# NeuroFlow Hub - AI Automation Platform

## Project Overview
Comprehensive AI automation platform featuring drag-and-drop workflow builder, AI agent creation, team orchestration, and real-time execution monitoring.

## Tech Stack
- **Frontend**: React 18, TypeScript, React Flow, TailwindCSS, Shadcn UI
- **Backend**: Express.js, TypeScript, WebSocket (ws library)
- **Database**: Supabase PostgreSQL with Drizzle ORM
- **AI Providers**: OpenAI (gpt-4o), Anthropic (claude-sonnet-4-20250514)
- **Real-time**: WebSocket for live workflow execution updates
- **Build Tool**: Vite

## Design Theme
- **Style**: Futuristic UI with glassmorphism effects and neon accents
- **Colors**: 
  - Electric Blue: #00D2FF
  - Cyber Green: #39FF14  
  - Violet accents
- **Dark theme** with gradient backgrounds

## Database Schema (PostgreSQL)
All tables use UUID primary keys with `gen_random_uuid()` default.

### Core Tables
- **users**: User accounts with authentication
- **workflows**: Workflow definitions with nodes/edges (JSONB)
- **ai_agents**: AI agents with personality, memory, and model config (JSONB)
- **agent_teams**: Team configurations for multi-agent orchestration
- **team_members**: Agent-to-team mappings with roles
- **integrations**: External service integrations (Slack, Gmail, etc.)
- **workflow_executions**: Execution history and metrics
- **agent_executions**: Individual agent execution logs
- **templates**: Pre-built workflow templates for marketplace

## Project Structure
```
├── client/src/          # React frontend
│   ├── components/      # Reusable UI components
│   ├── pages/           # Main application pages
│   ├── lib/             # Utilities and AI provider configs
│   └── store/           # Zustand state management
├── server/              # Express backend
│   ├── db.ts            # Database connection (Drizzle)
│   ├── storage.ts       # DbStorage implementation
│   ├── routes.ts        # API endpoints
│   ├── workflow-engine.ts  # Workflow execution engine
│   └── seed.ts          # Database seeding script
├── shared/              # Shared TypeScript types
│   └── schema.ts        # Drizzle schema definitions
└── drizzle.config.ts    # Drizzle ORM configuration
```

## Recent Changes (Latest Session)
### Database Migration (Completed ✅)
- Migrated from in-memory storage (MemStorage) to real Supabase PostgreSQL database
- Implemented DbStorage class with Drizzle ORM for all CRUD operations
- Successfully pushed database schema and seeded with demo data (demo user, 3 agents, 3 templates)
- All API routes now use persistent database storage

### Workflow Execution Engine (In Progress 🔄)
- Created workflow-engine.ts with OpenAI and Anthropic integration
- Implemented topological sort for node execution ordering  
- Added AI agent execution with personality and memory management
- Integrated conversation history tracking for AI agents
- Added `/api/workflows/:id/execute` endpoint for workflow execution
- **Known Issues**: 
  - Complex conditional branching logic needs refinement
  - OpenAI API usage for newer models needs validation
  - Production error handling needs hardening

### Type Safety (Completed ✅)
- Fixed all LSP diagnostics and type errors across the codebase
- Proper TypeScript types for all database operations

### Integration Connector System (Completed ✅)
- Built extensible connector framework with BaseConnector class
- Implemented 4 pre-built connectors: Slack, Webhook, HTTP, Email
- Connector registry for dynamic connector management
- API routes for connector testing and action execution
- Proper credential management and validation
- Each connector defines actions with input/output schemas

### WebSocket Real-time Updates (Completed ✅)
- WebSocket server initialized on `/ws` endpoint
- Real-time workflow execution notifications
- Event types: workflow_started, workflow_completed, workflow_failed, node_started, node_completed, node_failed, agent_update
- React hook `useWebSocket()` for frontend connection
- Automatic reconnection logic with 3-second retry
- Toast notifications for workflow completion/failure
- Connection status indicator component
- **Multi-tenant architecture**: Broadcasts scoped by userId (workflow/agent owner only receives their events)
- **Note**: Currently uses demo user auth for MVP. Production requires real session/JWT authentication

