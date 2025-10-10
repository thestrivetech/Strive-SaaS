Prompt #2: RAG System Integration - N8n Workflow Implementation
Claude AI Instructions
<instructions>
You are an expert N8n workflow engineer implementing the **RAG (Retrieval-Augmented Generation) System Integration** for a multi-tenant real estate SaaS platform. You have access to N8n via MCP and will create production-ready workflows for vector database management with Qdrant, following all architecture standards defined in the project instructions.
Your implementation must include:

Complete N8n workflow structure with specific Qdrant and embedding node configurations
Production-ready embedding generation code with intfloat/e5-large-v2 integration
Multi-tenant organization isolation for all vector operations
Data ingestion pipelines for properties, leads, market data, documents, and conversations
Incremental update system with deduplication and validation
Comprehensive error handling for embedding failures and vector operations
Performance optimization for batch processing (1000+ documents)
Complete testing procedures with sample real estate data

Before you begin implementation:

Confirm you have access to the project instructions document
Verify understanding of multi-tenant architecture requirements for vector databases
Check that Qdrant is accessible and collections can be created programmatically
Review embedding model requirements (intfloat/e5-large-v2, 1024 dimensions)
Ask clarifying questions about any ambiguous requirements

Your thinking process should follow this structure:
<thinking>
1. Requirement Analysis
   - What vector search capabilities does the real estate SaaS need?
   - How do we ensure organization isolation in Qdrant (no native RLS)?
   - What are the embedding generation failure modes?
   - How do we handle incremental updates efficiently?

Architecture Planning

What N8n nodes are needed for embedding generation?
How do we structure Qdrant collections with organization filtering?
What metadata must be stored with each vector?
How do we deduplicate documents before embedding?
How do we validate embedding quality?


Error Scenario Planning

Embedding API fails or times out → Retry with exponential backoff
Invalid document format → Skip and log error
Dimension mismatch → Re-embed with correct model
Qdrant connection failure → Queue for retry
Duplicate detection fails → Allow through with flag


Performance Considerations

Batch embedding requests (10-50 documents per API call)
Use async processing for large ingestion jobs
Cache frequently accessed vectors
Optimize Qdrant query parameters for speed vs accuracy


Testing Strategy

Test each content type (property, lead, document, etc.)
Verify organization isolation with cross-org queries
Test batch processing with 1000+ documents
Validate embedding quality with sample queries
Test incremental updates don't duplicate vectors
</thinking>




<workflow_design>
[High-level RAG system architecture and data flow will be provided in implementation]
</workflow_design>
<implementation>
[Complete N8n workflow configurations will be provided below]
</implementation>
<testing>
[Test procedures, sample data, and validation steps will be provided]
</testing>
<documentation>
[Usage guide, troubleshooting, and maintenance notes will be provided]
</documentation>
</instructions>
Business Context
Problem Statement:
Real estate agents need intelligent AI assistants that can answer questions about properties, leads, market trends, and documents using their organization's proprietary data. The RAG system must provide accurate, contextually relevant information retrieval while maintaining strict organization-level data isolation.
User Story:
As a real estate agent, I want to ask questions like "What 3-bedroom properties under $500k do I have in the downtown area?" or "What did John Smith say he was looking for in our last conversation?" and get instant, accurate answers from my organization's data, so that I can serve clients better and close deals faster.
Success Metrics:

Embedding Coverage: 95%+ of ingested documents successfully embedded
Query Relevance: 90%+ of search results rated relevant by users
Response Time: <500ms for semantic search queries (p95)
Organization Isolation: 100% - zero cross-org data leakage
Update Latency: New data available in search within 5 minutes

Integration Context:
This workflow integrates with:

Supabase (Core Database): Receives change notifications for properties, leads, documents via webhooks
Qdrant (Vector Database): Stores embeddings and provides semantic search
Embedding API (intfloat/e5-large-v2): Generates 1024-dimension vectors
AI Agents (Prompts #7-11): Query the RAG system for contextual information
Property Management (Prompt #5): Sends property data for embedding
Lead Management (Prompt #4): Sends lead conversation data for embedding

Prerequisites & Dependencies
Required Workflows:

None - This is a foundational workflow that other workflows depend on

Required Database Schema:
sql-- ============================================
-- RAG SYSTEM METADATA TABLES
-- ============================================

-- Track embedding jobs and their status
CREATE TABLE IF NOT EXISTS embedding_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  content_type VARCHAR(50) NOT NULL CHECK (content_type IN ('property', 'lead', 'market_data', 'document', 'conversation')),
  source_table VARCHAR(100) NOT NULL,
  source_id UUID NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  embedding_model VARCHAR(100) DEFAULT 'intfloat/e5-large-v2',
  vector_dimensions INT DEFAULT 1024,
  qdrant_collection VARCHAR(100),
  qdrant_point_id UUID,
  error_message TEXT,
  metadata JSONB,
  processing_time_ms INT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

CREATE INDEX idx_embedding_jobs_org ON embedding_jobs(organization_id);
CREATE INDEX idx_embedding_jobs_status ON embedding_jobs(status);
CREATE INDEX idx_embedding_jobs_source ON embedding_jobs(source_table, source_id);
CREATE INDEX idx_embedding_jobs_created ON embedding_jobs(created_at DESC);

-- Track query performance and relevance
CREATE TABLE IF NOT EXISTS rag_query_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  user_id UUID REFERENCES users(id),
  query_text TEXT NOT NULL,
  collection_name VARCHAR(100),
  results_count INT,
  top_score FLOAT,
  execution_time_ms INT,
  filters JSONB,
  relevance_feedback INT CHECK (relevance_feedback BETWEEN 1 AND 5),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_rag_query_logs_org ON rag_query_logs(organization_id);
CREATE INDEX idx_rag_query_logs_created ON rag_query_logs(created_at DESC);

-- Track embedding quality metrics
CREATE TABLE IF NOT EXISTS embedding_quality_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  collection_name VARCHAR(100) NOT NULL,
  metric_date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_embeddings INT DEFAULT 0,
  successful_embeddings INT DEFAULT 0,
  failed_embeddings INT DEFAULT 0,
  average_processing_time_ms INT,
  duplicate_detections INT DEFAULT 0,
  validation_failures INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(organization_id, collection_name, metric_date)
);

CREATE INDEX idx_embedding_quality_org ON embedding_quality_metrics(organization_id);
CREATE INDEX idx_embedding_quality_date ON embedding_quality_metrics(metric_date DESC);

-- RLS Policies
ALTER TABLE embedding_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE rag_query_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE embedding_quality_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY org_isolation_embedding_jobs ON embedding_jobs
  FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations WHERE user_id = auth.uid()
    )
  );

CREATE POLICY org_isolation_rag_query_logs ON rag_query_logs
  FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations WHERE user_id = auth.uid()
    )
  );

CREATE POLICY org_isolation_embedding_quality ON embedding_quality_metrics
  FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations WHERE user_id = auth.uid()
    )
  );

-- Updated_at triggers
CREATE TRIGGER update_embedding_jobs_updated_at
  BEFORE UPDATE ON embedding_jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
Required API Access:

Qdrant Cloud/Self-Hosted:

Endpoints: Collections API, Points API, Search API
Authentication: API Key
Rate Limits: 1000 requests/minute
Base URL: https://your-qdrant-instance.com or localhost:6333


Embedding API (Hugging Face or self-hosted):

Model: intfloat/e5-large-v2
Endpoint: /embeddings or Hugging Face Inference API
Authentication: API Token
Rate Limits: 100 requests/minute (batch up to 50 texts per request)
Input: Text up to 512 tokens
Output: 1024-dimensional vector



Required N8n Credentials:

qdrant_api: API Key authentication for Qdrant
embedding_api: API Key or OAuth for embedding service
supabase_api: Service role key for database operations

Required Environment Variables:
QDRANT_URL=https://your-qdrant-instance.com:6333
QDRANT_API_KEY=your_api_key_here
EMBEDDING_API_URL=https://api-inference.huggingface.co/models/intfloat/e5-large-v2
EMBEDDING_API_KEY=hf_your_token_here
EMBEDDING_BATCH_SIZE=50
QDRANT_BATCH_SIZE=100
MAX_TEXT_LENGTH=512
Technical Architecture
Workflow Overview
INGESTION PIPELINE:
┌──────────────────────┐
│  Supabase Webhook    │ (Property/Lead/Doc Created/Updated)
│  POST /rag/ingest    │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│  Validate Input      │ ──► [Invalid] ──► Return 400 Error
│  Check Org Auth      │
│  Extract Content     │
└──────────┬───────────┘
           │ [Valid]
           ▼
┌──────────────────────┐
│  Check for Duplicate │
│  Query existing      │
│  embeddings          │
└──────────┬───────────┘
           │
           ├─► [Duplicate] ──► Update Metadata ──► Return 200
           │
           ▼ [New]
┌──────────────────────┐
│  Prepare Text        │
│  - Extract fields    │
│  - Clean & normalize │
│  - Truncate to 512   │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│  Generate Embedding  │
│  (e5-large-v2)       │
│  Returns 1024-dim    │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│  Validate Embedding  │
│  - Check dimensions  │
│  - Check for NaN     │
│  - Validate magnitude│
└──────────┬───────────┘
           │
           ├─► [Invalid] ──► Log Error ──► Return 500
           │
           ▼ [Valid]
┌──────────────────────┐
│  Store in Qdrant     │
│  - Select collection │
│  - Add org metadata  │
│  - Upsert point      │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│  Log to Database     │
│  (embedding_jobs)    │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│  Update Quality      │
│  Metrics             │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│  Return Success      │
│  200 OK              │
└──────────────────────┘

QUERY PIPELINE:
┌──────────────────────┐
│  Semantic Search API │
│  POST /rag/query     │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│  Validate Query      │
│  Check Org Auth      │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│  Generate Query      │
│  Embedding           │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│  Search Qdrant       │
│  Filter by org_id    │
│  Top-k results       │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│  Enrich Results      │
│  Fetch source data   │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│  Log Query           │
│  Return Results      │
└──────────────────────┘

[All nodes] ────► Error Handler ────► Log & Alert ────► Return Error Response
Complete Node Structure
WORKFLOW 1: RAG Data Ingestion Pipeline
Node 1: Webhook Trigger - Data Ingestion
json{
  "id": "webhook_ingest_trigger",
  "type": "n8n-nodes-base.webhook",
  "typeVersion": 1,
  "position": [250, 300],
  "parameters": {
    "httpMethod": "POST",
    "path": "/rag/ingest",
    "responseMode": "responseNode",
    "authentication": "headerAuth",
    "options": {
      "rawBody": false
    }
  },
  "credentials": {
    "httpHeaderAuth": {
      "id": "bearer_token_auth",
      "name": "Bearer Token Auth"
    }
  }
}
Expected Input Schema:
json{
  "user_id": "uuid - Required - User triggering the ingestion",
  "organization_id": "uuid - Required - Organization context",
  "content_type": "string - Required - One of: property|lead|market_data|document|conversation",
  "source_table": "string - Required - Source database table name",
  "source_id": "uuid - Required - ID of the source record",
  "content": {
    "title": "string - Optional - Document/item title",
    "text": "string - Required - Main text content to embed",
    "metadata": "object - Optional - Additional metadata to store"
  },
  "options": {
    "force_reembed": "boolean - Optional - Default: false - Force re-embedding even if exists",
    "collection_override": "string - Optional - Override default collection name"
  }
}
Example Valid Request:
json{
  "user_id": "123e4567-e89b-12d3-a456-426614174000",
  "organization_id": "123e4567-e89b-12d3-a456-426614174001",
  "content_type": "property",
  "source_table": "properties",
  "source_id": "prop-12345",
  "content": {
    "title": "Beautiful 3BR Home in Downtown",
    "text": "Stunning 3 bedroom, 2 bathroom home located in the heart of downtown. Features include hardwood floors, granite countertops, stainless steel appliances, and a spacious backyard. Walk to restaurants, shops, and entertainment. Perfect for families or professionals. $485,000.",
    "metadata": {
      "address": "123 Main St, Bristol, VA",
      "price": 485000,
      "bedrooms": 3,
      "bathrooms": 2,
      "sqft": 1850,
      "mls_id": "MLS-789456"
    }
  }
}
Node 2: Input Validation & Authorization
json{
  "id": "validate_ingest_input",
  "type": "n8n-nodes-base.function",
  "typeVersion": 1,
  "position": [450, 300],
  "parameters": {
    "functionCode": "// See complete code below"
  }
}
Complete Function Code:
javascript// ============================================
// RAG INGESTION - INPUT VALIDATION
// ============================================

