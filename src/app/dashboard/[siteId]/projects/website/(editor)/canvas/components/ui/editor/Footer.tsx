"use client"

export interface FooterProps {
  companyName?: string
  year?: string
  links?: string
}

export default function Footer({
  companyName = "Your Company",
  year = new Date().getFullYear().toString(),
  links = "Privacy, Terms, Contact",
}: FooterProps) {
  const linkArray = links.split(",").map((link) => link.trim())

  return (
    <footer className="border-t py-8 px-4 bg-muted/50">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {year} {companyName}. All rights reserved.
          </p>
          <div className="flex gap-6">
            {linkArray.map((link, index) => (
              <a key={index} href="#" className="text-sm text-muted-foreground hover:text-foreground">
                {link}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}

export const FooterMetadata = {
  name: "Footer",
  category: "layout",
  props: {
    companyName: { type: "string", default: "Your Company" },
    year: { type: "string", default: new Date().getFullYear().toString() },
    links: { type: "string", default: "Privacy, Terms, Contact" },
  },
}
