"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import type { HeaderPosition, NavLinkPlacement } from "@/lib/navigation-link-data"
import { Loader2, Plus } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"

export type NavigationLinkRow = {
  id: string
  label: string
  href: string
  placement: NavLinkPlacement
  order: number
  headerPosition: HeaderPosition
  visible: boolean
  openInNewTab: boolean
}

type NavigationLinkDialogProps = {
  siteId: string
  link?: NavigationLinkRow | null
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onSuccess?: () => void
  trigger?: React.ReactNode
}

const defaultForm = {
  label: "",
  href: "",
  placement: "header" as NavLinkPlacement,
  order: 0,
  headerPosition: "start" as HeaderPosition,
  visible: true,
  openInNewTab: false,
}

export function NavigationLinkDialog({
  siteId,
  link,
  open: controlledOpen,
  onOpenChange,
  onSuccess,
  trigger,
}: NavigationLinkDialogProps) {
  const isEdit = Boolean(link)
  const [internalOpen, setInternalOpen] = useState(false)
  const open = controlledOpen ?? internalOpen
  const setOpen = onOpenChange ?? setInternalOpen
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState(defaultForm)

  useEffect(() => {
    if (!open) return
    if (link) {
      setForm({
        label: link.label,
        href: link.href,
        placement: link.placement,
        order: link.order,
        headerPosition: link.headerPosition,
        visible: link.visible,
        openInNewTab: link.openInNewTab,
      })
    } else {
      setForm(defaultForm)
    }
  }, [link, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.label.trim() || !form.href.trim()) return

    try {
      setLoading(true)
      const url = isEdit
        ? `/api/team/${siteId}/navigation-links/${link!.id}`
        : `/api/team/${siteId}/navigation-links`
      const res = await fetch(url, {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || "Failed to save link")
      toast.success(isEdit ? "Navigation link updated" : "Navigation link created")
      setOpen(false)
      onSuccess?.()
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Failed to save link")
    } finally {
      setLoading(false)
    }
  }

  const content = (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>{isEdit ? "Edit navigation link" : "New navigation link"}</DialogTitle>
        <DialogDescription>
          Custom header links for the headless site. Use position &quot;End of header&quot; for items
          like Contact that should appear after categories and Άρθρα.
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="nav-label">Label</Label>
          <Input
            id="nav-label"
            value={form.label}
            onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
            placeholder="ΕΠΙΚΟΙΝΩΝΙΑ"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="nav-href">Link (path or URL)</Label>
          <Input
            id="nav-href"
            value={form.href}
            onChange={(e) => setForm((f) => ({ ...f, href: e.target.value }))}
            placeholder="/contact"
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Placement</Label>
            <Select
              value={form.placement}
              onValueChange={(v) => setForm((f) => ({ ...f, placement: v as NavLinkPlacement }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="header">Header</SelectItem>
                <SelectItem value="mobile">Mobile</SelectItem>
                <SelectItem value="footer">Footer</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="nav-order">Sort order</Label>
            <Input
              id="nav-order"
              type="number"
              value={form.order}
              onChange={(e) => setForm((f) => ({ ...f, order: Number.parseInt(e.target.value, 10) || 0 }))}
            />
          </div>
        </div>
        {form.placement === "header" && (
          <div className="space-y-2">
            <Label>Header position</Label>
            <Select
              value={form.headerPosition}
              onValueChange={(v) => setForm((f) => ({ ...f, headerPosition: v as HeaderPosition }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="start">Start (before categories)</SelectItem>
                <SelectItem value="end">End (after categories & Άρθρα)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
        <div className="flex items-center justify-between">
          <Label htmlFor="nav-visible">Visible</Label>
          <Switch
            id="nav-visible"
            checked={form.visible}
            onCheckedChange={(visible) => setForm((f) => ({ ...f, visible }))}
          />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="nav-new-tab">Open in new tab</Label>
          <Switch
            id="nav-new-tab"
            checked={form.openInNewTab}
            onCheckedChange={(openInNewTab) => setForm((f) => ({ ...f, openInNewTab }))}
          />
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEdit ? "Save" : "Create"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  )

  if (isEdit) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        {content}
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger ? <DialogTrigger asChild>{trigger}</DialogTrigger> : null}
      {content}
    </Dialog>
  )
}

export function CreateNavigationLinkDialog({
  siteId,
  onSuccess,
}: {
  siteId: string
  onSuccess?: () => void
}) {
  return (
    <NavigationLinkDialog
      siteId={siteId}
      onSuccess={onSuccess}
      trigger={
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New link
        </Button>
      }
    />
  )
}