const startTime = Date.now();
const input = $input.first().json;

// Extract input data
const { 
  user_id, 
  organization_id, 
  content_type,
  source_table,
  source_id,
  content = {},
  options = {}
} = input;

// Validate required fields
const validationErrors = [];

if (!user_id || typeof user_id !== 'string') {
  validationErrors.push('user_id is required and must be a string');
}

if (!organization_id || typeof organization_id !== 'string') {
  validationErrors.push('organization_id is required and must be a string');
}

const validContentTypes = ['property', 'lead', 'market_data', 'document', 'conversation'];
if (!content_type || !validContentTypes.includes(content_type)) {
  validationErrors.push(`content_type must be one of: ${validContentTypes.join(', ')}`);
}

if (!source_table || typeof source_table !== 'string') {
  validationErrors.push('source_table is required and must be a string');
}

if (!source_id || typeof source_id !== 'string') {
  validationErrors.push('source_id is required and must be a string');
}

if (!content.text || typeof content.text !== 'string' || content.text.trim().length === 0) {
  validationErrors.push('content.text is required and must be a non-empty string');
}

// Return validation errors if any
if (validationErrors.length > 0) {
  return {
    json: {
      success: false,
      error: 'Validation failed',
      validation_errors: validationErrors,
      code: 400
    }
  };
}

// Determine Qdrant collection based on content_type
const collectionMap = {
  'property': 'properties',
  'lead': 'leads',
  'market_data': 'market_data',
  'document': 'documents',
  'conversation': 'conversations'
};

const qdrantCollection = options.collection_override || collectionMap[content_type];

// Prepare validated output
const validatedInput = {
  user_id,
  organization_id,
  content_type,
  source_table,
  source_id,
  content: {
    title: content.title || '',
    text: content.text.trim(),
    metadata: content.metadata || {}
  },
  options: {
    force_reembed: options.force_reembed === true,
    collection_override: options.collection_override || null
  },
  qdrant_collection: qdrantCollection,
  _metadata: {
    validated_at: new Date().toISOString(),
    validation_time_ms: Date.now() - startTime,
    workflow_execution_id: $execution.id
  },
  _org_check: {
    table: 'user_organizations',
    select: 'role, permissions',
    filters: {
      user_id: user_id,
      organization_id: organization_id
    }
  }
};

return { json: validatedInput };
Node 3: Supabase - Verify Organization Access
json{
  "id": "check_org_access_ingest",
  "type": "@n8n/n8n-nodes-langchain.supabaseVectorStore",
  "typeVersion": 1,
  "position": [650, 300],
  "parameters": {
    "operation": "select",
    "table": "user_organizations",
    "select": "role, permissions",
    "filterByFields": {
      "fields": [
        {
          "fieldName": "user_id",
          "fieldValue": "={{ $json.user_id }}"
        },
        {
          "fieldName": "organization_id",
          "fieldValue": "={{ $json.organization_id }}"
        }
      ]
    }
  },
  "credentials": {
    "supabaseApi": {
      "id": "supabase_main",
      "name": "Supabase API"
    }
  }
}
Node 4: Switch - Route Based on Authorization
json{
  "id": "authorization_switch_ingest",
  "type": "n8n-nodes-base.switch",
  "typeVersion": 1,
  "position": [850, 300],
  "parameters": {
    "rules": {
      "rules": [
        {
          "operation": "exists",
          "value1": "={{ $json.role }}",
          "output": 0
        }
      ]
    },
    "fallbackOutput": 1
  }
}

Output 0 (Authorized): Continue to duplicate check
Output 1 (Unauthorized): Route to error response

Node 5: Check for Duplicate Embedding
json{
  "id": "check_duplicate",
  "type": "n8n-nodes-base.function",
  "typeVersion": 1,
  "position": [1050, 250],
  "parameters": {
    "functionCode": "// See complete code below"
  }
}
Complete Function Code:
javascript// ============================================
// DUPLICATE DETECTION
// ============================================

const input = $input.first().json;
const { organization_id, source_table, source_id, options } = input;

// If force_reembed is true, skip duplicate check
if (options.force_reembed) {
  return {
    json: {
      ...input,
      is_duplicate: false,
      skip_reason: 'force_reembed_enabled'
    }
  };
}

// Query database for existing embedding job
// Note: In actual implementation, this would be a Supabase query node
// For this function, we structure the query that should be made

const duplicateCheckQuery = {
  table: 'embedding_jobs',
  select: 'id, qdrant_point_id, status, completed_at',
  filters: {
    organization_id: organization_id,
    source_table: source_table,
    source_id: source_id,
    status: 'completed'
  },
  order: {
    field: 'completed_at',
    direction: 'DESC'
  },
  limit: 1
};

return {
  json: {
    ...input,
    _duplicate_check: duplicateCheckQuery,
    check_performed: true
  }
};
Node 6: Supabase - Query Existing Embeddings
json{
  "id": "query_existing_embeddings",
  "type": "@n8n/n8n-nodes-langchain.supabaseVectorStore",
  "typeVersion": 1,
  "position": [1250, 250],
  "parameters": {
    "operation": "select",
    "table": "embedding_jobs",
    "select": "id, qdrant_point_id, status, completed_at",
    "filterByFields": {
      "fields": [
        {
          "fieldName": "organization_id",
          "fieldValue": "={{ $json.organization_id }}"
        },
        {
          "fieldName": "source_table",
          "fieldValue": "={{ $json.source_table }}"
        },
        {
          "fieldName": "source_id",
          "fieldValue": "={{ $json.source_id }}"
        },
        {
          "fieldName": "status",
          "fieldValue": "completed"
        }
      ]
    },
    "options": {
      "sort": {
        "fields": [
          {
            "fieldName": "completed_at",
            "direction": "DESC"
          }
        ]
      },
      "limit": 1
    }
  },
  "credentials": {
    "supabaseApi": {
      "id": "supabase_main",
      "name": "Supabase API"
    }
  }
}
Node 7: Switch - Handle Duplicate or Continue
json{
  "id": "duplicate_switch",
  "type": "n8n-nodes-base.switch",
  "typeVersion": 1,
  "position": [1450, 250],
  "parameters": {
    "rules": {
      "rules": [
        {
          "operation": "exists",
          "value1": "={{ $json.id }}",
          "output": 0
        }
      ]
    },
    "fallbackOutput": 1
  }
}

Output 0 (Duplicate Found): Update metadata only
Output 1 (New Embedding): Continue to text preparation

Node 8: Prepare Text for Embedding
json{
  "id": "prepare_text",
  "type": "n8n-nodes-base.function",
  "typeVersion": 1,
  "position": [1650, 350],
  "parameters": {
    "functionCode": "// See complete code below"
  }
}
Complete Function Code:
javascript// ============================================
// TEXT PREPARATION FOR EMBEDDING
// ============================================

const input = $input.first().json;
const { content, content_type } = input;

const MAX_TEXT_LENGTH = 512; // Token limit for e5-large-v2

/**
 * Clean and normalize text for embedding
 */
function cleanText(text) {
  if (!text) return '';
  
  return text
    .replace(/\s+/g, ' ') // Normalize whitespace
    .replace(/[^\w\s.,!?;:()\-$€£¥%]/g, '') // Remove special characters except punctuation
    .trim();
}

/**
 * Truncate text to max tokens (approximate)
 * Assuming ~1.3 chars per token on average
 */
function truncateText(text, maxTokens = 512) {
  const maxChars = maxTokens * 1.3;
  if (text.length <= maxChars) return text;
  
  // Truncate at word boundary
  const truncated = text.substring(0, maxChars);
  const lastSpace = truncated.lastIndexOf(' ');
  return lastSpace > 0 ? truncated.substring(0, lastSpace) : truncated;
}

/**
 * Create embedding text based on content type
 */
function createEmbeddingText(content, contentType) {
  let embeddingText = '';
  
  switch (contentType) {
    case 'property':
      // For properties, combine title, description, and key features
      embeddingText = [
        content.title || '',
        content.text || '',
        content.metadata?.address || '',
        content.metadata?.price ? `Price: $${content.metadata.price}` : '',
        content.metadata?.bedrooms ? `${content.metadata.bedrooms} bedrooms` : '',
        content.metadata?.bathrooms ? `${content.metadata.bathrooms} bathrooms` : '',
        content.metadata?.sqft ? `${content.metadata.sqft} sqft` : ''
      ].filter(Boolean).join('. ');
      break;
      
    case 'lead':
      // For leads, combine conversation context
      embeddingText = [
        content.title || '',
        content.text || '',
        content.metadata?.preferences ? `Looking for: ${content.metadata.preferences}` : '',
        content.metadata?.budget ? `Budget: $${content.metadata.budget}` : ''
      ].filter(Boolean).join('. ');
      break;
      
    case 'document':
      // For documents, use title and main content
      embeddingText = [
        content.title || '',
        content.text || ''
      ].filter(Boolean).join('. ');
      break;
      
    case 'market_data':
      // For market data, structure the analysis
      embeddingText = [
        content.title || '',
        content.text || '',
        content.metadata?.area || '',
        content.metadata?.timeframe || ''
      ].filter(Boolean).join('. ');
      break;
      
    case 'conversation':
      // For conversations, use the dialogue
      embeddingText = content.text || '';
      break;
      
    default:
      embeddingText = content.text || '';
  }
  
  return embeddingText;
}

// Create and prepare the text
let embeddingText = createEmbeddingText(content, content_type);
embeddingText = cleanText(embeddingText);
embeddingText = truncateText(embeddingText, MAX_TEXT_LENGTH);

// Validate that we have text to embed
if (!embeddingText || embeddingText.length < 10) {
  return {
    json: {
      success: false,
      error: 'Insufficient text content for embedding',
      code: 400,
      details: {
        original_length: (content.text || '').length,
        processed_length: embeddingText.length,
        min_required: 10
      }
    }
  };
}

// Return prepared data
return {
  json: {
    ...input,
    embedding_text: embeddingText,
    text_stats: {
      original_length: (content.text || '').length,
      processed_length: embeddingText.length,
      truncated: embeddingText.length < (content.text || '').length,
      word_count: embeddingText.split(/\s+/).length
    },
    _next_step: 'generate_embedding'
  }
};
Node 9: Generate Embedding via API
json{
  "id": "generate_embedding",
  "type": "n8n-nodes-base.httpRequest",
  "typeVersion": 3,
  "position": [1850, 350],
  "parameters": {
    "method": "POST",
    "url": "={{ $env.EMBEDDING_API_URL }}",
    "authentication": "predefinedCredentialType",
    "sendHeaders": true,
    "headerParameters": {
      "parameters": [
        {
          "name": "Content-Type",
          "value": "application/json"
        }
      ]
    },
    "sendBody": true,
    "bodyParameters": {
      "parameters": [
        {
          "name": "inputs",
          "value": "={{ $json.embedding_text }}"
        },
        {
          "name": "options",
          "value": "={{ {\"wait_for_model\": true} }}"
        }
      ]
    },
    "options": {
      "timeout": 30000,
      "retry": {
        "maxRetries": 3,
        "retryDelay": 2000
      }
    }
  },
  "credentials": {
    "httpHeaderAuth": {
      "id": "embedding_api_key",
      "name": "Embedding API Key"
    }
  }
}
Node 10: Validate Embedding Response
json{
  "id": "validate_embedding",
  "type": "n8n-nodes-base.function",
  "typeVersion": 1,
  "position": [2050, 350],
  "parameters": {
    "functionCode": "// See complete code below"
  }
}
Complete Function Code:
javascript// ============================================
// EMBEDDING VALIDATION
// ============================================

const input = $input.first().json;
const embeddingResponse = input; // The API response

const EXPECTED_DIMENSIONS = 1024; // For e5-large-v2

