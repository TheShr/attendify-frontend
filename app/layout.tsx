import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Analytics } from "@vercel/analytics/next";
import Header from "@/components/Headers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Attendify",
  description: "AI-powered attendance management system",
  generator: "v0.app",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body
        className={`font-sans ${GeistSans.variable} ${GeistMono.variable} text-gray-900
          min-h-screen
          bg-gradient-to-br from-white via-zinc-50 to-slate-100
          [background-image:radial-gradient(#e5e7eb_1px,transparent_1px)]
          [background-size:16px_16px]
          [background-position:0_0]
        `}
      >
        <Header />
        <main className="mx-auto max-w-6xl px-4 sm:px-6 py-8">{children}</main>
        <Analytics />
      </body>
    </html>
  );
}
