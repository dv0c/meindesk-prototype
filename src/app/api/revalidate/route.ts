import { revalidateTag, revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Webhook endpoint for on-demand cache revalidation
 * 
 * Usage:
 * POST /api/revalidate
 * Authorization: Bearer YOUR_SECRET_TOKEN
 * Body: { type: 'page', tenantId: '...', pageId: '...', path: '/...' }
 */
export async function POST(req: NextRequest) {
    // Verify webhook secret for security
    const authHeader = req.headers.get('authorization');
    const secret = process.env.REVALIDATION_SECRET;

    if (!secret) {
        console.error('REVALIDATION_SECRET not configured');
        return NextResponse.json(
            { error: 'Revalidation not configured' },
            { status: 500 }
        );
    }

    if (authHeader !== `Bearer ${secret}`) {
        return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
        );
    }

    try {
        const body = await req.json();
        const { type, tenantId, pageId, path, slug } = body;

        console.log(`Revalidating cache - Type: ${type}, Tenant: ${tenantId}, Page: ${pageId}`);

        switch (type) {
            case 'page':
                // Revalidate specific page
                if (pageId) {
                    revalidateTag(`page-${pageId}`);
                }
                if (tenantId) {
                    revalidateTag(`tenant-${tenantId}`);
                }
                if (slug) {
                    revalidateTag(`page-slug-${slug}`);
                }
                // Revalidate the actual path
                if (path) {
                    revalidatePath(path);
                }
                if (tenantId && slug) {
                    revalidatePath(`/${tenantId}/${slug}`);
                }
                break;

            case 'tenant':
                // Revalidate all pages for a tenant
                if (tenantId) {
                    revalidateTag(`tenant-${tenantId}`);
                    revalidatePath(`/${tenantId}`);
                }
                break;

            case 'tenant-home':
                // Revalidate tenant home page
                if (tenantId) {
                    revalidateTag('tenant-home');
                    revalidateTag(`tenant-${tenantId}`);
                    revalidatePath(`/${tenantId}`);
                }
                break;

            case 'all-pages':
                // Revalidate all pages (use sparingly!)
                revalidateTag('pages');
                break;

            case 'global':
                // Nuclear option: revalidate everything (very expensive!)
                revalidatePath('/', 'layout');
                console.warn('Global revalidation triggered - this is expensive!');
                break;

            default:
                return NextResponse.json(
                    { error: 'Invalid revalidation type' },
                    { status: 400 }
                );
        }

        return NextResponse.json({
            revalidated: true,
            type,
            timestamp: new Date().toISOString()
        });

    } catch (err) {
        console.error('Revalidation error:', err);
        return NextResponse.json(
            { error: 'Failed to revalidate', details: err instanceof Error ? err.message : 'Unknown error' },
            { status: 500 }
        );
    }
}

// Also support GET for simple health checks
export async function GET() {
    return NextResponse.json({
        status: 'ok',
        endpoint: 'revalidation',
        configured: !!process.env.REVALIDATION_SECRET
    });
}