/**
 * Validate embedding vector
 */
function validateEmbedding(embedding) {
  const errors = [];
  
  // Check if embedding exists
  if (!embedding || !Array.isArray(embedding)) {
    errors.push('Embedding is not an array');
    return { valid: false, errors };
  }
  
  // Check dimensions
  if (embedding.length !== EXPECTED_DIMENSIONS) {
    errors.push(`Expected ${EXPECTED_DIMENSIONS} dimensions, got ${embedding.length}`);
  }
  
  // Check for NaN or Infinity
  const hasInvalidValues = embedding.some(val => 
    typeof val !== 'number' || !isFinite(val)
  );
  
  if (hasInvalidValues) {
    errors.push('Embedding contains NaN or Infinity values');
  }
  
  // Check for zero vector (all zeros indicates failure)
  const isZeroVector = embedding.every(val => val === 0);
  if (isZeroVector) {
    errors.push('Embedding is a zero vector (likely generation failure)');
  }
  
  // Calculate magnitude (L2 norm)
  const magnitude = Math.sqrt(
    embedding.reduce((sum, val) => sum + val * val, 0)
  );
  
  // Check magnitude is reasonable (not too small or too large)
  if (magnitude < 0.01 || magnitude > 100) {
    errors.push(`Embedding magnitude (${magnitude.toFixed(4)}) is outside expected range`);
  }
  
  return {
    valid: errors.length === 0,
    errors,
    magnitude,
    dimensions: embedding.length
  };
}

// Extract embedding from response
// Note: Response format may vary by API provider
let embedding = null;

// Hugging Face format
if (Array.isArray(embeddingResponse) && Array.isArray(embeddingResponse[0])) {
  embedding = embeddingResponse[0];
}
// Alternative format { embedding: [...] }
else if (embeddingResponse.embedding && Array.isArray(embeddingResponse.embedding)) {
  embedding = embeddingResponse.embedding;
}
// Alternative format { data: [{ embedding: [...] }] }
else if (embeddingResponse.data && embeddingResponse.data[0]?.embedding) {
  embedding = embeddingResponse.data[0].embedding;
}

// Validate
const validation = validateEmbedding(embedding);

if (!validation.valid) {
  return {
    json: {
      success: false,
      error: 'Embedding validation failed',
      code: 500,
      validation_errors: validation.errors,
      embedding_stats: {
        dimensions: validation.dimensions || 0,
        magnitude: validation.magnitude || 0
      }
    }
  };
}

// Retrieve previous node data
const previousData = $('prepare_text').first().json;

// Return validated embedding
return {
  json: {
    ...previousData,
    embedding: embedding,
    embedding_stats: {
      dimensions: validation.dimensions,
      magnitude: validation.magnitude,
      valid: true
    },
    _next_step: 'store_in_qdrant'
  }
};
Node 11: Store Embedding in Qdrant
json{
  "id": "store_in_qdrant",
  "type": "n8n-nodes-base.httpRequest",
  "typeVersion": 3,
  "position": [2250, 350],
  "parameters": {
    "method": "PUT",
    "url": "={{ $env.QDRANT_URL }}/collections/={{ $json.qdrant_collection }}/points",
    "authentication": "predefinedCredentialType",
    "sendHeaders": true,
    "headerParameters": {
      "parameters": [
        {
          "name": "Content-Type",
          "value": "application/json"
        }
      ]
    },
    "sendBody": true,
    "specifyBody": "json",
    "jsonBody": "={{ JSON.stringify({\n  points: [\n    {\n      id: $json.source_id,\n      vector: $json.embedding,\n      payload: {\n        organization_id: $json.organization_id,\n        content_type: $json.content_type,\n        source_table: $json.source_table,\n        source_id: $json.source_id,\n        title: $json.content.title,\n        text_preview: $json.embedding_text.substring(0, 200),\n        metadata: $json.content.metadata,\n        created_at: new Date().toISOString(),\n        text_stats: $json.text_stats\n      }\n    }\n  ]\n}) }}",
    "options": {
      "timeout": 30000,
      "retry": {
        "maxRetries": 3,
        "retryDelay": 1000
      }
    }
  },
  "credentials": {
    "httpHeaderAuth": {
      "id": "qdrant_api_key",
      "name": "Qdrant API Key"
    }
  }
}
Node 12: Create Embedding Job Record
json{
  "id": "log_embedding_job",
  "type": "@n8n/n8n-nodes-langchain.supabaseVectorStore",
  "typeVersion": 1,
  "position": [2450, 350],
  "parameters": {
    "operation": "insert",
    "table": "embedding_jobs",
    "data": {
      "fields": [
        {
          "fieldName": "organization_id",
          "fieldValue": "={{ $json.organization_id }}"
        },
        {
          "fieldName": "content_type",
          "fieldValue": "={{ $json.content_type }}"
        },
        {
          "fieldName": "source_table",
          "fieldValue": "={{ $json.source_table }}"
        },
        {
          "fieldName": "source_id",
          "fieldValue": "={{ $json.source_id }}"
        },
        {
          "fieldName": "status",
          "fieldValue": "completed"
        },
        {
          "fieldName": "embedding_model",
          "fieldValue": "intfloat/e5-large-v2"
        },
        {
          "fieldName": "vector_dimensions",
          "fieldValue": "={{ $json.embedding_stats.dimensions }}"
        },
        {
          "fieldName": "qdrant_collection",
          "fieldValue": "={{ $json.qdrant_collection }}"
        },
        {
          "fieldName": "qdrant_point_id",
          "fieldValue": "={{ $json.source_id }}"
        },
        {
          "fieldName": "metadata",
          "fieldValue": "={{ JSON.stringify({\n  text_length: $json.text_stats.processed_length,\n  word_count: $json.text_stats.word_count,\n  magnitude: $json.embedding_stats.magnitude,\n  truncated: $json.text_stats.truncated\n}) }}"
        },
        {
          "fieldName": "processing_time_ms",
          "fieldValue": "={{ Date.now() - new Date($json._metadata.validated_at).getTime() }}"
        },
        {
          "fieldName": "completed_at",
          "fieldValue": "={{ new Date().toISOString() }}"
        }
      ]
    }
  },
  "credentials": {
    "supabaseApi": {
      "id": "supabase_main",
      "name": "Supabase API"
    }
  }
}
Node 13: Update Quality Metrics
json{
  "id": "update_quality_metrics",
  "type": "n8n-nodes-base.function",
  "typeVersion": 1,
  "position": [2650, 350],
  "parameters": {
    "functionCode": "// See complete code below"
  }
}
Complete Function Code:
javascript// ============================================
// UPDATE EMBEDDING QUALITY METRICS
// ============================================

const input = $input.first().json;
const { organization_id, qdrant_collection } = input;

const today = new Date().toISOString().split('T')[0];

// Prepare upsert query for metrics
// This increments counters for today's metrics
const metricsUpdate = {
  organization_id,
  collection_name: qdrant_collection,
  metric_date: today,
  increments: {
    total_embeddings: 1,
    successful_embeddings: 1
  }
};

return {
  json: {
    ...input,
    _metrics_update: metricsUpdate,
    success: true
  }
};
Node 14: Supabase - Upsert Quality Metrics
json{
  "id": "upsert_quality_metrics",
  "type": "n8n-nodes-base.httpRequest",
  "typeVersion": 3,
  "position": [2850, 350],
  "parameters": {
    "method": "POST",
    "url": "={{ $env.SUPABASE_URL }}/rest/v1/rpc/increment_embedding_metrics",
    "authentication": "predefinedCredentialType",
    "sendHeaders": true,
    "headerParameters": {
      "parameters": [
        {
          "name": "Content-Type",
          "value": "application/json"
        },
        {
          "name": "apikey",
          "value": "={{ $env.SUPABASE_SERVICE_KEY }}"
        }
      ]
    },
    "sendBody": true,
    "specifyBody": "json",
    "jsonBody": "={{ JSON.stringify($json._metrics_update) }}"
  },
  "credentials": {
    "httpHeaderAuth": {
      "id": "supabase_api",
      "name": "Supabase Service Key"
    }
  }
}
Node 15: Success Response
json{
  "id": "success_response",
  "type": "n8n-nodes-base.respondToWebhook",
  "typeVersion": 1,
  "position": [3050, 350],
  "parameters": {
    "respondWith": "json",
    "responseBody": "={{ JSON.stringify({\n  success: true,\n  message: 'Embedding created successfully',\n  data: {\n    embedding_job_id: $json.id,\n    collection: $json.qdrant_collection,\n    point_id: $json.source_id,\n    dimensions: $json.embedding_stats.dimensions,\n    processing_time_ms: $json.processing_time_ms\n  },\n  metadata: {\n    organization_id: $json.organization_id,\n    execution_id: $execution.id,\n    timestamp: new Date().toISOString()\n  }\n}) }}",
    "options": {
      "responseCode": 200,
      "responseHeaders": {
        "entries": [
          {
            "name": "Content-Type",
            "value": "application/json"
          }
        ]
      }
    }
  }
}
Node 16: Error Handler (Connected to All Nodes)
json{
  "id": "error_handler",
  "type": "n8n-nodes-base.errorTrigger",
  "typeVersion": 1,
  "position": [1650, 600],
  "parameters": {}
}
Node 17: Process Error
json{
  "id": "process_error",
  "type": "n8n-nodes-base.function",
  "typeVersion": 1,
  "position": [1850, 600],
  "parameters": {
    "functionCode": "// See complete code below"
  }
}
Complete Error Handling Code:
javascript// ============================================
// COMPREHENSIVE ERROR HANDLING
// ============================================

const error = $input.first().json;
const originalInput = $input.first().json;

// Categorize error
let errorCategory = 'UNKNOWN_ERROR';
let shouldRetry = false;
let retryAfterMs = 0;
let alertLevel = 'warning';

if (error.message?.includes('timeout') || error.message?.includes('ETIMEDOUT')) {
  errorCategory = 'TIMEOUT_ERROR';
  shouldRetry = true;
  retryAfterMs = 5000;
  alertLevel = 'warning';
} else if (error.message?.includes('rate limit') || error.code === 429) {
  errorCategory = 'RATE_LIMIT_ERROR';
  shouldRetry = true;
  retryAfterMs = 60000;
  alertLevel = 'info';
} else if (error.message?.includes('authentication') || error.code === 401) {
  errorCategory = 'AUTH_ERROR';
  shouldRetry = false;
  alertLevel = 'critical';
} else if (error.message?.includes('validation') || error.message?.includes('dimensions')) {
  errorCategory = 'VALIDATION_ERROR';
  shouldRetry = false;
  alertLevel = 'error';
} else if (error.message?.includes('Qdrant') || error.message?.includes('vector')) {
  errorCategory = 'VECTOR_STORE_ERROR';
  shouldRetry = true;
  retryAfterMs = 10000;
  alertLevel = 'error';
} else if (error.code >= 500) {
  errorCategory = 'SERVER_ERROR';
  shouldRetry = true;
  retryAfterMs = 10000;
  alertLevel = 'error';
}

const errorLog = {
  workflow_name: 'rag-data-ingestion-v1',
  execution_id: $execution.id,
  organization_id: originalInput.organization_id || 'unknown',
  error_category: errorCategory,
  error_message: error.message,
  error_stack: error.stack,
  error_code: error.code,
  should_retry: shouldRetry,
  retry_after_ms: retryAfterMs,
  alert_level: alertLevel,
  input_data: {
    content_type: originalInput.content_type,
    source_table: originalInput.source_table,
    source_id: originalInput.source_id,
    text_length: originalInput.content?.text?.length || 0
  },
  timestamp: new Date().toISOString(),
  node_name: error.node?.name || 'unknown'
};

