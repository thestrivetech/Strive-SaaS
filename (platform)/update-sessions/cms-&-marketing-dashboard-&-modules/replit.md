# Marketing Dashboard - Real Estate CMS

## Overview

This is a centralized content management and marketing dashboard designed for real estate agents. The platform enables agents to create, schedule, and analyze marketing campaigns across multiple channels including email, social media, and landing pages. Built with React, TypeScript, and Express, it provides a comprehensive suite of tools for managing marketing content and tracking performance metrics.

The application follows a full-stack architecture with a React frontend using shadcn/ui components and a Node.js/Express backend. It emphasizes professional design with a Linear-inspired aesthetic, focusing on information clarity, data density, and efficient workflows for busy real estate professionals.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React 18+ with TypeScript in strict mode, using Vite as the build tool and development server.

**Routing**: Client-side routing via Wouter, a lightweight alternative to React Router. Routes are defined in `App.tsx` with paths for Dashboard, Pages, Email Campaigns, Social Campaigns, Analytics, Media Library, and Settings.

**Component Library**: Built on shadcn/ui with Radix UI primitives, providing accessible, customizable components. The design system follows the "New York" style variant with custom theming supporting both light and dark modes.

**State Management**: 
- React Query (@tanstack/react-query) for server state management, caching, and API interactions
- React Context for theme management (ThemeContext)
- Local component state with React hooks for UI interactions

