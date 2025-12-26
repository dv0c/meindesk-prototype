import React from 'react'
import { useNode } from '@craftjs/core'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CraftComponentProps } from './withCraftComponent'

interface SettingsSectionProps {
    title: string
    children: React.ReactNode
}

export function SettingsSection({ title, children }: SettingsSectionProps) {
    return (
        <div className="space-y-3 pb-4 border-b last:border-0">
            <h3 className="text-sm font-semibold text-foreground/80">{title}</h3>
            <div className="space-y-3">
                {children}
            </div>
        </div>
    )
}

interface SettingControlProps {
    label: string
    children: React.ReactNode
    description?: string
}

export function SettingControl({ label, children, description }: SettingControlProps) {
    return (
        <div className="space-y-1.5">
            <Label className="text-xs font-medium">{label}</Label>
            {children}
            {description && (
                <p className="text-xs text-muted-foreground">{description}</p>
            )}
        </div>
    )
}

/**
 * Common spacing controls (margin & padding)
 */
export function SpacingSettings() {
    const { actions: { setProp }, props } = useNode((node) => ({
        props: node.data.props as CraftComponentProps
    }))

    return (
        <SettingsSection title="Spacing">
            {/* Margin */}
            <SettingControl label="Margin">
                <div className="grid grid-cols-2 gap-2">
                    <Input
                        type="number"
                        placeholder="Top"
                        value={props.marginTop || ''}
                        onChange={(e) => setProp((p: CraftComponentProps) => p.marginTop = parseInt(e.target.value) || 0)}
                        className="h-8 text-xs"
                    />
                    <Input
                        type="number"
                        placeholder="Right"
                        value={props.marginRight || ''}
                        onChange={(e) => setProp((p: CraftComponentProps) => p.marginRight = parseInt(e.target.value) || 0)}
                        className="h-8 text-xs"
                    />
                    <Input
                        type="number"
                        placeholder="Bottom"
                        value={props.marginBottom || ''}
                        onChange={(e) => setProp((p: CraftComponentProps) => p.marginBottom = parseInt(e.target.value) || 0)}
                        className="h-8 text-xs"
                    />
                    <Input
                        type="number"
                        placeholder="Left"
                        value={props.marginLeft || ''}
                        onChange={(e) => setProp((p: CraftComponentProps) => p.marginLeft = parseInt(e.target.value) || 0)}
                        className="h-8 text-xs"
                    />
                </div>
            </SettingControl>

            {/* Padding */}
            <SettingControl label="Padding">
                <div className="grid grid-cols-2 gap-2">
                    <Input
                        type="number"
                        placeholder="Top"
                        value={props.paddingTop || ''}
                        onChange={(e) => setProp((p: CraftComponentProps) => p.paddingTop = parseInt(e.target.value) || 0)}
                        className="h-8 text-xs"
                    />
                    <Input
                        type="number"
                        placeholder="Right"
                        value={props.paddingRight || ''}
                        onChange={(e) => setProp((p: CraftComponentProps) => p.paddingRight = parseInt(e.target.value) || 0)}
                        className="h-8 text-xs"
                    />
                    <Input
                        type="number"
                        placeholder="Bottom"
                        value={props.paddingBottom || ''}
                        onChange={(e) => setProp((p: CraftComponentProps) => p.paddingBottom = parseInt(e.target.value) || 0)}
                        className="h-8 text-xs"
                    />
                    <Input
                        type="number"
                        placeholder="Left"
                        value={props.paddingLeft || ''}
                        onChange={(e) => setProp((p: CraftComponentProps) => p.paddingLeft = parseInt(e.target.value) || 0)}
                        className="h-8 text-xs"
                    />
                </div>
            </SettingControl>
        </SettingsSection>
    )
}

/**
 * Common sizing controls
 */
