# Session 1.1: Fix Cross-Project Imports - PLAN

**Date:** 2025-10-04
**Status:** ⏸️ Ready to Execute
**Duration:** ~1-2 hours
**Dependencies:** Session 1 (completed)
**Priority:** 🔴 CRITICAL - Blocks all other sessions

---

## 🎯 Session Objectives

Fix all cross-project imports where `(platform)` project imports from `(chatbot)` project. All imports must come from either:
1. Within the `(platform)` project directory
2. From `shared/` root directory (for truly shared code)

**Current Problem:**
```typescript
// ❌ WRONG: Platform importing from separate Chatbot project
import { RAGService } from '@/app/(chatbot)/services/rag-service';
import { IndustryType } from '@/app/(chatbot)/types/industry';
```

**Goal:**
```typescript
// ✅ CORRECT: Platform importing from shared or own code
import { RAGService } from '@/lib/services/rag-service';
import { IndustryType } from '@shared/types/industry';
```

---

## 📋 Task Breakdown

### Phase 1: Analyze Cross-Project Imports (15 minutes)

#### Step 1.1: Identify All Problematic Imports
- [ ] Search for all `(chatbot)` imports in platform:
  ```bash
  cd (platform)
  grep -r "@/app/(chatbot)" --include="*.ts" --include="*.tsx" .
  ```
- [ ] Document each import location and what's being imported
- [ ] Create a categorized list

**Expected Imports to Find:**
From build errors, we know about:
1. `app/api/chat/route.ts`:
   - `@/app/(chatbot)/industries` → `loadIndustryConfig`
   - `@/app/(chatbot)/services/rag-service` → `RAGService`
   - `@/app/(chatbot)/types/industry` → `IndustryType`
   - `@/app/(chatbot)/types/conversation` → `Message`
   - `@/app/(chatbot)/schemas/chat-request` → `ChatRequestSchema`
   - `@/app/(chatbot)/types/rag` → `RAGContext`

2. `lib/modules/real-estate/services/rentcast-service.ts`:
   - `@/app/(chatbot)/services/cache-service` → `CacheService`

#### Step 1.2: Categorize Imports
For each import, determine:
- **Type A: Shared Types/Interfaces** → Move to `shared/lib/`
- **Type B: Platform-Specific Implementation** → Create in `(platform)/lib/`
- **Type C: Shared Services** → Move to `shared/lib/`

**Success Criteria:**
- [ ] Complete list of all cross-project imports
- [ ] Each import categorized (A, B, or C)
- [ ] Plan for where each file should live

---

### Phase 2: Create Shared Library Structure (20 minutes)

#### Step 2.1: Create Shared Directory Structure
- [ ] Create `shared/lib/` directory structure:
  ```bash
  cd ../shared
  mkdir -p lib/types
  mkdir -p lib/schemas
  mkdir -p lib/services
  mkdir -p lib/constants
  ```

#### Step 2.2: Setup Shared TypeScript Configuration
- [ ] Create `shared/lib/tsconfig.json`:
  ```json
  {
    "compilerOptions": {
      "target": "ES2020",
      "lib": ["ES2020"],
      "module": "ESNext",
      "moduleResolution": "node",
      "resolveJsonModule": true,
      "declaration": true,
      "declarationMap": true,
      "outDir": "./dist",
      "rootDir": ".",
      "strict": true,
      "esModuleInterop": true,
      "skipLibCheck": true,
      "forceConsistentCasingInFileNames": true
    },
    "include": ["./**/*"],
    "exclude": ["node_modules", "dist"]
  }
  ```

#### Step 2.3: Create Shared Package.json (Optional)
- [ ] Create `shared/lib/package.json` for proper module resolution:
  ```json
  {
    "name": "@strive/shared-lib",
    "version": "1.0.0",
    "private": true,
    "type": "module",
    "exports": {
      "./types/*": "./types/*.ts",
      "./schemas/*": "./schemas/*.ts",
      "./services/*": "./services/*.ts",
      "./constants/*": "./constants/*.ts"
    }
  }
  ```

