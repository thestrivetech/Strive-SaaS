

Scripts let you run each app individually (npm run dev:app) or both in parallel (npm run dev).

In app/web and app/app, keep each folder’s own next.config.js, package.json, tsconfig.json, etc.—they remain completely isolated from each other. Next.js will only look for app/ or pages/ inside the folder you cd into.

If you’re using Vercel, you can set up two separate project deployments:

One targeting the app/web folder (production domain strivetech.ai)

One targeting the app/app folder (subdomain app.strivetech.ai)
Vercel will detect each Next.js project by its package.json and build settings.

Shared code (e.g. design tokens, React components, utilities) can live in a top-level packages/ui or shared/ folder and be imported by both apps with workspace path aliases. Example:

text
// tsconfig.json (monorepo root)
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@shared/*": ["shared/*"]
    }
  }
}
Benefits of this structure:

Each app has isolation—no confusing root-level next.js lookups.

Clear separation of concerns: marketing site vs. SaaS platform.

Shared components/utilities can be hoisted into a workspace package.

You continue to adhere to Next.js expectations (each project has its own app/ or pages/ folder).

With this setup, you never need to move files or rename folders, and your two domains remain fully decoupled yet part of a single monorepo.
