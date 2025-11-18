import { TemplateSchemaEditor } from "@/components/template-schema-editor";

export default async function Page({ params }: { params: { siteId: string } }) {
    const { siteId } = await params
    return <TemplateSchemaEditor params={{ siteId }} />
}
