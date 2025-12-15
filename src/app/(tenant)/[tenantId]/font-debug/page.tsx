import { getCachedSiteDetails } from "@/lib/actions/helpers/cached-tenant";

export default async function FontDebugPage({ params }: { params: Promise<{ tenantId: string }> }) {
    const { tenantId } = await params;
    const site = await getCachedSiteDetails(tenantId);

    const settings = site?.settings as any;
    const headingFont = settings?.theme?.headingFont;
    const bodyFont = settings?.theme?.bodyFont;

    return (
        <div style={{ padding: '2rem' }}>
            <h1>Font Debug Page</h1>

            <div style={{ marginBottom: '2rem', padding: '1rem', background: '#f0f0f0' }}>
                <h2>Settings from Database:</h2>
                <p><strong>Heading Font:</strong> {headingFont || 'Not set'}</p>
                <p><strong>Body Font:</strong> {bodyFont || 'Not set'}</p>
            </div>

            <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontFamily: headingFont ? `'${headingFont}', sans-serif` : 'inherit' }}>
                    This is a H2 heading - Should use: {headingFont || 'default'}
                </h2>
                <p style={{ fontFamily: bodyFont ? `'${bodyFont}', sans-serif` : 'inherit' }}>
                    This is body text - Should use: {bodyFont || 'default'}
                </p>
            </div>

            <div style={{ marginBottom: '2rem', padding: '1rem', background: '#f0f0f0' }}>
                <h3>Font Link Tags:</h3>
                {headingFont && headingFont !== 'System Default' && (
                    <p>✅ Heading font link should be in head: {headingFont}</p>
                )}
                {bodyFont && bodyFont !== 'System Default' && (
                    <p>✅ Body font link should be in head: {bodyFont}</p>
                )}
            </div>

            <div>
                <h3>Test All Headings:</h3>
                <h1>H1 Heading</h1>
                <h2>H2 Heading</h2>
                <h3>H3 Heading</h3>
                <h4>H4 Heading</h4>
                <h5>H5 Heading</h5>
                <h6>H6 Heading</h6>
                <p>Regular paragraph text</p>
                <span>Span text</span>
                <div>Div text</div>
            </div>
        </div>
    );
}
