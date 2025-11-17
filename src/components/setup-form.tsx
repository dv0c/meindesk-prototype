// components/SetupForm.tsx
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils" // Utility for combining class names
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { createSite } from "@/lib/actions/site/create-site-action" // Your server action
import { Label } from "@/components/ui/label";
import { Link2Icon } from "lucide-react";

// ⚠️ IMPORTANT: DEFINE YOUR APPLICATION'S BASE DOMAIN HERE
const BASE_DOMAIN = ".meindesk.gr";

// --- ASSUMED CUSTOM COMPONENT PLACEHOLDERS ---
// Replace these with your actual component imports if they are global
interface ButtonGroupTextProps extends React.ComponentProps<"span"> { asChild?: boolean; }
const ButtonGroupText = (props: ButtonGroupTextProps) => <span {...props} className={cn("text-sm text-muted-foreground", props.className)} />;

interface InputGroupProps extends React.ComponentProps<"div"> { }
const InputGroup = (props: InputGroupProps) => <div {...props} className={cn("relative flex-grow", props.className)} />;

interface InputGroupInputProps extends React.ComponentProps<"input"> { }
// Using shadcn Input as base for the custom input component
const InputGroupInput = (props: InputGroupInputProps) => <Input {...props} className={cn("w-full rounded-md", props.className)} />;

interface InputGroupAddonProps extends React.ComponentProps<"div"> { align: "inline-end" | "inline-start"; }
const InputGroupAddon = (props: InputGroupAddonProps) => <div {...props} className={cn("absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground", props.className)} />;
// --- END PLACEHOLDERS ---


export function SetupForm({ className, ...props }: React.ComponentProps<"div">) {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [subdomain, setSubdomain] = useState("") // Subdomain state
  const [logo, setLogo] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleNext = () => {
    if (title.trim()) setStep(step + 1)
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

    if (!subdomain.trim()) {
      setError("Subdomain cannot be empty.")
      setLoading(false)
      return
    }

    // 1. Construct the final URL and clean the subdomain
    const cleanSubdomain = subdomain.toLowerCase().trim();
    const fullUrl = `https://${cleanSubdomain}${BASE_DOMAIN}`;

    try {
      // 2. Prepare FormData
      const formData = new FormData()
      formData.append("title", title)
      formData.append("description", description)
      formData.append("url", fullUrl)           // Full URL goes to the 'url' field
      formData.append("subdomain", cleanSubdomain) // Subdomain goes to the 'subdomain' field
      formData.append("logo", logo)

      // 3. Call the server action
      const res = await createSite(formData)
      // @ts-ignore
      if (res && res?.error) {
        // @ts-ignore
        throw new Error(res?.error);
      }

      // 4. Success: Redirect
      router.push("/dashboard/" + res.id)

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Setup failed. Please try again.")
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
              {/* ======================= Step 1 ======================= */}
              <div
                className={cn(
                  "transition-all duration-500 ease-in-out space-y-4",
                  step === 1 ? "opacity-100 translate-x-0 block" : "opacity-0 -translate-x-full hidden absolute w-full"
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

              {/* ======================= Step 2 ======================= */}
              <div
                className={cn(
                  "transition-all duration-500 ease-in-out space-y-4",
                  step === 2 ? "opacity-100 translate-x-0 block" : "opacity-0 translate-x-full hidden absolute w-full"
                )}
              >
                <Field>
                  <FieldLabel htmlFor="subdomain">Website Subdomain</FieldLabel>

                  {/* --- Subdomain Input Group (Separated Components) --- */}
                  <div className="flex items-center gap-2">

                    {/* Prefix: https:// */}
                    <ButtonGroupText asChild>
                      <Label htmlFor="subdomain" className="whitespace-nowrap">
                        https://
                      </Label>
                    </ButtonGroupText>

                    {/* Input Field */}
                    <InputGroup className="flex-grow">
                      <InputGroupInput
                        id="subdomain"
                        type="text"
                        value={subdomain}
                        // Basic cleanup: remove non-alphanumeric/non-hyphen characters
                        onChange={(e) => setSubdomain(e.target.value.replace(/[^a-zA-Z0-9-]/g, ''))}
                        placeholder="my-new-site"
                        required={step === 2}
                      />
                      {/* Icon Addon */}
                      <InputGroupAddon align="inline-end">
                        <Link2Icon className="w-4 h-4" />
                      </InputGroupAddon>
                    </InputGroup>

                    {/* Suffix: .meindesk.gr */}
                    <ButtonGroupText className="whitespace-nowrap">
                      {BASE_DOMAIN}
                    </ButtonGroupText>
                  </div>
                  {/* --- End Subdomain Input Group --- */}

                  <FieldDescription>
                    Your site URL will be https://{subdomain || 'example'}{BASE_DOMAIN}
                  </FieldDescription>
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
              <div className="flex gap-2 mt-6">
                {step > 1 && (
                  <Button type="button" variant="outline" onClick={handleBack} className="flex-1">
                    Back
                  </Button>
                )}
                {step < 2 ? (
                  <Button type="button" onClick={handleNext} disabled={!title.trim()} className="flex-1">
                    Next
                  </Button>
                ) : (
                  <Button type="submit" disabled={loading || !subdomain.trim()} className="flex-1">
                    {loading ? "Setting up..." : "Complete Setup"}
                  </Button>
                )}
              </div>

              {error && <p className="text-sm text-destructive text-center mt-4">{error}</p>}
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}