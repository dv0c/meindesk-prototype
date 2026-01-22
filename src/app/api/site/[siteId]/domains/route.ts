import { NextResponse } from "next/server";
import {
    addDomainToVercel,
    getDomainResponse,
    getConfigResponse,
    verifyDomain,
    removeDomainFromVercel,
} from "@/lib/vercel";
import { db as prisma } from "@/lib/db";
import { getActiveTeam } from "@/lib/actions/helpers/team";

export async function POST(
    req: Request,
    { params }: { params: { siteId: string } }
) {
    const { domain } = await req.json();
    const { siteId } = await params;

    // Basic validation
    if (!domain) {
        return new NextResponse("Domain is required", { status: 400 });
    }

    // Check site ownership/access
    const site = await getActiveTeam(siteId);
    if (!site) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const response = await addDomainToVercel(domain);

        if (response.error) {
            return new NextResponse(response.error.message, { status: 422 });
        }

        // Update DB to reflect the new custom domain
        // NOTE: This replaces the existing URL. If multiple domains are needed, schema change is required.
        await prisma.site.update({
            where: { id: siteId },
            data: { url: domain }
        });

        return NextResponse.json(response);
    } catch (error) {
        console.error("Error adding domain:", error);
        return new NextResponse("Failed to add domain", { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: { siteId: string } }
) {
    const { siteId } = await params;
    const { searchParams } = new URL(req.url);
    const domain = searchParams.get("domain");

    if (!domain) {
        return new NextResponse("Domain is required", { status: 400 });
    }

    const site = await getActiveTeam(siteId);
    if (!site) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const response = await removeDomainFromVercel(domain);

        // Clear URL in DB if it matches
        // Note: We might want to reset to default subdomain URL instead of empty string if possible
        // For now, we only clear if it matches exactly what we deleted
        if (site.url === domain) {
            await prisma.site.update({
                where: { id: siteId },
                data: { url: `${site.subdomain}.meindesk.gr` } // Reset to default subdomain
            });
        }

        return NextResponse.json(response);
    } catch (error) {
        console.error("Error removing domain:", error);
        return new NextResponse("Failed to remove domain", { status: 500 });
    }
}


export async function GET(
    req: Request,
    { params }: { params: { siteId: string } }
) {
    const { searchParams } = new URL(req.url);
    const domain = searchParams.get("domain");
    const { siteId } = await params;

    if (!domain) {
        return new NextResponse("Domain is required", { status: 400 });
    }

    const site = await getActiveTeam(siteId);
    if (!site) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const [domainResponse, configResponse] = await Promise.all([
            getDomainResponse(domain),
            getConfigResponse(domain),
        ]);

        if (domainResponse.error) {
            return NextResponse.json({
                status: "Invalid",
                domainJson: domainResponse,
                configJson: configResponse
            });
        }

        // Attempt verify if not verified
        let verificationResponse = null;
        if (!domainResponse.verified) {
            verificationResponse = await verifyDomain(domain);
        }

        return NextResponse.json({
            status: domainResponse.verified ? "Valid" : "Invalid",
            domainJson: domainResponse,
            configJson: configResponse,
            verificationJson: verificationResponse
        });
    } catch (error) {
        console.error("Error verifying domain:", error);
        return new NextResponse("Failed to get domain info", { status: 500 });
    }
}
