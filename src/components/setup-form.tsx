"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { createSite } from "@/lib/actions/site/create-site-action"

export function SetupForm({ className, ...props }: React.ComponentProps<"div">) {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [url, setUrl] = useState("")
  const [logo, setLogo] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleNext = () => {
    if (title) setStep(step + 1)
  }

  const handleBack = () => {
    if (step > 1) setStep(step - 1)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    if (e.key === "Enter" && step === 1) {
      e.preventDefault()
      handleNext()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (step !== 2) return

    setLoading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append("title", title)
      formData.append("description", description)
      formData.append("url", url)
      formData.append("logo", logo)

      await createSite(formData)

      router.push("/dashboard")
    } catch (err: any) {
      setError(err.message || "Setup failed")
      setLoading(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Set Up Your Website</CardTitle>
          <CardDescription>Step {step} of 2 - Let's get your website configured</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} onKeyDown={handleKeyDown}>
            <FieldGroup>
              {/* Step 1 */}
              <div
                className={cn(
                  "transition-all duration-500 ease-in-out",
                  step === 1 ? "opacity-100 translate-x-0 block" : "opacity-0 -translate-x-full hidden"
                )}
              >
                <Field>
                  <FieldLabel htmlFor="title">Website Title</FieldLabel>
                  <Input
                    id="title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="My Awesome Blog"
                    required
                  />
                  <FieldDescription>This will be displayed as your site's main title</FieldDescription>
                </Field>

                <Field>
                  <FieldLabel htmlFor="description">Description</FieldLabel>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="A blog about technology, design, and innovation..."
                    rows={3}
                  />
                  <FieldDescription>A brief description of what your website is about</FieldDescription>
                </Field>
              </div>

              {/* Step 2 */}
              <div
                className={cn(
                  "transition-all duration-500 ease-in-out",
                  step === 2 ? "opacity-100 translate-x-0 block" : "opacity-0 translate-x-full hidden"
                )}
              >
                <Field>
                  <FieldLabel htmlFor="url">Website URL (Optional)</FieldLabel>
                  <Input
                    id="url"
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://mywebsite.com"
                  />
                  <FieldDescription>Your custom domain or website URL</FieldDescription>
                </Field>

                <Field>
                  <FieldLabel htmlFor="logo">Logo URL (Optional)</FieldLabel>
                  <Input
                    id="logo"
                    type="url"
                    value={logo}
                    onChange={(e) => setLogo(e.target.value)}
                    placeholder="https://example.com/logo.png"
                  />
                  <FieldDescription>URL to your website logo or brand image</FieldDescription>
                </Field>
              </div>

              {/* Navigation buttons */}
              <div className="flex gap-2 mt-4">
                {step > 1 && (
                  <Button type="button" variant="outline" onClick={handleBack} className="flex-1">
                    Back
                  </Button>
                )}
                {step < 2 ? (
                  <Button type="button" onClick={handleNext} disabled={!title} className="flex-1">
                    Next
                  </Button>
                ) : (
                  <Button type="submit" disabled={loading} className="flex-1">
                    {loading ? "Setting up..." : "Complete Setup"}
                  </Button>
                )}
              </div>

              {error && <p className="text-sm text-destructive text-center mt-2">{error}</p>}
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
