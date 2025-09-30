# Development Instructions

## Project Structure (Updated 2025-09-29)

The project uses Next.js 15 App Router with the following structure:

```
app/                    # Next.js project root
├── app/                # App Router directory (where all routes live)
│   ├── (platform)/     # Platform routes
│   ├── (web)/          # Marketing routes
│   └── api/            # API routes
├── components/
├── lib/
└── [config files]
```

## Quick Start

1. **Run development server:**
   ```bash
   cd app
   npm run dev
   ```
   Server runs on http://localhost:3000

2. **Access Prisma Studio:**
   ```bash
   npx prisma studio
   ```
   Database GUI on port 5555

3. **Test login:**
   - Visit: http://localhost:3000/login
   - Username/Email: jgramcoin@gmail.com
   - Password: TestPassword123!
   - Expected: Redirect to dashboard as ADMIN user