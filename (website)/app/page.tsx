import { Metadata } from "next";
import { Hero } from "@/components/(web)/home/hero";
import { Features } from "@/components/(web)/home/features";
import { Solutions } from "@/components/(web)/home/solutions";
import { CaseStudies } from "@/components/(web)/home/case-studies";
import { Testimonials } from "@/components/(web)/home/testimonials";
import { CTA } from "@/components/(web)/home/cta";

export const metadata: Metadata = {
  title: "Strive Tech - AI-Powered Business Solutions",
  description:
    "Transform your business with custom AI automation, software development, and intelligent tools built by industry experts. Proven results, tailored strategies for sustainable growth.",
  keywords: [
    "AI automation",
    "business intelligence",
    "custom software development",
    "AI solutions",
    "digital transformation",
    "machine learning",
    "enterprise software",
  ],
  openGraph: {
    title: "Strive Tech - AI-Powered Business Solutions",
    description:
      "Transform your business with custom AI automation, software development, and intelligent tools built by industry experts.",
    url: "https://strivetech.ai",
    siteName: "Strive Tech",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Strive Tech - AI-Powered Business Solutions",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Strive Tech - AI-Powered Business Solutions",
    description:
      "Transform your business with custom AI automation, software development, and intelligent tools built by industry experts.",
    images: ["/twitter-image.png"],
  },
};

export default function HomePage() {
  return (
    <>
      <Hero />
      <Features />
      <Solutions />
      <CaseStudies />
      <Testimonials />
      <CTA />
    </>
  );
}
