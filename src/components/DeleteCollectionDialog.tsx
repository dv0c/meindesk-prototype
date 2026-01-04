"use client"

import { useState } from "react"
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Trash2, Unlink, Database, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

export type CollectionRelationAction = 'CASCADE' | 'REMOVE_FIELD' | 'CANCEL'

export interface CollectionReference {
    collectionId: string
    collectionName: string
    fieldName: string
    fieldLabel: string
    itemCount: number
}

interface DeleteCollectionDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    collectionName: string
    references: CollectionReference[]
    onConfirm: (action: CollectionRelationAction) => void
    loading?: boolean
}

export function DeleteCollectionDialog({
    open,
    onOpenChange,
    collectionName,
    references,
    onConfirm,
    loading = false
}: DeleteCollectionDialogProps) {
    const [selectedAction, setSelectedAction] = useState<CollectionRelationAction | null>(null)

    const handleConfirm = () => {
        if (selectedAction && selectedAction !== 'CANCEL') {
            onConfirm(selectedAction)
        } else {
            onOpenChange(false)
        }
    }

    const totalItems = references.reduce((sum, ref) => sum + ref.itemCount, 0)

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="max-w-lg font-mono bg-background border-border">
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-3 text-lg uppercase tracking-wider">
                        <div className="w-10 h-10 bg-destructive/10 flex items-center justify-center">
                            <AlertTriangle className="w-5 h-5 text-destructive" />
                        </div>
                        Collection Dependencies Found
                    </AlertDialogTitle>
                    <AlertDialogDescription asChild>
                        <div className="space-y-4 text-sm text-muted-foreground">
                            <p>
                                <span className="text-foreground font-semibold">&quot;{collectionName}&quot;</span> is referenced by {references.length} other collection{references.length > 1 ? 's' : ''}:
                            </p>

                            {/* References List */}
                            <div className="max-h-40 overflow-y-auto border border-border bg-muted/30 p-3 space-y-3">
                                {references.map((ref) => (
                                    <div key={`${ref.collectionId}-${ref.fieldName}`} className="flex items-start gap-3">
                                        <Database className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-foreground font-medium">{ref.collectionName}</p>
                                            <p className="text-xs text-muted-foreground">
                                                Field: <span className="text-foreground">{ref.fieldLabel}</span>
                                                {ref.itemCount > 0 && (
                                                    <span className="ml-2">
                                                        ({ref.itemCount} item{ref.itemCount !== 1 ? 's' : ''} linked)
                                                    </span>
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <p className="text-xs">
                                How would you like to handle these dependencies?
                            </p>
                        </div>
                    </AlertDialogDescription>
                </AlertDialogHeader>

                {/* Action Options */}
                <div className="grid gap-3 py-4">
                    {/* REMOVE_FIELD Option */}
                    <button
                        type="button"
                        onClick={() => setSelectedAction('REMOVE_FIELD')}
                        disabled={loading}
                        className={cn(
                            "flex items-start gap-4 p-4 border text-left transition-all",
                            selectedAction === 'REMOVE_FIELD'
                                ? "border-primary bg-primary/5"
                                : "border-border hover:border-foreground/30 hover:bg-muted/30"
                        )}
                    >
                        <div className="w-8 h-8 bg-blue-500/10 flex items-center justify-center shrink-0">
                            <Unlink className="w-4 h-4 text-blue-500" />
                        </div>
                        <div className="space-y-1">
                            <p className="font-semibold text-sm uppercase tracking-wider">Remove Relation Fields</p>
                            <p className="text-xs text-muted-foreground">
                                Remove the relation field(s) from the referencing collection(s).
                                {totalItems > 0 && ` This will clear ${totalItems} linked item(s).`}
                            </p>
                        </div>
                    </button>

                    {/* CASCADE Option */}
                    <button
                        type="button"
                        onClick={() => setSelectedAction('CASCADE')}
                        disabled={loading}
                        className={cn(
                            "flex items-start gap-4 p-4 border text-left transition-all",
                            selectedAction === 'CASCADE'
                                ? "border-destructive bg-destructive/5"
                                : "border-border hover:border-foreground/30 hover:bg-muted/30"
                        )}
                    >
                        <div className="w-8 h-8 bg-destructive/10 flex items-center justify-center shrink-0">
                            <Trash2 className="w-4 h-4 text-destructive" />
                        </div>
                        <div className="space-y-1">
                            <p className="font-semibold text-sm uppercase tracking-wider text-destructive">Delete All Collections</p>
                            <p className="text-xs text-muted-foreground">
                                Delete this collection AND all {references.length} referencing collection{references.length > 1 ? 's' : ''} (with all their items).
                                This action cannot be undone.
                            </p>
                        </div>
                    </button>
                </div>

                <AlertDialogFooter className="gap-2">
                    <AlertDialogCancel
                        disabled={loading}
                        className="font-mono text-xs uppercase tracking-widest rounded-none"
                    >
                        Cancel
                    </AlertDialogCancel>
                    <Button
                        onClick={handleConfirm}
                        disabled={!selectedAction || loading}
                        variant={selectedAction === 'CASCADE' ? 'destructive' : 'default'}
                        className="font-mono text-xs uppercase tracking-widest rounded-none"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            <>
                                {selectedAction === 'CASCADE' ? 'Delete All' : 'Confirm'}
                            </>
                        )}
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
