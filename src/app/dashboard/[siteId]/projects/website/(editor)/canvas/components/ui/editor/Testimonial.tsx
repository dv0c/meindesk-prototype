"use client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"

export interface TestimonialProps {
  quote?: string
  author?: string
  role?: string
  avatarUrl?: string
}

export default function Testimonial({
  quote = "This product has completely transformed how we work. Highly recommended!",
  author = "John Doe",
  role = "CEO, Company Inc.",
  avatarUrl,
}: TestimonialProps) {
  return (
    <Card className="max-w-2xl mx-auto my-8">
      <CardContent className="pt-6">
        <blockquote className="text-lg italic mb-4">"{quote}"</blockquote>
        <div className="flex items-center gap-4">
          <Avatar>
            <AvatarImage src={avatarUrl || "/placeholder.svg"} alt={author} />
            <AvatarFallback>{author.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold">{author}</p>
            <p className="text-sm text-muted-foreground">{role}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export const TestimonialMetadata = {
  name: "Testimonial",
  category: "content",
  props: {
    quote: { type: "string", default: "This product has completely transformed how we work. Highly recommended!" },
    author: { type: "string", default: "John Doe" },
    role: { type: "string", default: "CEO, Company Inc." },
    avatarUrl: { type: "string", default: "" },
  },
}