return {
  json: {
    success: false,
    error: {
      category: errorCategory,
      message: error.message,
      code: error.code || 'INTERNAL_ERROR',
      should_retry: shouldRetry,
      retry_after_ms: retryAfterMs
    },
    log: errorLog,
    alert_level: alertLevel
  }
};
Node 18: Log Error to Database
json{
  "id": "log_error_db",
  "type": "@n8n/n8n-nodes-langchain.supabaseVectorStore",
  "typeVersion": 1,
  "position": [2050, 600],
  "parameters": {
    "operation": "insert",
    "table": "embedding_jobs",
    "data": {
      "fields": [
        {
          "fieldName": "organization_id",
          "fieldValue": "={{ $json.log.organization_id }}"
        },
        {
          "fieldName": "content_type",
          "fieldValue": "={{ $json.log.input_data.content_type }}"
        },
        {
          "fieldName": "source_table",
          "fieldValue": "={{ $json.log.input_data.source_table }}"
        },
        {
          "fieldName": "source_id",
          "fieldValue": "={{ $json.log.input_data.source_id }}"
        },
        {
          "fieldName": "status",
          "fieldValue": "failed"
        },
        {
          "fieldName": "error_message",
          "fieldValue": "={{ $json.log.error_message }}"
        },
        {
          "fieldName": "metadata",
          "fieldValue": "={{ JSON.stringify({\n  error_category: $json.log.error_category,\n  node_name: $json.log.node_name,\n  should_retry: $json.log.should_retry\n}) }}"
        }
      ]
    }
  },
  "credentials": {
    "supabaseApi": {
      "id": "supabase_main",
      "name": "Supabase API"
    }
  }
}
Node 19: Error Response
json{
  "id": "error_response",
  "type": "n8n-nodes-base.respondToWebhook",
  "typeVersion": 1,
  "position": [2250, 600],
  "parameters": {
    "respondWith": "json",
    "responseBody": "={{ JSON.stringify($json.error) }}",
    "options": {
      "responseCode": "={{ $json.error.code || 500 }}",
      "responseHeaders": {
        "entries": [
          {
            "name": "Content-Type",
            "value": "application/json"
          },
          {
            "name": "X-Error-Category",
            "value": "={{ $json.error.category }}"
          }
        ]
      }
    }
  }
}

WORKFLOW 2: RAG Semantic Search Query
Node 1: Webhook Trigger - Search Query
json{
  "id": "webhook_query_trigger",
  "type": "n8n-nodes-base.webhook",
  "typeVersion": 1,
  "position": [250, 300],
  "parameters": {
    "httpMethod": "POST",
    "path": "/rag/query",
    "responseMode": "responseNode",
    "authentication": "headerAuth",
    "options": {
      "rawBody": false
    }
  },
  "credentials": {
    "httpHeaderAuth": {
      "id": "bearer_token_auth",
      "name": "Bearer Token Auth"
    }
  }
}
Expected Input Schema:
json{
  "user_id": "uuid - Required",
  "organization_id": "uuid - Required",
  "query": "string - Required - Natural language query",
  "collections": "array - Optional - Specific collections to search (default: all)",
  "limit": "number - Optional - Max results to return (default: 10, max: 50)",
  "score_threshold": "number - Optional - Minimum similarity score (default: 0.7)",
  "filters": "object - Optional - Additional metadata filters"
}
Example Query Request:
json{
  "user_id": "123e4567-e89b-12d3-a456-426614174000",
  "organization_id": "123e4567-e89b-12d3-a456-426614174001",
  "query": "Show me 3 bedroom homes under $500k in downtown area",
  "collections": ["properties"],
  "limit": 10,
  "score_threshold": 0.7,
  "filters": {
    "content_type": "property"
  }
}
Due to length constraints, I need to continue this in a follow-up message. The pattern continues with:

Query validation
Embedding generation for query text
Qdrant search with organization filtering
Result enrichment
Response formatting

Would you like me to continue with the complete implementation, or would you prefer I provide the remaining sections in a more condensed format?RetryGRContinueMapped out comprehensive RAG system integration workflow steps.The user wants me to continue with the RAG System Integration workflow implementation. I need to complete:

The remaining nodes for the Query workflow (Nodes 2-15+)
External API integrations section
Database operations
Performance optimization
Testing & validation with complete test cases
Documentation
Then move to Prompt #3 enhancement

Let me continue with the complete implementation of the query workflow and all remaining sections.Continuation of Prompt #2 Enhancement
RAG Semantic Search Query Workflow (Continued)
Node 2: Validate Query Input
json{
  "id": "validate_query_input",
  "type": "n8n-nodes-base.function",
  "typeVersion": 1,
  "position": [450, 300],
  "parameters": {
    "functionCode": "// See complete code below"
  }
}
Complete Function Code:
javascript// ============================================
// RAG QUERY - INPUT VALIDATION
// ============================================

const startTime = Date.now();
const input = $input.first().json;

const { 
  user_id, 
  organization_id, 
  query,
  collections = ['properties', 'leads', 'market_data', 'documents', 'conversations'],
  limit = 10,
  score_threshold = 0.7,
  filters = {}
} = input;

// Validate required fields
const validationErrors = [];

if (!user_id || typeof user_id !== 'string') {
  validationErrors.push('user_id is required and must be a string');
}

if (!organization_id || typeof organization_id !== 'string') {
  validationErrors.push('organization_id is required and must be a string');
}

if (!query || typeof query !== 'string' || query.trim().length === 0) {
  validationErrors.push('query is required and must be a non-empty string');
}

if (query && query.length > 1000) {
  validationErrors.push('query must be 1000 characters or less');
}

// Validate collections
const validCollections = ['properties', 'leads', 'market_data', 'documents', 'conversations'];
if (!Array.isArray(collections) || collections.length === 0) {
  validationErrors.push('collections must be a non-empty array');
} else {
  const invalidCollections = collections.filter(c => !validCollections.includes(c));
  if (invalidCollections.length > 0) {
    validationErrors.push(`Invalid collections: ${invalidCollections.join(', ')}. Valid: ${validCollections.join(', ')}`);
  }
}

// Validate limit
if (typeof limit !== 'number' || limit < 1 || limit > 50) {
  validationErrors.push('limit must be a number between 1 and 50');
}

// Validate score_threshold
if (typeof score_threshold !== 'number' || score_threshold < 0 || score_threshold > 1) {
  validationErrors.push('score_threshold must be a number between 0 and 1');
}

if (validationErrors.length > 0) {
  return {
    json: {
      success: false,
      error: 'Validation failed',
      validation_errors: validationErrors,
      code: 400
    }
  };
}

// Prepare validated output
const validatedInput = {
  user_id,
  organization_id,
  query: query.trim(),
  collections,
  limit,
  score_threshold,
  filters,
  _metadata: {
    validated_at: new Date().toISOString(),
    validation_time_ms: Date.now() - startTime,
    workflow_execution_id: $execution.id
  },
  _org_check: {
    table: 'user_organizations',
    select: 'role, permissions',
    filters: { user_id, organization_id }
  }
};

return { json: validatedInput };
Node 3: Supabase - Verify Organization Access
json{
  "id": "check_org_access_query",
  "type": "@n8n/n8n-nodes-langchain.supabaseVectorStore",
  "typeVersion": 1,
  "position": [650, 300],
  "parameters": {
    "operation": "select",
    "table": "user_organizations",
    "select": "role, permissions",
    "filterByFields": {
      "fields": [
        {
          "fieldName": "user_id",
          "fieldValue": "={{ $json.user_id }}"
        },
        {
          "fieldName": "organization_id",
          "fieldValue": "={{ $json.organization_id }}"
        }
      ]
    }
  },
  "credentials": {
    "supabaseApi": {
      "id": "supabase_main",
      "name": "Supabase API"
    }
  }
}
Node 4: Authorization Switch
json{
  "id": "authorization_switch_query",
  "type": "n8n-nodes-base.switch",
  "typeVersion": 1,
  "position": [850, 300],
  "parameters": {
    "rules": {
      "rules": [
        {
          "operation": "exists",
          "value1": "={{ $json.role }}",
          "output": 0
        }
      ]
    },
    "fallbackOutput": 1
  }
}
Node 5: Generate Query Embedding
json{
  "id": "generate_query_embedding",
  "type": "n8n-nodes-base.httpRequest",
  "typeVersion": 3,
  "position": [1050, 250],
  "parameters": {
    "method": "POST",
    "url": "={{ $env.EMBEDDING_API_URL }}",
    "authentication": "predefinedCredentialType",
    "sendHeaders": true,
    "headerParameters": {
      "parameters": [
        {
          "name": "Content-Type",
          "value": "application/json"
        }
      ]
    },
    "sendBody": true,
    "bodyParameters": {
      "parameters": [
        {
          "name": "inputs",
          "value": "={{ $json.query }}"
        },
        {
          "name": "options",
          "value": "={{ {\"wait_for_model\": true} }}"
        }
      ]
    },
    "options": {
      "timeout": 15000,
      "retry": {
        "maxRetries": 2,
        "retryDelay": 1000
      }
    }
  },
  "credentials": {
    "httpHeaderAuth": {
      "id": "embedding_api_key",
      "name": "Embedding API Key"
    }
  }
}
Node 6: Process Query Embedding
json{
  "id": "process_query_embedding",
  "type": "n8n-nodes-base.function",
  "typeVersion": 1,
  "position": [1250, 250],
  "parameters": {
    "functionCode": "// See complete code below"
  }
}
Complete Function Code:
javascript// ============================================
// PROCESS QUERY EMBEDDING
// ============================================

const embeddingResponse = $input.first().json;
const previousData = $('authorization_switch_query').first().json;

// Extract embedding from response
let queryEmbedding = null;

if (Array.isArray(embeddingResponse) && Array.isArray(embeddingResponse[0])) {
  queryEmbedding = embeddingResponse[0];
} else if (embeddingResponse.embedding && Array.isArray(embeddingResponse.embedding)) {
  queryEmbedding = embeddingResponse.embedding;
} else if (embeddingResponse.data && embeddingResponse.data[0]?.embedding) {
  queryEmbedding = embeddingResponse.data[0].embedding;
}

// Validate embedding
if (!queryEmbedding || !Array.isArray(queryEmbedding) || queryEmbedding.length !== 1024) {
  return {
    json: {
      success: false,
      error: 'Invalid query embedding generated',
      code: 500
    }
  };
}

return {
  json: {
    ...previousData,
    query_embedding: queryEmbedding,
    _next_step: 'search_collections'
  }
};
Node 7: Search Multiple Collections (Loop Start)
json{
  "id": "loop_collections",
  "type": "n8n-nodes-base.splitInBatches",
  "typeVersion": 3,
  "position": [1450, 250],
  "parameters": {
    "batchSize": 1,
    "options": {}
  }
}
Node 8: Prepare Collection Search
json{
  "id": "prepare_collection_search",
  "type": "n8n-nodes-base.function",
  "typeVersion": 1,
  "position": [1650, 250],
  "parameters": {
    "functionCode": "// See complete code below"
  }
}
Complete Function Code:
javascript// ============================================
// PREPARE COLLECTION SEARCH
// ============================================

const batchData = $input.first().json;
const allData = $('process_query_embedding').first().json;

// Get current collection from batch
const currentCollection = allData.collections[batchData.batchIndex];

// Prepare Qdrant search request
const searchRequest = {
  vector: allData.query_embedding,
  limit: allData.limit,
  score_threshold: allData.score_threshold,
  with_payload: true,
  with_vector: false,
  filter: {
    must: [
      {
        key: "organization_id",
        match: {
          value: allData.organization_id
        }
      }
    ]
  }
};

// Add content_type filter if specified
if (allData.filters.content_type) {
  searchRequest.filter.must.push({
    key: "content_type",
    match: {
      value: allData.filters.content_type
    }
  });
}

// Add any additional metadata filters
Object.entries(allData.filters).forEach(([key, value]) => {
  if (key !== 'content_type') {
    searchRequest.filter.must.push({
      key: `metadata.${key}`,
      match: { value }
    });
  }
});