**Success Criteria:**
- [ ] `shared/lib/` directory structure created
- [ ] TypeScript configuration in place
- [ ] Ready to receive moved files

---

### Phase 3: Move/Create Shared Types & Schemas (30 minutes)

#### Step 3.1: Industry Types
- [ ] Check if `(chatbot)/types/industry.ts` exists
- [ ] Read the file to understand the types
- [ ] Create `shared/lib/types/industry.ts` with:
  ```typescript
  // Shared industry type definitions
  export type IndustryType =
    | 'real-estate'
    | 'healthcare'
    | 'finance'
    | 'retail'
    | 'technology'
    | 'general';

  export interface IndustryConfig {
    type: IndustryType;
    name: string;
    description: string;
    features: string[];
    tools: string[];
  }
  ```

#### Step 3.2: Conversation Types
- [ ] Check if `(chatbot)/types/conversation.ts` exists
- [ ] Create `shared/lib/types/conversation.ts` with:
  ```typescript
  export interface Message {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
    metadata?: Record<string, unknown>;
  }

  export interface Conversation {
    id: string;
    userId?: string;
    messages: Message[];
    industry?: string;
    createdAt: Date;
    updatedAt: Date;
  }
  ```

#### Step 3.3: RAG Types
- [ ] Check if `(chatbot)/types/rag.ts` exists
- [ ] Create `shared/lib/types/rag.ts` with:
  ```typescript
  export interface RAGContext {
    query: string;
    context: string[];
    sources: string[];
    similarity: number;
  }

  export interface RAGResult {
    answer: string;
    context: RAGContext;
    confidence: number;
  }
  ```

#### Step 3.4: Chat Request Schema
- [ ] Check if `(chatbot)/schemas/chat-request.ts` exists
- [ ] Create `shared/lib/schemas/chat-request.ts` with:
  ```typescript
  import { z } from 'zod';

  export const ChatRequestSchema = z.object({
    message: z.string().min(1).max(10000),
    conversationId: z.string().uuid().optional(),
    industry: z.enum([
      'real-estate',
      'healthcare',
      'finance',
      'retail',
      'technology',
      'general'
    ]).optional(),
    userId: z.string().uuid().optional(),
    metadata: z.record(z.unknown()).optional(),
  });

  export type ChatRequest = z.infer<typeof ChatRequestSchema>;
  ```

**Success Criteria:**
- [ ] All shared types created in `shared/lib/types/`
- [ ] All shared schemas created in `shared/lib/schemas/`
- [ ] Files are properly typed with TypeScript
- [ ] No dependencies on chatbot-specific code

---

### Phase 4: Create Platform Services (40 minutes)

#### Step 4.1: RAG Service
- [ ] Check if `(chatbot)/services/rag-service.ts` exists
- [ ] Read implementation to understand functionality
- [ ] Create `(platform)/lib/services/rag-service.ts`:
  ```typescript
  import 'server-only';
  import { RAGContext, RAGResult } from '@shared/lib/types/rag';

  export class RAGService {
    // Implement RAG functionality for platform
    // This may be a simplified version or full implementation

    async search(query: string): Promise<RAGContext> {
      // Implementation
    }

    async generateResponse(context: RAGContext): Promise<RAGResult> {
      // Implementation
    }
  }
  ```

#### Step 4.2: Cache Service
- [ ] Check if `(chatbot)/services/cache-service.ts` exists
- [ ] Create `shared/lib/services/cache-service.ts`:
  ```typescript
  import 'server-only';

  export class CacheService {
    private cache: Map<string, { value: unknown; expiry: number }>;

    constructor() {
      this.cache = new Map();
    }

    async get<T>(key: string): Promise<T | null> {
      const item = this.cache.get(key);
      if (!item) return null;

      if (Date.now() > item.expiry) {
        this.cache.delete(key);
        return null;
      }

      return item.value as T;
    }

    async set(key: string, value: unknown, ttl: number = 3600000): Promise<void> {
      this.cache.set(key, {
        value,
        expiry: Date.now() + ttl,
      });
    }

    async delete(key: string): Promise<void> {
      this.cache.delete(key);
    }

    async clear(): Promise<void> {
      this.cache.clear();
    }
  }

  export const cacheService = new CacheService();
  ```

