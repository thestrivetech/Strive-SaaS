import type { Metadata } from "next";
import { Toaster } from "@/components/(shared)/ui/toaster";
import { Toaster as Sonner } from "sonner";

export const metadata: Metadata = {
  title: "Strive Tech - SaaS Platform",
  description: "Enterprise B2B SaaS platform for business optimization and growth",
};

export default function PlatformLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      {children}
      <Toaster />
      <Sonner />
    </>
  );
}
