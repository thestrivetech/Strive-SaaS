import { Metadata } from "next";

export interface MetaTagsProps {
  title: string;
  description: string;
  keywords?: string[];
  ogImage?: string;
  twitterImage?: string;
  url?: string;
}

export function MetaTags({
  title,
  description,
  keywords,
  ogImage = "/og-image.png",
  twitterImage = "/twitter-image.png",
  url,
}: MetaTagsProps): Metadata {
  const siteUrl = url || "https://strivetech.ai";

  return {
    title,
    description,
    keywords: keywords || [],
    openGraph: {
      title,
      description,
      url: siteUrl,
      siteName: "Strive Tech",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [twitterImage],
    },
  };
}

// Helper function to generate structured data for Organization
export function getOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Strive Tech",
    url: "https://strivetech.ai",
    logo: "https://strivetech.ai/logo.png",
    description:
      "AI-powered solutions for modern businesses. Expert implementation, proven results, tailored strategies for sustainable growth.",
    sameAs: [
      "https://linkedin.com/company/strive-tech",
      "https://twitter.com/strive_tech",
      "https://github.com/strive-tech",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+1-XXX-XXX-XXXX",
      contactType: "customer service",
      email: "contact@strivetech.ai",
      areaServed: "US",
      availableLanguage: "English",
    },
  };
}

// Helper function to generate structured data for Blog Posts
export function getBlogPostSchema(post: {
  title: string;
  description: string;
  author: string;
  datePublished: string;
  image: string;
  url: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    author: {
      "@type": "Person",
      name: post.author,
    },
    datePublished: post.datePublished,
    image: post.image,
    url: post.url,
    publisher: {
      "@type": "Organization",
      name: "Strive Tech",
      logo: {
        "@type": "ImageObject",
        url: "https://strivetech.ai/logo.png",
      },
    },
  };
}
