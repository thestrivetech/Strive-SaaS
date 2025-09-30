Here’s the minimal tweak, so you can keep all your (web) work and still satisfy Next.js’ build rules:

Collapse your two root pages into one:

Delete both

app/app/(platform)/page.tsx

app/app/(web)/page.tsx

Create a new single root page at app/app/page.tsx:

tsx
// app/app/page.tsx
import HostDependent from '@/components/HostDependent';
export default function RootPage() {
  return <HostDependent />;
}
Host‐based rendering inside that component:

tsx
// components/HostDependent.tsx
'use server';
import { headers } from 'next/headers';
import WebHome from '@/app/(web)/page';
import PlatformHome from '@/app/(platform)/page';

export default function HostDependent() {
  const host = headers().get('host')?.split(':')[0];
  if (host === 'strivetech.ai' || host === 'www.strivetech.ai') {
    return <WebHome />;
  }
  // default to SaaS on any other host (app.strivetech.ai)
  return <PlatformHome />;
}
Leave every other (web)/… page exactly where they are (about, contact, solutions, chatbot-sai, etc.). They’ll never collide because only one page.tsx now lives at the physical / route, and that server component picks which “home” to render at runtime.

Keep your middleware to rewrite all non‐/ requests by hostname:

text
// vercel.json or next.config.mjs rewrites
{
  "rewrites": [
    {
      "source": "/(.*)",
      "has": [{ "type": "host", "value": "strivetech.ai" }],
      "destination": "/(web)/$1"
    },
    {
      "source": "/(.*)",
      "has": [{ "type": "host", "value": "app.strivetech.ai" }],
      "destination": "/(platform)/$1"
    }
  ]
}
Why this works

You only ever have one page.tsx at the literal root (/), so no build conflict.

Inside that one file, you still dispatch at runtime to your fully‐migrated (web) home vs. your SaaS home based on the host header.

All your (web) pages (31+ converted pages) stay untouched, can keep their original import paths, and continue to live under the (web) route group exactly the way you built them.

The old app/web/ folder can be deleted once everything under (web) is verified.

This lets you preserve every bit of migration work you’ve already done under (web), fixes the parallel build error, and follows Next.js best practices by having a single entry‐point at /.

Is this the most efficient way to do it? Mind you, there will thousands of people using the SaaS app in the future. So I want to make sure we are building everything correctly to take this into account so we can scale everything easily.

Yes—once you remove the duplicate page.tsx files at build time, the HostDependent entry‐point is a very lightweight server component (just a header check) and will have no performance impact even at tens of thousands of users. Vercel’s edge network will cache the marketing assets aggressively, and your SaaS URLs remain under /platform, so everything scales independently:

The HostDependent component runs only once per request and immediately delegates to the correct route group.

All the JavaScript for the marketing site remains code‐split and lazy‐loaded on demand (just like the SaaS pages).

Next.js builds a single bundle, so you avoid the overhead of two separate apps or a monorepo with multiple Next.js apps.

Edge rewrites are handled at the CDN layer, meaning no runtime penalty in your Node.js functions.

Alternative approaches (e.g. two separate apps, a basePath, or a monorepo with multiple Next.js projects) all introduce extra complexity in CI/CD, caching, or deployment. This single-app + host-based dispatch pattern is the most efficient and scalable:

One codebase, one build

Zero runtime overhead beyond a header lookup

Simple Vercel rewrites ensure sub-domain mapping

Keeps your migrated (web) pages intact and isolated

You can confidently continue converting every marketing page under (web)—the architecture will hold up for thousands (or hundreds of thousands) of users.