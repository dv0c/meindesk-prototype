"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { markSubscriptionPaid } from "@/lib/actions/subscription/mark-paid";
import { Loader2, ShieldCheck } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function AdminPaymentControls({ subscriptionId }: { subscriptionId: string }) {
    const { data: session } = useSession();
    const [loading, setLoading] = useState(false);
    const [amount, setAmount] = useState<string>("20");
    const [months, setMonths] = useState<string>("1");
    const router = useRouter();

    // Hide if not admin
    if (!session || session.user.role !== "ADMIN") {
        return null;
    }

    const handlePayment = async () => {
        try {
            setLoading(true);
            await markSubscriptionPaid({
                subscriptionId,
                amount: parseFloat(amount),
                months: parseInt(months),
            });
            toast.success("Subscription marked as paid");
            router.refresh();
        } catch (error) {
            toast.error("Failed to update subscription");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="border-orange-500/50 bg-orange-500/5 mt-8">
            <CardHeader>
                <div className="flex items-center gap-2 text-orange-600">
                    <ShieldCheck className="w-5 h-5" />
                    <CardTitle className="text-lg">Admin Controls</CardTitle>
                </div>
                <CardDescription>
                    Manually extend subscription. Only visible to Admins.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Amount (€)</Label>
                        <Input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Extend by (Months)</Label>
                        <Select value={months} onValueChange={setMonths}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="1">1 Month</SelectItem>
                                <SelectItem value="2">2 Months</SelectItem>
                                <SelectItem value="3">3 Months</SelectItem>
                                <SelectItem value="6">6 Months</SelectItem>
                                <SelectItem value="12">1 Year</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <Button
                    onClick={handlePayment}
                    disabled={loading}
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                >
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Mark as Paid & Extend
                </Button>
            </CardContent>
        </Card>
    );
}
