import React from 'react'
import { Container, Heading, Text, Button } from "../user-components"
import { LayoutTemplate, AlignCenter, Type, CreditCard, MessageSquare, Phone } from "lucide-react"

export interface Template {
    id: string
    name: string
    description: string
    category: string
    icon: React.ElementType
    content: React.ReactElement
}

export const templates: Template[] = [
    {
        id: "hero-centered",
        name: "Centered Hero",
        description: "High impact hero section with centered text and call to action",
        category: "Hero",
        icon: LayoutTemplate,
        content: (
            <Container padding={80} alignItems="center" justifyContent="center" backgroundColor="#f9fafb">
                <Heading level="h1" text="Build Your Dream Website" textAlign="center" marginBottom={20} fontSize={56} />
                <Text
                    text="Create stunning websites in minutes with our drag-and-drop builder. No coding required."
                    textAlign="center"
                    color="#4b5563"
                    fontSize={20}
                    maxWidth="700px"
                    marginBottom={40}
                />
                <Container flexDirection="row" gap={20} alignItems="center" justifyContent="center" minHeight="auto" padding={0}>
                    <Button text="Get Started" variant="primary" size="lg" />
                    <Button text="Learn More" variant="outline" size="lg" />
                </Container>
            </Container>
        )
    },
    {
        id: "features-3-col",
        name: "Features Grid",
        description: "Three column layout highlighting key features",
        category: "Features",
        icon: AlignCenter,
        content: (
            <Container padding={60} backgroundColor="#ffffff">
                <Container alignItems="center" marginBottom={50} minHeight="auto">
                    <Heading level="h2" text="Why Choose Us" textAlign="center" marginBottom={16} />
                    <Text text="Everything you need to build professional websites." textAlign="center" color="#6b7280" />
                </Container>

                <Container flexDirection="row" gap={30} justifyContent="center" alignItems="stretch" minHeight="auto">
                    {/* Feature 1 */}
                    <Container padding={30} backgroundColor="#ffffff" borderRadius={12} borderWidth={1} borderColor="#e5e7eb" className="flex-1">
                        <Container width="48px" height="48px" backgroundColor="#eff6ff" borderRadius={8} marginBottom={20} minHeight="48px" alignItems="center" justifyContent="center">
                            <Heading level="h4" text="⚡" marginBottom={0} />
                        </Container>
                        <Heading level="h3" text="Lightning Fast" fontSize={20} marginBottom={10} />
                        <Text text="Optimized for speed and performance out of the box." color="#6b7280" />
                    </Container>

                    {/* Feature 2 */}
                    <Container padding={30} backgroundColor="#ffffff" borderRadius={12} borderWidth={1} borderColor="#e5e7eb" className="flex-1">
                        <Container width="48px" height="48px" backgroundColor="#f0fdf4" borderRadius={8} marginBottom={20} minHeight="48px" alignItems="center" justifyContent="center">
                            <Heading level="h4" text="🎨" marginBottom={0} />
                        </Container>
                        <Heading level="h3" text="Beautiful Design" fontSize={20} marginBottom={10} />
                        <Text text="Professional templates and design tools at your fingertips." color="#6b7280" />
                    </Container>

                    {/* Feature 3 */}
                    <Container padding={30} backgroundColor="#ffffff" borderRadius={12} borderWidth={1} borderColor="#e5e7eb" className="flex-1">
                        <Container width="48px" height="48px" backgroundColor="#fef2f2" borderRadius={8} marginBottom={20} minHeight="48px" alignItems="center" justifyContent="center">
                            <Heading level="h4" text="📱" marginBottom={0} />
                        </Container>
                        <Heading level="h3" text="Mobile Ready" fontSize={20} marginBottom={10} />
                        <Text text="Fully responsive designs that look great on any device." color="#6b7280" />
                    </Container>
                </Container>
            </Container>
        )
    },
    {
        id: "cta-simple",
        name: "Simple CTA",
        description: "Minimal call to action strip",
        category: "CTA",
        icon: CreditCard,
        content: (
            <Container padding={60} backgroundColor="#111827" alignItems="center" justifyContent="center">
                <Heading level="h2" text="Ready to get started?" color="#ffffff" textAlign="center" marginBottom={16} />
                <Text text="Join thousands of users building with our platform today." color="#9ca3af" textAlign="center" marginBottom={30} />
                <Button text="Start for Free" variant="primary" backgroundColor="#ffffff" textColor="#000000" size="lg" />
            </Container>
        )
    },
    {
        id: "testimonial-card",
        name: "Testimonial",
        description: "Single testimonial card",
        category: "Testimonials",
        icon: MessageSquare,
        content: (
            <Container padding={60} backgroundColor="#f3f4f6" alignItems="center">
                <Container maxWidth="800px" padding={40} backgroundColor="#ffffff" borderRadius={16} boxShadow="md">
                    <Text
                        text="“This platform completely transformed how we build websites. The speed and flexibility are unmatched. Highly recommended for any team.”"
                        fontSize={24}
                        lineHeight={1.5}
                        color="#111827"
                        textAlign="center"
                        marginBottom={30}
                    />
                    <Container alignItems="center" minHeight="auto">
                        <Heading level="h4" text="Sarah Johnson" marginBottom={4} fontSize={18} />
                        <Text text="Product Designer, TechCorp" color="#6b7280" fontSize={14} />
                    </Container>
                </Container>
            </Container>
        )
    },
    {
        id: "contact-simple",
        name: "Contact Section",
        description: "Simple contact info layout",
        category: "Contact",
        icon: Phone,
        content: (
            <Container padding={60} backgroundColor="#ffffff">
                <Container flexDirection="row" gap={40} alignItems="center" className="container mx-auto">
                    <Container className="flex-1" minHeight="auto">
                        <Heading level="h2" text="Get in Touch" marginBottom={20} />
                        <Text text="Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible." color="#4b5563" marginBottom={30} />

                        <Container flexDirection="row" gap={12} alignItems="center" minHeight="auto" marginBottom={12}>
                            <Text text="📧" fontSize={20} />
                            <Text text="hello@example.com" color="#4b5563" />
                        </Container>
                        <Container flexDirection="row" gap={12} alignItems="center" minHeight="auto">
                            <Text text="📍" fontSize={20} />
                            <Text text="123 Design Street, Creative City" color="#4b5563" />
                        </Container>
                    </Container>
                    <Container className="flex-1" padding={40} backgroundColor="#f9fafb" borderRadius={16} minHeight="300px">
                        {/* Placeholder for actual form elements if available, for now just visuals */}
                        <Heading level="h4" text="Send us a message" marginBottom={20} />
                        <Container padding={12} backgroundColor="#ffffff" borderWidth={1} borderColor="#e5e7eb" borderRadius={6} marginBottom={16} minHeight="45px">
                            <Text text="Name" color="#9ca3af" fontSize={14} />
                        </Container>
                        <Container padding={12} backgroundColor="#ffffff" borderWidth={1} borderColor="#e5e7eb" borderRadius={6} marginBottom={16} minHeight="45px">
                            <Text text="Email" color="#9ca3af" fontSize={14} />
                        </Container>
                        <Container padding={12} backgroundColor="#ffffff" borderWidth={1} borderColor="#e5e7eb" borderRadius={6} marginBottom={20} minHeight="100px">
                            <Text text="Message" color="#9ca3af" fontSize={14} />
                        </Container>
                        <Button text="Send Message" fullWidth />
                    </Container>
                </Container>
            </Container>
        )
    }
]
