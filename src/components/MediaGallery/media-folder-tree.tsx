"use client"

import { Fragment, useMemo, useState } from "react"
import {
  ChevronDown,
  ChevronRight,
  Folder,
  FolderOpen,
  FolderPlus,
  Images,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { cn } from "@/lib/utils"
import type { MediaFolderNode, MediaFolderSelection } from "@/types/media-gallery"

interface MediaFolderTreeProps {
  siteId: string
  folders: MediaFolderNode[]
  selectedFolder: MediaFolderSelection
  onSelect: (folder: MediaFolderSelection) => void
  onCreate: (path: string) => Promise<string | null>
  onRename: (from: string, to: string) => Promise<string | null>
  onDelete: (path: string) => Promise<void>
  isLoading?: boolean
  compact?: boolean
  className?: string
}

function findNode(nodes: MediaFolderNode[], path: string): MediaFolderNode | null {
  for (const node of nodes) {
    if (node.path === path) return node
    const found = findNode(node.children, path)
    if (found) return found
  }
  return null
}

function FolderRow({
  node,
  depth,
  selectedFolder,
  expanded,
  onToggle,
  onSelect,
  onRequestCreate,
  onRequestRename,
  onRequestDelete,
}: {
  node: MediaFolderNode
  depth: number
  selectedFolder: MediaFolderSelection
  expanded: Set<string>
  onToggle: (path: string) => void
  onSelect: (folder: MediaFolderSelection) => void
  onRequestCreate: (parentPath: string) => void
  onRequestRename: (path: string, name: string) => void
  onRequestDelete: (path: string) => void
}) {
  const isSelected = selectedFolder === node.path
  const isExpanded = expanded.has(node.path)
  const hasChildren = node.children.length > 0

  return (
    <div>
      <div
        className={cn(
          "group flex items-center gap-0.5 rounded-md pr-1 text-sm",
          isSelected ? "bg-muted font-medium" : "hover:bg-muted/60",
        )}
        style={{ paddingLeft: 4 + depth * 12 }}
      >
        <button
          type="button"
          className="flex h-7 w-5 shrink-0 items-center justify-center text-muted-foreground"
          onClick={() => hasChildren && onToggle(node.path)}
          aria-label={isExpanded ? "Collapse" : "Expand"}
        >
          {hasChildren ? (
            isExpanded ? (
              <ChevronDown className="h-3.5 w-3.5" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5" />
            )
          ) : (
            <span className="w-3.5" />
          )}
        </button>
        <button
          type="button"
          className="flex min-w-0 flex-1 items-center gap-1.5 py-1.5 text-left"
          onClick={() => onSelect(node.path)}
        >
          {isSelected || isExpanded ? (
            <FolderOpen className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          ) : (
            <Folder className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          )}
          <span className="truncate">{node.name}</span>
        </button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100 data-[state=open]:opacity-100"
            >
              <MoreHorizontal className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onClick={() => onRequestCreate(node.path)}>
              <FolderPlus className="mr-2 h-3.5 w-3.5" />
              New subfolder
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onRequestRename(node.path, node.name)}>
              <Pencil className="mr-2 h-3.5 w-3.5" />
              Rename
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => onRequestDelete(node.path)}
            >
              <Trash2 className="mr-2 h-3.5 w-3.5" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {isExpanded &&
        node.children.map((child) => (
          <FolderRow
            key={child.path}
            node={child}
            depth={depth + 1}
            selectedFolder={selectedFolder}
            expanded={expanded}
            onToggle={onToggle}
            onSelect={onSelect}
            onRequestCreate={onRequestCreate}
            onRequestRename={onRequestRename}
            onRequestDelete={onRequestDelete}
          />
        ))}
    </div>
  )
}

export function MediaFolderBreadcrumbs({
  siteId,
  selectedFolder,
  onSelect,
  className,
}: {
  siteId: string
  selectedFolder: MediaFolderSelection
  onSelect: (folder: MediaFolderSelection) => void
  className?: string
}) {
  const crumbs = useMemo(() => {
    if (!selectedFolder || selectedFolder === "all") {
      return [{ label: "All media", path: "all" as const }]
    }
    const relative = selectedFolder.startsWith(`${siteId}/`)
      ? selectedFolder.slice(siteId.length + 1)
      : selectedFolder === siteId
        ? ""
        : selectedFolder
    const parts = relative ? relative.split("/") : []
    const items: { label: string; path: MediaFolderSelection }[] = [
      { label: "All media", path: "all" },
    ]
    let acc = siteId
    for (const part of parts) {
      acc = `${acc}/${part}`
      items.push({ label: part, path: acc })
    }
    return items
  }, [selectedFolder, siteId])

  return (
    <Breadcrumb className={className}>
      <BreadcrumbList className="text-xs">
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1
          return (
            <Fragment key={String(crumb.path)}>
              {index > 0 && <BreadcrumbSeparator />}
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      onSelect(crumb.path)
                    }}
                  >
                    {crumb.label}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </Fragment>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}

