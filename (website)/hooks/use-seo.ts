import { useMemo } from "react";

interface SEOConfig {
  title: string;
  description: string;
  keywords?: string[];
  ogImage?: string;
  twitterImage?: string;
  url?: string;
}

export function useSEO(config?: Partial<SEOConfig>) {
  const defaultConfig: SEOConfig = {
    title: "Strive Tech - AI-Powered Business Solutions",
    description:
      "Transform your business with custom AI automation, software development, and intelligent tools built by industry experts.",
    keywords: [
      "AI automation",
      "business intelligence",
      "custom software development",
      "AI solutions",
      "digital transformation",
    ],
    ogImage: "/og-image.png",
    twitterImage: "/twitter-image.png",
    url: "https://strivetech.ai",
  };

  const seoConfig = useMemo(
    () => ({
      ...defaultConfig,
      ...config,
    }),
    [config]
  );

  return { seoConfig };
}
