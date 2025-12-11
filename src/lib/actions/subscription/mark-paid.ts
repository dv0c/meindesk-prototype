"use server";

import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function markSubscriptionPaid({
    subscriptionId,
    amount,
    months = 1,
    description = "Manual Admin Payment"
}: {
    subscriptionId: string;
    amount: number;
    months?: number;
    description?: string;
}) {
    const session = await getAuthSession();

    // 1. Check Auth & Admin Role
    if (!session?.user || session.user.role !== "ADMIN") {
        throw new Error("Unauthorized: Only Admins can perform this action");
    }

    // 2. Get current subscription to calculate new billing date
    const sub = await db.subscription.findUnique({
        where: { id: subscriptionId },
    });

    if (!sub) {
        throw new Error("Subscription not found");
    }

    // Calculate new date: If exisiting date is future, add to it. If past, start from now (or keep current if we want to cover back-pay? User asked for next payment). 
    // Standard logic: If expired, start from now + months. If active, next_billing + months.
    // Actually, standard SaaS logic is contiguous billing. 
    // Let's assume contiguous.
    const currentNextBilling = new Date(sub.next_billing_date);
    const now = new Date();

    // If the subscription is way in the past, maybe reset to now? 
    // But usually "mark as paid" implies paying for the *next* cycle.
    // Let's safe bet: add X months to the greater of (now, currentNextBilling) if expired? 
    // Or just simply add months to 'next_billing_date'. 
    // Simpler: Just add months to the existing next_billing_date.

    const nextDate = new Date(currentNextBilling);
    nextDate.setMonth(nextDate.getMonth() + months);

    // 3. Updates in transaction
    await db.$transaction([
        // Update Subscription
        db.subscription.update({
            where: { id: subscriptionId },
            data: {
                next_billing_date: nextDate,
                status: "active", // ensure active
                price: amount, // update price just in case
            },
        }),
        // Add History
        (db as any).billingHistory.create({
            data: {
                subscriptionId: subscriptionId,
                amount: amount,
                currency: "EUR", // default per schema
                status: "paid",
                date: new Date(),
                description: description,
            },
        }),
    ]);

    revalidatePath("/dashboard");
    return { success: true, newDate: nextDate };
}