**Styling**: Tailwind CSS with custom design tokens defined in CSS variables. The color palette emphasizes professional real estate branding with primary blue (#3B82F6), semantic colors for different metrics (cyan for email, purple for social, teal for landing pages), and comprehensive light/dark mode support.

**Form Handling**: React Hook Form with Zod validation for type-safe form schemas, integrated via @hookform/resolvers.

**Key Design Decisions**:
- Information-dense layouts optimized for productivity tools
- Progressive disclosure for complex features
- Consistent interaction patterns across all modules
- Mobile-responsive design with breakpoint at 768px

### Backend Architecture

**Runtime**: Node.js with TypeScript using ESM modules.

**Web Framework**: Express.js configured with JSON body parsing and URL-encoded form support. The server implements middleware for request logging with timing metrics.

**API Design**: RESTful API with resource-based routes:
- `/api/campaigns` - CRUD operations for email and social campaigns
- `/api/pages` - Landing page management
- `/api/media` - Media library operations

All routes return JSON responses with proper HTTP status codes (201 for creation, 404 for not found, 400 for validation errors, 500 for server errors).

**Data Validation**: Zod schemas defined in shared schema file, validated on both client and server. Uses drizzle-zod for generating insert schemas from database tables.

**Storage Layer**: Abstracted through `IStorage` interface with in-memory implementation (`MemStorage`) for development. The interface is designed to be swapped with database-backed implementations (PostgreSQL via Drizzle ORM) without changing application logic.

**Development vs Production**:
- Development: Vite dev server integrated as Express middleware with HMR support
- Production: Static file serving from built assets in `dist/public`

**Error Handling**: Centralized error middleware that normalizes error responses and logs errors while maintaining stack traces in development.

### Data Storage Solutions

**ORM**: Drizzle ORM configured for PostgreSQL with schema-first approach.

**Database Schema**:

1. **Users Table**: Authentication storage with username/password fields
2. **Campaigns Table**: Multi-channel campaign data including:
   - Type field (email/social)
   - Status (draft/scheduled/active/completed)
   - Scheduled dates for publishing
   - Metrics (JSON field for sends, opens, clicks, impressions, engagement)
   - Platform array for social campaigns
3. **Pages Table**: Landing page content with:
   - URL slug management
   - JSON content storage for flexible page structures
   - SEO metadata (title, description)
   - View tracking
4. **Media Table**: Asset management with:
   - File type categorization
   - Tag system for organization
   - Size and URL tracking
   - Folder organization

**Key Schema Decisions**:
- UUID primary keys generated via `gen_random_uuid()`
- JSON fields for flexible, nested data (metrics, content blocks, tags)
- Automatic timestamp management with `createdAt` and `updatedAt`
- Unique constraints on usernames and page slugs

**Migration Strategy**: Drizzle Kit for schema migrations with configuration pointing to `shared/schema.ts`. Migrations output to `./migrations` directory.

### Authentication and Authorization

**Current Implementation**: Basic session-based authentication infrastructure in place with user table schema defined.

**Planned Enhancement**: The schema supports username/password authentication, but full authentication middleware is not yet implemented. Future implementation should add:
- Password hashing (bcrypt recommended)
- Session management with connect-pg-simple for PostgreSQL-backed sessions
- Protected route middleware
- User context propagation

### External Dependencies

**UI Component Libraries**:
- Radix UI primitives (@radix-ui/react-*) - Accessible, unstyled component primitives
- shadcn/ui component system built on Radix
- Lucide React for icons
- CMDK for command palette functionality

**Development Tools**:
- Vite with React plugin for fast development and optimized builds
- ESBuild for server bundle compilation
- TypeScript compiler for type checking
- Replit-specific plugins (cartographer, dev banner, runtime error overlay)

**Data & Validation**:
- Zod for runtime type validation
- date-fns for date manipulation and formatting
- class-variance-authority (CVA) for type-safe variant styling
- clsx and tailwind-merge for conditional className management

**Database & ORM**:
- Drizzle ORM for type-safe database queries
- @neondatabase/serverless for serverless PostgreSQL connections
- Drizzle Kit for schema management and migrations
- connect-pg-simple for session storage (configured but not fully integrated)

**State Management**:
- @tanstack/react-query v5 for server state and caching
- React Hook Form for form state
- @hookform/resolvers for validation integration

**Build & Runtime**:
- PostCSS with Tailwind CSS and Autoprefixer
- TSX for TypeScript execution in development
- Express for HTTP server
- Wouter for client-side routing

**Fonts**: Google Fonts integration with Inter (UI text) and JetBrains Mono (code/technical content).

**Environment Variables Required**:
- `DATABASE_URL` - PostgreSQL connection string (throws error if not provided)
- `NODE_ENV` - Development/production mode toggle

## Recent Changes (October 2025)

### Completed Features

#### Core Infrastructure ✅
- **Data Schema**: Complete type-safe schema in `shared/schema.ts` with Campaign, Page, Media, and User types
- **Storage Layer**: Full in-memory storage implementation (`server/storage.ts`) with CRUD operations for all resources
- **API Routes**: RESTful endpoints for campaigns (`/api/campaigns`), pages (`/api/pages`), and media (`/api/media`)
- **Type Safety**: Zod schemas with drizzle-zod integration for validation on both client and server
- **Query Client**: Configured TanStack Query with proper error handling and cache invalidation

#### Campaign Management ✅
- **CampaignModal Component**: Fully functional modal for creating email and social campaigns
  - Form validation with react-hook-form and Zod
  - Separate email and social campaign flows
  - Platform selection (Facebook, Instagram, LinkedIn, Twitter) for social campaigns
  - Status selection (draft, scheduled, active)
  - Scheduled date picker integration
  - Real-time form validation with error messages
- **Email Campaign List**: Complete list view with:
  - Real-time data fetching from API
  - Search/filter functionality
  - Create campaign button opening modal
  - Campaign cards displaying metrics
  - Loading and empty states
- **Social Campaign List**: Complete list view with:
  - Real-time data fetching from API
  - Search/filter functionality
  - Create campaign button opening modal
  - Platform badges for social posts
  - Loading and empty states

#### Pages & CMS ✅
- **PageModal Component**: Full-featured page creation modal
  - Auto-slug generation from title
  - SEO metadata fields (meta title, meta description)
  - Status management
  - Form validation with character limits
- **Pages List**: Complete page management interface
  - Create, view, and delete operations
  - Delete confirmation dialog
  - Search functionality
  - Page status badges
  - View count tracking
  - Last modified timestamps
- **DeleteConfirmDialog**: Reusable confirmation dialog for destructive actions

#### Dashboard ✅
- **Interactive Dashboard**: Real-time overview with:
  - Campaign statistics calculated from real data
  - Recent campaigns display (top 3)
  - Quick action cards for email, social, and pages
  - Campaign creation modals accessible from dashboard
  - Dynamic metrics (total campaigns, engagement, click rate)
  - Navigation to list views

#### UI/UX Improvements ✅
- **Loading States**: Implemented across all data fetching components
- **Empty States**: User-friendly messages when no data exists with CTA buttons
- **Error Handling**: Toast notifications for success/error feedback
- **Search Functionality**: Working search across campaigns and pages
- **Form Validation**: Real-time validation with helpful error messages
- **Responsive Design**: Mobile-first layout with proper breakpoints

#### Testing & Quality Assurance ✅
- **End-to-End Tests**: Comprehensive E2E test coverage for:
  - Campaign creation from dashboard quick actions
  - Campaign creation from list pages
  - Page creation with auto-slug generation
  - API integration and data persistence
  - Toast notifications and modal interactions
- **Bug Fixes**:
  - Fixed campaign type handling (removed from form, made prop-based)
  - Fixed apiRequest parameter order throughout application
  - Verified all API calls use correct (method, url, data) signature

### Implementation Details

#### Campaign Creation Flow
Campaigns can be created from three entry points:
1. **Dashboard Quick Actions**: Separate buttons for email and social that open type-specific modals
2. **Email Campaigns Page**: Create button opens modal pre-configured for email campaigns
3. **Social Campaigns Page**: Create button opens modal pre-configured for social campaigns

Each entry point passes the `campaignType` prop to `CampaignModal`, ensuring the correct fields are displayed and the proper type is submitted to the API.

#### API Integration Pattern
All mutations follow this pattern:
```typescript
const createMutation = useMutation({
  mutationFn: async (data) => apiRequest("POST", "/api/endpoint", data),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["/api/endpoint"] });
    toast({ title: "Success message" });
  },
  onError: () => {
    toast({ title: "Error", variant: "destructive" });
  }
});
```

#### Data Flow
1. User interacts with UI (clicks create button)
2. Modal opens with form validation
3. User fills form and submits
4. Form validation runs (client-side Zod)
5. API request sent to backend
6. Backend validates with Zod schema
7. Data stored in memory storage
8. Response returned to client
9. Query cache invalidated and refetched
10. Success toast displayed
11. Modal closes
12. UI updates with new data

### Pending Features

#### High Priority
- Rich text editor for campaign content
- Media upload system with drag-and-drop
- Campaign edit functionality
- Campaign delete with confirmation
- Campaign duplication
- Interactive analytics with charts
- Date range filters for analytics

#### Medium Priority
- Bulk operations for campaigns
- Calendar view for scheduled campaigns
- Campaign templates
- Email template builder
- Social media preview
- Page content blocks editor

#### Low Priority
- Export functionality
- Campaign history
- Performance optimization
- Advanced search filters
- Tag management for media
- User preferences