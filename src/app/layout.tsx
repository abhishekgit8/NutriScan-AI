import type { Metadata, Viewport } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/components/ThemeProvider";
import { PostHogProvider } from "@/components/PostHogProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "NutriScan AI - Know What You Eat",
  description:
    "Scan barcodes, photograph ingredient labels, or snap food items. Get instant AI-powered health analysis personalized to your health profile.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/logo.svg",
  },
  openGraph: {
    title: "NutriScan AI",
    description: "Scan any food product and get instant AI-powered health analysis.",
    siteName: "NutriScan AI",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#22c55e",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className="min-h-screen antialiased">
          <ThemeProvider>
            <PostHogProvider>{children}</PostHogProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