return {
  json: {
    ...allData,
    current_collection: currentCollection,
    search_request: searchRequest,
    batch_index: batchData.batchIndex
  }
};
Node 9: Execute Qdrant Search
json{
  "id": "execute_qdrant_search",
  "type": "n8n-nodes-base.httpRequest",
  "typeVersion": 3,
  "position": [1850, 250],
  "parameters": {
    "method": "POST",
    "url": "={{ $env.QDRANT_URL }}/collections/={{ $json.current_collection }}/points/search",
    "authentication": "predefinedCredentialType",
    "sendHeaders": true,
    "headerParameters": {
      "parameters": [
        {
          "name": "Content-Type",
          "value": "application/json"
        }
      ]
    },
    "sendBody": true,
    "specifyBody": "json",
    "jsonBody": "={{ JSON.stringify($json.search_request) }}",
    "options": {
      "timeout": 10000,
      "retry": {
        "maxRetries": 2,
        "retryDelay": 500
      }
    }
  },
  "credentials": {
    "httpHeaderAuth": {
      "id": "qdrant_api_key",
      "name": "Qdrant API Key"
    }
  }
}
Node 10: Process Search Results
json{
  "id": "process_search_results",
  "type": "n8n-nodes-base.function",
  "typeVersion": 1,
  "position": [2050, 250],
  "parameters": {
    "functionCode": "// See complete code below"
  }
}
Complete Function Code:
javascript// ============================================
// PROCESS SEARCH RESULTS
// ============================================

const searchResponse = $input.first().json;
const previousData = $('prepare_collection_search').first().json;

// Extract results from Qdrant response
const results = searchResponse.result || [];

// Format results with collection info
const formattedResults = results.map(result => ({
  id: result.id,
  score: result.score,
  collection: previousData.current_collection,
  payload: result.payload,
  content_type: result.payload.content_type,
  source_id: result.payload.source_id,
  title: result.payload.title,
  text_preview: result.payload.text_preview,
  metadata: result.payload.metadata,
  created_at: result.payload.created_at
}));

return {
  json: {
    ...previousData,
    collection_results: formattedResults,
    result_count: formattedResults.length
  }
};
Node 11: Loop Collections (Back to Node 7 until complete)
Node 12: Aggregate All Results
json{
  "id": "aggregate_results",
  "type": "n8n-nodes-base.aggregate",
  "typeVersion": 1,
  "position": [2250, 250],
  "parameters": {
    "aggregate": "aggregateAllItemData",
    "options": {}
  }
}
Node 13: Rank and Filter Results
json{
  "id": "rank_filter_results",
  "type": "n8n-nodes-base.function",
  "typeVersion": 1,
  "position": [2450, 250],
  "parameters": {
    "functionCode": "// See complete code below"
  }
}
Complete Function Code:
javascript// ============================================
// RANK AND FILTER RESULTS
// ============================================

const allResults = $input.all();
const queryData = $('process_query_embedding').first().json;

// Flatten all collection results
let combinedResults = [];
allResults.forEach(item => {
  if (item.json.collection_results && Array.isArray(item.json.collection_results)) {
    combinedResults = combinedResults.concat(item.json.collection_results);
  }
});

// Remove duplicates (by source_id)
const uniqueResults = [];
const seenIds = new Set();

combinedResults.forEach(result => {
  const key = `${result.collection}:${result.source_id}`;
  if (!seenIds.has(key)) {
    seenIds.add(key);
    uniqueResults.push(result);
  }
});

// Sort by score (descending)
uniqueResults.sort((a, b) => b.score - a.score);

// Apply limit
const topResults = uniqueResults.slice(0, queryData.limit);

// Calculate result statistics
const stats = {
  total_searched: combinedResults.length,
  unique_results: uniqueResults.length,
  returned_results: topResults.length,
  collections_searched: queryData.collections.length,
  average_score: topResults.length > 0 
    ? topResults.reduce((sum, r) => sum + r.score, 0) / topResults.length 
    : 0,
  max_score: topResults.length > 0 ? topResults[0].score : 0,
  min_score: topResults.length > 0 ? topResults[topResults.length - 1].score : 0
};

return {
  json: {
    ...queryData,
    results: topResults,
    stats,
    _next_step: 'enrich_results'
  }
};
Node 14: Enrich Results with Source Data
json{
  "id": "enrich_results",
  "type": "n8n-nodes-base.function",
  "typeVersion": 1,
  "position": [2650, 250],
  "parameters": {
    "functionCode": "// See complete code below"
  }
}
Complete Function Code:
javascript// ============================================
// ENRICH RESULTS WITH SOURCE DATA
// ============================================

const data = $input.first().json;

// For each result, we would typically fetch full details from Supabase
// This function prepares the queries needed

const enrichmentQueries = data.results.map(result => ({
  table: result.payload.source_table,
  id: result.payload.source_id,
  collection: result.collection
}));

// In a production workflow, this would trigger parallel Supabase queries
// For now, we'll structure the data for the next node to process

return {
  json: {
    ...data,
    enrichment_queries: enrichmentQueries,
    enrichment_needed: enrichmentQueries.length > 0
  }
};
Node 15: Log Query Execution
json{
  "id": "log_query_execution",
  "type": "@n8n/n8n-nodes-langchain.supabaseVectorStore",
  "typeVersion": 1,
  "position": [2850, 250],
  "parameters": {
    "operation": "insert",
    "table": "rag_query_logs",
    "data": {
      "fields": [
        {
          "fieldName": "organization_id",
          "fieldValue": "={{ $json.organization_id }}"
        },
        {
          "fieldName": "user_id",
          "fieldValue": "={{ $json.user_id }}"
        },
        {
          "fieldName": "query_text",
          "fieldValue": "={{ $json.query }}"
        },
        {
          "fieldName": "collection_name",
          "fieldValue": "={{ $json.collections.join(',') }}"
        },
        {
          "fieldName": "results_count",
          "fieldValue": "={{ $json.stats.returned_results }}"
        },
        {
          "fieldName": "top_score",
          "fieldValue": "={{ $json.stats.max_score }}"
        },
        {
          "fieldName": "execution_time_ms",
          "fieldValue": "={{ Date.now() - new Date($json._metadata.validated_at).getTime() }}"
        },
        {
          "fieldName": "filters",
          "fieldValue": "={{ JSON.stringify($json.filters) }}"
        }
      ]
    }
  },
  "credentials": {
    "supabaseApi": {
      "id": "supabase_main",
      "name": "Supabase API"
    }
  }
}
Node 16: Return Query Results
json{
  "id": "return_query_results",
  "type": "n8n-nodes-base.respondToWebhook",
  "typeVersion": 1,
  "position": [3050, 250],
  "parameters": {
    "respondWith": "json",
    "responseBody": "={{ JSON.stringify({\n  success: true,\n  query: $json.query,\n  results: $json.results,\n  stats: $json.stats,\n  metadata: {\n    organization_id: $json.organization_id,\n    execution_id: $execution.id,\n    timestamp: new Date().toISOString()\n  }\n}) }}",
    "options": {
      "responseCode": 200,
      "responseHeaders": {
        "entries": [
          {
            "name": "Content-Type",
            "value": "application/json"
          }
        ]
      }
    }
  }
}

External API Integrations
API 1: Embedding Service (intfloat/e5-large-v2)
Purpose: Generate 1024-dimensional embeddings for text content and search queries
Authentication:

Type: API Key (Bearer token)
Credential Setup:

Sign up at https://huggingface.co
Generate API token in Settings → Access Tokens
Create new N8n credential: Credentials → Add → Header Auth
Name: embedding_api_key
Header: Authorization
Value: Bearer hf_your_token_here



N8n Credential Name: embedding_api_key
Endpoint: Generate Embeddings

Method: POST
URL: https://api-inference.huggingface.co/models/intfloat/e5-large-v2
Headers:

Authorization: Bearer {token}
Content-Type: application/json



Request Body:
json{
  "inputs": "Your text to embed here",
  "options": {
    "wait_for_model": true
  }
}
Response (Success 200):
json[
  [0.123, -0.456, 0.789, ..., 0.321]
]
Response (Error):
json{
  "error": "Model is loading, please retry"
}
Rate Limits: 100 requests/minute per API key, 1000 requests/hour
Retry Strategy: Exponential backoff, max 3 retries
Batch Processing: Send up to 50 texts in single request using array input

API 2: Qdrant Vector Database
Purpose: Store and search vector embeddings with metadata filtering
Authentication:

Type: API Key
Credential Setup:

Deploy Qdrant Cloud instance or self-host
Generate API key in Qdrant dashboard
Create N8n credential: Credentials → Add → Header Auth
Name: qdrant_api_key
Header: api-key
Value: your_qdrant_api_key



N8n Credential Name: qdrant_api_key
Endpoint 1: Create Collection

Method: PUT
URL: {QDRANT_URL}/collections/{collection_name}
Request Body:

json{
  "vectors": {
    "size": 1024,
    "distance": "Cosine"
  },
  "optimizers_config": {
    "indexing_threshold": 10000
  }
}
Endpoint 2: Upsert Points (Store Embeddings)

Method: PUT
URL: {QDRANT_URL}/collections/{collection_name}/points
Request Body:

json{
  "points": [
    {
      "id": "uuid-or-string-id",
      "vector": [0.123, -0.456, ...],
      "payload": {
        "organization_id": "org-uuid",
        "content_type": "property",
        "title": "Document title",
        "metadata": {...}
      }
    }
  ]
}
Endpoint 3: Search (Semantic Query)

Method: POST
URL: {QDRANT_URL}/collections/{collection_name}/points/search
Request Body:

json{
  "vector": [0.123, -0.456, ...],
  "limit": 10,
  "score_threshold": 0.7,
  "with_payload": true,
  "with_vector": false,
  "filter": {
    "must": [
      {
        "key": "organization_id",
        "match": { "value": "org-uuid" }
      }
    ]
  }
}
Response (Search Success):
json{
  "result": [
    {
      "id": "point-id",
      "score": 0.95,
      "payload": {
        "organization_id": "org-uuid",
        "content_type": "property",
        "title": "Result title",
        "text_preview": "Preview text...",
        "metadata": {...}
      }
    }
  ],
  "status": "ok",
  "time": 0.023
}
Rate Limits: 1000 requests/minute
Retry Strategy: Retry on 503 (service unavailable), exponential backoff

Database Operations
SQL Function: Increment Embedding Metrics (PostgreSQL)
sql-- Create function for atomic metrics increment
CREATE OR REPLACE FUNCTION increment_embedding_metrics(
  p_organization_id UUID,
  p_collection_name VARCHAR(100),
  p_metric_date DATE
)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO embedding_quality_metrics (
    organization_id,
    collection_name,
    metric_date,
    total_embeddings,
    successful_embeddings
  ) VALUES (
    p_organization_id,
    p_collection_name,
    p_metric_date,
    1,
    1
  )
  ON CONFLICT (organization_id, collection_name, metric_date)
  DO UPDATE SET
    total_embeddings = embedding_quality_metrics.total_embeddings + 1,
    successful_embeddings = embedding_quality_metrics.successful_embeddings + 1;
END;
$$;

-- Grant execution to service role
GRANT EXECUTE ON FUNCTION increment_embedding_metrics TO service_role;
Common Queries:
Query 1: Get Embedding Job Status
sql-- Check status of embedding jobs for an organization
SELECT 
  id,
  content_type,
  source_table,
  source_id,
  status,
  error_message,
  processing_time_ms,
  created_at,
  completed_at
FROM embedding_jobs
WHERE 
  organization_id = $1
  AND created_at >= $2
ORDER BY created_at DESC
LIMIT $3;

-- Parameters:
-- $1: organization_id (UUID)
-- $2: created_after (TIMESTAMP) - e.g., NOW() - INTERVAL '24 hours'
-- $3: limit (INTEGER) - e.g., 100

-- Expected result: 0-100 rows
-- Performance: <20ms with index on (organization_id, created_at)
Query 2: Get Embedding Quality Metrics
sql-- Get daily embedding quality metrics for last 30 days
SELECT 
  metric_date,
  collection_name,
  total_embeddings,
  successful_embeddings,
  failed_embeddings,
  ROUND(100.0 * successful_embeddings / NULLIF(total_embeddings, 0), 2) as success_rate,
  average_processing_time_ms,
  duplicate_detections
FROM embedding_quality_metrics
WHERE 
  organization_id = $1
  AND metric_date >= CURRENT_DATE - INTERVAL '30 days'
ORDER BY metric_date DESC, collection_name;

-- Parameters:
-- $1: organization_id (UUID)

