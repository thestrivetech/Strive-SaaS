import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "@/lib/env"; // Validate environment variables at startup
import { Providers } from "@/components/shared/providers";
import { Toaster } from "sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: {
    template: "%s | Strive Tech Platform",
    default: "Strive Tech - Enterprise SaaS Platform",
  },
  description: "AI-Powered Business Management Platform",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://app.strivetech.ai"
  ),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}