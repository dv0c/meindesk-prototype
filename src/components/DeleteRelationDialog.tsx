"use client"

import { useState } from "react"
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
import { Button } from "@/components/ui/button"
import { AlertTriangle, Trash2, Unlink, Link2Off, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

export type RelationAction = 'CASCADE' | 'SET_NULL' | 'CANCEL'

export interface Reference {
    itemId: string
    itemName: string
    collectionId: string
    collectionName: string
    fieldName: string
    fieldLabel: string
}

interface DeleteRelationDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    itemName: string
    references: Reference[]
    onConfirm: (action: RelationAction) => void
    loading?: boolean
}

export function DeleteRelationDialog({
    open,
    onOpenChange,
    itemName,
    references,
    onConfirm,
    loading = false
}: DeleteRelationDialogProps) {
    const [selectedAction, setSelectedAction] = useState<RelationAction | null>(null)

    const handleConfirm = () => {
        if (selectedAction && selectedAction !== 'CANCEL') {
            onConfirm(selectedAction)
        } else {
            onOpenChange(false)
        }
    }

    // Group references by collection
    const groupedRefs = references.reduce((acc, ref) => {
        if (!acc[ref.collectionName]) {
            acc[ref.collectionName] = []
        }
        acc[ref.collectionName].push(ref)
        return acc
    }, {} as Record<string, Reference[]>)

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="max-w-lg font-mono bg-background border-border">
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-3 text-lg uppercase tracking-wider">
                        <div className="w-10 h-10 bg-destructive/10 flex items-center justify-center">
                            <AlertTriangle className="w-5 h-5 text-destructive" />
                        </div>
                        Linked Records Found
                    </AlertDialogTitle>
                    <AlertDialogDescription asChild>
                        <div className="space-y-4 text-sm text-muted-foreground">
                            <p>
                                <span className="text-foreground font-semibold">&quot;{itemName}&quot;</span> is referenced by {references.length} other record{references.length > 1 ? 's' : ''}:
                            </p>

                            {/* References List */}
                            <div className="max-h-40 overflow-y-auto border border-border bg-muted/30 p-3 space-y-2">
                                {Object.entries(groupedRefs).map(([collectionName, refs]) => (
                                    <div key={collectionName}>
                                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
                                            {collectionName} ({refs.length})
                                        </p>
                                        <ul className="space-y-1 pl-2 border-l-2 border-border">
                                            {refs.slice(0, 5).map((ref) => (
                                                <li key={ref.itemId} className="text-xs text-foreground/80">
                                                    {ref.itemName}
                                                    <span className="text-muted-foreground ml-1">
                                                        (via {ref.fieldLabel})
                                                    </span>
                                                </li>
                                            ))}
                                            {refs.length > 5 && (
                                                <li className="text-xs text-muted-foreground italic">
                                                    +{refs.length - 5} more...
                                                </li>
                                            )}
                                        </ul>
                                    </div>
                                ))}
                            </div>

                            <p className="text-xs">
                                How would you like to handle these linked records?
                            </p>
                        </div>
                    </AlertDialogDescription>
                </AlertDialogHeader>

                {/* Action Options */}
                <div className="grid gap-3 py-4">
                    {/* SET NULL Option */}
                    <button
                        type="button"
                        onClick={() => setSelectedAction('SET_NULL')}
                        disabled={loading}
                        className={cn(
                            "flex items-start gap-4 p-4 border text-left transition-all",
                            selectedAction === 'SET_NULL'
                                ? "border-primary bg-primary/5"
                                : "border-border hover:border-foreground/30 hover:bg-muted/30"
                        )}
                    >
                        <div className="w-8 h-8 bg-blue-500/10 flex items-center justify-center shrink-0">
                            <Unlink className="w-4 h-4 text-blue-500" />
                        </div>
                        <div className="space-y-1">
                            <p className="font-semibold text-sm uppercase tracking-wider">Unlink References</p>
                            <p className="text-xs text-muted-foreground">
                                Remove the link to this record from all referencing items. The items will remain but their relation field will be cleared.
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
                            <p className="font-semibold text-sm uppercase tracking-wider text-destructive">Delete All</p>
                            <p className="text-xs text-muted-foreground">
                                Delete this record AND all {references.length} referencing item{references.length > 1 ? 's' : ''}. This action cannot be undone.
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
