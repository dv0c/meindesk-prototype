'use client'

import { useState, useMemo, useEffect } from "react"
import { useRouter } from "next/navigation"
import { MoreHorizontal, Edit, Eye, Trash, Copy, Search, ChevronLeft, ChevronRight, Lock, Loader2, File } from "lucide-react"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"

import { useTeam } from "@/hooks/useTeam"
import { Skeleton } from "./ui/skeleton"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "./ui/alert-dialog"
import { usePages } from "@/hooks/use-pages"
import { cn } from "@/lib/utils"

const statusColors: Record<string, string> = {
  PUBLISHED: "default",
  DRAFT: "secondary",
  ARCHIVED: "outline",
}

const ITEMS_PER_PAGE = 10

export function PagesTable() {
  const router = useRouter()
  const team = useTeam().team
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [activeTab, setActiveTab] = useState("pages")
  const [currentPage, setCurrentPage] = useState(1)
  const { pages, getPages, deletePage, loading } = usePages()

  const [deleteTarget, setDeleteTarget] = useState<any>(null)
  const [isDialogOpenn, setIsDialogOpen] = useState(false)

  useEffect(() => {
    if (team) getPages(team.id)
  }, [team, getPages])

  const filteredPages = useMemo(() => {
    if (!pages) return []
    return pages.filter((page: any) => {
      // Search Filter
      const matchesSearch =
        page.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        page.slug?.toLowerCase().includes(searchQuery.toLowerCase())

      // Status Filter
      const matchesStatus = statusFilter === "ALL" || page.status === statusFilter

      // Tab Filter (Pages vs Templates)
      const isTemplate = page.meta?.isTemplate || page.slug?.endsWith("-template")
      const matchesTab = activeTab === "templates" ? isTemplate : !isTemplate

      return matchesSearch && matchesStatus && matchesTab
    })
  }, [pages, searchQuery, statusFilter, activeTab])

  const totalPages = Math.ceil(filteredPages.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const paginatedPages = filteredPages.slice(startIndex, endIndex)

  const confirmDelete = (page: any) => {
    setDeleteTarget(page)
    setIsDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!team || !deleteTarget) return toast.error("Site or page missing.")
    await deletePage(team.id, deleteTarget.id)
    getPages(team.id)
    setIsDialogOpen(false)
    setDeleteTarget(null)
  }

  const handleDuplicate = async (page: any) => {
    if (!team?.id) return toast.error("Site not found.")
    const data = {
      ...page,
      title: `${page.title} (Copy)`,
      slug: `${page.slug}-copy-${Date.now()}`,
    }
    await fetch(`/api/sites/${team?.id}/pages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    toast.success("Page duplicated.")
    getPages(team.id)
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64 w-full">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  )

  return (
    <>
      <div className="space-y-4 w-full">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <Tabs defaultValue="pages" value={activeTab} onValueChange={setActiveTab} className="w-auto">
            <TabsList className="grid w-full grid-cols-2 h-9 p-1 bg-muted/50">
              <TabsTrigger value="pages" className="text-xs">Pages</TabsTrigger>
              <TabsTrigger value="templates" className="text-xs">Templates</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search pages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 bg-background"
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(value) => {
                setStatusFilter(value)
                setCurrentPage(1)
              }}
            >
              <SelectTrigger className="w-[130px] h-9 text-xs">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="PUBLISHED">Published</SelectItem>
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="ARCHIVED">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="rounded-md border bg-background text-sm shadow-sm overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow className="hover:bg-transparent border-b">
                <TableHead className="h-10 text-xs font-medium w-[300px]">Page</TableHead>
                <TableHead className="h-10 text-xs font-medium">Slug</TableHead>
                <TableHead className="h-10 text-xs font-medium">Status</TableHead>
                <TableHead className="h-10 text-xs font-medium">Created</TableHead>
                <TableHead className="h-10 text-xs font-medium">Updated</TableHead>
                <TableHead className="h-10 text-xs font-medium text-right w-[60px]">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {paginatedPages.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    No pages found.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedPages.map((page: any) => (
                  <TableRow
                    key={page.id}
                    className="group border-b last:border-0 cursor-pointer hover:bg-muted/40 transition-colors"
                    onClick={(e) => {
                      const target = e.target as HTMLElement
                      if (target.closest("button") || target.closest("[role='menu']")) return
                      router.push(`/dashboard/${team?.id}/projects/website/canva/${page.id}/`)
                    }}
                  >
                    <TableCell className="font-medium py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-md bg-muted/50 flex items-center justify-center border">
                          <File className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="flex flex-col">
                          <span className="truncate max-w-[200px] text-foreground font-medium flex items-center gap-1.5">
                            {page.locked && <Lock className="h-3 w-3 text-muted-foreground" />}
                            {page.title || "Untitled Page"}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground py-3">{page.slug}</TableCell>
                    <TableCell className="py-3">
                      <Badge variant={statusColors[page.status] as any} className="h-5 px-2 text-[10px] font-medium rounded-full">
                        {page.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground py-3">
                      {new Date(page.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground py-3">
                      {new Date(page.updatedAt).toLocaleDateString()}
                    </TableCell>

                    <TableCell className="text-right py-3" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() =>
                                router.push(`/dashboard/${team?.id}/projects/website/canva/${page.id}/`)
                              }
                            >
                              <Edit className="h-4 w-4 mr-2" /> Edit Page
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                router.push(`${team?.url}/pages/${page.slug}`)
                              }
                            >
                              <Eye className="h-4 w-4 mr-2" /> View Live
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDuplicate(page)}>
                              <Copy className="h-4 w-4 mr-2" /> Duplicate
                            </DropdownMenuItem>
                            {!page.locked && (
                              <DropdownMenuItem
                                onClick={() => confirmDelete(page)}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash className="h-4 w-4 mr-2" /> Delete
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {filteredPages.length > 0 && (
          <div className="flex items-center justify-between px-2 pt-2">
            <div className="text-xs text-muted-foreground">
              Showing {startIndex + 1}-{Math.min(endIndex, filteredPages.length)} of {filteredPages.length}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="h-8 w-8 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div >

      {/* Delete confirmation dialog */}
      < AlertDialog open={isDialogOpenn} onOpenChange={setIsDialogOpen} >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this page?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The page <strong>{deleteTarget?.title}</strong> will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsDialogOpen(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-white hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog >
    </>
  )
}
