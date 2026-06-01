"use client"

import { CreateNavigationLinkDialog, NavigationLinkDialog, type NavigationLinkRow } from "@/components/builder/cms/dialogs/NavigationLinkDialog"
import { DeleteConfirmDialog } from "@/components/builder/cms/dialogs/DeleteConfirmDialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useFetch } from "@/hooks/useFetch"
import { Edit, Loader2, Search, Trash } from "lucide-react"
import { useMemo, useState } from "react"
import { toast } from "sonner"

interface NavigationLinksTableProps {
  siteId: string
}

export function NavigationLinksTable({ siteId }: NavigationLinksTableProps) {
  const { data, loading, refetch } = useFetch<{ links: NavigationLinkRow[] }>(
    siteId ? `/api/team/${siteId}/navigation-links` : null,
  )

  const [searchQuery, setSearchQuery] = useState("")
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [editLink, setEditLink] = useState<NavigationLinkRow | null>(null)
  const [editOpen, setEditOpen] = useState(false)

  const links = data?.links ?? []

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase()
    return links.filter(
      (link) => link.label.toLowerCase().includes(q) || link.href.toLowerCase().includes(q),
    )
  }, [links, searchQuery])

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      const res = await fetch(`/api/team/${siteId}/navigation-links/${deleteId}`, {
        method: "DELETE",
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || "Failed to delete")
      }
      toast.success("Link deleted")
      refetch()
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Failed to delete link")
    } finally {
      setDeleteId(null)
    }
  }

  return (
    <div className="h-full flex-1 flex-col space-y-8 p-8 md:flex max-w-7xl mx-auto w-full">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Navigation</h2>
          <p className="text-muted-foreground">
            Header, mobile, and footer links. Category order is managed under Categories.
          </p>
        </div>
        <CreateNavigationLinkDialog siteId={siteId} onSuccess={refetch} />
      </div>

      <div className="flex justify-end">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search links..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 bg-background"
          />
        </div>
      </div>

      <div className="rounded-md border bg-background shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead>Label</TableHead>
              <TableHead>Href</TableHead>
              <TableHead>Placement</TableHead>
              <TableHead>Order</TableHead>
              <TableHead>Header</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && !links.length ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  No navigation links found.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((link) => (
                <TableRow key={link.id}>
                  <TableCell className="font-medium">{link.label}</TableCell>
                  <TableCell className="font-mono text-sm text-muted-foreground">{link.href}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{link.placement}</Badge>
                  </TableCell>
                  <TableCell>{link.order}</TableCell>
                  <TableCell>
                    {link.placement === "header" ? (
                      <Badge variant={link.headerPosition === "end" ? "default" : "secondary"}>
                        {link.headerPosition === "end" ? "End" : "Start"}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => {
                          setEditLink(link)
                          setEditOpen(true)
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:text-destructive"
                        onClick={() => setDeleteId(link.id)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <NavigationLinkDialog
        siteId={siteId}
        link={editLink}
        open={editOpen}
        onOpenChange={(open) => {
          setEditOpen(open)
          if (!open) setEditLink(null)
        }}
        onSuccess={refetch}
      />

      <DeleteConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete navigation link"
        description="Remove this link from the site navigation?"
      />
    </div>
  )
}