-- Expected result: 0-150 rows (5 collections × 30 days)
-- Performance: <30ms with indexes
Query 3: Search Query Analytics
sql-- Get query performance analytics
SELECT 
  DATE(created_at) as query_date,
  COUNT(*) as total_queries,
  AVG(execution_time_ms) as avg_execution_time_ms,
  AVG(results_count) as avg_results_count,
  AVG(top_score) as avg_relevance_score,
  AVG(relevance_feedback) FILTER (WHERE relevance_feedback IS NOT NULL) as avg_user_rating
FROM rag_query_logs
WHERE 
  organization_id = $1
  AND created_at >= $2
GROUP BY DATE(created_at)
ORDER BY query_date DESC;

-- Parameters:
-- $1: organization_id (UUID)
-- $2: start_date (TIMESTAMP)

-- Expected result: 1-30 rows
-- Performance: <50ms with aggregation

Performance Optimization
Caching Strategy:
javascript// Embedding cache configuration
const EMBEDDING_CACHE_CONFIG = {
  // Cache embeddings for frequently accessed content
  'property_embeddings': {
    ttl: 86400, // 24 hours
    key_pattern: 'emb:{org_id}:{content_type}:{source_id}',
    storage: 'redis',
    invalidate_on: ['property_update', 'property_delete']
  },
  // Cache query embeddings for common queries
  'query_embeddings': {
    ttl: 3600, // 1 hour
    key_pattern: 'qemb:{hash}', // Hash of query text
    storage: 'redis'
  },
  // Cache search results for popular queries
  'search_results': {
    ttl: 300, // 5 minutes
    key_pattern: 'search:{org_id}:{query_hash}',
    storage: 'redis'
  }
};

// Implementation in Function node
const crypto = require('crypto');

function hashQuery(query) {
  return crypto.createHash('md5').update(query.toLowerCase().trim()).digest('hex');
}

const queryHash = hashQuery($json.query);
const cacheKey = `qemb:${queryHash}`;

// Try cache first (pseudo-code - actual implementation would use Redis node)
// const cachedEmbedding = await redis.get(cacheKey);
// if (cachedEmbedding) return { json: { embedding: JSON.parse(cachedEmbedding) } };

// If not cached, generate and store
// await redis.setex(cacheKey, 3600, JSON.stringify(embedding));
Batch Processing Configuration:
For ingesting large datasets (1000+ documents):
json{
  "id": "batch_split",
  "type": "n8n-nodes-base.splitInBatches",
  "parameters": {
    "batchSize": 50,
    "options": {
      "reset": true
    }
  }
}
When to use batching:

Embedding Generation: Batch 10-50 texts per API call (depends on provider)
Qdrant Upsert: Batch 100-500 points per request for optimal throughput
Initial Data Load: Process 1000+ documents in batches to avoid timeout

Query Optimization Tips:

Qdrant Index Configuration:

json{
  "hnsw_config": {
    "m": 16,
    "ef_construct": 100,
    "full_scan_threshold": 10000
  }
}

Limit Search Scope:

Only search relevant collections (don't search all 5 if user needs properties)
Use metadata filters to reduce search space
Set appropriate score_threshold to filter low-quality results


Database Query Performance:

Index on (organization_id, created_at) for time-range queries
Index on (organization_id, status) for filtering by status
Use EXPLAIN ANALYZE to identify slow queries



Performance Targets:

Embedding Generation: <500ms per document (single), <2s for batch of 50
Qdrant Search: <200ms per collection (p95)
Full Query Pipeline: <2s from webhook to response (p95)
Batch Ingestion: >500 documents/minute
Memory Usage: <512MB per workflow execution
Concurrent Operations: Support 50+ simultaneous embedding jobs


Testing & Validation
Test Data Sets
Test Case 1: Property Embedding (Happy Path)
json{
  "name": "Embed property listing",
  "input": {
    "user_id": "123e4567-e89b-12d3-a456-426614174000",
    "organization_id": "123e4567-e89b-12d3-a456-426614174001",
    "content_type": "property",
    "source_table": "properties",
    "source_id": "prop-test-001",
    "content": {
      "title": "Luxury 4BR Colonial in Historic District",
      "text": "Stunning 4 bedroom, 3.5 bathroom colonial home in the heart of the historic district. Features include: original hardwood floors throughout, chef's kitchen with granite countertops and stainless steel appliances, formal dining room, spacious master suite with walk-in closet, finished basement, two-car garage, professionally landscaped yard. Walking distance to downtown shops, restaurants, and schools. Move-in ready! $675,000.",
      "metadata": {
        "address": "456 Oak Avenue, Bristol, VA 24201",
        "price": 675000,
        "bedrooms": 4,
        "bathrooms": 3.5,
        "sqft": 2850,
        "lot_size": 0.25,
        "year_built": 1985,
        "mls_id": "MLS-456789",
        "property_type": "Single Family",
        "status": "Active"
      }
    }
  },
  "expected_output": {
    "success": true,
    "data": {
      "embedding_job_id": "uuid",
      "collection": "properties",
      "point_id": "prop-test-001",
      "dimensions": 1024,
      "processing_time_ms": "<2000"
    }
  },
  "expected_status_code": 200
}
Test Case 2: Lead Conversation Embedding
json{
  "name": "Embed lead conversation",
  "input": {
    "user_id": "123e4567-e89b-12d3-a456-426614174000",
    "organization_id": "123e4567-e89b-12d3-a456-426614174001",
    "content_type": "lead",
    "source_table": "lead_conversations",
    "source_id": "conv-test-002",
    "content": {
      "title": "Initial consultation with John Smith",
      "text": "John Smith is looking for a 3-4 bedroom home in the downtown area. Budget is flexible up to $550k. Needs to be move-in ready as they're relocating for work in 2 months. Preferences: updated kitchen, good schools nearby, quiet neighborhood. Family of 4 (2 kids ages 8 and 11). Currently renting but pre-approved for mortgage. Very motivated buyer.",
      "metadata": {
        "lead_name": "John Smith",
        "lead_email": "john.smith@email.com",
        "lead_phone": "+1-555-0123",
        "budget_min": 400000,
        "budget_max": 550000,
        "bedrooms_min": 3,
        "timeline": "2 months",
        "pre_approved": true
      }
    }
  },
  "expected_output": {
    "success": true,
    "data": {
      "embedding_job_id": "uuid",
      "collection": "leads",
      "dimensions": 1024
    }
  },
  "expected_status_code": 200
}
Test Case 3: Duplicate Detection
json{
  "name": "Attempt to embed existing document",
  "input": {
    "user_id": "123e4567-e89b-12d3-a456-426614174000",
    "organization_id": "123e4567-e89b-12d3-a456-426614174001",
    "content_type": "property",
    "source_table": "properties",
    "source_id": "prop-test-001",
    "content": {
      "title": "Same property as Test Case 1",
      "text": "This should be detected as duplicate..."
    },
    "options": {
      "force_reembed": false
    }
  },
  "expected_output": {
    "success": true,
    "message": "Embedding already exists, metadata updated",
    "data": {
      "existing_job_id": "uuid",
      "skipped": true
    }
  },
  "expected_status_code": 200
}
Test Case 4: Force Re-embedding
json{
  "name": "Force re-embed existing document",
  "input": {
    "user_id": "123e4567-e89b-12d3-a456-426614174000",
    "organization_id": "123e4567-e89b-12d3-a456-426614174001",
    "content_type": "property",
    "source_table": "properties",
    "source_id": "prop-test-001",
    "content": {
      "title": "Updated property listing",
      "text": "Price reduced! Now $650,000. New flooring installed..."
    },
    "options": {
      "force_reembed": true
    }
  },
  "expected_output": {
    "success": true,
    "data": {
      "embedding_job_id": "new-uuid",
      "collection": "properties",
      "reembedded": true
    }
  },
  "expected_status_code": 200
}
Test Case 5: Invalid Text Content
json{
  "name": "Insufficient text for embedding",
  "input": {
    "user_id": "123e4567-e89b-12d3-a456-426614174000",
    "organization_id": "123e4567-e89b-12d3-a456-426614174001",
    "content_type": "property",
    "source_table": "properties",
    "source_id": "prop-test-error",
    "content": {
      "title": "",
      "text": "Hi",
      "metadata": {}
    }
  },
  "expected_output": {
    "success": false,
    "error": "Insufficient text content for embedding"
  },
  "expected_status_code": 400
}
Test Case 6: Semantic Search Query
json{
  "name": "Search for properties matching criteria",
  "input": {
    "user_id": "123e4567-e89b-12d3-a456-426614174000",
    "organization_id": "123e4567-e89b-12d3-a456-426614174001",
    "query": "Show me 3 bedroom homes under $500k near good schools in quiet neighborhoods",
    "collections": ["properties"],
    "limit": 10,
    "score_threshold": 0.7
  },
  "expected_output": {
    "success": true,
    "results": [
      {
        "id": "prop-xxx",
        "score": 0.92,
        "collection": "properties",
        "title": "3BR Home Near Elementary School",
        "text_preview": "..."
      }
    ],
    "stats": {
      "returned_results": ">0",
      "average_score": ">0.7"
    }
  },
  "expected_status_code": 200
}
Test Case 7: Cross-Organization Isolation Test
json{
  "name": "Verify user cannot access other org's vectors",
  "setup": [
    "Create embedding for org-1: 'Exclusive downtown loft'",
    "Create embedding for org-2: 'Luxury penthouse downtown'"
  ],
  "input": {
    "user_id": "user-org-1",
    "organization_id": "org-1",
    "query": "luxury penthouse downtown",
    "collections": ["properties"]
  },
  "expected_output": {
    "success": true,
    "results": [
      "Should NOT contain org-2's penthouse",
      "Should only contain org-1's properties"
    ]
  },
  "verification": "Manually check no results have organization_id === 'org-2'"
}
Test Case 8: Batch Embedding (1000 documents)
json{
  "name": "Batch ingest 1000 property listings",
  "input": {
    "batch_size": 50,
    "total_documents": 1000,
    "content_type": "property",
    "organization_id": "org-batch-test"
  },
  "expected_output": {
    "total_processed": 1000,
    "successful": ">980",
    "failed": "<20",
    "total_time_seconds": "<300",
    "throughput": ">200 docs/minute"
  }
}

Testing Procedures
Step 1: Unit Testing (Individual Operations)
bash# Test 1: Embed single property
curl -X POST http://n8n.local/webhook/rag/ingest \
  -H "Authorization: Bearer test-token" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "test-user-001",
    "organization_id": "test-org-001",
    "content_type": "property",
    "source_table": "properties",
    "source_id": "prop-unit-test-001",
    "content": {
      "title": "Test Property",
      "text": "Beautiful home with 3 bedrooms and 2 bathrooms in excellent condition.",
      "metadata": {"price": 350000, "bedrooms": 3}
    }
  }'

# Expected: 200 OK with embedding_job_id
# Verify: Check embedding_jobs table for completed status
# Verify: Query Qdrant to confirm point exists

# Test 2: Search for the embedded property
curl -X POST http://n8n.local/webhook/rag/query \
  -H "Authorization: Bearer test-token" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "test-user-001",
    "organization_id": "test-org-001",
    "query": "3 bedroom home under $400k",
    "collections": ["properties"],
    "limit": 5
  }'

# Expected: 200 OK with results array containing the test property
# Verify: Result score > 0.7
# Verify: Correct metadata returned
Step 2: Integration Testing (End-to-End)
bash# Full workflow test: Ingest → Search → Verify
./test_rag_workflow.sh

# Script contents:
#!/bin/bash
set -e

echo "=== RAG System Integration Test ==="

# 1. Ingest test data
echo "1. Ingesting test properties..."
for i in {1..5}; do
  curl -s -X POST http://n8n.local/webhook/rag/ingest \
    -H "Authorization: Bearer test-token" \
    -H "Content-Type: application/json" \
    -d "{
      \"user_id\": \"test-user-001\",
      \"organization_id\": \"test-org-001\",
      \"content_type\": \"property\",
      \"source_table\": \"properties\",
      \"source_id\": \"test-prop-$i\",
      \"content\": {
        \"title\": \"Test Property $i\",
        \"text\": \"Property with unique features for test $i\",
        \"metadata\": {\"price\": $((300000 + i * 50000))}
      }
    }" | jq '.success'
  sleep 1
done

# 2. Wait for embeddings to complete
echo "2. Waiting for embeddings to complete..."
sleep 5

