import type { Metadata } from "next";
import "./globals.css";
import Navigation from "@/components/(web)/web/navigation";
import Footer from "@/components/(web)/web/footer";
import { Toaster } from "@/components/ui/toaster";
import { GoogleAnalytics } from "@/lib/analytics";
import { getOrganizationSchema } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Strive Tech - AI & Innovation Solutions",
  description: "Transform your business with cutting-edge AI solutions. Expert implementation, proven results, tailored strategies for sustainable growth.",
};

export default function WebLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;

  return (
    <>
      {/* Organization Schema for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(getOrganizationSchema()),
        }}
      />

      <Navigation />
      <main>{children}</main>
      <Footer />
      <Toaster />

      {/* Google Analytics */}
      {gaId && <GoogleAnalytics gaId={gaId} />}
    </>
  );
}