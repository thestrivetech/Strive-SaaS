# Overview

This is a modern real estate business management dashboard built as a full-stack web application. The application provides a comprehensive "wow moment" interface for users to manage CRM, transactions, marketing, finance, and business intelligence through an interactive, visually striking dashboard with real-time data updates, AI-powered insights, and customizable widgets.

The project uses a React-based frontend with a Node.js/Express backend, featuring a glassmorphic design with neon accents, particle effects, and drag-and-drop dashboard customization.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

**Technology Stack:**
- React 18 with TypeScript for type-safe component development
- Vite as the build tool and development server
- Wouter for lightweight client-side routing
- TailwindCSS for utility-first styling with custom design tokens
- shadcn/ui component library (New York variant) for consistent UI components
- Framer Motion for animations and transitions
- React Query (@tanstack/react-query) for server state management and data fetching

**Design System:**
- Dark-first theme with glassmorphism effects
- Neon accent colors (#00D2FF cyan, #39FF14 green, #8B5CF6 purple)
- Custom CSS variables for theming in `index.css`
- Component aliases configured for clean imports (`@/components`, `@/lib`, etc.)

**Key Features:**
- Responsive dashboard with customizable widget grid using react-grid-layout
- Command palette (⌘K) for global search and navigation
- Real-time data updates with automatic polling (10-30 second intervals)
- Particle.js background for visual effects
- Mobile-responsive with dedicated bottom navigation

**Component Architecture:**
- Dashboard widgets (KPI rings, live charts, world map, activity feed, AI insights, smart suggestions)
- Collapsible sidebar with hierarchical navigation
- Hero section with animated greeting and quick stats
- Reusable UI components from shadcn/ui (dialogs, dropdowns, cards, etc.)

## Backend Architecture

**Technology Stack:**
- Node.js with Express.js for the REST API server
- TypeScript for type safety across the full stack
- Drizzle ORM for database operations
- Neon serverless PostgreSQL as the database provider

**API Design:**
- RESTful endpoints under `/api/*` prefix
- JSON request/response format
- Request logging middleware for debugging
- Error handling with proper HTTP status codes

**Key Routes:**
- `GET /api/dashboard/kpis` - Fetch KPI metrics
- `GET /api/dashboard/activities` - Fetch activity feed (with limit parameter)
- `POST /api/dashboard/activities` - Create new activity
- `GET /api/dashboard/settings/:userId` - Get user dashboard settings
- `PUT /api/dashboard/settings` - Update dashboard settings

**Development Features:**
- Hot module replacement in development via Vite
- Custom error overlay plugin for runtime errors
- Separate build process for client and server code

## Data Storage

**Database:**
- PostgreSQL database hosted on Neon (serverless)
- Connection via `@neondatabase/serverless` driver
- Schema defined in `shared/schema.ts` for type sharing between frontend and backend

**Database Schema:**
- `users` - User authentication and profile data
- `dashboard_settings` - User-specific dashboard layout, theme, accent color, and favorites
- `kpi_metrics` - Real-time KPI data with change tracking
- `activities` - Activity feed items with timestamps
- `leads` - Lead management (referenced but not fully shown)
- `deals` - Deal tracking (referenced but not fully shown)
- `notifications` - User notifications (referenced but not fully shown)

**ORM Features:**
- Drizzle ORM with TypeScript for type-safe database queries
- Zod schema validation using drizzle-zod for runtime type checking
- Migration support via drizzle-kit
- Shared types between client and server via `@shared` alias

**Storage Layer:**
- Abstract storage interface defined in `server/storage.ts`
- CRUD operations for all entities
- Support for relationships (foreign keys to users table)

## External Dependencies

**UI & Styling:**
- Radix UI primitives for accessible component foundations
- Tailwind CSS with PostCSS for styling
- class-variance-authority (CVA) for variant-based component styling
- Lucide React for icon library
- Google Fonts (Inter, DM Sans, Fira Code, Geist Mono, Architects Daughter)

**Data & State Management:**
- TanStack React Query for server state, caching, and real-time updates
- React Hook Form with Zod resolvers for form validation
- date-fns for date manipulation

**Developer Experience:**
- Replit-specific plugins for development (cartographer, dev banner, runtime error modal)
- ESBuild for server bundling in production
- TypeScript compiler for type checking

**Third-Party Integrations (Planned):**
- OpenAI API for AI insights and natural language search (client/src/lib/openai.ts)
- Weather API for live weather widget (client/src/hooks/use-weather.ts)
- Particles.js for animated background effects

**Production Deployment:**
- Client builds to `dist/public` directory
- Server bundles to `dist/index.js` using ESBuild
- Environment variable `DATABASE_URL` required for database connection
- Static file serving in production mode