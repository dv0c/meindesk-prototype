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
  title: "Meindesk Prototype",
  description: "Created for customers by Meintanis A.",
};

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
        <ThemeProvider attribute={'class'}>
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