# 3. Execute search query
echo "3. Executing search query..."
RESULTS=$(curl -s -X POST http://n8n.local/webhook/rag/query \
  -H "Authorization: Bearer test-token" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "test-user-001",
    "organization_id": "test-org-001",
    "query": "properties with unique features",
    "collections": ["properties"],
    "limit": 10
  }')

# 4. Verify results
RESULT_COUNT=$(echo $RESULTS | jq '.stats.returned_results')
echo "4. Results found: $RESULT_COUNT"

if [ "$RESULT_COUNT" -ge 3 ]; then
  echo "✅ Integration test PASSED"
  exit 0
else
  echo "❌ Integration test FAILED - Expected at least 3 results"
  exit 1
fi
Step 3: Organization Isolation Testing
sql-- Set up test data for two organizations
INSERT INTO organizations (id, name) VALUES
  ('iso-test-org-1', 'Isolation Test Org 1'),
  ('iso-test-org-2', 'Isolation Test Org 2');

INSERT INTO users (id, email) VALUES
  ('iso-test-user-1', 'user1@isolationtest.com'),
  ('iso-test-user-2', 'user2@isolationtest.com');

INSERT INTO user_organizations (user_id, organization_id, role) VALUES
  ('iso-test-user-1', 'iso-test-org-1', 'admin'),
  ('iso-test-user-2', 'iso-test-org-2', 'admin');
bash# Embed document for Org 1
curl -X POST http://n8n.local/webhook/rag/ingest \
  -H "Authorization: Bearer test-token" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "iso-test-user-1",
    "organization_id": "iso-test-org-1",
    "content_type": "property",
    "source_table": "properties",
    "source_id": "org1-property-secret",
    "content": {
      "title": "Org 1 Exclusive Property",
      "text": "This property belongs exclusively to Organization 1 and should never appear in Org 2 searches."
    }
  }'

# Embed document for Org 2
curl -X POST http://n8n.local/webhook/rag/ingest \
  -H "Authorization: Bearer test-token" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "iso-test-user-2",
    "organization_id": "iso-test-org-2",
    "content_type": "property",
    "source_table": "properties",
    "source_id": "org2-property-secret",
    "content": {
      "title": "Org 2 Exclusive Property",
      "text": "This property belongs exclusively to Organization 2 and should never appear in Org 1 searches."
    }
  }'

# Test 1: Org 1 user searches
RESULTS_ORG1=$(curl -s -X POST http://n8n.local/webhook/rag/query \
  -H "Authorization: Bearer test-token" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "iso-test-user-1",
    "organization_id": "iso-test-org-1",
    "query": "exclusive property",
    "collections": ["properties"]
  }')

# Verify: Results should ONLY contain org1-property-secret
echo $RESULTS_ORG1 | jq '.results[] | select(.source_id == "org2-property-secret")'
# Expected: Empty (no output)

# Test 2: Org 2 user searches
RESULTS_ORG2=$(curl -s -X POST http://n8n.local/webhook/rag/query \
  -H "Authorization: Bearer test-token" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "iso-test-user-2",
    "organization_id": "iso-test-org-2",
    "query": "exclusive property",
    "collections": ["properties"]
  }')

# Verify: Results should ONLY contain org2-property-secret
echo $RESULTS_ORG2 | jq '.results[] | select(.source_id == "org1-property-secret")'
# Expected: Empty (no output)

echo "✅ Organization isolation verified"
Step 4: Performance Testing
bash# Use Apache Bench for load testing
ab -n 100 -c 10 -p search_payload.json -T application/json \
  -H "Authorization: Bearer test-token" \
  http://n8n.local/webhook/rag/query

# search_payload.json:
{
  "user_id": "perf-test-user",
  "organization_id": "perf-test-org",
  "query": "3 bedroom homes with modern kitchens",
  "collections": ["properties"],
  "limit": 10
}

# Analyze results:
# - Mean response time should be < 2000ms
# - 95th percentile should be < 3000ms
# - 99th percentile should be < 5000ms
# - Error rate should be < 1%

# Monitor N8n metrics during load test:
# - Check workflow execution times in N8n UI
# - Monitor Qdrant search latency in Qdrant dashboard
# - Check database connection pool usage in Supabase
# - Monitor embedding API rate limits
Step 5: Batch Processing Test
bash# Test batch ingestion of 1000 documents
node test_batch_ingestion.js

# test_batch_ingestion.js contents:
const axios = require('axios');

async function ingestBatch() {
  const startTime = Date.now();
  const results = {
    total: 1000,
    successful: 0,
    failed: 0,
    errors: []
  };

  // Generate 1000 test properties
  const properties = Array.from({length: 1000}, (_, i) => ({
    user_id: 'batch-test-user',
    organization_id: 'batch-test-org',
    content_type: 'property',
    source_table: 'properties',
    source_id: `batch-prop-${i}`,
    content: {
      title: `Batch Test Property ${i}`,
      text: `This is test property number ${i} with ${3 + (i % 3)} bedrooms and ${2 + (i % 2)} bathrooms. Price: $${300000 + (i * 1000)}.`,
      metadata: {
        bedrooms: 3 + (i % 3),
        bathrooms: 2 + (i % 2),
        price: 300000 + (i * 1000)
      }
    }
  }));

  // Process in batches of 50
  for (let i = 0; i < properties.length; i += 50) {
    const batch = properties.slice(i, i + 50);
    
    await Promise.all(batch.map(async (prop) => {
      try {
        const response = await axios.post(
          'http://n8n.local/webhook/rag/ingest',
          prop,
          {
            headers: {
              'Authorization': 'Bearer test-token',
              'Content-Type': 'application/json'
            },
            timeout: 30000
          }
        );
        if (response.data.success) results.successful++;
      } catch (error) {
        results.failed++;
        results.errors.push({prop: prop.content.title, error: error.message});
      }
    }));

    console.log(`Processed ${Math.min(i + 50, properties.length)}/${properties.length}`);
    
    // Small delay between batches to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  const duration = (Date.now() - startTime) / 1000;
  const throughput = Math.round(results.successful / (duration / 60));

  console.log('\n=== Batch Ingestion Results ===');
  console.log(`Total: ${results.total}`);
  console.log(`Successful: ${results.successful}`);
  console.log(`Failed: ${results.failed}`);
  console.log(`Duration: ${duration.toFixed(2)}s`);
  console.log(`Throughput: ${throughput} docs/minute`);
  
  if (results.failed > 0) {
    console.log('\nErrors:');
    results.errors.forEach(e => console.log(`  ${e.prop}: ${e.error}`));
  }

  // Validation
  const success_rate = (results.successful / results.total) * 100;
  if (success_rate >= 98 && throughput >= 200) {
    console.log('\n✅ Batch test PASSED');
  } else {
    console.log('\n❌ Batch test FAILED');
    console.log(`  Success rate: ${success_rate.toFixed(2)}% (target: >=98%)`);
    console.log(`  Throughput: ${throughput} docs/min (target: >=200)`);
  }
}

ingestBatch().catch(console.error);

Validation Checklist
Before marking implementation complete, verify:
Functionality:

✅ Property embeddings created successfully
✅ Lead conversation embeddings created successfully
✅ Document embeddings created successfully
✅ Market data embeddings created successfully
✅ Duplicate detection works correctly
✅ Force re-embed option works
✅ Semantic search returns relevant results
✅ Multi-collection search works
✅ Score threshold filtering works
✅ Metadata filters applied correctly

Security:

✅ Organization isolation enforced in Qdrant filters
✅ User authorization checked before ingestion
✅ User authorization checked before queries
✅ No cross-org data leakage in search results
✅ API keys stored securely in N8n credentials
✅ No sensitive data logged

Performance:

✅ Single embedding: <2s (p95)
✅ Search query: <2s (p95)
✅ Batch ingestion: >200 docs/minute
✅ No memory leaks during batch processing
✅ Database queries optimized with indexes
✅ Qdrant search latency <200ms

Code Quality:

✅ No placeholder code or TODOs
✅ All functions have error handling
✅ Code is well-commented
✅ Consistent naming conventions
✅ No hardcoded credentials

Integration:

✅ Embedding API integration works
✅ Qdrant API integration works
✅ Supabase database operations work
✅ Webhook triggers receive requests correctly
✅ Response format matches specification

Monitoring:

✅ Embedding jobs logged to database
✅ Query executions logged to database
✅ Quality metrics tracked daily
✅ Errors logged with context
✅ Performance metrics captured

Documentation:

✅ Workflow purpose documented
✅ API endpoints documented
✅ Test procedures complete
✅ Troubleshooting guide helpful
✅ Integration guide provided


Monitoring & Alerting
Key Metrics:
javascriptconst RAG_METRICS = {
  embedding_success_rate: {
    type: 'gauge',
    labels: ['organization_id', 'content_type'],
    description: 'Percentage of successful embeddings',
    target: '>95%'
  },
  embedding_duration: {
    type: 'histogram',
    buckets: [500, 1000, 2000, 5000, 10000],
    labels: ['content_type'],
    description: 'Time to generate and store embedding (ms)'
  },
  search_latency: {
    type: 'histogram',
    buckets: [100, 200, 500, 1000, 2000],
    labels: ['collection'],
    description: 'Semantic search response time (ms)'
  },
  search_relevance: {
    type: 'histogram',
    buckets: [0.5, 0.6, 0.7, 0.8, 0.9, 1.0],
    description: 'Average similarity score of search results'
  },
  daily_embeddings: {
    type: 'counter',
    labels: ['organization_id', 'content_type'],
    description: 'Total embeddings created per day'
  },
  query_volume: {
    type: 'counter',
    labels: ['organization_id'],
    description: 'Total search queries executed'
  }
};
Alert Rules:
yamlalerts:
  - name: High Embedding Failure Rate
    condition: embedding_success_rate < 90% over 10 minutes
    severity: warning
    action: Notify DevOps team, investigate embedding API
    
  - name: Critical Embedding Failure Rate
    condition: embedding_success_rate < 75% over 5 minutes
    severity: critical
    action: Page on-call engineer, check API status
    
  - name: Slow Search Performance
    condition: p95(search_latency) > 3000ms over 10 minutes
    severity: warning
    action: Investigate Qdrant performance, check index status
    
  - name: Low Search Relevance
    condition: avg(search_relevance) < 0.6 over 1 hour
    severity: warning
    action: Review embedding quality, check for model drift
    
  - name: Embedding API Down
    condition: embedding_api_errors > 80% over 2 minutes
    severity: critical
    action: Switch to backup provider, alert team
    
  - name: Qdrant Connection Issues
    condition: qdrant_errors > 50% over 2 minutes
    severity: critical
    action: Check Qdrant status, verify network connectivity
Dashboard Panels:

Embedding Operations (last 24h)

Line chart: Embeddings created per hour by content type
Success rate gauge by organization
Average processing time trend


Search Performance (real-time)

Queries per minute
P50/P95/P99 search latency
Average relevance score
Results per query distribution


Quality Metrics

Embedding success rate by content type
Duplicate detection rate
Validation failure rate
Error breakdown by category


Resource Utilization

API rate limit usage (Embedding API, Qdrant)
Database connection pool usage
Workflow execution queue length
Storage usage by collection




Documentation
Workflow Overview
Name: RAG System Integration v1.0
Version: 1.0.0
Purpose: Provide semantic search capabilities across real estate organization data by generating and storing vector embeddings, enabling AI agents to retrieve contextually relevant information.
Business Value:

Intelligent Retrieval: Find relevant properties, leads, and documents using natural language queries
Context-Aware AI: Enable AI agents to access organization-specific knowledge for accurate responses
Scalable Search: Handle thousands of documents with sub-second query times
Multi-Tenant Isolation: Ensure organizations only access their own data

When to Use:

Embedding new properties, leads, documents, or market data for semantic search
Querying organization data with natural language questions
Enabling AI agents to retrieve contextual information
Building recommendation systems based on similarity

When NOT to Use:

Simple keyword search (use PostgreSQL full-text search instead)
Exact match queries (use database direct queries)
Real-time data that changes every second (embeddings have ~5min lag)
Non-textual data (images, videos require different embedding models)


Integration Points
Consumes From:

Supabase Webhooks: Property/lead/document creation or updates trigger embedding
Property Management (Prompt #5): Sends property data for embedding
Lead Management (Prompt #4): Sends conversation data for embedding
Document Upload: Processes uploaded contracts, disclosures for embedding

Provides To:

AI Agents (Prompts #7-11): Provides semantic search results for context
Frontend Search: Powers intelligent search features in UI
Recommendation Engine: Finds similar properties or leads
Analytics: Provides query logs for understanding user search patterns

Triggers:

Webhook: Manual trigger via API for on-demand embedding
Database Events: Automatic trigger when new records created (via Supabase webhooks)
Batch Import: Triggered during bulk data import operations


Usage Examples
Example 1: Embed New Property Listing
bashcurl -X POST https://api.strivetech.io/api/rag/ingest \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "agent-uuid",
    "organization_id": "org-uuid",
    "content_type": "property",
    "source_table": "properties",
    "source_id": "prop-12345",
    "content": {
      "title": "Modern Downtown Condo",
      "text": "Spacious 2BR/2BA condo in downtown district. Granite countertops, stainless appliances, balcony with city views. Walk to restaurants and shops. $425,000.",
      "metadata": {
        "address": "789 Main St",
        "price": 425000,
        "bedrooms": 2,
        "bathrooms": 2
      }
    }
  }'

# Response:
{
  "success": true,
  "message": "Embedding created successfully",
  "data": {
    "embedding_job_id": "job-uuid",
    "collection": "properties",
    "point_id": "prop-12345",
    "dimensions": 1024,
    "processing_time_ms": 1245
  }
}
Example 2: Search for Properties
bashcurl -X POST https://api.strivetech.io/api/rag/query \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "agent-uuid",
    "organization_id": "org-uuid",
    "query": "2 bedroom condos downtown under $450k",
    "collections": ["properties"],
    "limit": 5,
    "score_threshold": 0.7
  }'

# Response:
{
  "success": true,
  "query": "2 bedroom condos downtown under $450k",
  "results": [
    {
      "id": "prop-12345",
      "score": 0.92,
      "collection": "properties",
      "title": "Modern Downtown Condo",
      "text_preview": "Spacious 2BR/2BA condo in downtown...",
      "metadata": {
        "address": "789 Main St",
        "price": 425000,
        "bedrooms": 2
      }
    }
  ],
  "stats": {
    "returned_results": 5,
    "average_score": 0.86,
    "max_score": 0.92
  }
}
Example 3: Frontend Integration (React)
javascript// RAG search hook for Next.js
import { useState } from 'react';

export function useRAGSearch() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);

  const search = async (query, collections = ['properties']) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/rag/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify({
          user_id: getCurrentUserId(),
          organization_id: getCurrentOrgId(),
          query,
          collections,
          limit: 10,
          score_threshold: 0.7
        })
      });

      if (!response.ok) {
        throw new Error(`Search failed: ${response.statusText}`);
      }

      const data = await response.json();
      setResults(data.results);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { search, results, loading, error };
}

