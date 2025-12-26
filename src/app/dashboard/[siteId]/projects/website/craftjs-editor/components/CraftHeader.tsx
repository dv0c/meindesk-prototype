"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Monitor, Tablet, Smartphone, Save, Eye, Undo, Redo, SidebarClose, Layers, LayoutTemplate, FileCode } from "lucide-react"
import { useEditor } from "@craftjs/core"
import Link from "next/link"
import { CraftLayersPopup } from "./CraftLayers"
import { Element } from "@craftjs/core"
import { Navbar } from "../user-components/Navbar"
import { Hero } from "../user-components"

interface CraftHeaderProps {
    pageName: string
    setPageName: (name: string) => void
    deviceMode: "desktop" | "tablet" | "mobile"
    setDeviceMode: (mode: "desktop" | "tablet" | "mobile") => void
    onSave: () => void
    isSaving: boolean
    showSidebar: boolean
    setShowSidebar: (show: boolean) => void
    siteId: string
}

export function CraftHeader({
    pageName,
    setPageName,
    deviceMode,
    setDeviceMode,
    onSave,
    isSaving,
    showSidebar,
    setShowSidebar,
    siteId,
}: CraftHeaderProps) {
    const { actions, query, canUndo, canRedo, enabled, selected } = useEditor((state, query) => {
        const currentNodeId = state.events.selected?.values().next().value
        return {
            canUndo: query.history.canUndo(),
            canRedo: query.history.canRedo(),
            enabled: state.options.enabled,
            selected: currentNodeId,
        }
    })

    const [showLayers, setShowLayers] = useState(false)

    const handleQuickSetup = () => {
        // Greek text content provided by user
        const greekContent = `
            <p>Από νωρίς στη ζωή μου με συγκινούσε η ανθρώπινη εμπειρία· η ανάγκη να κατανοώ, να αφουγκράζομαι και να αναζητώ το ουσιαστικό πίσω από τις λέξεις και τις συμπεριφορές. Η σύνδεση με τον άλλον, η παρουσία, η φροντίδα και η αλήθεια στη σχέση είναι για μένα θεμέλια της προσωπικής και επαγγελματικής μου ταυτότητας.</p>
            <p>Αυτή η βαθιά ανάγκη για κατανόηση και ουσιαστική επικοινωνία με τους ανθρώπους με οδήγησε φυσικά στον χώρο της ψυχικής υγείας και της θεραπευτικής.</p>
            <p>Είμαι Σύμβουλος Ψυχικής Υγείας Ενηλίκων, Εφήβων και Γονέων, και παρέχω επίσης συνεδρίες Θεραπείας Ζεύγους. Μέσα από τις σπουδές και την επαγγελματική μου πορεία έχω εξελίξει την ενσυναίσθησή μου και έχω αποκτήσει εμπειρία στο να συνοδεύω ανθρώπους στο προσωπικό τους ταξίδι αυτογνωσίας και εξέλιξης.</p>
            <p>Έχω εκπαιδευτεί σε διάφορες θεραπευτικές προσεγγίσεις και τεχνικές, γεγονός που μας επιτρέπει, μέσα από τη θεραπευτική σχέση, να αφουγκραστούμε τις ανάγκες σας και να τις διαχειριστούμε με τον πιο κατάλληλο τρόπο.</p>
            <p>Οι εκπαιδεύσεις μου αφορούν στις ακόλουθες προσεγγίσεις: Ψυχοδυναμική Συμβουλευτική, Γνωσιακή Συμπεριφοριστική Θεραπεία (CBT), Gestalt, Συστημική Αναπαράσταση, Art Therapy, Drama Therapy, Ομαδική Ανάλυση, Θεραπεία Ζεύγους, Σωματικά Επικεντρωμένη Ψυχοθεραπεία Gestalt. Για χρόνια ασχολήθηκα με το Θεατρικό Παιχνίδι, δουλεύοντας με ομάδες παιδιών και ενηλίκων.</p>
            <p>Συνεχίζω να επιμορφώνομαι σε θέματα ψυχολογίας, θεραπευτικών προσεγγίσεων και προσωπικής ανάπτυξης, παραμένοντας ανοιχτή στη συνεχή εξέλιξη.</p>
            <p>Μαζί μπορούμε να διερευνήσουμε όσα σας απασχολούν, σας δυσκολεύουν ή σας αγχώνουν, όσα ίσως στερούν την ικανοποίηση και τη χαρά από την καθημερινότητά σας και να αναδείξουμε το δυναμικό που υπάρχει μέσα σας, ξεπερνώντας τα εμπόδια που σας κρατούν μακριά από τη ζωή που επιθυμείτε.</p>
            <p>Αγαπημένη μου φράση "Κάθε στιγμή είναι η κατάλληλη στιγμή για μια νέα αρχή".</p>
        `

        // 1. Get the Root Node
        const rootNodeId = "ROOT"

        // 2. Create the Navbar Node
        const navbarNode = query.createNode(<Navbar />)

        // 3. Create the Hero Node with custom content
        const heroNode = query.createNode(<Hero content={greekContent} marginTop={50} thumbnail="https://www.sophiaplatanisioti.gr/_next/image?url=https%3A%2F%2Fres.cloudinary.com%2Fdiqgnn64x%2Fimage%2Fupload%2Fv1750415004%2F66f2bad889534a0c7ffb5fde%2Fuploads%2Fqsjvpd3vo50cz4kjuijw_vyhwn1.webp&w=828&q=100" />)

        // 4. Add them to the canvas
        if (navbarNode && navbarNode.data.type) {
            actions.add(navbarNode, rootNodeId)
        }
        if (heroNode && heroNode.data.type) {
            actions.add(heroNode, rootNodeId)
        }
    }

    return (
        <>
            <header className="h-16 border-b backdrop-blur-xl bg-background/80 shadow-sm flex items-center justify-between px-6 z-30 shrink-0">
                {/* Left: Page title */}
                <div className="flex items-center gap-4">
                    <Button
                        onClick={() => history.back()}
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 rounded-full hover:bg-muted transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div className="h-8 w-px bg-border/50" />
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20">
                            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                                CraftJS
                            </span>
                        </div>
                        <div>
                            <Input
                                size={pageName.length || 8}
                                maxLength={30}
                                onChange={(e) => setPageName(e.target.value)}
                                value={pageName || ""}
                                placeholder="Untitled"
                                className="h-9 bg-transparent border-none font-semibold text-base focus-visible:ring-0 focus-visible:ring-offset-0 px-2"
                            />
                        </div>
                    </div>
                </div>

                {/* Center: Device toggle */}
                <div className="absolute left-1/2 -translate-x-1/2 flex items-center bg-muted/50 rounded-full p-1 border shadow-sm backdrop-blur-sm">
                    <Button
                        variant={deviceMode === "desktop" ? "secondary" : "ghost"}
                        size="icon"
                        className="h-8 w-8 rounded-full transition-all"
                        title="Desktop View"
                        onClick={() => setDeviceMode("desktop")}
                    >
                        <Monitor className="h-4 w-4" />
                    </Button>
                    <Button
                        variant={deviceMode === "tablet" ? "secondary" : "ghost"}
                        size="icon"
                        className="h-8 w-8 rounded-full transition-all"
                        title="Tablet View"
                        onClick={() => setDeviceMode("tablet")}
                    >
                        <Tablet className="h-4 w-4" />
                    </Button>
                    <Button
                        variant={deviceMode === "mobile" ? "secondary" : "ghost"}
                        size="icon"
                        className="h-8 w-8 rounded-full transition-all"
                        title="Mobile View"
                        onClick={() => setDeviceMode("mobile")}
                    >
                        <Smartphone className="h-4 w-4" />
                    </Button>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2">
                    {enabled && (
                        <>
                            {/* Layers Toggle */}
                            <Button
                                variant={showLayers ? "secondary" : "ghost"}
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => setShowLayers(!showLayers)}
                                title="Toggle Layers Panel"
                            >
                                <Layers className="h-4 w-4" />
                            </Button>

                            <Button
                                variant={showSidebar ? "secondary" : "ghost"}
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => setShowSidebar(!showSidebar)}
                                title="Toggle Sidebar"
                            >
                                <SidebarClose className="h-4 w-4" />
                            </Button>

                            <div className="h-6 w-px bg-border/50 mx-1" />

                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => actions.history.undo()}
                                disabled={!canUndo}
                                title="Undo (Ctrl+Z)"
                            >
                                <Undo className="h-4 w-4" />
                            </Button>

                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-blue-600 hover:bg-blue-50"
                                onClick={handleQuickSetup}
                                title="Quick Setup (Demo)"
                            >
                                <LayoutTemplate className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => actions.history.redo()}
                                disabled={!canRedo}
                                title="Redo (Ctrl+Y)"
                            >
                                <Redo className="h-4 w-4" />
                            </Button>

                            <div className="h-6 w-px bg-border/50 mx-1" />
                        </>
                    )}

                    <Button
                        variant={!enabled ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                            const newEnabled = !enabled
                            actions.setOptions((options) => (options.enabled = newEnabled))
                            setShowSidebar(newEnabled)
                            if (!newEnabled) {
                                setShowLayers(false)
                            }
                        }}
                    >
                        <Eye className="h-4 w-4 mr-2" />
                        {!enabled ? "Exit Preview" : "Preview"}
                    </Button>

                    <Button size="sm" onClick={onSave} disabled={isSaving}>
                        <Save className="h-4 w-4 mr-2" />
                        {isSaving ? "Saving..." : "Save"}
                    </Button>
                </div>
            </header >

            {/* Floating Layers Popup */}
            < CraftLayersPopup isOpen={showLayers} onClose={() => setShowLayers(false)
            } />
        </>
    )
}