#### Step 4.3: Industry Configuration
- [ ] Check if `(chatbot)/industries/` directory exists
- [ ] Create `(platform)/lib/industries/` directory:
  ```bash
  mkdir -p lib/industries/configs
  ```
- [ ] Create `(platform)/lib/industries/index.ts`:
  ```typescript
  import { IndustryType, IndustryConfig } from '@shared/lib/types/industry';
  import { realEstateConfig } from './configs/real-estate';
  import { healthcareConfig } from './configs/healthcare';
  import { generalConfig } from './configs/general';

  const industryConfigs: Record<IndustryType, IndustryConfig> = {
    'real-estate': realEstateConfig,
    'healthcare': healthcareConfig,
    'finance': generalConfig, // TODO: Create finance config
    'retail': generalConfig,
    'technology': generalConfig,
    'general': generalConfig,
  };

  export function loadIndustryConfig(industry: IndustryType): IndustryConfig {
    return industryConfigs[industry] || industryConfigs.general;
  }

  export { industryConfigs };
  ```

- [ ] Create `(platform)/lib/industries/configs/general.ts`:
  ```typescript
  import { IndustryConfig } from '@shared/lib/types/industry';

  export const generalConfig: IndustryConfig = {
    type: 'general',
    name: 'General',
    description: 'General-purpose AI assistant',
    features: [
      'General conversation',
      'Question answering',
      'Task assistance',
    ],
    tools: [],
  };
  ```

- [ ] Create industry-specific configs as needed (real-estate, healthcare, etc.)

**Success Criteria:**
- [ ] RAGService created in platform
- [ ] CacheService created in shared (if truly shared) or platform
- [ ] Industry configuration system created in platform
- [ ] All services properly typed and working

---

### Phase 5: Update Import Paths (20 minutes)

#### Step 5.1: Update TypeScript Path Aliases
- [ ] Update `(platform)/tsconfig.json` to include shared paths:
  ```json
  {
    "compilerOptions": {
      "paths": {
        "@/*": ["./*"],
        "@shared/*": ["../shared/*"]
      }
    }
  }
  ```

#### Step 5.2: Update Platform Imports
- [ ] Update `app/api/chat/route.ts`:
  ```typescript
  // Old imports (DELETE):
  // import { loadIndustryConfig } from '@/app/(chatbot)/industries';
  // import { RAGService } from '@/app/(chatbot)/services/rag-service';
  // import { IndustryType } from '@/app/(chatbot)/types/industry';
  // import { Message } from '@/app/(chatbot)/types/conversation';
  // import { ChatRequestSchema } from '@/app/(chatbot)/schemas/chat-request';
  // import { RAGContext } from '@/app/(chatbot)/types/rag';

  // New imports (ADD):
  import { loadIndustryConfig } from '@/lib/industries';
  import { RAGService } from '@/lib/services/rag-service';
  import { IndustryType } from '@shared/lib/types/industry';
  import { Message } from '@shared/lib/types/conversation';
  import { ChatRequestSchema } from '@shared/lib/schemas/chat-request';
  import { RAGContext } from '@shared/lib/types/rag';
  ```

- [ ] Update `lib/modules/real-estate/services/rentcast-service.ts`:
  ```typescript
  // Old import (DELETE):
  // import { CacheService } from '@/app/(chatbot)/services/cache-service';

  // New import (ADD):
  import { cacheService as CacheService } from '@shared/lib/services/cache-service';
  ```

#### Step 5.3: Search and Replace All Remaining Imports
- [ ] Run global search and replace:
  ```bash
  cd (platform)
  # Search for any remaining chatbot imports
  grep -r "@/app/(chatbot)" --include="*.ts" --include="*.tsx" .

  # If found, update each file individually
  ```

