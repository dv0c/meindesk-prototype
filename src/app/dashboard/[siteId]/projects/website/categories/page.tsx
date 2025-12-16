import { CategoriesTable } from "@/components/CategoriesTable"

const CategoriesPage = () => {
  return (
    <div className="p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
        <p className="text-muted-foreground">
          Manage your article categories to organize your content
        </p>
      </div>
      <CategoriesTable />
    </div>
  )
}

export default CategoriesPage