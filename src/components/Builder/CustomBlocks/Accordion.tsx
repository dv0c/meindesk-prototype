"use client"
import {
  Accordion as AccordionComponent,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion"

interface AccordionProps {
  items?: Array<{ title: string; content: string }>
  className?: string
  [key: string]: any
}

export function Accordion({
  items = [
    { title: "Is it accessible?", content: "Yes. It adheres to the WAI-ARIA design pattern." },
    { title: "Is it styled?", content: "Yes. It comes with default styles to get you started." },
    { title: "Is it animated?", content: "Yes. It is animated by default." },
  ],
  className = "",
  ...props
}: AccordionProps) {
  return (
    <AccordionComponent className={`w-full ${className}`} {...props}>
      {items.map((item, index) => (
        <AccordionItem key={index} value={`item-${index}`}>
          <AccordionTrigger>{item.title}</AccordionTrigger>
          <AccordionContent>{item.content}</AccordionContent>
        </AccordionItem>
      ))}
    </AccordionComponent>
  )
}