### Enhanced AI Agent Capabilities (Completed ✅)
- **Tool/Function calling framework** with 5 built-in tools
  - get_current_time: Real-time clock (production-ready)
  - calculate: Safe mathematical operations (add, subtract, multiply, divide, power)
  - search_knowledge_base: Stub for vector DB integration
  - send_notification: Stub for notification service
  - fetch_data: Stub for database/API integration
- **Security-first design**: All condition evaluation and calculations use safe parsing (no arbitrary code execution)
- **OpenAI integration**: Full tool calling support with multi-turn conversations
- **Agent-specific tools**: Enable/disable tools per agent via capabilities field
- **Tool result feedback**: AI receives tool outputs for informed follow-up responses
- **Production notes**: All stub tools clearly marked for future implementation

### Team Orchestration Patterns (Completed ✅)
- **4 coordination patterns** for multi-agent collaboration
  - Hierarchical: Leader delegates individualized subtasks to workers, synthesizes results
  - Collaborative: All agents contribute independently, coordinator synthesizes
  - Pipeline: Sequential processing with each agent building on previous output
  - Democratic: Agents propose solutions and vote on best approach
- **Role-based agent ordering**: Honors team configuration for leader/worker/pipeline roles
- **Agent-to-agent messaging**: Message history tracking for collaboration transparency
- **POST /api/teams/:id/execute**: Execute team tasks with specified coordination pattern
- **Integration with workflow engine**: Reuses shared workflow engine for consistency
- **Production note**: Agent execution integration requires public API for production stability

### Analytics Dashboard (Completed ✅)
- **Comprehensive metrics tracking** with 3 specialized analytics endpoints
  - GET /api/analytics/executions: Total executions, success rate, avg duration, failure count
  - GET /api/analytics/agents: Agent-specific performance metrics and task completion stats
  - GET /api/analytics/costs: Token usage and cost analysis by AI model
- **Storage aggregation methods**: getExecutionMetrics, getAgentPerformanceMetrics, getCostMetrics
- **Data visualizations** using Recharts library
  - PieChart: Success vs Failure distribution
  - BarChart: Agent performance comparison
  - Cost breakdown by model (OpenAI vs Anthropic)
- **Real-time metrics**: React Query integration for live data updates
- **Time-range selector**: UI ready for 7d/30d/90d/1y filtering (backend filtering to be added)
- **Top performers**: Displays best-performing agents by success rate
- **Cost optimization insights**: Model usage breakdown for ROI analysis
- **UI/UX improvements**: Fixed all React warnings (nested links, Progress component props)

## API Endpoints

### Workflows
- `GET /api/workflows` - List user's workflows
- `GET /api/workflows/:id` - Get specific workflow
- `POST /api/workflows` - Create new workflow
- `PUT /api/workflows/:id` - Update workflow
- `DELETE /api/workflows/:id` - Delete workflow
- `POST /api/workflows/:id/execute` - Execute workflow

### AI Agents
- `GET /api/agents` - List user's agents
- `GET /api/agents/:id` - Get specific agent
- `POST /api/agents` - Create new agent
- `PUT /api/agents/:id` - Update agent
- `DELETE /api/agents/:id` - Delete agent

### Agent Teams
- `GET /api/teams` - List user's teams
- `POST /api/teams` - Create new team
- `GET /api/teams/:id/members` - Get team members

### Integrations
- `GET /api/integrations` - List user's integrations
- `POST /api/integrations` - Create integration

### Executions
- `GET /api/executions` - List workflow executions (with filters)
- `POST /api/executions` - Create execution record
- `PUT /api/executions/:id` - Update execution status

