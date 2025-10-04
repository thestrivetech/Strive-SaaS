# REID - Real Estate Intelligence Dashboard

## Overview

REID (Real Estate Intelligence Dashboard) is a full-stack web application built to analyze and visualize real estate market data. The platform provides comprehensive neighborhood insights including market metrics, demographics, school ratings, amenities, and investment analysis tools. The application features a modern dark-themed dashboard with interactive data visualizations, maps, and analytical tools designed for real estate professionals and investors.

**Tech Stack:**
- Frontend: React with TypeScript, Vite
- UI Framework: shadcn/ui components with Tailwind CSS
- Backend: Express.js with TypeScript
- Database: PostgreSQL with Drizzle ORM
- State Management: TanStack Query
- Validation: Zod
- Mapping: Leaflet
- Charts: Recharts

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Component Structure:**
- Modular dashboard design with collapsible sidebar navigation
- Eight core modules: Heatmap, Demographics, Schools & Amenities, Comparative Trends, ROI Simulator, AI Profiles, Alerts, and Export
- Responsive design using shadcn/ui component library built on Radix UI primitives
- Custom dark theme with neon accent colors (cyan/purple palette)
- Component examples provided for development and testing

**State Management:**
- TanStack Query for server state and data fetching
- localStorage for persisting user filters and preferences
- React Context for global filter state (area codes, date ranges, module toggles)

**Routing:**
- Wouter for client-side routing
- Single main route (/) serving the dashboard
- 404 handling for undefined routes

**Design System:**
- Tailwind CSS with custom theme configuration
- Design guidelines emphasizing data density, neon accents, and professional aesthetics
- Inter font family for primary typography
- Custom border radius and color system via CSS variables

### Backend Architecture

**API Structure:**
- RESTful API endpoints under `/api/v1/reid/`
- Express.js server with TypeScript
- Modular route registration pattern
- Global error handling middleware
- Request/response logging for API endpoints

**Key Endpoints:**
- `GET /api/v1/reid/insights` - Fetch all or filtered neighborhood insights
- `GET /api/v1/reid/insights/:areaCode` - Fetch specific neighborhood insight
- `POST /api/v1/reid/insights` - Create new neighborhood insight

**Data Layer:**
- Storage abstraction pattern (IStorage interface) for database operations
- DbStorage implementation using Drizzle ORM
- Support for filtering by area code

**Development Setup:**
- Vite development server with HMR
- Separate build process for client and server
- Custom Vite plugins for Replit integration (development banners, error overlay, cartographer)

### Data Storage

**Database:**
- PostgreSQL database (configured for Neon serverless)
- Drizzle ORM for type-safe database queries
- WebSocket support for real-time connections

**Schema:**
- `users` table: Basic user authentication (username/password)
- `neighborhood_insights` table: Core data model storing:
  - Area codes (zip or school district identifiers)
  - Market metrics (median price, days on market, inventory, price change)
  - Demographics (median age/income, households, commute times)
  - Amenities (school ratings, walk/bike scores, crime index, park proximity)
  - Timestamps for creation and updates

**Data Types:**
- JSON fields for complex nested data structures
- UUID primary keys with automatic generation
- Drizzle-Zod integration for runtime validation

**Seeding:**
- Sample data for San Francisco area codes (94110, 94123, 94107, 94115)
- Seed script for initial data population

### External Dependencies

**Third-Party Services:**
- Leaflet/MapBox: Interactive mapping and geospatial visualization
- Recharts: Data visualization library for charts and graphs
- Google Fonts: Inter and Fira Code font families
- CartoDB: Dark theme map tiles

**Development Tools:**
- Replit-specific plugins for development environment
- Vite plugins for enhanced development experience
- ESBuild for production server bundling

**UI Component Libraries:**
- Radix UI: Headless UI primitives for accessible components
- shadcn/ui: Pre-built component collection
- Lucide React: Icon system

**Planned Integrations (Not Yet Implemented):**
- OpenAI/Groq: AI-powered neighborhood profile generation
- Email/SMS: Alert notifications
- PDF Generation: Report exports
- External real estate data APIs for live market data

**Database Provider:**
- Neon Serverless PostgreSQL with WebSocket support
- Connection pooling via @neondatabase/serverless

**Validation & Type Safety:**
- Zod for schema validation
- TypeScript for compile-time type checking
- Drizzle-Zod for database schema to Zod schema conversion