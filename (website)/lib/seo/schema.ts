/**
 * JSON-LD Schema Generators
 *
 * Generates structured data (schema.org) for rich search results.
 * Used in page layouts to improve SEO and search appearance.
 */

/**
 * Site configuration
 */
const siteConfig = {
  name: 'Strive Tech',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://strivetech.ai',
  logo: '/assets/logos/strive_logo.webp',
  email: 'contact@strivetech.ai',
  phone: '+1-XXX-XXX-XXXX', // TODO: Add real phone number
  address: {
    streetAddress: 'TBD',
    addressLocality: 'TBD',
    addressRegion: 'TBD',
    postalCode: 'TBD',
    addressCountry: 'US',
  },
  socialMedia: {
    linkedin: 'https://linkedin.com/company/strive-tech',
    twitter: 'https://twitter.com/strive_tech',
    github: 'https://github.com/strive-tech',
  },
};

/**
 * Generate Organization schema (for root layout)
 *
 * @returns JSON-LD Organization schema
 */
export function getOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteConfig.name,
    url: siteConfig.url,
    logo: `${siteConfig.url}${siteConfig.logo}`,
    description:
      'AI-powered business solutions and custom software development for modern enterprises',
    email: siteConfig.email,
    telephone: siteConfig.phone,
    address: {
      '@type': 'PostalAddress',
      ...siteConfig.address,
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: siteConfig.phone,
      contactType: 'Customer Service',
      email: siteConfig.email,
      areaServed: 'US',
      availableLanguage: ['English'],
    },
    sameAs: Object.values(siteConfig.socialMedia),
  };
}

/**
 * Generate Website schema
 *
 * @returns JSON-LD Website schema
 */
export function getWebsiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteConfig.name,
    url: siteConfig.url,
    description:
      'AI-powered business solutions and custom software development for modern enterprises',
    publisher: {
      '@type': 'Organization',
      name: siteConfig.name,
      logo: {
        '@type': 'ImageObject',
        url: `${siteConfig.url}${siteConfig.logo}`,
      },
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteConfig.url}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

/**
 * Generate Blog Posting schema
 *
 * @param post - Blog post data
 * @returns JSON-LD BlogPosting schema
 */
export function getBlogPostSchema(post: {
  title: string;
  description: string;
  author: string;
  datePublished: string;
  dateModified?: string;
  image: string;
  url: string;
  category?: string;
  tags?: string[];
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    image: `${siteConfig.url}${post.image}`,
    datePublished: post.datePublished,
    dateModified: post.dateModified || post.datePublished,
    author: {
      '@type': 'Person',
      name: post.author,
    },
    publisher: {
      '@type': 'Organization',
      name: siteConfig.name,
      logo: {
        '@type': 'ImageObject',
        url: `${siteConfig.url}${siteConfig.logo}`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': post.url,
    },
    ...(post.category && { articleSection: post.category }),
    ...(post.tags && { keywords: post.tags.join(', ') }),
  };
}

/**
 * Generate Article schema (for case studies)
 *
 * @param article - Article data
 * @returns JSON-LD Article schema
 */
export function getArticleSchema(article: {
  title: string;
  description: string;
  author?: string;
  datePublished: string;
  dateModified?: string;
  image: string;
  url: string;
  category?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    image: `${siteConfig.url}${article.image}`,
    datePublished: article.datePublished,
    dateModified: article.dateModified || article.datePublished,
    author: article.author
      ? {
          '@type': 'Person',
          name: article.author,
        }
      : {
          '@type': 'Organization',
          name: siteConfig.name,
        },
    publisher: {
      '@type': 'Organization',
      name: siteConfig.name,
      logo: {
        '@type': 'ImageObject',
        url: `${siteConfig.url}${siteConfig.logo}`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': article.url,
    },
    ...(article.category && { articleSection: article.category }),
  };
}

/**
 * Generate FAQ schema
 *
 * @param faqs - Array of FAQ items
 * @returns JSON-LD FAQPage schema
 */
export function getFAQSchema(faqs: Array<{ question: string; answer: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

/**
 * Generate Product schema (for solutions/services)
 *
 * @param product - Product/service data
 * @returns JSON-LD Product schema
 */
export function getProductSchema(product: {
  name: string;
  description: string;
  image?: string;
  offers?: {
    price?: number;
    currency?: string;
    availability?: string;
  };
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    ...(product.image && { image: `${siteConfig.url}${product.image}` }),
    brand: {
      '@type': 'Organization',
      name: siteConfig.name,
    },
    ...(product.offers && {
      offers: {
        '@type': 'Offer',
        price: product.offers.price,
        priceCurrency: product.offers.currency || 'USD',
        availability:
          product.offers.availability || 'https://schema.org/InStock',
        seller: {
          '@type': 'Organization',
          name: siteConfig.name,
        },
      },
    }),
  };
}

/**
 * Generate Service schema
 *
 * @param service - Service data
 * @returns JSON-LD Service schema
 */
export function getServiceSchema(service: {
  name: string;
  description: string;
  serviceType: string;
  areaServed?: string;
  provider?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.name,
    description: service.description,
    serviceType: service.serviceType,
    provider: {
      '@type': 'Organization',
      name: service.provider || siteConfig.name,
    },
    areaServed: {
      '@type': 'Country',
      name: service.areaServed || 'United States',
    },
  };
}

/**
 * Generate Breadcrumb schema
 *
 * @param items - Breadcrumb items
 * @returns JSON-LD BreadcrumbList schema
 */
export function getBreadcrumbSchema(
  items: Array<{ name: string; url: string }>
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${siteConfig.url}${item.url}`,
    })),
  };
}

/**
 * Generate Review schema
 *
 * @param review - Review data
 * @returns JSON-LD Review schema
 */
export function getReviewSchema(review: {
  itemName: string;
  author: string;
  rating: number;
  reviewBody: string;
  datePublished: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Review',
    itemReviewed: {
      '@type': 'Organization',
      name: review.itemName,
    },
    author: {
      '@type': 'Person',
      name: review.author,
    },
    reviewRating: {
      '@type': 'Rating',
      ratingValue: review.rating,
      bestRating: 5,
    },
    reviewBody: review.reviewBody,
    datePublished: review.datePublished,
  };
}

/**
 * Generate Event schema
 *
 * @param event - Event data
 * @returns JSON-LD Event schema
 */
export function getEventSchema(event: {
  name: string;
  description: string;
  startDate: string;
  endDate?: string;
  location?: {
    name: string;
    address?: string;
  };
  url?: string;
  image?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.name,
    description: event.description,
    startDate: event.startDate,
    ...(event.endDate && { endDate: event.endDate }),
    ...(event.location && {
      location: {
        '@type': 'Place',
        name: event.location.name,
        ...(event.location.address && {
          address: {
            '@type': 'PostalAddress',
            streetAddress: event.location.address,
          },
        }),
      },
    }),
    ...(event.url && { url: event.url }),
    ...(event.image && { image: `${siteConfig.url}${event.image}` }),
    organizer: {
      '@type': 'Organization',
      name: siteConfig.name,
      url: siteConfig.url,
    },
  };
}

/**
 * Helper to render JSON-LD script tag in React components
 *
 * Usage:
 * ```tsx
 * <script
 *   type="application/ld+json"
 *   dangerouslySetInnerHTML={{ __html: JSON.stringify(getOrganizationSchema()) }}
 * />
 * ```
 */
