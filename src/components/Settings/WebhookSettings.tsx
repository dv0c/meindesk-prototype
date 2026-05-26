"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type WebhookData = {
  revalidateUrl: string
  revalidateSecret: string
  hasSecret: boolean
  configured: boolean
}

type TestResult = {
  success: boolean
  status?: number
  error?: string
  body?: unknown
}

export function WebhookSettings({ siteId }: { siteId: string }) {
  const [url, setUrl] = useState("")
  const [secret, setSecret] = useState("")
  const [configured, setConfigured] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [testResult, setTestResult] = useState<TestResult | null>(null)

  useEffect(() => {
    fetch(`/api/team/${siteId}/webhooks`)
      .then((res) => res.json())
      .then((data: WebhookData) => {
        setUrl(data.revalidateUrl || "")
        setConfigured(data.configured)
      })
      .catch(() => setMessage({ type: "error", text: "Failed to load webhook settings" }))
      .finally(() => setLoading(false))
  }, [siteId])

  async function handleSave() {
    setSaving(true)
    setMessage(null)
    setTestResult(null)

    try {
      const body: Record<string, string> = {}
      if (url.trim()) body.revalidateUrl = url.trim()
      if (secret.trim()) body.revalidateSecret = secret.trim()

      if (!body.revalidateUrl && !body.revalidateSecret) {
        setMessage({ type: "error", text: "Provide at least a URL or secret." })
        return
      }

      const res = await fetch(`/api/team/${siteId}/webhooks`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      const data = await res.json()

      if (!res.ok) {
        setMessage({ type: "error", text: data.error || "Failed to save" })
        return
      }

      setConfigured(data.configured)
      setSecret("")
      setMessage({ type: "success", text: "Webhook settings saved." })
    } catch {
      setMessage({ type: "error", text: "Network error" })
    } finally {
      setSaving(false)
    }
  }

  async function handleTest() {
    setTesting(true)
    setTestResult(null)
    setMessage(null)

    try {
      const res = await fetch(`/api/team/${siteId}/webhooks/test`, {
        method: "POST",
      })

      const data: TestResult = await res.json()
      setTestResult(data)
    } catch {
      setTestResult({ success: false, error: "Network error" })
    } finally {
      setTesting(false)
    }
  }

  async function handleDelete() {
    setDeleting(true)
    setMessage(null)
    setTestResult(null)

    try {
      const res = await fetch(`/api/team/${siteId}/webhooks`, {
        method: "DELETE",
      })

      if (res.ok) {
        setUrl("")
        setSecret("")
        setConfigured(false)
        setMessage({ type: "success", text: "Webhook settings removed." })
      } else {
        const data = await res.json()
        setMessage({ type: "error", text: data.error || "Failed to remove" })
      }
    } catch {
      setMessage({ type: "error", text: "Network error" })
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="border rounded-lg p-6 bg-card">
        <p className="text-sm text-muted-foreground">Loading webhook settings...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Status */}
      <div className="border rounded-lg p-6 bg-card">
        <div className="flex items-center gap-3 mb-1">
          <div
            className={`h-2.5 w-2.5 rounded-full ${configured ? "bg-green-500" : "bg-yellow-500"}`}
          />
          <h4 className="text-sm font-medium">
            {configured ? "Webhook configured" : "Webhook not configured"}
          </h4>
        </div>
        <p className="text-xs text-muted-foreground ml-5.5">
          {configured
            ? "Your frontend will be notified when content changes."
            : "Set a URL and secret below to enable automatic cache revalidation."}
        </p>
      </div>

      {/* Form */}
      <div className="border rounded-lg p-6 bg-card space-y-4">
        <div className="space-y-2">
          <Label htmlFor="webhook-url">Revalidation URL</Label>
          <Input
            id="webhook-url"
            type="url"
            placeholder="https://yoursite.com/api/revalidate-all"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            The endpoint on your frontend that handles cache revalidation.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="webhook-secret">
            Revalidation Secret {configured && "(leave blank to keep current)"}
          </Label>
          <Input
            id="webhook-secret"
            type="password"
            placeholder={configured ? "••••••••" : "Enter a secret token"}
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Sent as a Bearer token in the Authorization header. Must match the
            REVALIDATION_SECRET_TOKEN on your frontend.
          </p>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </Button>

          {configured && (
            <>
              <Button
                variant="outline"
                onClick={handleTest}
                disabled={testing}
              >
                {testing ? "Testing..." : "Test Webhook"}
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? "Removing..." : "Remove"}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Feedback */}
      {message && (
        <div
          className={`border rounded-lg p-4 text-sm ${
            message.type === "success"
              ? "bg-green-50 border-green-200 text-green-800 dark:bg-green-950 dark:border-green-900 dark:text-green-300"
              : "bg-red-50 border-red-200 text-red-800 dark:bg-red-950 dark:border-red-900 dark:text-red-300"
          }`}
        >
          {message.text}
        </div>
      )}

      {testResult && (
        <div
          className={`border rounded-lg p-4 text-sm space-y-1 ${
            testResult.success
              ? "bg-green-50 border-green-200 text-green-800 dark:bg-green-950 dark:border-green-900 dark:text-green-300"
              : "bg-red-50 border-red-200 text-red-800 dark:bg-red-950 dark:border-red-900 dark:text-red-300"
          }`}
        >
          <p className="font-medium">
            {testResult.success ? "Webhook test successful" : "Webhook test failed"}
          </p>
          {testResult.status && (
            <p>HTTP status: {testResult.status}</p>
          )}
          {testResult.error && <p>Error: {testResult.error}</p>}
        </div>
      )}

      {/* Help */}
      <div className="border rounded-lg p-6 bg-card space-y-3">
        <h4 className="text-sm font-medium">How it works</h4>
        <ul className="text-xs text-muted-foreground space-y-1.5 list-disc list-inside">
          <li>
            When you publish, update, or delete content (pages, articles, categories,
            collection items), Meindesk sends a GET request to your revalidation URL.
          </li>
          <li>
            The request includes an <code className="bg-muted px-1 rounded">Authorization: Bearer &lt;secret&gt;</code> header.
          </li>
          <li>
            Your frontend should call <code className="bg-muted px-1 rounded">revalidateTag</code> / <code className="bg-muted px-1 rounded">revalidatePath</code> to
            purge its cache so visitors see the latest content.
          </li>
        </ul>
      </div>
    </div>
  )
}