**Success Criteria:**
- [ ] All cross-project imports updated
- [ ] No references to `@/app/(chatbot)` remain in platform
- [ ] TypeScript path aliases configured correctly
- [ ] No import errors in IDE

---

### Phase 6: Verification & Testing (20 minutes)

#### Step 6.1: Type Check
- [ ] Run TypeScript compiler:
  ```bash
  cd (platform)
  npx tsc --noEmit
  ```
- [ ] Fix any type errors related to imports
- [ ] Verify 0 module not found errors

#### Step 6.2: Build Test
- [ ] Build the platform:
  ```bash
  npm run build
  ```
- [ ] Check for module resolution errors
- [ ] Verify build completes successfully

#### Step 6.3: Runtime Verification
- [ ] Start dev server:
  ```bash
  npm run dev
  ```
- [ ] Test API route: `POST /api/chat`
- [ ] Verify no runtime import errors
- [ ] Check that services instantiate correctly

#### Step 6.4: Lint Check
- [ ] Run linter:
  ```bash
  npm run lint
  ```
- [ ] Fix any new import-related warnings

**Success Criteria:**
- [ ] TypeScript: 0 module not found errors
- [ ] Build: Succeeds without import errors
- [ ] Dev server: Starts without errors
- [ ] Lint: Passes (or only pre-existing warnings)

---

## 📊 Files to Create/Update

### Files to Create in shared/lib/ (6 files)
```
shared/lib/
├── tsconfig.json                      # ✅ Create
├── package.json                       # ✅ Create (optional)
├── types/
│   ├── industry.ts                   # ✅ Create
│   ├── conversation.ts               # ✅ Create
│   └── rag.ts                        # ✅ Create
├── schemas/
│   └── chat-request.ts               # ✅ Create
└── services/
    └── cache-service.ts              # ✅ Create
```

### Files to Create in (platform)/lib/ (5+ files)
```
(platform)/lib/
├── services/
│   └── rag-service.ts                # ✅ Create
└── industries/
    ├── index.ts                      # ✅ Create
    └── configs/
        ├── general.ts                # ✅ Create
        ├── real-estate.ts            # ✅ Create
        └── healthcare.ts             # ✅ Create
```

### Files to Update (2+ files)
```
(platform)/
├── tsconfig.json                     # 🔄 Update (add @shared path alias)
├── app/api/chat/route.ts            # 🔄 Update (fix imports)
└── lib/modules/real-estate/services/
    └── rentcast-service.ts          # 🔄 Update (fix import)
```

**Total:** ~13 new files, ~3 file updates

---

## 🎯 Success Criteria

**MANDATORY - All must pass:**
- [ ] Zero imports from `@/app/(chatbot)` in platform project
- [ ] All shared code in `shared/lib/` directory
- [ ] All platform-specific code in `(platform)/lib/` directory
- [ ] TypeScript compiles: 0 module not found errors
- [ ] Build succeeds: `npm run build`
- [ ] Dev server runs: `npm run dev`
- [ ] No runtime import errors
- [ ] API routes functional (chat endpoint works)

**Quality Checks:**
- [ ] All new files under 500 lines
- [ ] Proper TypeScript types on all exports
- [ ] Services properly implement interfaces
- [ ] No code duplication between files
- [ ] Clear separation: shared vs platform-specific

---

## 🔗 Integration Points

### With Chatbot Project
```typescript
// Chatbot can import shared types
import { IndustryType } from '@shared/lib/types/industry';
import { Message } from '@shared/lib/types/conversation';

// But chatbot-specific implementations stay in chatbot
// Platform doesn't import from chatbot
```

### With Platform Project
```typescript
// Platform imports from shared
import { IndustryType } from '@shared/lib/types/industry';

// Platform uses own services
import { RAGService } from '@/lib/services/rag-service';
import { loadIndustryConfig } from '@/lib/industries';
```

