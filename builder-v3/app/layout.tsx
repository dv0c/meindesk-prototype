// Purpose: Root layout for the standalone builder-v3 Next.js app.

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Builder V3",
  description: "Local-first visual page builder",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