export function MediaFolderTree({
  siteId,
  folders,
  selectedFolder,
  onSelect,
  onCreate,
  onRename,
  onDelete,
  isLoading,
  compact,
  className,
}: MediaFolderTreeProps) {
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set())
  const [createOpen, setCreateOpen] = useState(false)
  const [createParent, setCreateParent] = useState(siteId)
  const [createName, setCreateName] = useState("")
  const [renameOpen, setRenameOpen] = useState(false)
  const [renamePath, setRenamePath] = useState("")
  const [renameName, setRenameName] = useState("")
  const [deletePath, setDeletePath] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const toggle = (path: string) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(path)) next.delete(path)
      else next.add(path)
      return next
    })
  }

  const openCreate = (parentPath: string) => {
    setCreateParent(parentPath)
    setCreateName("")
    setCreateOpen(true)
  }

  const openRename = (path: string, name: string) => {
    setRenamePath(path)
    setRenameName(name)
    setRenameOpen(true)
  }

  const handleCreate = async () => {
    const name = createName.trim()
    if (!name) {
      toast.error("Enter a folder name")
      return
    }
    setBusy(true)
    try {
      const path = createParent === siteId ? `${siteId}/${name}` : `${createParent}/${name}`
      const created = await onCreate(path)
      if (created) {
        setExpanded((prev) => new Set(prev).add(createParent))
        onSelect(created)
        setCreateOpen(false)
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create folder")
    } finally {
      setBusy(false)
    }
  }

  const handleRename = async () => {
    const name = renameName.trim()
    if (!name) {
      toast.error("Enter a folder name")
      return
    }
    const parent = renamePath.includes("/")
      ? renamePath.slice(0, renamePath.lastIndexOf("/"))
      : siteId
    const to = `${parent}/${name}`
    setBusy(true)
    try {
      await onRename(renamePath, to)
      setRenameOpen(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to rename folder")
    } finally {
      setBusy(false)
    }
  }

  const handleDelete = async () => {
    if (!deletePath) return
    setBusy(true)
    try {
      await onDelete(deletePath)
      setDeletePath(null)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete folder")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className={cn("flex h-full min-h-0 flex-col border-r bg-muted/10", className)}>
      <div className={cn("flex items-center justify-between gap-2 border-b px-3", compact ? "py-2" : "py-3")}>
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Folders</p>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => openCreate(selectedFolder === "all" ? siteId : String(selectedFolder))}
          title="New folder"
        >
          <FolderPlus className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-0.5 p-2">
          <button
            type="button"
            className={cn(
              "flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-sm",
              selectedFolder === "all" ? "bg-muted font-medium" : "hover:bg-muted/60",
            )}
            onClick={() => onSelect("all")}
          >
            <Images className="h-3.5 w-3.5 text-muted-foreground" />
            All media
          </button>

          {isLoading && folders.length === 0 ? (
            <p className="px-2 py-4 text-xs text-muted-foreground">Loading folders…</p>
          ) : folders.length === 0 ? (
            <p className="px-2 py-4 text-xs text-muted-foreground">
              No folders yet. Create one to organize uploads.
            </p>
          ) : (
            folders.map((node) => (
              <FolderRow
                key={node.path}
                node={node}
                depth={0}
                selectedFolder={selectedFolder}
                expanded={expanded}
                onToggle={toggle}
                onSelect={onSelect}
                onRequestCreate={openCreate}
                onRequestRename={openRename}
                onRequestDelete={setDeletePath}
              />
            ))
          )}
        </div>
      </ScrollArea>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>New folder</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">
              Parent:{" "}
              {createParent === siteId
                ? "root"
                : createParent.replace(`${siteId}/`, "")}
            </p>
            <Input
              autoFocus
              placeholder="Folder name"
              value={createName}
              onChange={(e) => setCreateName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)} disabled={busy}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={busy}>
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Rename folder</DialogTitle>
          </DialogHeader>
          <Input
            autoFocus
            value={renameName}
            onChange={(e) => setRenameName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleRename()}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameOpen(false)} disabled={busy}>
              Cancel
            </Button>
            <Button onClick={handleRename} disabled={busy}>
              Rename
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deletePath} onOpenChange={(open) => !open && setDeletePath(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete folder?</AlertDialogTitle>
            <AlertDialogDescription>
              The folder must be empty (no assets or subfolders). Move or delete contents first.
              {deletePath && findNode(folders, deletePath) && (
                <>
                  {" "}
                  Deleting &quot;{findNode(folders, deletePath)?.name}&quot;.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busy}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={busy}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

/** Flatten folder tree for move-to select lists */
export function flattenFolderPaths(
  folders: MediaFolderNode[],
  excludePath?: string,
): { path: string; label: string }[] {
  const result: { path: string; label: string }[] = []

  function walk(nodes: MediaFolderNode[], prefix = "") {
    for (const node of nodes) {
      if (excludePath && (node.path === excludePath || node.path.startsWith(`${excludePath}/`))) {
        continue
      }
      const label = prefix ? `${prefix} / ${node.name}` : node.name
      result.push({ path: node.path, label })
      walk(node.children, label)
    }
  }

  walk(folders)
  return result
}
