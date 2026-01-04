"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Trash2, Mail, Loader2 } from "lucide-react"
import { useSession, signOut } from "next-auth/react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { deleteAccount } from "@/lib/actions/user-actions"

export function AccountTab() {
    const { data: session } = useSession()
    const user = session?.user

    const [deleteConfirmation, setDeleteConfirmation] = useState("")
    const [isDeleting, setIsDeleting] = useState(false)
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)

    const handleDeleteAccount = async () => {
        if (deleteConfirmation.toLowerCase() !== "i confirm") return

        setIsDeleting(true)
        const result = await deleteAccount()

        if (result.success) {
            toast.success("Account deleted successfully")
            signOut({ callbackUrl: "/" })
        } else {
            toast.error("Failed to delete account")
            setIsDeleting(false)
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">Account</h3>
                <p className="text-sm text-muted-foreground">
                    Manage your account settings and preferences.
                </p>
            </div>

            <div className="space-y-6">
                {/* Email Section */}
                <div className="space-y-4">
                    <h4 className="text-sm font-medium">Email Addresses</h4>
                    <Card>
                        <CardContent className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 text-muted-foreground bg-muted/50 rounded-full flex items-center justify-center">
                                    <Mail className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="font-medium text-sm">{user?.email}</p>
                                    <p className="text-xs text-muted-foreground">Primary</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Separator />

                {/* Danger Zone */}
                <div className="space-y-4">
                    <h4 className="text-sm font-medium text-destructive">Danger Zone</h4>
                    <div className="border border-destructive/20 bg-destructive/5 rounded-lg p-4 space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="font-medium text-sm">Delete Account</p>
                                <p className="text-xs text-muted-foreground">
                                    Permanently delete your account and all associated data. This action cannot be undone.
                                </p>
                            </div>
                            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                                <DialogTrigger asChild>
                                    <Button variant="destructive" size="sm">
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete Account
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Delete Account</DialogTitle>
                                        <DialogDescription>
                                            This action cannot be undone. This will permanently delete your account and remove your data from our servers.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4 py-4">
                                        <Label htmlFor="confirm">
                                            Type <span className="font-bold">I confirm</span> to continue
                                        </Label>
                                        <Input
                                            id="confirm"
                                            value={deleteConfirmation}
                                            onChange={(e) => setDeleteConfirmation(e.target.value)}
                                            placeholder="I confirm"
                                        />
                                    </div>
                                    <DialogFooter>
                                        <Button variant="outline" onClick={() => setShowDeleteDialog(false)} disabled={isDeleting}>Cancel</Button>
                                        <Button
                                            variant="destructive"
                                            onClick={handleDeleteAccount}
                                            disabled={deleteConfirmation.toLowerCase() !== "i confirm" || isDeleting}
                                        >
                                            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            Delete Account
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
