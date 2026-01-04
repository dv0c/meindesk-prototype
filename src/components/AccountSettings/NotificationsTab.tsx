"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Bell, Mail } from "lucide-react"
import { useState } from "react"

export function NotificationsTab() {
    const [emailMarketing, setEmailMarketing] = useState(false)
    const [emailSecurity, setEmailSecurity] = useState(true)
    const [pushActivity, setPushActivity] = useState(true)
    const [browserPush, setBrowserPush] = useState(false)

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">Notifications</h3>
                <p className="text-sm text-muted-foreground">
                    Manage how you receive updates and alerts.
                </p>
            </div>

            <div className="grid gap-6">
                {/* Email Notifications */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                            <Mail className="h-4 w-4" />
                        </div>
                        <h4 className="font-medium text-sm">Email Notifications</h4>
                    </div>
                    <Card>
                        <CardContent className="p-0 divide-y">
                            <div className="flex items-center justify-between p-4">
                                <div className="space-y-0.5">
                                    <Label htmlFor="email-marketing" className="text-base font-medium">Marketing & Updates</Label>
                                    <p className="text-xs text-muted-foreground">Receive news, product updates, and promotional offers.</p>
                                </div>
                                <Switch id="email-marketing" checked={emailMarketing} onCheckedChange={setEmailMarketing} />
                            </div>
                            <div className="flex items-center justify-between p-4">
                                <div className="space-y-0.5">
                                    <div className="flex items-center gap-2">
                                        <Label htmlFor="email-security" className="text-base font-medium">Security Alerts</Label>
                                        <span className="text-[10px] font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 px-1.5 py-0.5 rounded">Required</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground">Receive emails about your account security and login attempts.</p>
                                </div>
                                <Switch id="email-security" checked={emailSecurity} onCheckedChange={setEmailSecurity} disabled />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Push Notifications */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                            <Bell className="h-4 w-4" />
                        </div>
                        <h4 className="font-medium text-sm">Push Notifications</h4>
                    </div>
                    <Card>
                        <CardContent className="p-0 divide-y">
                            <div className="flex items-center justify-between p-4">
                                <div className="space-y-0.5">
                                    <Label htmlFor="push-activity" className="text-base font-medium">Activity & Comments</Label>
                                    <p className="text-xs text-muted-foreground">Receive notifications when someone comments on your projects.</p>
                                </div>
                                <Switch id="push-activity" checked={pushActivity} onCheckedChange={setPushActivity} />
                            </div>
                            <div className="flex items-center justify-between p-4">
                                <div className="space-y-0.5">
                                    <Label htmlFor="browser-push" className="text-base font-medium">Browser Push</Label>
                                    <p className="text-xs text-muted-foreground">Allow notifications from your browser even when you're away.</p>
                                </div>
                                <Switch id="browser-push" checked={browserPush} onCheckedChange={setBrowserPush} />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
