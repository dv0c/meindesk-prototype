"use client"
import { Card, CardContent } from "@/components/ui/card"

interface TeamMemberProps {
  name?: string
  role?: string
  bio?: string
  image?: string
  className?: string
  [key: string]: any
}

export function TeamMember({
  name = "John Doe",
  role = "Co-founder & CEO",
  bio = "Passionate about building great products",
  image = "/placeholder.svg?height=400&width=400",
  className = "",
  ...props
}: TeamMemberProps) {
  return (
    <Card className={className} {...props}>
      <CardContent className="p-0">
        <img src={image || "/placeholder.svg"} alt={name} className="h-64 w-full object-cover" />
        <div className="p-6">
          <h3 className="mb-1 text-xl font-bold">{name}</h3>
          <p className="mb-3 text-sm text-primary">{role}</p>
          <p className="text-sm text-muted-foreground">{bio}</p>
        </div>
      </CardContent>
    </Card>
  )
}
