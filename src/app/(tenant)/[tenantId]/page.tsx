// app/[tenantId]/page.tsx

import { db } from '@/lib/db'
import { notFound } from 'next/navigation'
import dynamicImport from 'next/dynamic'
import { TemplateSchema } from '@/types/TemplateSchema'

interface TenantPageProps {
  params: {
    tenantId: string
  }
}

const tenantSelectFields = {
  title: true,
  id: true,
  description: true,
  subdomain: true,
  template_schema: true,
}

export default async function TenantHomePage({ params }: TenantPageProps) {
  const { tenantId } = await params

  // Fetch tenant data
  const tenantData = await db.site.findUnique({
    where: { id: tenantId },
    select: tenantSelectFields,
  })

  if (!tenantData) return notFound()

  const templateSchema = tenantData.template_schema as unknown as TemplateSchema
  const template = templateSchema.template || 'simple'

  // Validate template
  const templates = ['simple', 'minimal']
  if (!templates.includes(template)) return notFound()

  // Lazy load the template component dynamically
  const Template = dynamicImport(() =>
    import(`../_components/templates/${template}/index`)
  ) as React.ComponentType<{ tenant: any }>

  return (
    <div className="min-h-screen">
      <Template tenant={tenantData} />
    </div>
  )
}
