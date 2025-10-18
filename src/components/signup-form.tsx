"use client"

import { useState } from "react"
import { toast } from "sonner" // optional
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { signup } from "@/lib/actions/authentication/register-actions"

export function SignupForm({ ...props }: React.ComponentProps<typeof Card>) {
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const name = (formData.get("name") as string)?.trim()
    const email = (formData.get("email") as string)?.trim()
    const password = formData.get("password") as string
    const confirm = formData.get("confirm-password") as string

    if (!name || !email || !password || !confirm) {
      toast?.error("All fields are required")
      setLoading(false)
      return
    }

    if (password !== confirm) {
      toast?.error("Passwords do not match")
      setLoading(false)
      return
    }

    try {
      // Use server action
      const serverFormData = new FormData()
      serverFormData.append("email", email)
      serverFormData.append("password", password)
      // Optional: send extra data if you want, e.g., name
      // serverFormData.append("name", name)

      await signup(serverFormData) // redirect happens inside server action

      toast?.success(
        "Account created! Check your email for verification link."
      )
      e.currentTarget.reset()
    } catch (err: any) {
      toast?.error(err.message || "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  async function handleOAuth(provider: "google") {
    setLoading(true)
    try {
      // Keep client-side OAuth if you want redirect behavior
      // You could also implement server-side OAuth action
      window.location.href = `/actions/oauth-login?provider=${provider}`
    } catch (err: any) {
      toast?.error(err.message || "OAuth login failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card {...props}>
      <CardHeader>
        <CardTitle>Create an account</CardTitle>
        <CardDescription>
          Enter your information below to create your account
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="name">Full Name</FieldLabel>
              <Input id="name" name="name" type="text" placeholder="John Doe" required />
            </Field>

            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input id="email" name="email" type="email" placeholder="m@example.com" required />
              <FieldDescription>
                We&apos;ll use this to contact you. We won&apos;t share it.
              </FieldDescription>
            </Field>

            <Field>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Input id="password" name="password" type="password" required />
              <FieldDescription>Must be at least 8 characters long.</FieldDescription>
            </Field>

            <Field>
              <FieldLabel htmlFor="confirm-password">Confirm Password</FieldLabel>
              <Input id="confirm-password" name="confirm-password" type="password" required />
              <FieldDescription>Please confirm your password.</FieldDescription>
            </Field>

            <FieldGroup>
              <Field className="flex flex-col gap-2">
                <Button type="submit" disabled={loading}>
                  {loading ? "Creating account..." : "Create Account"}
                </Button>

                <Button
                  variant="outline"
                  type="button"
                  disabled={loading}
                  onClick={() => handleOAuth("google")}
                >
                  Sign up with Google
                </Button>

                <FieldDescription className="px-6 text-center">
                  Already have an account? <a href="/login">Sign in</a>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}