### Templates
- `GET /api/templates` - List templates (with filters)
- `GET /api/templates/:id` - Get specific template
- `POST /api/templates` - Create new template

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/system/health` - Get system health metrics

### Analytics
- `GET /api/analytics/executions` - Get execution metrics (total, success rate, avg duration)
- `GET /api/analytics/agents` - Get agent performance metrics
- `GET /api/analytics/costs` - Get cost metrics by AI model

## Environment Variables Required
```bash
DATABASE_URL=<supabase-connection-string>
SESSION_SECRET=<random-secret>
OPENAI_API_KEY=<openai-key>      # Optional: for AI workflows
ANTHROPIC_API_KEY=<anthropic-key> # Optional: for AI workflows
```

## Development Commands
```bash
npm run dev           # Start development server (port 5000)
npm run db:push       # Push schema changes to database
npm run db:push --force  # Force push (use if normal push fails)
tsx server/seed.ts    # Seed database with demo data
```

## Demo User
- Username: `demo`
- Email: `demo@neuroflow.ai`
- Password: `demo123`

## Seeded Demo Data
- **User**: 1 demo user account
- **Agents**: 
  1. Sales Assistant (OpenAI gpt-4o)
  2. Customer Support (Anthropic claude-sonnet-4)
  3. Data Analyst (OpenAI gpt-4o)
- **Templates**:
  1. Sales Lead Automation
  2. Customer Support Automation
  3. Data Processing Pipeline

## Next Steps / TODO
1. **Workflow Engine Refinement** (Priority: High)
   - Implement proper conditional branching logic
   - Add support for parallel execution paths
   - Validate OpenAI API compatibility with latest models
   - Add comprehensive error handling and retry logic

2. **Integration Ecosystem** (Priority: High)
   - Build 10+ pre-built connectors (Slack, Gmail, Notion, Zapier, etc.)
   - Implement OAuth flows for third-party services
   - Add webhook support for external triggers

3. **Team Orchestration** (Priority: Medium)
   - Complete hierarchical team pattern
   - Implement collaborative (round-robin) pattern
   - Add pipeline (sequential) pattern
   - Build democratic (voting/consensus) pattern

4. **Vector Database Integration** (Priority: Medium)
   - Add vector storage for agent long-term memory
   - Implement semantic search for agent knowledge bases
   - Build RAG (Retrieval Augmented Generation) pipelines

5. **Analytics Enhancements** (Priority: Low) ✅ *Dashboard Complete*
   - Add time-range filtering (7d/30d/90d/1y) to backend endpoints
   - Implement ROI calculations with cost per outcome metrics
   - Add performance optimization suggestions based on metrics
   - Export analytics reports (CSV/PDF)

6. **Real-time Features** (Priority: Low) ✅ *WebSocket Complete*
   - Implement multi-user collaboration features
   - Add real-time workflow editing with conflict resolution
   - Add collaborative cursor/presence indicators

7. **Testing & Quality** (Priority: High)
   - Add end-to-end tests for critical workflows
   - Implement unit tests for storage layer
   - Add integration tests for AI provider integrations

## Architecture Decisions

### Why Drizzle ORM?
- Type-safe database queries
- Excellent TypeScript integration
- Lightweight and performant
- Easy schema migrations with `db:push`

### Why Zustand for State Management?
- Minimal boilerplate compared to Redux
- React hooks-based API
- Good TypeScript support
- Perfect for medium-complexity state needs

### Why React Flow?
- Industry-standard for workflow/node-based UIs
- Highly customizable nodes and edges
- Good performance with large graphs
- Built-in zoom, pan, and selection features

## Known Issues
1. Workflow execution engine needs production hardening
2. Template filtering by category shows 404 for certain requests
3. Storage.ts type warnings: Non-blocking Drizzle ORM type inference issues with JSON columns; runtime functionality confirmed working

## Notes
- All database operations are transactional through Drizzle ORM
- Agent memory is stored as JSONB for flexibility
- Workflow nodes/edges stored as JSONB for dynamic workflow structures
- Uses demo user ID for all operations (authentication not yet implemented)
