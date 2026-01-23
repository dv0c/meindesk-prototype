import LoadingBar from "@/components/LoadingBar";
import SessionProvider from "@/components/Providers/sessionProvider";
import { VersionProvider } from "@/components/Providers/VersionProvider";
import { Toaster } from "@/components/ui/sonner";
import { ScrollToTop } from "@/hooks/scrollToTop";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/Providers/ThemeProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PROTOTYPE — Blog Builder & Drag-Drop CMS",
  description:
    "Build stunning blogs with our intuitive drag-and-drop CMS. RSS feed scraper, SEO builder, custom themes, and a generous free tier. Total control over your content.",
  generator: "Prototype Builder",
  keywords: [
    "blog builder",
    "drag and drop cms",
    "rss feed scraper",
    "seo builder",
    "custom themes",
    "free tier",
    "total control over your content",
  ],
  authors: [
    {
      name: "Meindesk",
      url: "https://meindesk.com",
    },
  ],
  openGraph: {
    title: "PROTOTYPE — Blog Builder & Drag-Drop CMS",
    description:
      "Build stunning blogs with our intuitive drag-and-drop CMS. RSS feed scraper, SEO builder, custom themes, and a generous free tier. Total control over your content.",
    type: "website",
    locale: "en_US",
    siteName: "Meindesk",
    images: [
      {
        url: "/prototype-image.png",
        width: 1200,
        height: 630,
        alt: "PROTOTYPE — Blog Builder & Drag-Drop CMS",
      },
    ],
  },
  twitter: {
    title: "PROTOTYPE — Blog Builder & Drag-Drop CMS",
    description:
      "Build stunning blogs with our intuitive drag-and-drop CMS. RSS feed scraper, SEO builder, custom themes, and a generous free tier. Total control over your content.",
    card: "summary_large_image",
    images: [
      {
        url: "/prototype-image.png",
        width: 1200,
        height: 630,
        alt: "PROTOTYPE — Blog Builder & Drag-Drop CMS",
      },
    ],
  },
  icons: {
    icon: [
      {
        url: "/PrototypeFav.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/PrototypeFav.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/PrototypeFav.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/PrototypeFav.png",
  },
}


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider attribute={'class'} defaultTheme="dark" enableSystem={false}>
          <SessionProvider>
            <Toaster />
            <LoadingBar>
              <VersionProvider>
                <ScrollToTop />
                {children}
              </VersionProvider>
            </LoadingBar>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html >
  );
}
