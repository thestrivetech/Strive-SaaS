# AI Garage & Workbench

## Overview

AI Garage & Workbench is a custom AI agent and tool creation platform built with a futuristic, holographic aesthetic. The platform enables SaaS users to design, configure, and order bespoke AI solutions through an immersive, interactive interface featuring aurora-inspired gradients, glass morphism effects, and fluid animations.

The application provides a comprehensive suite of tools for AI agent creation, custom tool development, order management, template libraries, and a showcase gallery of completed projects. It emphasizes visual storytelling through its design system, creating an engaging user experience that communicates advanced AI capabilities.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework Stack:**
- React 18+ with TypeScript for type-safe component development
- Vite as the build tool and development server
- Wouter for lightweight client-side routing
- TanStack Query for server state management and data fetching

**UI Component System:**
- shadcn/ui (New York style) as the foundation component library
- Radix UI primitives for accessible, unstyled components
- Custom holographic components built on top of shadcn/ui base
- Tailwind CSS for utility-first styling with custom design tokens

**Design System:**
- Dark-mode-first approach with holographic glass morphism
- Aurora gradient system with multi-stop color transitions
- Custom CSS variables for theming (defined in index.css)
- Magnetic hover effects and fluid animations throughout
- Color palette: Cyan (primary), Violet (secondary), Emerald (success), with slate backgrounds

**State Management:**
- TanStack Query for async server state
- React hooks (useState, useEffect) for local component state
- Form state managed via react-hook-form with Zod validation

### Backend Architecture

**Server Framework:**
- Express.js with TypeScript for type-safe server-side code
- Node.js runtime environment
- RESTful API architecture (routes prefixed with /api)

**Development Setup:**
- Vite middleware integration for hot module replacement in development
- Custom error handling middleware with status code management
- Request/response logging for API endpoints

**Storage Interface:**
- Abstract IStorage interface for data persistence operations
- In-memory storage implementation (MemStorage) as default
- Designed for easy swap to database-backed storage (Drizzle ORM configured)

### Data Storage Solutions

**ORM and Database:**
- Drizzle ORM configured for PostgreSQL via @neondatabase/serverless
- Schema definitions in TypeScript using drizzle-orm pg-core
- Schema location: shared/schema.ts for isomorphic access
- Migration support via drizzle-kit

**Current Schema:**
- Users table with UUID primary keys, username, and password fields
- Extensible schema design for adding agents, tools, orders, templates

**Session Management:**
- connect-pg-simple configured for PostgreSQL session storage
- Session handling infrastructure ready for authentication implementation

### Authentication and Authorization

**Current State:**
- User schema defined with username/password fields
- Storage interface includes getUserByUsername and createUser methods
- Authentication implementation pending (infrastructure prepared)

**Planned Approach:**
- Session-based authentication using Express sessions
- Password hashing (infrastructure suggests bcrypt or similar)
- Query functions include 401 handling with configurable behavior

### External Dependencies

**AI/ML Services:**
- Anthropic Claude SDK (@anthropic-ai/sdk) for Claude model integration
- Google Generative AI (@google/genai) for Gemini models
- Infrastructure for multi-provider AI agent configuration

**Development Tools:**
- Replit-specific plugins for development environment integration
- @replit/vite-plugin-runtime-error-modal for error visualization
- @replit/vite-plugin-cartographer and dev-banner for development experience

**UI/UX Libraries:**
- Lucide React for consistent iconography
- date-fns for date manipulation and formatting
- class-variance-authority (CVA) for component variant management
- cmdk for command palette functionality

**Form Handling:**
- react-hook-form for performant form state management
- @hookform/resolvers with Zod schemas for validation
- Type-safe form definitions shared between client and server

### Key Architectural Decisions

**Monorepo Structure:**
- Client code in client/src directory
- Server code in server directory
- Shared types and schemas in shared directory
- Path aliases configured (@/ for client, @shared for shared code)

**Type Safety:**
- End-to-end TypeScript for type safety across stack
- Zod schemas for runtime validation and type inference
- drizzle-zod integration for database schema validation

**Component Architecture:**
- Atomic design approach with reusable UI primitives
- Custom holographic components wrap shadcn/ui base components
- Page components compose multiple feature components
- Example components provided for documentation and testing

**API Design:**
- RESTful conventions with /api prefix for all backend routes
- JSON request/response format
- Centralized error handling with status codes and messages
- Request logging with timing information

**Build and Deployment:**
- Separate build processes for client (Vite) and server (esbuild)
- Client builds to dist/public, server bundles to dist
- Production mode uses bundled server serving static client assets
- ESM module format throughout for modern JavaScript features