### With Website Project
```typescript
// Website can also import shared types if needed
import { Message } from '@shared/lib/types/conversation';
```

---

## 📝 Implementation Notes

### Architectural Decisions

**1. Shared vs Platform-Specific**
- **Shared (`shared/lib/`)**: Types, schemas, constants, utilities used by multiple projects
- **Platform (`(platform)/lib/`)**: Implementations, services, business logic specific to platform

**2. Service Implementation Strategy**
- Services like RAGService are platform-specific implementations
- Shared types/interfaces allow consistency across projects
- Each project can have its own implementation if needed

**3. Industry Configuration**
- Industry configs are platform-specific (platform needs them for AI features)
- Industry types are shared (all projects reference same industry names)
- Chatbot may have its own industry implementations

**4. Cache Service Decision**
- If only platform uses it → Keep in `(platform)/lib/services/`
- If chatbot also uses it → Move to `shared/lib/services/`
- Recommend: Keep in shared since caching is common utility

### Import Path Strategy

**TypeScript Path Mapping:**
```json
{
  "@/*": ["./"],           // Platform internal
  "@shared/*": ["../shared/*"]  // Shared across projects
}
```

**Import Conventions:**
```typescript
// Shared types/schemas
import { Type } from '@shared/lib/types/...';
import { Schema } from '@shared/lib/schemas/...';

// Platform code
import { Service } from '@/lib/services/...';
import { Component } from '@/components/...';

// Never do this in platform:
import { X } from '@/app/(chatbot)/...'; // ❌ WRONG
```

---

## ⚠️ Critical Warnings

**DO NOT:**
- ❌ Keep any imports from `@/app/(chatbot)` in platform
- ❌ Copy entire chatbot project into platform
- ❌ Create circular dependencies between projects
- ❌ Skip type definitions for shared code
- ❌ Mix shared and platform-specific code in same file

**MUST:**
- ✅ Keep shared code truly generic (no project-specific logic)
- ✅ Document what each shared file exports and why
- ✅ Test imports work in both projects after moving to shared
- ✅ Maintain clear boundary: shared vs platform vs chatbot
- ✅ Update both projects if shared types change

---

## 🚀 Quick Start Commands

```bash
# Phase 2: Create shared structure
cd ../shared
mkdir -p lib/{types,schemas,services,constants}

# Phase 3-4: Create files (use templates above)
# ... create each file individually ...

# Phase 5: Update imports
cd ../(platform)
# Edit tsconfig.json
# Edit import statements in affected files

# Phase 6: Verify
cd (platform)
npx tsc --noEmit        # Should show 0 module not found errors
npm run build           # Should succeed
npm run dev             # Should start without errors
```

---

## 🔄 Dependencies

**Requires:**
- Session 1 completed ✅
- Shared Prisma schema exists ✅
- Platform project structure fixed ✅

**Blocks:**
- All future sessions (can't build without this)
- Session 2 (Auth & RBAC)
- Session 3 (UI/UX)
- Session 4 (Security)
- Session 5 (Testing)
- Session 6 (Deployment)

**Enables:**
- Successful builds
- Proper project separation
- Code reusability across projects
- Independent deployment of chatbot and platform

---

## 📖 Reference Files

**Must examine before starting:**
- `(chatbot)/types/` - To understand what types exist
- `(chatbot)/services/` - To understand service implementations
- `(chatbot)/industries/` - To understand industry config structure
- `(platform)/app/api/chat/route.ts` - Main file with broken imports
- `(platform)/lib/modules/real-estate/services/rentcast-service.ts` - Another affected file

**Documentation:**
- [TypeScript Path Mapping](https://www.typescriptlang.org/docs/handbook/module-resolution.html#path-mapping)
- [Monorepo Shared Code Patterns](https://turbo.build/repo/docs/handbook/sharing-code)

---

**Last Updated:** 2025-10-04
**Status:** ⏸️ Ready to Execute
**Priority:** 🔴 CRITICAL - Execute immediately after Session 1
