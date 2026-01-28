import { SettingsLayout } from "@/components/Settings/SettingsLayout"

export default async function SettingsLayoutWrapper({
    children,
    params,
}: {
    children: React.ReactNode
    params: { siteId: string }
}) {
    const { siteId } = await params
    return <SettingsLayout siteId={siteId}>{children}</SettingsLayout>
}