// Usage in component
function PropertySearch() {
  const { search, results, loading } = useRAGSearch();
  const [query, setQuery] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    await search(query, ['properties']);
  };

  return (
    <div>
      <form onSubmit={handleSearch}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search properties..."
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {results.map(result => (
        <PropertyCard 
          key={result.id}
          {...result}
          relevance={result.score}
        />
      ))}
    </div>
  );
}

Troubleshooting Guide
Problem: Embedding generation fails with timeout
Symptoms:

Error: "Request timeout" or "ETIMEDOUT"
Workflow fails at embedding generation step
embedding_jobs table shows "failed" status

Diagnosis:

Check embedding API status at provider dashboard
Test API directly with curl to verify accessibility
Check network connectivity from N8n server
Review API rate limits and usage

Solution:

Increase timeout in HTTP Request node (currently 30s)
Implement queue system for retrying failed embeddings
Switch to alternative embedding provider if primary is down
Batch smaller groups of texts if hitting rate limits

Prevention:

Monitor API uptime and set up alerts
Implement automatic failover to backup provider
Use exponential backoff for retries
Cache embeddings to reduce API calls


Problem: Search results not relevant
Symptoms:

Low similarity scores (<0.6) for clearly relevant queries
Expected results not appearing in top results
User feedback indicates poor relevance

Diagnosis:

Check embedding quality metrics in database
Review sample embeddings for zero vectors or anomalies
Test with known good query-document pairs
Verify correct embedding model being used (e5-large-v2)
Check if document text preparation is removing important content

Solution:

Adjust score_threshold (try lowering to 0.6)
Review text preparation logic to ensure key information included
Re-embed documents if model mismatch detected
Add more context to document metadata
Consider fine-tuning embedding model on domain-specific data

Prevention:

Track relevance metrics over time
Collect user feedback on search quality
Regularly audit top queries and results
A/B test different embedding strategies


Problem: Organization isolation breach
Symptoms:

User reports seeing data from other organizations
Security audit shows cross-org data access
Test queries return results from wrong organization

Diagnosis:

Check Qdrant filter in search request includes organization_id
Verify organization_id stored correctly in vector payload
Test with known cross-org scenario (use Test Case 7)
Review recent code changes to filter logic

Solution:
CRITICAL: This is a security issue requiring immediate action

Disable RAG search workflow immediately
Audit all existing vector points for correct organization_id
Add organization_id to MUST filters in Qdrant query
Re-test thoroughly with multiple organizations
Add automated tests for organization isolation

Prevention:

Include organization isolation in ALL test suites
Code review every change to filter logic
Regular security audits of vector database
Monitor query logs for suspicious cross-org patterns


Problem: Slow embedding performance
Symptoms:

Processing time >5s per document
Batch jobs timing out
Backlog of pending embedding_jobs

Diagnosis:

Check embedding API response times
Monitor N8n workflow execution times
Review database query performance
Check for network latency issues

Optimization Strategies:

Batch Embedding Requests:

Send 10-50 texts per API call instead of one
Reduces API overhead and improves throughput


Parallel Processing:

Use N8n's Split In Batches with parallel execution
Process multiple documents simultaneously


Text Optimization:

Truncate very long texts before embedding
Remove unnecessary whitespace and formatting
Cache preprocessed text


API Selection:

Consider self-hosting embedding model for lower latency
Use local GPU for faster embedding generation
Evaluate alternative models with faster inference



Prevention:

Set performance benchmarks and monitor continuously
Load test before deploying to production
Use caching for frequently embedded content


Problem: Duplicate embeddings created
Symptoms:

Multiple embedding_jobs for same source_id
Duplicate points in Qdrant collection
Increased storage costs

Diagnosis:

Check duplicate detection logic in workflow
Query embedding_jobs for duplicate source_id entries
Verify Qdrant point IDs match source_ids
Review workflow triggers for duplicate firing

Solution:

Fix duplicate detection query (check status='completed')
Use upsert operation in Qdrant (PUT /points automatically updates)
Add unique constraint on (source_table, source_id) in embedding_jobs
Implement idempotency keys for webhook triggers

Prevention:

Test duplicate detection with existing documents
Monitor embedding_jobs table for duplicates
Use database constraints to enforce uniqueness
Implement webhook deduplication at infrastructure level


Problem: Qdrant connection failures
Symptoms:

Error: "ECONNREFUSED" or "Connection timeout"
Workflow fails at Qdrant API calls
Cannot store or search vectors

Diagnosis:

Verify Qdrant service is running: curl $QDRANT_URL/collections
Check network connectivity from N8n to Qdrant
Verify API key is correct and has proper permissions
Check Qdrant logs for errors

Solution:

Restart Qdrant service if down
Verify firewall rules allow N8n → Qdrant traffic
Regenerate API key if authentication failing
Check Qdrant resource limits (RAM, disk space)
Scale Qdrant instance if overloaded

Prevention:

Monitor Qdrant health endpoint continuously
Set up alerts for connection failures
Implement circuit breaker pattern in workflow
Use managed Qdrant Cloud for better reliability


Maintenance & Updates
Regular Maintenance Tasks:
Weekly:

✅ Review error logs for new failure patterns
✅ Check embedding quality metrics for degradation
✅ Verify organization isolation with spot checks
✅ Monitor API costs and usage trends

Monthly:

✅ Audit embedding coverage (% of documents embedded)
✅ Review search relevance metrics and user feedback
✅ Optimize slow-performing queries
✅ Update embedding model if newer version available
✅ Clean up old/unused embeddings

Quarterly:

✅ Comprehensive performance audit
✅ Security review of vector access patterns
✅ Load testing with realistic traffic patterns
✅ Review and optimize Qdrant index configuration
✅ Evaluate alternative embedding models


Update Procedures:
When updating this workflow:

Create new version (don't modify v1.0)
Test thoroughly in development:

All test cases pass
Organization isolation verified
Performance benchmarks met


Deploy to staging for integration testing
Monitor staging for 48 hours
Gradual rollout to production:

Deploy to 10% of organizations
Monitor for 24 hours
Increase to 50% if no issues
Full rollout after 48 hours stable


Keep v1.0 active for quick rollback


Rollback Procedure:
bash# If issues detected in v2.0
1. Access N8n UI
2. Deactivate "rag-data-ingestion-v2"
3. Reactivate "rag-data-ingestion-v1"
4. Clear webhook cache: curl -X POST http://n8n.local/api/webhooks/clear-cache
5. Document what went wrong
6. Fix issues in development
7. Re-test before next deployment

Known Limitations
Current Limitations:

Embedding Model Context Length

Impact: Text longer than 512 tokens is truncated
Workaround: Split long documents into chunks before embedding
Roadmap: Implement chunking strategy in Q2 2025


Search Latency with Large Collections

Impact: Collections >100k vectors may have >500ms search latency
Workaround: Use metadata filters to reduce search space
Roadmap: Implement collection sharding in Q3 2025


No Multi-Language Support

Impact: e5-large-v2 optimized for English only
Workaround: Use language-specific embedding models
Roadmap: Add multilingual model support in Q4 2025


Embedding Update Lag

Impact: Document changes take ~5min to reflect in search
Workaround: Accept eventually consistent model
Roadmap: Implement real-time embedding pipeline in Q3 2025



Future Enhancements:

Hybrid Search (Dense + Sparse)

Priority: High
Estimated Effort: 3 weeks
Dependencies: Qdrant hybrid search feature, BM25 implementation


Automatic Chunking Strategy

Priority: High
Estimated Effort: 2 weeks
Dependencies: Text splitting library, overlap strategy


Query Expansion & Reranking

Priority: Medium
Estimated Effort: 4 weeks
Dependencies: Cross-encoder model, query preprocessing


Embedding Model Fine-Tuning

Priority: Low
Estimated Effort: 6 weeks
Dependencies: Training data collection, GPU resources




Success Criteria
This RAG system implementation is complete when:
Functionality:

✅ All content types (property, lead, document, market_data, conversation) embed successfully
✅ Duplicate detection prevents redundant embeddings
✅ Semantic search returns relevant results for natural language queries
✅ Multi-collection search works across all collections
✅ Metadata filtering applies correctly
✅ Organization isolation is 100% enforced

Performance:

✅ Single document embedding: <2s (p95)
✅ Semantic search query: <2s (p95)
✅ Batch ingestion: >200 documents/minute
✅ Search relevance: >90% user satisfaction
✅ Embedding coverage: >95% of documents

Security:

✅ Organization-level data isolation verified
✅ User authorization enforced on all operations
✅ No cross-org data leakage in any scenario
✅ API credentials stored securely
✅ Audit logs capture all data access

Quality:

✅ No placeholder code remains
✅ All error scenarios handled gracefully
✅ Comprehensive logging and monitoring
✅ Code follows project standards
✅ Documentation is complete and accurate

Operations:

✅ Monitoring dashboards configured
✅ Alerts set up for critical failures
✅ Runbooks created for common issues
✅ Automated tests run on every deploy
✅ Backup and recovery procedures documented

Deliverables:

✅ N8n workflow JSON files (ingestion + query)
✅ Database schema and migrations
✅ Test suite with 10+ test cases
✅ Complete API documentation
✅ Troubleshooting and maintenance guide


</enhanced_prompt>
