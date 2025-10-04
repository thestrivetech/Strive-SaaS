# RealtyFlow - Real Estate Transaction Management Platform

## Overview

RealtyFlow is a comprehensive real estate transaction management platform similar to DotLoop, designed to streamline property transactions through digital workflows, document management, e-signatures, and compliance tracking. The platform provides a professional, information-dense interface for managing transaction loops, parties, documents, tasks, and milestones throughout the real estate closing process.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System:**
- React 18+ with TypeScript in strict mode
- Vite as the build tool and development server
- Wouter for client-side routing (lightweight alternative to React Router)
- Component-based architecture with separation between pages (`/pages`), reusable components (`/components`), and UI primitives (`/components/ui`)

**State Management & Data Fetching:**
- TanStack React Query (v5) for server state management, caching, and automatic refetching
- Custom hooks pattern for data operations (e.g., `useLoops`, `useDocuments`, `useTasks`)
- Client-side state managed through React hooks and context where needed

**UI Component System:**
- shadcn/ui component library with Tailwind CSS for styling
- Design system inspired by Linear (data-dense UIs), Notion (document organization), and DocuSign (signature workflows)
- Radix UI primitives for accessible, unstyled components
- Custom theme using CSS variables for consistent color palette and dark mode support
- Form handling with React Hook Form and Zod for validation

**Key Design Principles:**
- Information density: Maximize useful data without clutter
- Professional aesthetic conveying trust and legal validity
- Status-based color coding (draft, active, under contract, closing, closed, cancelled)
- Responsive design with mobile-optimized layouts

### Backend Architecture

**Server Framework:**
- Express.js server with TypeScript
- RESTful API architecture with routes under `/api/*`
- Middleware for request logging, JSON parsing, and error handling

**API Structure:**
- Loop management: `GET/POST /api/loops`, `GET /api/loops/:id`
- Document management: `GET/POST /api/documents`
- Task management: `GET/POST/PATCH /api/tasks`
- Party management: `GET/POST /api/parties`
- Milestone tracking: `GET/POST /api/milestones`
- Activity logging: `GET/POST /api/activities`

**Data Validation:**
- Zod schemas defined in shared schema file for runtime validation
- drizzle-zod for automatic schema generation from database models
- Validation errors formatted with zod-validation-error for user-friendly messages

### Data Storage

**Database:**
- PostgreSQL via Neon serverless database
- Drizzle ORM for type-safe database queries
- WebSocket connection support for real-time capabilities

**Schema Design:**
- `users`: Authentication and user profiles
- `loops`: Transaction loops (property transactions)
- `documents`: File metadata with versioning support
- `tasks`: Checklist items with assignments and due dates
- `parties`: Transaction participants with roles and permissions
- `milestones`: Timeline events for transaction progress
- `activities`: Audit log of all system actions

**Data Access Pattern:**
- Storage interface abstraction (`IStorage`) allows for multiple implementations
- In-memory storage (`MemStorage`) for development/testing
- Database-backed storage for production
- Foreign key constraints with cascade delete for data integrity

### Authentication & Authorization

**Current Implementation:**
- Basic user authentication structure in place
- Session-based approach anticipated (Express sessions with connect-pg-simple)
- Role-based access control through party permissions system

**Planned Security Features:**
- JWT or session-based authentication
- Role-based permissions (View, Edit, Sign, Manage Parties, Message)
- Document-level access control
- Audit logging for compliance

### External Dependencies

**Third-Party Services (Planned/Required):**
- **E-Signature Provider**: DocuSign or similar API for signature workflows and legal validity
- **File Storage**: Cloud storage solution (AWS S3, Google Cloud Storage) for document uploads
- **Email Service**: SendGrid, Mailgun, or AWS SES for notifications and signature requests
- **WebSocket/Real-time**: Socket.io or Pusher for real-time updates on signatures, uploads, and status changes
- **PDF Processing**: PDF.js for in-browser document viewing and annotation
- **Identity Verification**: SMS OTP service (Twilio, AWS SNS) for signature ceremony verification

**Development Tools:**
- Replit-specific plugins for development environment
- ESBuild for production builds
- Drizzle Kit for database migrations

**UI Libraries:**
- date-fns for date formatting and manipulation
- lucide-react for icon system
- cmdk for command palette functionality
- class-variance-authority for component variant management

### Integration Points

**API Integration Strategy:**
- React Query hooks fetch from `/api/v1/*` endpoints
- Optimistic updates for immediate UI feedback
- Error boundaries and retry logic for resilience
- WebSocket or Server-Sent Events for real-time synchronization

**File Upload Flow:**
1. Client-side file validation (type, size)
2. Multipart upload to backend endpoint
3. Virus scanning (planned)
4. Storage in cloud service with metadata in database
5. Version control for document updates

**Signature Workflow:**
1. Document upload and preparation
2. Party selection and signing order configuration
3. Email notifications with secure signing links
4. Identity verification step (SMS OTP)
5. Digital signature capture using Signature Pad component
6. Document finalization and distribution
7. Audit trail with tamper-evident hashing

### Performance & Scalability

**Optimization Strategies:**
- Lazy loading for route-based code splitting
- Infinite scroll or pagination for large datasets
- Memoization for expensive computations
- Image optimization and lazy loading
- Query caching and background refetching with React Query

**Deployment Architecture:**
- Static frontend assets served from CDN
- Node.js backend on scalable container platform
- PostgreSQL database with connection pooling
- Horizontal scaling for API servers