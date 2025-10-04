# Real Estate CRM Dashboard

## Overview

A comprehensive Real Estate Customer Relationship Management (CRM) system built as a modern web application. The platform enables real estate agents to manage leads, contacts, deals, property listings, calendar appointments, and analytics through an intuitive dashboard interface. The system features a pipeline-based deal tracking system with drag-and-drop functionality, client relationship management with automated follow-ups, and comprehensive analytics for performance tracking.

## Recent Changes (October 4, 2025)

### Lead Management - Production Implementation

**Schema Updates**:
- Fixed phase value consistency: Changed default from 'new-lead' (hyphen) to 'new_lead' (snake_case) across all tables
- Extended `insertLeadSchema` to make DB-defaulted fields optional (lastContact, isClient)
- Successfully migrated database schema with `npm run db:push`

**Bug Fixes**:
1. **lastContact Sorting Bug**: Fixed timestamp handling in leads-table.tsx by converting timestamp strings to Date objects before sorting
2. **Edit Dialog Implementation**: Added complete edit flow with state management, dialog opening, and form pre-filling
3. **Delete Functionality**: Implemented delete action with confirmation dialog, API integration, and proper cache invalidation

**Form Implementation**:
- Lead form dialog supports both create and edit modes with single component
- Proper optional field handling: sends `undefined` instead of empty strings
- useEffect resets form immediately when lead/mode changes (no stale data)
- Phase dropdown values aligned with backend schema (snake_case)
- React Hook Form with Zod validation for all fields

**Cache Strategy**:
- Predicate-based query invalidation for all lead mutations
- Invalidates all queries where queryKey[0] starts with '/api/v1/leads'
- Covers base queries, filtered queries, paginated queries, and individual lead queries
- Ensures UI updates correctly after create/update/delete operations

**E2E Testing**:
- Complete CRUD flow verified with Playwright
- Create, edit, delete all working correctly
- Grid/Table view switching functional
- No runtime errors in production

**API Routes Confirmed**:
- POST /api/v1/leads - Create (validates with insertLeadSchema)
- GET /api/v1/leads - List all leads
- GET /api/v1/leads/:id - Get single lead
- PATCH /api/v1/leads/:id - Update (validates with partial schema)
- DELETE /api/v1/leads/:id - Delete (returns 204)
- GET /api/v1/leads/clients - List client leads

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Core Framework**: React 18+ with TypeScript in strict mode, utilizing Vite as the build tool and development server. The application follows a component-based architecture with client-side routing handled by Wouter.

**UI Component System**: Built on shadcn/ui (Radix UI primitives) with Tailwind CSS for styling. The design system implements Material Design 3 principles customized for real estate industry needs, featuring:
- Custom color palette with light/dark mode support via CSS variables
- Professional navy primary color (220 70% 45%) for trust and confidence
- Status-specific colors for lead scoring (hot/warm/cold) and deal stages
- Consistent spacing, elevation, and border radius tokens
- Typography using Inter, Outfit, and JetBrains Mono fonts

**State Management**: 
- TanStack Query (React Query) for server state and data fetching
- Local state hooks for UI interactions and form management
- Custom hooks (e.g., `useLeadsState`) for complex domain logic
- Theme state managed via Context API with localStorage persistence

**Key Features**:
- Drag-and-drop deal pipeline using @dnd-kit libraries
- Multi-view data presentation (grid, table, relationship manager)
- Real-time search and filtering capabilities
- Responsive sidebar navigation with collapsible states
- Toast notifications for user feedback
- Dark/light theme toggle

### Backend Architecture

**Server Framework**: Express.js with TypeScript, running on Node.js with ES modules enabled.

**API Design**: RESTful API structure with `/api` prefix for all application routes. The server includes:
- Middleware for JSON parsing and URL encoding
- Request/response logging with duration tracking
- Error handling middleware for consistent error responses
- Vite integration in development mode for HMR (Hot Module Reload)

**Data Access Layer**: Storage interface pattern with `IStorage` interface defining CRUD operations. Currently implemented with in-memory storage (`MemStorage`) using Map data structures, designed to be swapped with database-backed implementations.

**Development Tools**:
- Automatic server restart with tsx in development
- Production build uses esbuild for server bundling
- Vite dev server runs in middleware mode for seamless frontend integration

### Database & Schema

**ORM**: Drizzle ORM configured for PostgreSQL with schema-first approach.

**Schema Design**: Type-safe schema definitions using drizzle-orm with Zod validation:
- User authentication table with UUID primary keys
- Schema export patterns for INSERT operations and SELECT types
- Migration support via drizzle-kit

**Database Connection**: Configured to use Neon serverless PostgreSQL (@neondatabase/serverless) with connection string from environment variables.

**Type Safety**: Full TypeScript integration with inferred types from schema definitions, validation schemas generated via drizzle-zod.

### External Dependencies

**UI & Styling**:
- Radix UI component primitives (@radix-ui/*) for accessible, unstyled components
- Tailwind CSS with PostCSS for utility-first styling
- class-variance-authority and clsx for dynamic class composition
- Lucide React for consistent iconography

**Data & Forms**:
- React Hook Form with Zod resolvers for form validation
- TanStack Query for server state management
- date-fns for date manipulation and formatting

**Database & Backend**:
- Drizzle ORM for type-safe database queries
- Neon serverless PostgreSQL for database hosting
- Express.js for HTTP server and middleware

**Development**:
- Vite for fast development builds and HMR
- TypeScript for static type checking
- Replit-specific plugins for runtime error handling and development tooling

**Drag & Drop**:
- @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities for accessible drag-and-drop interactions

**Session Management**: Configured for connect-pg-simple (PostgreSQL session store) though not yet actively implemented in routes.