export function SizingSettings() {
    const { actions: { setProp }, props } = useNode((node) => ({
        props: node.data.props as CraftComponentProps
    }))

    return (
        <SettingsSection title="Size">
            <SettingControl label="Width">
                <Input
                    type="text"
                    placeholder="auto, 100%, 200px"
                    value={props.width || ''}
                    onChange={(e) => setProp((p: CraftComponentProps) => p.width = e.target.value)}
                    className="h-8 text-xs"
                />
            </SettingControl>

            <SettingControl label="Height">
                <Input
                    type="text"
                    placeholder="auto, 100%, 200px"
                    value={props.height || ''}
                    onChange={(e) => setProp((p: CraftComponentProps) => p.height = e.target.value)}
                    className="h-8 text-xs"
                />
            </SettingControl>

            <SettingControl label="Max Width">
                <Input
                    type="text"
                    placeholder="none, 1200px"
                    value={props.maxWidth || ''}
                    onChange={(e) => setProp((p: CraftComponentProps) => p.maxWidth = e.target.value)}
                    className="h-8 text-xs"
                />
            </SettingControl>
        </SettingsSection>
    )
}

/**
 * Common appearance controls (colors, borders)
 */
export function AppearanceSettings() {
    const { actions: { setProp }, props } = useNode((node) => ({
        props: node.data.props as CraftComponentProps
    }))

    return (
        <SettingsSection title="Appearance">
            <SettingControl label="Background Color">
                <div className="flex gap-2">
                    <Input
                        type="color"
                        value={props.backgroundColor || '#ffffff'}
                        onChange={(e) => setProp((p: CraftComponentProps) => p.backgroundColor = e.target.value)}
                        className="h-8 w-12 p-1"
                    />
                    <Input
                        type="text"
                        placeholder="#ffffff"
                        value={props.backgroundColor || ''}
                        onChange={(e) => setProp((p: CraftComponentProps) => p.backgroundColor = e.target.value)}
                        className="h-8 text-xs flex-1"
                    />
                </div>
            </SettingControl>

            <SettingControl label="Text Color">
                <div className="flex gap-2">
                    <Input
                        type="color"
                        value={props.color || '#000000'}
                        onChange={(e) => setProp((p: CraftComponentProps) => p.color = e.target.value)}
                        className="h-8 w-12 p-1"
                    />
                    <Input
                        type="text"
                        placeholder="#000000"
                        value={props.color || ''}
                        onChange={(e) => setProp((p: CraftComponentProps) => p.color = e.target.value)}
                        className="h-8 text-xs flex-1"
                    />
                </div>
            </SettingControl>

            <SettingControl label="Border Radius">
                <div className="space-y-2">
                    <Slider
                        value={[props.borderRadius || 0]}
                        onValueChange={([value]) => setProp((p: CraftComponentProps) => p.borderRadius = value)}
                        max={50}
                        step={1}
                        className="w-full"
                    />
                    <div className="text-xs text-muted-foreground text-right">{props.borderRadius || 0}px</div>
                </div>
            </SettingControl>

            <SettingControl label="Border">
                <div className="space-y-2">
                    <Input
                        type="number"
                        placeholder="Width (px)"
                        value={props.borderWidth || ''}
                        onChange={(e) => setProp((p: CraftComponentProps) => p.borderWidth = parseInt(e.target.value) || 0)}
                        className="h-8 text-xs"
                    />
                    <Select
                        value={props.borderStyle || 'solid'}
                        onValueChange={(value) => setProp((p: CraftComponentProps) => p.borderStyle = value as any)}
                    >
                        <SelectTrigger className="h-8 text-xs">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="solid">Solid</SelectItem>
                            <SelectItem value="dashed">Dashed</SelectItem>
                            <SelectItem value="dotted">Dotted</SelectItem>
                            <SelectItem value="none">None</SelectItem>
                        </SelectContent>
                    </Select>
                    <Input
                        type="text"
                        placeholder="Color"
                        value={props.borderColor || ''}
                        onChange={(e) => setProp((p: CraftComponentProps) => p.borderColor = e.target.value)}
                        className="h-8 text-xs"
                    />
                </div>
            </SettingControl>
        </SettingsSection>
    )
}

/**
 * All common settings combined
 */
export function CommonSettings() {
    return (
        <div className="space-y-4">
            <SpacingSettings />
            <SizingSettings />
            <AppearanceSettings />
        </div>
    )
}
