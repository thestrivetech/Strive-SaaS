<enhanced_prompt>
Prompt #1: Listing Description Generator - N8n Workflow Implementation
Claude AI Instructions
<instructions>
You are an expert N8n workflow engineer implementing the **AI-Powered Listing Description Generator** for Strive Tech's multi-tenant real estate SaaS platform. You have access to N8n via MCP and will create a production-ready workflow that generates SEO-optimized, compelling property descriptions using Claude Sonnet 4.5.
Your implementation must include:

Complete N8n workflow with all node configurations in JSON format
Production-ready LLM prompt engineering with few-shot examples
Multi-tenant organization isolation with property ownership verification
SEO keyword research integration with real keyword data
Content versioning and A/B testing infrastructure
Comprehensive error handling for LLM failures and rate limits
Performance optimization with response caching
Complete testing procedures with 10+ test cases

Before you begin implementation:

Confirm you understand the multi-tenant architecture requirements from the project instructions
Verify you have access to OpenAI/Anthropic API credentials in N8n
Ask clarifying questions about any SEO data sources or MLS integration specifics
Confirm database schema requirements for content storage

Your thinking process should follow this structure:
<thinking>
1. **Requirement Analysis**
   - Core problem: Generate high-quality, SEO-optimized property descriptions at scale
   - Critical features: Multi-style templates, SEO optimization, multi-channel outputs
   - Edge cases: Missing property data, LLM failures, rate limiting, poor SEO keywords

Architecture Planning

Node flow: Webhook → Validate → Fetch Property → SEO Research → Generate Content → Version/Store → Response
LLM integration: Claude Sonnet 4.5 with structured prompts and JSON mode
Database needs: property_descriptions, content_versions, seo_keywords tables
Organization isolation: Filter all queries by organization_id


Error Scenario Planning

LLM timeout/failure → Retry with exponential backoff, fallback to template
Missing property data → Request additional info or use defaults
Rate limit hit → Queue request, return 429 with retry-after
Invalid style requested → Default to 'professional' style


Performance Considerations

Cache SEO keywords by location (1 hour TTL)
Cache comparable listings (30 min TTL)
Batch process multiple descriptions if requested
Stream LLM responses for better UX


Testing Strategy

Test with complete vs. incomplete property data
Test all style variations (professional, casual, luxury, investment)
Test all output formats (MLS, website, social, flyer)
Verify organization isolation with cross-org test
Performance test with 100 concurrent requests
</thinking>




</instructions>
Business Context
Problem Statement:
Real estate agents spend 30-45 minutes crafting unique, compelling property descriptions for each listing. This manual process is time-consuming, inconsistent in quality, and often fails to incorporate SEO best practices. Agents need an AI-powered tool that generates professional, optimized descriptions in seconds while maintaining brand voice and highlighting unique selling propositions.
User Story:
As a real estate agent, I want to generate multiple versions of property descriptions optimized for different channels (MLS, website, social media) so that I can list properties faster, maintain consistent quality, and improve online visibility through SEO optimization.
Success Metrics:

Reduce description writing time from 30-45 min to <2 min
Increase listing SEO ranking by incorporating high-value local keywords
Generate 95%+ agent-approved descriptions (minimal editing needed)
Support 1000+ description generations per day per organization
Achieve 4.5+ star quality ratings from agents

Integration Context:
This workflow integrates with:

Property Database (Supabase): Fetches property details, photos, features, neighborhood data
MLS Integration: Provides comparable listings and market data for context
SEO Keyword Research: Google Keyword Planner API or similar for local keyword data
Content Management: Stores generated descriptions with versioning and A/B test tracking
Frontend Dashboard: Agents select style, review, edit, and publish descriptions

Prerequisites & Dependencies
Required Workflows:

None (this is a foundational workflow)

Required Database Schema:
sql-- Properties table (assumed to exist)
CREATE TABLE IF NOT EXISTS properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  mls_id VARCHAR(50),
  address TEXT NOT NULL,
  city VARCHAR(100),
  state VARCHAR(2),
  zip VARCHAR(10),
  property_type VARCHAR(50), -- single_family, condo, townhouse, multi_family, land
  bedrooms INTEGER,
  bathrooms DECIMAL(3,1),
  square_feet INTEGER,
  lot_size DECIMAL(10,2),
  year_built INTEGER,
  price DECIMAL(12,2),
  description TEXT, -- Current description if exists
  features JSONB, -- {parking, pool, fireplace, etc}
  photos_urls TEXT[], -- Array of photo URLs
  neighborhood_info JSONB, -- Schools, amenities, demographics
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_properties_org ON properties(organization_id);
CREATE INDEX idx_properties_mls ON properties(mls_id);
CREATE INDEX idx_properties_location ON properties(city, state, zip);

-- New table for generated descriptions
CREATE TABLE IF NOT EXISTS property_descriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  property_id UUID NOT NULL REFERENCES properties(id),
  user_id UUID REFERENCES users(id),
  
  -- Content
  style VARCHAR(50) NOT NULL, -- professional, casual, luxury, investment
  channel VARCHAR(50) NOT NULL, -- mls, website, social, flyer
  description_text TEXT NOT NULL,
  seo_keywords TEXT[], -- Keywords incorporated
  readability_score INTEGER, -- Flesch reading ease
  character_count INTEGER,
  word_count INTEGER,
  
  -- Metadata
  generation_time_ms INTEGER,
  llm_model VARCHAR(100),
  prompt_version VARCHAR(20),
  is_published BOOLEAN DEFAULT FALSE,
  agent_edited BOOLEAN DEFAULT FALSE,
  agent_rating INTEGER, -- 1-5 stars
  
  -- Versioning
  version INTEGER DEFAULT 1,
  parent_version_id UUID REFERENCES property_descriptions(id),
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_descriptions_org ON property_descriptions(organization_id);
CREATE INDEX idx_descriptions_property ON property_descriptions(property_id);
CREATE INDEX idx_descriptions_published ON property_descriptions(is_published);

-- SEO Keywords cache
CREATE TABLE IF NOT EXISTS seo_keywords (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location VARCHAR(200) NOT NULL, -- "Austin, TX" or "78701"
  property_type VARCHAR(50),
  
  keywords JSONB NOT NULL, -- [{keyword, volume, competition, cpc}]
  
  cached_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP,
  
  UNIQUE(location, property_type)
);

CREATE INDEX idx_seo_location ON seo_keywords(location, property_type);

-- Social media content
CREATE TABLE IF NOT EXISTS social_media_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  description_id UUID REFERENCES property_descriptions(id),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  
  platform VARCHAR(50), -- facebook, instagram, linkedin, twitter
  post_text TEXT,
  hashtags TEXT[],
  character_count INTEGER,
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE property_descriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_keywords ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_media_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY org_isolation_descriptions ON property_descriptions
  FOR ALL USING (organization_id IN (
    SELECT organization_id FROM user_organizations WHERE user_id = auth.uid()
  ));

CREATE POLICY org_isolation_social ON social_media_content
  FOR ALL USING (organization_id IN (
    SELECT organization_id FROM user_organizations WHERE user_id = auth.uid()
  ));
Required API Access:

Claude API (Anthropic): claude-sonnet-4-5 model for description generation

Authentication: API Key
Rate limits: 4000 requests/min, 400,000 tokens/min
Pricing: $3/million input tokens, $15/million output tokens


Google Keyword Planner API (Optional but recommended):

Authentication: OAuth 2.0
Rate limits: 15,000 requests/day
Purpose: Real SEO keyword research



Required N8n Credentials:

anthropic_api_key: Anthropic Claude API key
supabase_api: Supabase project URL and anon/service key
google_ads_oauth (optional): For keyword research

Required Environment Variables:
bashANTHROPIC_API_KEY=sk-ant-...
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_KEY=eyJhbG...
GOOGLE_ADS_DEVELOPER_TOKEN=xxx (optional)
DEFAULT_DESCRIPTION_STYLE=professional
MAX_DESCRIPTION_LENGTH_MLS=1000
MAX_DESCRIPTION_LENGTH_WEBSITE=2000
ENABLE_SEO_KEYWORDS=true
Technical Architecture
Workflow Overview
┌─────────────────────┐
│  Webhook Trigger    │
│  POST /api/generate-│
│  listing-description│
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Validate Input     │────► [Invalid] ────► Return 400 Error
│  + Org Auth Check   │
└──────────┬──────────┘
           │ [Valid]
           ▼
┌─────────────────────┐
│  Fetch Property     │
│  Data from Supabase │────► [Not Found] ──► Return 404 Error
└──────────┬──────────┘
           │ [Found]
           ▼
┌─────────────────────┐
│  Check Description  │
│  Cache (optional)   │────► [Cache Hit] ───► Return Cached + Log
└──────────┬──────────┘
           │ [Cache Miss]
           ▼
┌─────────────────────┐
│  Fetch SEO Keywords │
│  (Google/Cache)     │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Fetch Comparable   │
│  Listings (context) │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Build LLM Prompt   │
│  (Style-specific)   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Call Claude API    │
│  Generate Content   │────► [LLM Error] ───► Retry 3x → Fallback
└──────────┬──────────┘
           │ [Success]
           ▼
┌─────────────────────┐
│  Parse & Validate   │
│  LLM Response       │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Generate Social    │
│  Media Variants     │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Store in Database  │
│  (with versioning)  │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Log Execution      │
│  Metrics            │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Return Response    │
│  (All Variants)     │
└─────────────────────┘

[All nodes] ────► Error Handler ────► Log & Alert ────► Return Error Response
Complete Node Structure
Node 1: Webhook Trigger
json{
  "id": "webhook_trigger",
  "type": "n8n-nodes-base.webhook",
  "typeVersion": 1,
  "position": [250, 300],
  "parameters": {
    "httpMethod": "POST",
    "path": "/api/generate-listing-description",
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
  "user_id": "uuid - Required - ID of user making request",
  "organization_id": "uuid - Required - Organization context",
  "property_id": "uuid - Required - Property to generate description for",
  "style": "string - Optional - Default: 'professional' - Options: professional|casual|luxury|investment",
  "channels": "array - Optional - Default: ['mls','website'] - Options: mls|website|social|flyer",
  "seo_enabled": "boolean - Optional - Default: true - Include SEO keywords",
  "regenerate": "boolean - Optional - Default: false - Force regeneration even if cached",
  "options": {
    "max_length": "integer - Optional - Override default max length",
    "tone": "string - Optional - Additional tone guidance (enthusiastic, formal, etc)",
    "highlight_features": "array - Optional - Specific features to emphasize"
  }
}
Example Valid Request:
json{
  "user_id": "123e4567-e89b-12d3-a456-426614174000",
  "organization_id": "org-123",
  "property_id": "prop-456",
  "style": "luxury",
  "channels": ["mls", "website", "social"],
  "seo_enabled": true,
  "options": {
    "highlight_features": ["pool", "smart_home", "view"]
  }
}
Node 2: Input Validation & Organization Check
json{
  "id": "validate_and_authorize",
  "type": "n8n-nodes-base.function",
  "typeVersion": 1,
  "position": [450, 300],
  "parameters": {
    "functionCode": "// See complete code below"
  }
}
Complete Function Code:
javascript// ============================================
// INPUT VALIDATION & ORGANIZATION AUTHORIZATION
// ============================================

const startTime = Date.now();

// 1. EXTRACT INPUT DATA
const input = $input.first().json;
const { 
  user_id, 
  organization_id, 
  property_id,
  style = 'professional',
  channels = ['mls', 'website'],
  seo_enabled = true,
  regenerate = false,
  options = {}
} = input;

// 2. VALIDATE REQUIRED FIELDS
const validationErrors = [];

if (!user_id || typeof user_id !== 'string') {
  validationErrors.push('user_id is required and must be a string');
}

if (!organization_id || typeof organization_id !== 'string') {
  validationErrors.push('organization_id is required and must be a string');
}

if (!property_id || typeof property_id !== 'string') {
  validationErrors.push('property_id is required and must be a string');
}

// 3. VALIDATE ENUM VALUES
const validStyles = ['professional', 'casual', 'luxury', 'investment'];
if (!validStyles.includes(style)) {
  validationErrors.push(`style must be one of: ${validStyles.join(', ')}`);
}

const validChannels = ['mls', 'website', 'social', 'flyer'];
if (!Array.isArray(channels) || channels.length === 0) {
  validationErrors.push('channels must be a non-empty array');
} else {
  const invalidChannels = channels.filter(c => !validChannels.includes(c));
  if (invalidChannels.length > 0) {
    validationErrors.push(`Invalid channels: ${invalidChannels.join(', ')}. Valid: ${validChannels.join(', ')}`);
  }
}

// 4. VALIDATE OPTIONS
if (options.max_length && (typeof options.max_length !== 'number' || options.max_length < 100 || options.max_length > 5000)) {
  validationErrors.push('options.max_length must be a number between 100 and 5000');
}

if (options.highlight_features && !Array.isArray(options.highlight_features)) {
  validationErrors.push('options.highlight_features must be an array');
}

// If validation fails, return error
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

// 5. STRUCTURE VALIDATED OUTPUT
const validatedInput = {
  user_id,
  organization_id,
  property_id,
  style,
  channels,
  seo_enabled,
  regenerate,
  options: {
    max_length: options.max_length || (channels.includes('mls') ? 1000 : 2000),
    tone: options.tone || null,
    highlight_features: options.highlight_features || []
  },
  _metadata: {
    validated_at: new Date().toISOString(),
    validation_time_ms: Date.now() - startTime,
    workflow_execution_id: $execution.id
  }
};

return {
  json: validatedInput
};
Node 3: Supabase - Verify Organization Access & Fetch Property
json{
  "id": "fetch_property_and_verify_org",
  "type": "n8n-nodes-base.function",
  "typeVersion": 1,
  "position": [650, 300],
  "parameters": {
    "functionCode": "// See complete code below"
  }
}
Complete Function Code:
javascript// ============================================
// VERIFY ORG ACCESS & FETCH PROPERTY DATA
// ============================================

const input = $input.first().json;
const { user_id, organization_id, property_id } = input;

// This would typically use the Supabase node, but for demonstration
// we'll structure the queries that should be made

// Query 1: Verify user has access to organization
const orgAccessQuery = {
  table: 'user_organizations',
  select: 'role, permissions',
  filters: {
    user_id: user_id,
    organization_id: organization_id
  }
};

// Query 2: Fetch property data with organization check
const propertyQuery = {
  table: 'properties',
  select: `
    id,
    organization_id,
    mls_id,
    address,
    city,
    state,
    zip,
    property_type,
    bedrooms,
    bathrooms,
    square_feet,
    lot_size,
    year_built,
    price,
    description,
    features,
    photos_urls,
    neighborhood_info
  `,
  filters: {
    id: property_id,
    organization_id: organization_id
  },
  single: true
};

// In actual implementation, these would be executed via Supabase nodes
// For now, we'll pass the query structure to the next node

return {
  json: {
    ...input,
    _queries: {
      org_access: orgAccessQuery,
      property: propertyQuery
    }
  }
};
Node 4: Supabase Query - Execute Property Fetch
json{
  "id": "supabase_fetch_property",
  "type": "@n8n/n8n-nodes-langchain.supabaseVectorStore",
  "typeVersion": 1,
  "position": [850, 300],
  "parameters": {
    "operation": "select",
    "table": "properties",
    "select": "*",
    "filterByFields": {
      "fields": [
        {
          "fieldName": "id",
          "fieldValue": "={{ $json.property_id }}"
        },
        {
          "fieldName": "organization_id",
          "fieldValue": "={{ $json.organization_id }}"
        }
      ]
    },
    "limit": 1
  },
  "credentials": {
    "supabaseApi": {
      "id": "supabase_main",
      "name": "Supabase API"
    }
  }
}
Node 5: Check Property Exists & Merge Data
json{
  "id": "check_property_exists",
  "type": "n8n-nodes-base.function",
  "typeVersion": 1,
  "position": [1050, 300],
  "parameters": {
    "functionCode": "// See complete code below"
  }
}
Complete Function Code:
javascript// ============================================
// CHECK PROPERTY EXISTS & MERGE DATA
// ============================================

const input = $input.first().json;
const supabaseResult = input; // Data from Supabase node

// Check if property was found
if (!supabaseResult || !supabaseResult.id) {
  return {
    json: {
      success: false,
      error: 'Property not found',
      message: `No property found with id ${input.property_id} for organization ${input.organization_id}`,
      code: 404
    }
  };
}

// Extract property data
const property = {
  id: supabaseResult.id,
  mls_id: supabaseResult.mls_id,
  address: supabaseResult.address,
  city: supabaseResult.city,
  state: supabaseResult.state,
  zip: supabaseResult.zip,
  property_type: supabaseResult.property_type,
  bedrooms: supabaseResult.bedrooms,
  bathrooms: supabaseResult.bathrooms,
  square_feet: supabaseResult.square_feet,
  lot_size: supabaseResult.lot_size,
  year_built: supabaseResult.year_built,
  price: supabaseResult.price,
  existing_description: supabaseResult.description,
  features: supabaseResult.features || {},
  photos_urls: supabaseResult.photos_urls || [],
  neighborhood_info: supabaseResult.neighborhood_info || {}
};

// Calculate some derived attributes for better descriptions
const derived = {
  price_formatted: new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0
  }).format(property.price),
  price_per_sqft: property.square_feet ? 
    Math.round(property.price / property.square_feet) : null,
  age_years: new Date().getFullYear() - property.year_built,
  full_address: `${property.address}, ${property.city}, ${property.state} ${property.zip}`
};

// Merge everything together
return {
  json: {
    ...input, // Original input
    property: {
      ...property,
      ...derived
    },
    _processing: {
      property_fetched_at: new Date().toISOString()
    }
  }
};
Node 6: Fetch SEO Keywords (with caching)
json{
  "id": "fetch_seo_keywords",
  "type": "n8n-nodes-base.function",
  "typeVersion": 1,
  "position": [1250, 300],
  "parameters": {
    "functionCode": "// See complete code below"
  }
}
Complete Function Code:
javascript// ============================================
// FETCH SEO KEYWORDS (WITH CACHING)
// ============================================

const input = $input.first().json;
const { property, seo_enabled } = input;

// Skip if SEO not enabled
if (!seo_enabled) {
  return {
    json: {
      ...input,
      seo_keywords: [],
      _processing: {
        ...input._processing,
        seo_skipped: true
      }
    }
  };
}

// Build location key for cache lookup
const locationKey = `${property.city}, ${property.state}`;
const propertyType = property.property_type;

// In production, this would:
// 1. Check seo_keywords table for cached keywords (expires_at > NOW())
// 2. If cache miss, call Google Keyword Planner API
// 3. Store in cache with 1 hour TTL

// For this implementation, we'll provide the structure
const seoKeywordQuery = {
  table: 'seo_keywords',
  select: 'keywords',
  filters: {
    location: locationKey,
    property_type: propertyType
  },
  where: 'expires_at > NOW()',
  single: true
};

// Example of what keyword data looks like
const exampleKeywords = [
  { keyword: `homes for sale ${property.city}`, volume: 12000, competition: 0.8, cpc: 4.50 },
  { keyword: `${property.city} real estate`, volume: 8500, competition: 0.7, cpc: 3.20 },
  { keyword: `${property.property_type} ${property.city}`, volume: 3200, competition: 0.6, cpc: 2.80 },
  { keyword: `${property.zip} homes`, volume: 1500, competition: 0.5, cpc: 2.10 },
  { keyword: `${property.city} ${property.bedrooms} bedroom`, volume: 980, competition: 0.4, cpc: 1.90 }
];

// In actual implementation, we'd use the query above
// For now, we'll use example data and mark for cache lookup
return {
  json: {
    ...input,
    seo_keywords: exampleKeywords,
    _processing: {
      ...input._processing,
      seo_keywords_source: 'example', // Would be 'cache' or 'api'
      seo_keywords_fetched_at: new Date().toISOString()
    },
    _seo_query: seoKeywordQuery
  }
};
Node 7: Fetch Comparable Listings
json{
  "id": "fetch_comparables",
  "type": "n8n-nodes-base.function",
  "typeVersion": 1,
  "position": [1450, 300],
  "parameters": {
    "functionCode": "// See complete code below"
  }
}
Complete Function Code:
javascript// ============================================
// FETCH COMPARABLE LISTINGS FOR CONTEXT
// ============================================

const input = $input.first().json;
const { property, organization_id } = input;

// Build comparable search criteria
// - Same property type
// - Within 20% price range
// - Within 5 miles (approximate with lat/lng if available)
// - Sold or active in last 6 months
// - Max 5 comparables

const priceLower = property.price * 0.8;
const priceUpper = property.price * 1.2;

const comparableQuery = {
  table: 'properties',
  select: `
    address,
    city,
    bedrooms,
    bathrooms,
    square_feet,
    price,
    features,
    year_built
  `,
  filters: {
    organization_id: organization_id,
    property_type: property.property_type,
    city: property.city, // Simple proximity filter
    price: { gte: priceLower, lte: priceUpper },
    id: { neq: property.id } // Exclude current property
  },
  limit: 5,
  order: { created_at: 'desc' }
};

// Example comparable data structure
const exampleComparables = [
  {
    address: '456 Oak St',
    city: property.city,
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms + 0.5,
    square_feet: property.square_feet + 200,
    price: property.price * 1.05,
    year_built: property.year_built + 2,
    features: { pool: true, garage: 2 }
  },
  {
    address: '789 Maple Ave',
    city: property.city,
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    square_feet: property.square_feet - 150,
    price: property.price * 0.95,
    year_built: property.year_built - 1,
    features: { updated_kitchen: true, hardwood: true }
  }
];

return {
  json: {
    ...input,
    comparables: exampleComparables,
    _processing: {
      ...input._processing,
      comparables_count: exampleComparables.length,
      comparables_fetched_at: new Date().toISOString()
    },
    _comparable_query: comparableQuery
  }
};
Node 8: Build LLM Prompt (Style-Specific)
json{
  "id": "build_llm_prompt",
  "type": "n8n-nodes-base.function",
  "typeVersion": 1,
  "position": [1650, 300],
  "parameters": {
    "functionCode": "// See complete code below"
  }
}
Complete Function Code:
javascript// ============================================
// BUILD LLM PROMPT (STYLE-SPECIFIC)
// ============================================

const input = $input.first().json;
const { property, style, channels, seo_keywords, comparables, options } = input;

// ============================================
// SYSTEM PROMPTS BY STYLE
// ============================================

const systemPrompts = {
  professional: `You are an expert real estate copywriter specializing in professional property descriptions. Write clear, factual, and persuasive descriptions that highlight key features and value propositions. Use industry-standard terminology and maintain a trustworthy, authoritative tone.`,
  
  casual: `You are a friendly real estate writer who creates warm, conversational property descriptions. Write in an approachable, relatable style that helps buyers envision themselves living in the home. Use natural language and paint a lifestyle picture, not just facts.`,
  
  luxury: `You are a luxury real estate writer crafting sophisticated property descriptions for high-end listings. Emphasize exclusivity, premium features, and aspirational lifestyle. Use elegant language, highlight unique architectural details, and create a sense of prestige.`,
  
  investment: `You are a real estate investment analyst writing property descriptions for investors. Focus on financial metrics, cash flow potential, appreciation prospects, and ROI factors. Use data-driven language and emphasize investment value.`
};

// ============================================
// BUILD FEATURE LIST
// ============================================

const features = [];

if (property.bedrooms) features.push(`${property.bedrooms} bedrooms`);
if (property.bathrooms) features.push(`${property.bathrooms} bathrooms`);
if (property.square_feet) features.push(`${property.square_feet.toLocaleString()} sq ft`);
if (property.lot_size) features.push(`${property.lot_size.toLocaleString()} sq ft lot`);
if (property.year_built) features.push(`Built in ${property.year_built}`);

// Add special features from JSONB field
const specialFeatures = Object.entries(property.features || {})
  .filter(([key, value]) => value === true)
  .map(([key]) => key.replace(/_/g, ' '))
  .join(', ');

if (specialFeatures) {
  features.push(specialFeatures);
}

// ============================================
// BUILD SEO KEYWORD STRING
// ============================================

const topKeywords = seo_keywords
  .slice(0, 5)
  .map(k => k.keyword)
  .join(', ');

// ============================================
// BUILD COMPARABLE CONTEXT
// ============================================

const comparableContext = comparables.length > 0 ? 
  `\n\nComparable Properties in Area:\n${comparables.map((c, i) => 
    `${i + 1}. ${c.address}: ${c.bedrooms}br/${c.bathrooms}ba, ${c.square_feet}sqft, $${c.price.toLocaleString()}`
  ).join('\n')}` : '';

// ============================================
// BUILD NEIGHBORHOOD CONTEXT
// ============================================

const neighborhoodContext = property.neighborhood_info ? 
  `\n\nNeighborhood Information:\n${JSON.stringify(property.neighborhood_info, null, 2)}` : '';

// ============================================
// CHANNEL-SPECIFIC REQUIREMENTS
// ============================================

const channelRequirements = {
  mls: {
    max_length: 1000,
    requirements: 'MLS-compliant, factual, no superlatives, include all key features',
    format: 'Single paragraph, no formatting'
  },
  website: {
    max_length: 2000,
    requirements: 'Engaging, SEO-optimized, can include lifestyle elements',
    format: 'Multiple paragraphs with natural flow'
  },
  social: {
    max_length: 280,
    requirements: 'Attention-grabbing, emoji-friendly, include call-to-action',
    format: 'Short, punchy, shareable'
  },
  flyer: {
    max_length: 500,
    requirements: 'Highlight-focused, scannable bullet points',
    format: 'Brief paragraphs or bullet points'
  }
};

// Get requirements for primary channel
const primaryChannel = channels[0];
const channelReq = channelRequirements[primaryChannel];

// ============================================
// ASSEMBLE FULL PROMPT
// ============================================

const userPrompt = `Generate a compelling ${style} property description for this listing:

PROPERTY DETAILS:
- Address: ${property.full_address}
- Type: ${property.property_type}
- Price: ${property.price_formatted}
- Features: ${features.join(', ')}
${property.price_per_sqft ? `- Price per sq ft: $${property.price_per_sqft}` : ''}
${property.age_years ? `- Age: ${property.age_years} years old` : ''}
${comparableContext}
${neighborhoodContext}

WRITING REQUIREMENTS:
- Style: ${style}
- Primary channel: ${primaryChannel}
- Max length: ${options.max_length || channelReq.max_length} characters
- ${channelReq.requirements}
- Format: ${channelReq.format}

SEO KEYWORDS TO NATURALLY INCORPORATE:
${topKeywords}

${options.highlight_features && options.highlight_features.length > 0 ? 
  `FEATURES TO EMPHASIZE:\n- ${options.highlight_features.join('\n- ')}` : ''}

${options.tone ? `ADDITIONAL TONE GUIDANCE: ${options.tone}` : ''}

OUTPUT FORMAT:
Return a JSON object with this structure:
{
  "description": "The main property description text",
  "highlights": ["Key highlight 1", "Key highlight 2", "Key highlight 3"],
  "call_to_action": "Compelling CTA text",
  "readability_score": <estimated Flesch reading ease score>,
  "seo_keywords_used": ["keyword1", "keyword2"]
}

Generate the description now:`;

// ============================================
// RETURN PROMPT STRUCTURE
// ============================================

return {
  json: {
    ...input,
    llm_prompt: {
      system: systemPrompts[style],
      user: userPrompt,
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 2000,
      temperature: 0.7
    },
    _processing: {
      ...input._processing,
      prompt_built_at: new Date().toISOString(),
      prompt_character_count: userPrompt.length
    }
  }
};
Node 9: Call Claude API
json{
  "id": "call_claude_api",
  "type": "n8n-nodes-base.httpRequest",
  "typeVersion": 3,
  "position": [1850, 300],
  "parameters": {
    "method": "POST",
    "url": "https://api.anthropic.com/v1/messages",
    "authentication": "predefinedCredentialType",
    "nodeCredentialType": "anthropicApi",
    "sendHeaders": true,
    "headerParameters": {
      "parameters": [
        {
          "name": "anthropic-version",
          "value": "2023-06-01"
        },
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
          "name": "model",
          "value": "={{ $json.llm_prompt.model }}"
        },
        {
          "name": "max_tokens",
          "value": "={{ $json.llm_prompt.max_tokens }}"
        },
        {
          "name": "temperature",
          "value": "={{ $json.llm_prompt.temperature }}"
        },
        {
          "name": "system",
          "value": "={{ $json.llm_prompt.system }}"
        },
        {
          "name": "messages",
          "value": "={{ [{role: 'user', content: $json.llm_prompt.user}] }}"
        }
      ]
    },
    "options": {
      "timeout": 60000,
      "retry": {
        "maxRetries": 3,
        "retryDelay": 2000
      }
    }
  },
  "credentials": {
    "anthropicApi": {
      "id": "anthropic_api_key",
      "name": "Anthropic API"
    }
  }
}
Node 10: Parse & Validate LLM Response
json{
  "id": "parse_llm_response",
  "type": "n8n-nodes-base.function",
  "typeVersion": 1,
  "position": [2050, 300],
  "parameters": {
    "functionCode": "// See complete code below"
  }
}
Complete Function Code:
javascript// ============================================
// PARSE & VALIDATE LLM RESPONSE
// ============================================

const input = $input.first().json;
const claudeResponse = input;

// Extract the text content from Claude's response
const responseText = claudeResponse.content?.[0]?.text;

if (!responseText) {
  throw new Error('Invalid Claude API response: no text content found');
}

// Try to parse as JSON
let parsedContent;
try {
  // Claude sometimes wraps JSON in markdown code blocks, so clean it
  const cleanedJson = responseText
    .replace(/```json\n?/g, '')
    .replace(/```\n?/g, '')
    .trim();
  
  parsedContent = JSON.parse(cleanedJson);
} catch (error) {
  // If JSON parsing fails, treat entire response as description
  console.warn('Could not parse LLM response as JSON, using raw text');
  parsedContent = {
    description: responseText,
    highlights: [],
    call_to_action: 'Contact us to schedule a showing!',
    readability_score: null,
    seo_keywords_used: []
  };
}

// Validate required fields
if (!parsedContent.description || parsedContent.description.length < 100) {
  throw new Error('Generated description is too short or missing');
}

// Calculate actual metrics
const wordCount = parsedContent.description.split(/\s+/).length;
const characterCount = parsedContent.description.length;
const sentenceCount = parsedContent.description.split(/[.!?]+/).length;

// Simple readability score calculation (Flesch Reading Ease approximation)
// Score = 206.835 - 1.015 * (words/sentences) - 84.6 * (syllables/words)
// Simplified: higher = easier to read
const avgWordsPerSentence = wordCount / sentenceCount;
const readabilityScore = parsedContent.readability_score || 
  Math.round(Math.max(0, Math.min(100, 100 - avgWordsPerSentence * 2)));

// Get original input data that we need to preserve
const originalInput = $('validate_and_authorize').first().json;

return {
  json: {
    ...originalInput,
    property: input.property,
    generated_content: {
      description: parsedContent.description,
      highlights: parsedContent.highlights || [],
      call_to_action: parsedContent.call_to_action || 'Schedule your showing today!',
      seo_keywords_used: parsedContent.seo_keywords_used || [],
      metrics: {
        character_count: characterCount,
        word_count: wordCount,
        sentence_count: sentenceCount,
        readability_score: readabilityScore
      }
    },
    _processing: {
      ...input._processing,
      llm_response_parsed_at: new Date().toISOString(),
      llm_tokens_used: claudeResponse.usage?.total_tokens || 0
    }
  }
};
Node 11: Generate Social Media Variants
json{
  "id": "generate_social_variants",
  "type": "n8n-nodes-base.function",
  "typeVersion": 1,
  "position": [2250, 300],
  "parameters": {
    "functionCode": "// See complete code below"
  }
}
Complete Function Code:
javascript// ============================================
// GENERATE SOCIAL MEDIA VARIANTS
// ============================================

const input = $input.first().json;
const { generated_content, property, channels } = input;

// Only generate social variants if 'social' channel was requested
if (!channels.includes('social')) {
  return {
    json: {
      ...input,
      social_variants: null
    }
  };
}

// Extract key info for social posts
const { price_formatted, bedrooms, bathrooms, city, address } = property;
const mainHighlight = generated_content.highlights[0] || 'Beautiful property';

// ============================================
// PLATFORM-SPECIFIC VARIANTS
// ============================================

const socialVariants = {
  facebook: {
    post_text: `🏡 NEW LISTING ALERT! ${mainHighlight}\n\n${bedrooms}BR | ${bathrooms}BA | ${price_formatted}\n${address}, ${city}\n\n${generated_content.description.substring(0, 200)}...\n\n${generated_content.call_to_action}\n\n#RealEstate #${city.replace(/\s+/g, '')}Homes #NewListing`,
    character_count: 0, // Will calculate below
    hashtags: ['RealEstate', `${city.replace(/\s+/g, '')}Homes`, 'NewListing', 'ForSale']
  },
  
  instagram: {
    post_text: `${mainHighlight} ✨\n\n📍 ${address}\n💰 ${price_formatted}\n🛏️ ${bedrooms}BR | 🛁 ${bathrooms}BA\n\n${generated_content.description.substring(0, 150)}...\n\nLink in bio! 👆`,
    character_count: 0,
    hashtags: [
      'RealEstate',
      'HouseHunting',
      `${city.replace(/\s+/g, '')}RealEstate`,
      'DreamHome',
      'ForSale',
      'NewListing',
      'RealEstateAgent',
      'PropertyForSale'
    ]
  },
  
  twitter: {
    post_text: `🏡 NEW: ${bedrooms}BR/${bathrooms}BA ${property.property_type} in ${city}\n💰 ${price_formatted}\n\n${mainHighlight}\n\n${generated_content.call_to_action}`,
    character_count: 0,
    hashtags: ['RealEstate', `${city}Homes`, 'ForSale']
  },
  
  linkedin: {
    post_text: `I'm excited to share this exceptional ${property.property_type} listing in ${city}.\n\nProperty Highlights:\n• ${bedrooms} Bedrooms, ${bathrooms} Bathrooms\n• ${property.square_feet?.toLocaleString()} sq ft\n• Listed at ${price_formatted}\n\n${generated_content.description.substring(0, 300)}...\n\n${generated_content.highlights.slice(0, 3).map((h, i) => `${i + 1}. ${h}`).join('\n')}\n\nInterested buyers can reach out directly. #RealEstate #${city.replace(/\s+/g, '')}`,
    character_count: 0,
    hashtags: ['RealEstate', 'PropertyListing', city.replace(/\s+/g, '')]
  }
};

// Calculate character counts
Object.keys(socialVariants).forEach(platform => {
  socialVariants[platform].character_count = socialVariants[platform].post_text.length;
});

return {
  json: {
    ...input,
    social_variants: socialVariants,
    _processing: {
      ...input._processing,
      social_variants_generated_at: new Date().toISOString()
    }
  }
};
Node 12: Store in Database (Multiple Inserts)
json{
  "id": "store_descriptions",
  "type": "n8n-nodes-base.function",
  "typeVersion": 1,
  "position": [2450, 300],
  "parameters": {
    "functionCode": "// See complete code below"
  }
}
Complete Function Code:
javascript// ============================================
// STORE DESCRIPTIONS IN DATABASE
// ============================================

const input = $input.first().json;
const { 
  user_id, 
  organization_id, 
  property_id, 
  style, 
  channels,
  generated_content,
  social_variants,
  _processing
} = input;

// Calculate total generation time
const generationTimeMs = Date.now() - new Date(input._metadata.validated_at).getTime();

// ============================================
// PREPARE DESCRIPTION RECORDS
// ============================================

const descriptionRecords = [];

// Create a record for each requested channel
channels.forEach(channel => {
  let descriptionText = generated_content.description;
  let characterCount = generated_content.metrics.character_count;
  
  // For social channel, use platform-specific variant
  if (channel === 'social' && social_variants) {
    // Use Facebook variant as primary social description
    descriptionText = social_variants.facebook.post_text;
    characterCount = social_variants.facebook.character_count;
  }
  
  descriptionRecords.push({
    organization_id,
    property_id,
    user_id,
    style,
    channel,
    description_text: descriptionText,
    seo_keywords: generated_content.seo_keywords_used,
    readability_score: generated_content.metrics.readability_score,
    character_count: characterCount,
    word_count: generated_content.metrics.word_count,
    generation_time_ms: generationTimeMs,
    llm_model: 'claude-sonnet-4-5',
    prompt_version: 'v1.0',
    is_published: false,
    agent_edited: false,
    agent_rating: null,
    version: 1,
    parent_version_id: null
  });
});

// ============================================
// PREPARE SOCIAL MEDIA RECORDS
// ============================================

const socialRecords = [];

if (social_variants) {
  Object.entries(social_variants).forEach(([platform, content]) => {
    socialRecords.push({
      // description_id will be set after descriptions are inserted
      description_id: null, // Placeholder
      organization_id,
      platform,
      post_text: content.post_text,
      hashtags: content.hashtags,
      character_count: content.character_count
    });
  });
}

// In actual implementation, these would be inserted via Supabase nodes
// For now, we'll structure the insert operations

const insertOperations = {
  descriptions: {
    table: 'property_descriptions',
    records: descriptionRecords
  },
  social_content: {
    table: 'social_media_content',
    records: socialRecords
  }
};

return {
  json: {
    ...input,
    _database_operations: insertOperations,
    _processing: {
      ...input._processing,
      descriptions_prepared: descriptionRecords.length,
      social_records_prepared: socialRecords.length,
      ready_for_storage: true
    }
  }
};
Node 13: Supabase Insert - Descriptions
json{
  "id": "supabase_insert_descriptions",
  "type": "@n8n/n8n-nodes-langchain.supabaseVectorStore",
  "typeVersion": 1,
  "position": [2650, 300],
  "parameters": {
    "operation": "insert",
    "table": "property_descriptions",
    "data": {
      "fields": "={{ $json._database_operations.descriptions.records }}"
    }
  },
  "credentials": {
    "supabaseApi": {
      "id": "supabase_main",
      "name": "Supabase API"
    }
  }
}
Node 14: Log Execution Metrics
json{
  "id": "log_execution",
  "type": "@n8n/n8n-nodes-langchain.supabaseVectorStore",
  "typeVersion": 1,
  "position": [2850, 300],
  "parameters": {
    "operation": "insert",
    "table": "workflow_executions",
    "data": {
      "fields": [
        {
          "fieldName": "workflow_name",
          "fieldValue": "listing-description-generator-v1"
        },
        {
          "fieldName": "execution_id",
          "fieldValue": "={{ $execution.id }}"
        },
        {
          "fieldName": "organization_id",
          "fieldValue": "={{ $json.organization_id }}"
        },
        {
          "fieldName": "status",
          "fieldValue": "completed"
        },
        {
          "fieldName": "duration_ms",
          "fieldValue": "={{ Date.now() - new Date($json._metadata.validated_at).getTime() }}"
        },
        {
          "fieldName": "metadata",
          "fieldValue": "={{ JSON.stringify({ style: $json.style, channels: $json.channels, tokens_used: $json._processing.llm_tokens_used }) }}"
        }
      ]
    }
  }
}
Node 15: Format Final Response
json{
  "id": "format_response",
  "type": "n8n-nodes-base.function",
  "typeVersion": 1,
  "position": [3050, 300],
  "parameters": {
    "functionCode": "// See complete code below"
  }
}
Complete Function Code:
javascript// ============================================
// FORMAT FINAL RESPONSE
// ============================================

const input = $input.first().json;

// Get the inserted description IDs from Supabase response
const insertedDescriptions = input.insertedDescriptions || [];

// Build clean response object
const response = {
  success: true,
  data: {
    property_id: input.property_id,
    style: input.style,
    channels: input.channels,
    
    // Main generated content
    description: input.generated_content.description,
    highlights: input.generated_content.highlights,
    call_to_action: input.generated_content.call_to_action,
    
    // Social media variants if generated
    social_variants: input.social_variants || null,
    
    // Metrics
    metrics: {
      character_count: input.generated_content.metrics.character_count,
      word_count: input.generated_content.metrics.word_count,
      readability_score: input.generated_content.metrics.readability_score,
      seo_keywords_used: input.generated_content.seo_keywords_used
    },
    
    // Database references
    description_ids: insertedDescriptions.map(d => d.id),
    
    // Usage info for billing/limits
    tokens_used: input._processing.llm_tokens_used || 0,
    generation_time_ms: Date.now() - new Date(input._metadata.validated_at).getTime()
  },
  metadata: {
    organization_id: input.organization_id,
    generated_at: new Date().toISOString(),
    workflow_execution_id: input._metadata.workflow_execution_id,
    model_used: 'claude-sonnet-4-5'
  }
};

return { json: response };
Node 16: Webhook Response
json{
  "id": "webhook_response",
  "type": "n8n-nodes-base.respondToWebhook",
  "typeVersion": 1,
  "position": [3250, 300],
  "parameters": {
    "respondWith": "json",
    "responseBody": "={{ JSON.stringify($json) }}",
    "options": {
      "responseCode": 200,
      "responseHeaders": {
        "entries": [
          {
            "name": "Content-Type",
            "value": "application/json"
          },
          {
            "name": "X-Execution-ID",
            "value": "={{ $json.metadata.workflow_execution_id }}"
          },
          {
            "name": "X-Generation-Time-Ms",
            "value": "={{ $json.data.generation_time_ms }}"
          }
        ]
      }
    }
  }
}

Error Handling Nodes
Node 17: Error Handler
json{
  "id": "error_handler",
  "type": "n8n-nodes-base.errorTrigger",
  "typeVersion": 1,
  "position": [1650, 550],
  "parameters": {}
}
Node 18: Process Error
json{
  "id": "process_error",
  "type": "n8n-nodes-base.function",
  "typeVersion": 1,
  "position": [1850, 550],
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

// Categorize error type
let errorCategory = 'UNKNOWN_ERROR';
let shouldRetry = false;
let retryAfterMs = 0;
let alertLevel = 'warning';
let userMessage = 'An error occurred while generating the description';

// Claude API errors
if (error.message?.includes('rate limit') || error.code === 429) {
  errorCategory = 'RATE_LIMIT_ERROR';
  shouldRetry = true;
  retryAfterMs = 60000; // 1 minute
  alertLevel = 'info';
  userMessage = 'Rate limit reached. Please try again in a minute.';
} else if (error.message?.includes('timeout') || error.code === 'ETIMEDOUT') {
  errorCategory = 'TIMEOUT_ERROR';
  shouldRetry = true;
  retryAfterMs = 5000;
  alertLevel = 'warning';
  userMessage = 'Request timed out. Retrying...';
} else if (error.message?.includes('authentication') || error.code === 401) {
  errorCategory = 'AUTH_ERROR';
  shouldRetry = false;
  alertLevel = 'critical';
  userMessage = 'Authentication error. Please contact support.';
} else if (error.message?.includes('Invalid Claude API response')) {
  errorCategory = 'LLM_RESPONSE_ERROR';
  shouldRetry = true;
  retryAfterMs = 3000;
  alertLevel = 'error';
  userMessage = 'Failed to generate description. Retrying...';
} else if (error.message?.includes('Property not found')) {
  errorCategory = 'NOT_FOUND_ERROR';
  shouldRetry = false;
  alertLevel = 'info';
  userMessage = error.message;
} else if (error.message?.includes('Validation failed')) {
  errorCategory = 'VALIDATION_ERROR';
  shouldRetry = false;
  alertLevel = 'info';
  userMessage = error.message;
} else if (error.code >= 500) {
  errorCategory = 'SERVER_ERROR';
  shouldRetry = true;
  retryAfterMs = 10000;
  alertLevel = 'error';
  userMessage = 'Server error. Please try again.';
}

// Structure error log
const errorLog = {
  workflow_name: 'listing-description-generator-v1',
  execution_id: $execution.id,
  organization_id: originalInput.organization_id || 'unknown',
  error_category: errorCategory,
  error_message: error.message,
  error_stack: error.stack,
  error_code: error.code,
  should_retry: shouldRetry,
  retry_after_ms: retryAfterMs,
  alert_level: alertLevel,
  input_data: originalInput,
  timestamp: new Date().toISOString(),
  node_name: error.node?.name || 'unknown'
};

// Return structured error
return {
  json: {
    success: false,
    error: {
      category: errorCategory,
      message: userMessage,
      code: error.code || 'INTERNAL_ERROR',
      should_retry: shouldRetry,
      retry_after_ms: retryAfterMs,
      details: error.message
    },
    log: errorLog,
    alert_level: alertLevel
  }
};
Node 19: Log Error to Database
json{
  "id": "log_error_db",
  "type": "@n8n/n8n-nodes-langchain.supabaseVectorStore",
  "typeVersion": 1,
  "position": [2050, 550],
  "parameters": {
    "operation": "insert",
    "table": "workflow_errors",
    "data": {
      "fields": [
        {
          "fieldName": "workflow_name",
          "fieldValue": "={{ $json.log.workflow_name }}"
        },
        {
          "fieldName": "execution_id",
          "fieldValue": "={{ $json.log.execution_id }}"
        },
        {
          "fieldName": "organization_id",
          "fieldValue": "={{ $json.log.organization_id }}"
        },
        {
          "fieldName": "error_category",
          "fieldValue": "={{ $json.log.error_category }}"
        },
        {
          "fieldName": "error_message",
          "fieldValue": "={{ $json.log.error_message }}"
        },
        {
          "fieldName": "alert_level",
          "fieldValue": "={{ $json.alert_level }}"
        }
      ]
    }
  }
}
Node 20: Error Response
json{
  "id": "error_response",
  "type": "n8n-nodes-base.respondToWebhook",
  "typeVersion": 1,
  "position": [2250, 550],
  "parameters": {
    "respondWith": "json",
    "responseBody": "={{ JSON.stringify($json.error) }}",
    "options": {
      "responseCode": "={{ $json.error.code === 'NOT_FOUND_ERROR' ? 404 : ($json.error.code === 'VALIDATION_ERROR' ? 400 : ($json.error.code === 'RATE_LIMIT_ERROR' ? 429 : 500)) }}",
      "responseHeaders": {
        "entries": [
          {
            "name": "Content-Type",
            "value": "application/json"
          },
          {
            "name": "X-Error-Category",
            "value": "={{ $json.error.category }}"
          },
          {
            "name": "Retry-After",
            "value": "={{ $json.error.retry_after_ms / 1000 }}"
          }
        ]
      }
    }
  }
}

Testing & Validation
Test Data Sets
Test Case 1: Valid Request - Professional Style, MLS Channel
json{
  "name": "Valid professional description for MLS",
  "input": {
    "user_id": "user-123",
    "organization_id": "org-456",
    "property_id": "prop-789",
    "style": "professional",
    "channels": ["mls"],
    "seo_enabled": true
  },
  "expected_output": {
    "success": true,
    "data": {
      "description": "<string with 500-1000 characters>",
      "highlights": "<array of 3-5 key features>",
      "metrics": {
        "readability_score": ">60",
        "seo_keywords_used": "<array of 3-5 keywords>"
      }
    }
  },
  "expected_status_code": 200,
  "expected_response_time_ms": "<2000"
}
Test Case 2: Luxury Style, Multiple Channels
json{
  "name": "Luxury description for website and social",
  "input": {
    "user_id": "user-123",
    "organization_id": "org-456",
    "property_id": "prop-luxury-001",
    "style": "luxury",
    "channels": ["website", "social"],
    "seo_enabled": true,
    "options": {
      "highlight_features": ["pool", "ocean_view", "smart_home"]
    }
  },
  "expected_output": {
    "success": true,
    "data": {
      "description": "<elegant, sophisticated language>",
      "social_variants": {
        "facebook": "<post_text>",
        "instagram": "<post_text>",
        "twitter": "<post_text>",
        "linkedin": "<post_text>"
      }
    }
  },
  "expected_status_code": 200
}
Test Case 3: Missing Required Field
json{
  "name": "Missing organization_id",
  "input": {
    "user_id": "user-123",
    "property_id": "prop-789",
    "style": "professional"
  },
  "expected_output": {
    "success": false,
    "error": "Validation failed",
    "validation_errors": ["organization_id is required and must be a string"]
  },
  "expected_status_code": 400
}
Test Case 4: Invalid Style Value
json{
  "name": "Invalid style parameter",
  "input": {
    "user_id": "user-123",
    "organization_id": "org-456",
    "property_id": "prop-789",
    "style": "super_fancy",
    "channels": ["mls"]
  },
  "expected_output": {
    "success": false,
    "error": "Validation failed",
    "validation_errors": ["style must be one of: professional, casual, luxury, investment"]
  },
  "expected_status_code": 400
}
Test Case 5: Property Not Found
json{
  "name": "Non-existent property",
  "input": {
    "user_id": "user-123",
    "organization_id": "org-456",
    "property_id": "prop-nonexistent",
    "style": "professional",
    "channels": ["mls"]
  },
  "expected_output": {
    "success": false,
    "error": "Property not found",
    "code": 404
  },
  "expected_status_code": 404
}
Test Case 6: Unauthorized Organization Access
json{
  "name": "User doesn't belong to organization",
  "input": {
    "user_id": "user-123",
    "organization_id": "org-different",
    "property_id": "prop-789",
    "style": "professional",
    "channels": ["mls"]
  },
  "expected_output": {
    "success": false,
    "error": "Unauthorized"
  },
  "expected_status_code": 403
}
Test Case 7: Investment Style with Financial Focus
json{
  "name": "Investment-focused description",
  "input": {
    "user_id": "user-123",
    "organization_id": "org-456",
    "property_id": "prop-investment-001",
    "style": "investment",
    "channels": ["website"],
    "seo_enabled": true
  },
  "expected_output": {
    "success": true,
    "data": {
      "description": "<should mention ROI, cap rate, cash flow>",
      "highlights": "<investment-focused highlights>"
    }
  },
  "expected_status_code": 200
}
Test Case 8: All Channels Requested
json{
  "name": "Generate for all channel types",
  "input": {
    "user_id": "user-123",
    "organization_id": "org-456",
    "property_id": "prop-789",
    "style": "professional",
    "channels": ["mls", "website", "social", "flyer"],
    "seo_enabled": true
  },
  "expected_output": {
    "success": true,
    "data": {
      "description_ids": "<array with 4 IDs>",
      "social_variants": "<all 4 platforms>"
    }
  },
  "expected_status_code": 200
}
Test Case 9: SEO Disabled
json{
  "name": "Generate without SEO optimization",
  "input": {
    "user_id": "user-123",
    "organization_id": "org-456",
    "property_id": "prop-789",
    "style": "casual",
    "channels": ["website"],
    "seo_enabled": false
  },
  "expected_output": {
    "success": true,
    "data": {
      "metrics": {
        "seo_keywords_used": "[]"
      }
    }
  },
  "expected_status_code": 200
}
Test Case 10: Claude API Timeout (Simulated)
json{
  "name": "LLM request timeout",
  "mock_scenario": "claude_timeout",
  "input": {
    "user_id": "user-123",
    "organization_id": "org-456",
    "property_id": "prop-789",
    "style": "professional",
    "channels": ["mls"]
  },
  "expected_output": {
    "success": false,
    "error": {
      "category": "TIMEOUT_ERROR",
      "should_retry": true,
      "retry_after_ms": 5000
    }
  },
  "expected_status_code": 500
}

Testing Procedures
Step 1: Unit Testing (Individual Nodes)
bash# Test validation node
curl -X POST http://n8n.local/webhook-test/listing-description-generator \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer test_token_123" \
  -d '{
    "user_id": "user-123",
    "organization_id": "org-456",
    "property_id": "prop-789",
    "style": "professional",
    "channels": ["mls"]
  }'

# Expected: Validation passes, proceeds to next node
# Manual verification: Check N8n execution log for validated output
Step 2: Integration Testing (Full Workflow)
bash# Test complete workflow with valid data
curl -X POST https://your-n8n-instance.com/webhook/generate-listing-description \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d@test_case_1.json

# Verify:
# ✓ Response status code is 200
# ✓ Response contains 'description' field
# ✓ Response contains 'highlights' array
# ✓ Database record created in property_descriptions table
# ✓ workflow_executions table has entry
# ✓ Response time < 2 seconds
Step 3: Organization Isolation Testing
sql-- Setup: Create test data for two organizations
INSERT INTO organizations (id, name) VALUES
  ('org-test-1', 'Test Organization 1'),
  ('org-test-2', 'Test Organization 2');

INSERT INTO users (id, email) VALUES
  ('user-test-1', 'test1@example.com'),
  ('user-test-2', 'test2@example.com');

INSERT INTO user_organizations (user_id, organization_id, role) VALUES
  ('user-test-1', 'org-test-1', 'agent'),
  ('user-test-2', 'org-test-2', 'agent');

INSERT INTO properties (id, organization_id, address, city, state, price, bedrooms, bathrooms) VALUES
  ('prop-test-1', 'org-test-1', '123 Test St', 'Austin', 'TX', 500000, 3, 2),
  ('prop-test-2', 'org-test-2', '456 Demo Ave', 'Dallas', 'TX', 600000, 4, 3);
bash# Test 1: User 1 generates description for Org 1 property (should succeed)
curl -X POST http://n8n.local/webhook/generate-listing-description \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user-test-1",
    "organization_id": "org-test-1",
    "property_id": "prop-test-1",
    "style": "professional",
    "channels": ["mls"]
  }'
# Verify: Success, description generated

# Test 2: User 1 tries to generate for Org 2 property (should fail)
curl -X POST http://n8n.local/webhook/generate-listing-description \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user-test-1",
    "organization_id": "org-test-2",
    "property_id": "prop-test-2",
    "style": "professional",
    "channels": ["mls"]
  }'
# Verify: 403 Unauthorized error

# Test 3: User 1 with Org 1 tries to access Org 2 property
curl -X POST http://n8n.local/webhook/generate-listing-description \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user-test-1",
    "organization_id": "org-test-1",
    "property_id": "prop-test-2",
    "style": "professional",
    "channels": ["mls"]
  }'
# Verify: 404 Property not found (RLS prevents seeing other org's properties)
Step 4: Performance Testing
bash# Use Apache Bench for load testing
ab -n 100 -c 10 -p test_data.json -T application/json \
  https://your-n8n-instance.com/webhook/generate-listing-description

# Analyze results:
# - Mean response time should be < 2000ms
# - 95th percentile should be < 3000ms
# - 99th percentile should be < 5000ms
# - Error rate should be 0%
# - Check for memory leaks (monitor N8n process)
javascript// Performance monitoring query
SELECT 
  COUNT(*) as total_executions,
  AVG(duration_ms) as avg_duration_ms,
  PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY duration_ms) as p95_duration_ms,
  PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY duration_ms) as p99_duration_ms,
  SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END)::FLOAT / COUNT(*) * 100 as error_rate_pct
FROM workflow_executions
WHERE workflow_name = 'listing-description-generator-v1'
  AND created_at > NOW() - INTERVAL '1 hour';
Step 5: Error Handling Testing
bash# Test 1: Invalid style parameter
curl -X POST http://n8n.local/webhook/generate-listing-description \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user-123",
    "organization_id": "org-456",
    "property_id": "prop-789",
    "style": "invalid_style",
    "channels": ["mls"]
  }'
# Verify: 400 error, validation_errors array contains style error

# Test 2: Missing required field
curl -X POST http://n8n.local/webhook/generate-listing-description \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user-123",
    "property_id": "prop-789"
  }'
# Verify: 400 error, validation_errors mentions organization_id

# Test 3: Non-existent property
curl -X POST http://n8n.local/webhook/generate-listing-description \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user-123",
    "organization_id": "org-456",
    "property_id": "prop-nonexistent",
    "style": "professional",
    "channels": ["mls"]
  }'
# Verify: 404 error, appropriate error message

# Test 4: Simulate Claude API failure (requires mock setup)
# Would need to temporarily configure N8n to use mock Claude endpoint
# that returns errors

Validation Checklist
Before marking implementation complete, verify:
Functionality:

✅ All test cases pass (100% success rate)
✅ All 4 style variants generate appropriate content
✅ All 4 channel formats produce correct output
✅ SEO keywords are naturally incorporated
✅ Social media variants include proper hashtags
✅ Descriptions meet length requirements per channel
✅ Highlights extracted accurately
✅ Call-to-actions are contextually appropriate

Security:

✅ Organization isolation enforced at property fetch
✅ User-organization relationship verified
✅ RLS policies prevent cross-org data access
✅ No hardcoded API keys in workflow
✅ Input validation prevents injection
✅ Error messages don't leak sensitive data

Performance:

✅ Response time <2s (95th percentile) under normal load
✅ Handles 100 concurrent requests without degradation
✅ SEO keywords cached effectively (1 hour TTL)
✅ Claude API retries work correctly
✅ Database queries optimized with proper indexes
✅ No memory leaks during sustained load

Code Quality:

✅ No placeholder code or TODOs
✅ All functions have clear names
✅ Complex logic is commented
✅ Error handling covers all failure modes
✅ Logging is comprehensive but not excessive
✅ Code follows project standards

Integration:

✅ Claude API integration works correctly
✅ Supabase queries execute successfully
✅ Webhook receives and responds properly
✅ Database records created correctly
✅ Can integrate with frontend React component

Monitoring:

✅ Execution metrics logged to database
✅ Errors logged with full context
✅ Performance data captured
✅ Token usage tracked for billing
✅ Alerts configured for critical failures

Documentation:

✅ Workflow purpose clearly documented
✅ All nodes have descriptive names
✅ Complex prompts explained
✅ Dependencies listed
✅ Troubleshooting guide provided


Performance & Scaling
Expected Load

Requests per minute: 50-100 (peak), 20-30 (average)
Concurrent users: 20-50 agents per organization
Peak traffic periods: 9 AM - 12 PM, 2 PM - 5 PM local time
Data volume: 1000-2000 descriptions per day per organization

Scaling Strategy
Current (Tier 1): Single N8n instance with optimized queries

Handles up to 100 descriptions/hour
Claude API rate limit: 4000 req/min (plenty of headroom)
Database connection pool: 20 connections
Response time target: <2s (95th percentile)

Tier 2 (500 req/hr): Horizontal scaling with load balancer

Deploy 3 N8n instances behind load balancer
Implement Redis cache for SEO keywords and comparables
Increase database connection pool to 50
Add CDN for static assets (social media images)

Tier 3 (2000+ req/hr): Distributed architecture

N8n workers with message queue (Bull/Redis)
Separate Claude API instance per worker
Read replicas for Supabase queries
Dedicated caching layer (Redis Cluster)

Resource Requirements
Current:

CPU: 2 cores minimum (4 recommended)
Memory: 4GB minimum (8GB recommended)
Storage: 50GB for logs and temporary data
Network: 100 Mbps bandwidth
Database: Supabase Pro tier ($25/mo) supports 500K requests

Claude API Costs:

Average description: ~1500 input tokens, ~800 output tokens
Cost per description: ~$0.017 ($0.0045 input + $0.012 output)
1000 descriptions/day = ~$17/day = $510/month
Budget recommendation: $750/month for 1500 descriptions/day

Optimization Opportunities

SEO Keyword Caching

Current: Cache hit rate ~70%
Target: 90%+ hit rate
Implementation: Increase TTL to 4 hours, preload popular locations


Comparable Listings Cache

Current: Fresh query every time
Target: 80%+ cache hit rate
Implementation: Cache by property type + location + price range (30 min TTL)


Prompt Template Optimization

Current: ~1500 token prompts
Target: Reduce to ~1000 tokens
Implementation: Remove verbose examples, optimize instructions


Batch Processing

Current: One property at a time
Future: Batch 5-10 properties in single LLM call
Benefit: Reduce overhead, increase throughput by 3-4x




Monitoring & Alerting
Key Metrics
javascript// Metrics configuration for dashboard
const METRICS = {
  execution_count: {
    type: 'counter',
    labels: ['organization_id', 'style', 'channel', 'status'],
    description: 'Total description generation executions'
  },
  execution_duration: {
    type: 'histogram',
    buckets: [500, 1000, 2000, 3000, 5000, 10000],
    labels: ['style'],
    description: 'Description generation time in milliseconds'
  },
  error_rate: {
    type: 'gauge',
    labels: ['error_category'],
    description: 'Percentage of failed executions'
  },
  claude_api_tokens: {
    type: 'counter',
    labels: ['organization_id', 'token_type'],
    description: 'Claude API tokens used (input/output)'
  },
  claude_api_cost: {
    type: 'counter',
    labels: ['organization_id'],
    description: 'Estimated Claude API cost in USD'
  },
  description_quality: {
    type: 'histogram',
    buckets: [1, 2, 3, 4, 5],
    labels: ['style'],
    description: 'Agent ratings (1-5 stars)'
  },
  cache_hit_rate: {
    type: 'gauge',
    labels: ['cache_type'],
    description: 'Cache hit rate percentage'
  }
};
Alert Rules
yamlalerts:
  - name: High Error Rate
    condition: error_rate > 5% over 10 minutes
    severity: warning
    action: Notify DevOps via Slack
    runbook: Check workflow_errors table for patterns
    
  - name: Critical Error Rate
    condition: error_rate > 15% over 5 minutes
    severity: critical
    action: Page on-call engineer + disable workflow
    runbook: Immediate investigation required
    
  - name: Slow Response Times
    condition: p95(execution_duration) > 4000ms over 15 minutes
    severity: warning
    action: Investigate performance bottleneck
    runbook: Check Claude API latency, database query times
    
  - name: Claude API Down
    condition: claude_api_errors > 90% over 3 minutes
    severity: critical
    action: Enable fallback to template generation, notify team
    runbook: Check Anthropic status page, verify API keys
    
  - name: High API Costs
    condition: daily_claude_cost > $1000
    severity: warning
    action: Alert finance team, investigate usage spike
    runbook: Check for abuse or unusual traffic patterns
    
  - name: Low Description Quality
    condition: avg(agent_rating) < 3.0 over 24 hours
    severity: warning
    action: Notify product team, review prompt templates
    runbook: Analyze low-rated descriptions for patterns
    
  - name: Cache Performance Degraded
    condition: cache_hit_rate < 50% over 30 minutes
    severity: info
    action: Check cache configuration
    runbook: Verify Redis connectivity, check TTL settings
Dashboard Visualization
Real-time Dashboard Panels:

Executions per Minute (Line Chart)

Total executions
By style (professional, casual, luxury, investment)
Success vs. failure rate


Response Time Distribution (Histogram)

p50, p95, p99 percentiles
Color-coded by acceptable/warning/critical


Error Breakdown (Pie Chart)

By error category
Click through to error details


Active Executions (Gauge)

Current executing workflows
Queue depth if applicable


Claude API Usage (Stacked Area Chart)

Input tokens over time
Output tokens over time
Estimated costs


Top Organizations by Usage (Table)

Organization name
Description count (24h)
Total cost (24h)
Average quality rating


Cache Performance (Line Chart)

SEO keywords cache hit rate
Comparables cache hit rate


Description Quality (Bar Chart)

Average rating by style
Total ratings received




Documentation
Workflow Overview
Name: Listing Description Generator v1
Version: 1.0.0
Purpose: Generate SEO-optimized, compelling property descriptions tailored to different styles and marketing channels using AI (Claude Sonnet 4.5).
Business Value:

Reduce description writing time from 30-45 min to <2 min (95%+ time savings)
Ensure consistent, professional quality across all listings
Improve SEO rankings through automated keyword optimization
Support multiple marketing channels with channel-specific formatting
Enable A/B testing of description variants

When to Use:

Agent is creating a new property listing
Refreshing an existing listing with updated description
Generating multi-channel marketing content for a property
A/B testing different description styles
Bulk generating descriptions for multiple properties

When NOT to Use:

Property data is incomplete (missing core fields like address, price)
Description requires extremely specific local knowledge not in database
Legal/compliance-sensitive descriptions requiring manual review
Properties with unique circumstances requiring custom messaging

Integration Points
Consumes From:

Database: properties table - Property details, features, pricing
Database: seo_keywords table - Cached SEO keyword data
Claude API - LLM for content generation
Google Keyword Planner API (optional) - Real-time SEO keyword research

Provides To:

Database: property_descriptions table - Generated descriptions with metadata
Database: social_media_content table - Platform-specific social posts
Frontend Dashboard - React component displays descriptions for review/edit
MLS Integration (future) - Auto-publish to MLS systems
Website CMS (future) - Auto-populate website listings

Triggers:

Manual: Agent clicks "Generate Description" in UI
API Call: POST to /api/generate-listing-description
Bulk: Future workflow for batch processing multiple properties


Usage Examples
Example 1: Generate Professional MLS Description
bash# Request
curl -X POST https://api.strivetech.io/api/generate-listing-description \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "agent-001",
    "organization_id": "realty-pros-tx",
    "property_id": "prop-12345",
    "style": "professional",
    "channels": ["mls"],
    "seo_enabled": true
  }'

# Response (Success)
{
  "success": true,
  "data": {
    "property_id": "prop-12345",
    "style": "professional",
    "channels": ["mls"],
    "description": "Welcome to this stunning 3-bedroom, 2-bathroom single-family home in the heart of Austin, TX. Spanning 1,850 square feet, this beautifully maintained property offers modern living with timeless charm. The open-concept layout features a spacious living room with abundant natural light, a gourmet kitchen with stainless steel appliances, and elegant hardwood floors throughout. The master suite includes a walk-in closet and ensuite bathroom. Outside, enjoy a large backyard perfect for entertaining. Located in a highly sought-after neighborhood with excellent schools and convenient access to shopping and dining. Priced at $525,000. This home won't last long!",
    "highlights": [
      "Open-concept layout with abundant natural light",
      "Gourmet kitchen with stainless steel appliances",
      "Master suite with walk-in closet and ensuite",
      "Large backyard perfect for entertaining",
      "Excellent schools and convenient location"
    ],
    "call_to_action": "Schedule your showing today!",
    "social_variants": null,
    "metrics": {
      "character_count": 742,
      "word_count": 121,
      "readability_score": 68,
      "seo_keywords_used": [
        "Austin TX homes",
        "single family home Austin",
        "3 bedroom Austin"
      ]
    },
    "description_ids": ["desc-uuid-001"],
    "tokens_used": 2234,
    "generation_time_ms": 1847
  },
  "metadata": {
    "organization_id": "realty-pros-tx",
    "generated_at": "2025-10-09T14:23:17Z",
    "workflow_execution_id": "exec-uuid-001",
    "model_used": "claude-sonnet-4-5"
  }
}
Example 2: Luxury Description with Social Media
javascript// Frontend React component integration
async function generateLuxuryDescription(propertyId) {
  try {
    const response = await fetch('/api/generate-listing-description', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify({
        user_id: getCurrentUserId(),
        organization_id: getCurrentOrgId(),
        property_id: propertyId,
        style: 'luxury',
        channels: ['website', 'social'],
        seo_enabled: true,
        options: {
          highlight_features: ['wine_cellar', 'home_theater', 'infinity_pool'],
          tone: 'sophisticated'
        }
      })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error.message);
    }
    
    const data = await response.json();
    
    // Display in UI for agent review
    displayDescription(data.data.description);
    displaySocialPosts(data.data.social_variants);
    
    return data;
  } catch (error) {
    console.error('Failed to generate description:', error);
    showErrorNotification(error.message);
    throw error;
  }
}
Example 3: Investment-Focused Description
bashcurl -X POST https://api.strivetech.io/api/generate-listing-description \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "investor-agent-007",
    "organization_id": "investment-realty-group",
    "property_id": "prop-multifamily-456",
    "style": "investment",
    "channels": ["website"],
    "seo_enabled": true
  }'

# Response includes investment-focused language:
# - Mentions potential ROI, cap rate, cash flow
# - Highlights rental income potential
# - Emphasizes appreciation prospects
# - Includes comparable investment metrics

Troubleshooting Guide
Problem 1: Workflow returns 400 validation error
Symptoms:

Response status: 400
Error message: "Validation failed"
validation_errors array in response

Diagnosis:

Check the validation_errors array in the response
Common issues:

Missing user_id, organization_id, or property_id
Invalid style value (must be: professional, casual, luxury, investment)
Invalid channels array (must include valid channels: mls, website, social, flyer)
Invalid options.max_length (must be 100-5000)



Solution:
javascript// Validate input before sending
const validStyles = ['professional', 'casual', 'luxury', 'investment'];
const validChannels = ['mls', 'website', 'social', 'flyer'];

if (!validStyles.includes(style)) {
  throw new Error(`Invalid style. Must be one of: ${validStyles.join(', ')}`);
}

if (!channels.every(c => validChannels.includes(c))) {
  throw new Error(`Invalid channels. Must be one of: ${validChannels.join(', ')}`);
}
Prevention:

Use TypeScript interfaces to enforce types
Implement frontend validation before API call
Reference the API schema documentation


Problem 2: Claude API timeout or rate limit
Symptoms:

Request takes >60 seconds with no response
Error message: "Rate limit exceeded" or "Request timeout"
Response status: 429 or 500

Diagnosis:

Check workflow_errors table:

sqlSELECT * FROM workflow_errors 
WHERE error_category IN ('TIMEOUT_ERROR', 'RATE_LIMIT_ERROR')
  AND created_at > NOW() - INTERVAL '1 hour'
ORDER BY created_at DESC;

Check Claude API status: https://status.anthropic.com
Check your API usage against rate limits

Solution:
For rate limits (429 errors):
javascript// Workflow implements automatic retry with exponential backoff
// Wait time increases: 60s → 120s → 240s
// If persists, reduce concurrent requests or upgrade API tier
For timeouts:
javascript// Workflow retries 3 times with 5s delays
// If still timing out:
// 1. Check Claude API status
// 2. Verify network connectivity
// 3. Simplify prompt (reduce context/examples)
Prevention:

Monitor API usage dashboard
Set up alerts when approaching rate limits
Implement request queuing for burst traffic
Consider API tier upgrade if consistently hitting limits


Problem 3: Generated description is poor quality
Symptoms:

Agent rates description <3 stars
Description doesn't match property features
SEO keywords awkwardly inserted
Wrong tone for selected style

Diagnosis:

Check agent ratings:

sqlSELECT 
  style,
  AVG(agent_rating) as avg_rating,
  COUNT(*) as total_ratings
FROM property_descriptions
WHERE agent_rating IS NOT NULL
  AND created_at > NOW() - INTERVAL '7 days'
GROUP BY style;

Review low-rated descriptions:

sqlSELECT * FROM property_descriptions
WHERE agent_rating <= 2
  AND created_at > NOW() - INTERVAL '7 days'
ORDER BY created_at DESC
LIMIT 10;

Compare input property data quality

Solution:
If property data is incomplete:
javascript// Ensure properties table has complete data:
// - All core fields populated (bedrooms, bathrooms, square_feet, etc.)
// - Features JSONB includes key amenities
// - neighborhood_info has relevant context
If prompt needs improvement:
javascript// Adjust prompt in Node 8 (build_llm_prompt)
// - Add more specific examples
// - Clarify tone requirements
// - Adjust keyword incorporation instructions
If specific style is consistently poor:
javascript// Review and update systemPrompts in Node 8
// Example: Make luxury style more sophisticated
systemPrompts.luxury = `You are an elite luxury real estate writer...`;
Prevention:

Regularly review agent ratings and feedback
A/B test prompt variations
Ensure property data quality standards
Collect agent feedback for continuous improvement


Problem 4: Organization isolation failure
Symptoms:

User sees descriptions from different organization
Security audit flags cross-org data access
User accesses property they shouldn't see

Diagnosis:

Check user-organization relationship:

sqlSELECT * FROM user_organizations
WHERE user_id = '<suspect_user_id>';

Verify RLS policies are enabled:

sqlSELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename IN ('properties', 'property_descriptions', 'social_media_content');

Test isolation:

bash# User should NOT be able to access other org's property
curl -X POST /api/generate-listing-description \
  -d '{"user_id": "user-A", "organization_id": "org-B", "property_id": "prop-org-B-123"}'
# Should return 404 or 403
Solution:
⚠️ CRITICAL SECURITY ISSUE - Requires immediate fix:

Disable workflow immediately until fixed
Verify all queries include organization_id filter:

javascript// Every Supabase query must have:
filterByFields: {
  fields: [
    { fieldName: "organization_id", fieldValue: "={{ $json.organization_id }}" }
  ]
}

Enable RLS on all tables:

sqlALTER TABLE property_descriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY org_isolation ON property_descriptions
  FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM user_organizations 
      WHERE user_id = auth.uid()
    )
  );

Audit all data access logs:

sql-- Check for any cross-org access
SELECT * FROM workflow_executions 
WHERE created_at > '<date_of_concern>'
ORDER BY created_at DESC;

Re-test with multiple organizations

Prevention:

ALWAYS include organization_id in WHERE clauses
Enable RLS on all multi-tenant tables
Include organization isolation in ALL test suites
Code review focusing on data access patterns
Regular security audits


Problem 5: Slow performance (response time >5 seconds)
Symptoms:

Users report slow description generation
Dashboard shows p95 > 4000ms
Timeout errors increasing

Diagnosis:

Check execution metrics:

sqlSELECT 
  PERCENTILE_CONT(0.50) WITHIN GROUP (ORDER BY duration_ms) as p50,
  PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY duration_ms) as p95,
  PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY duration_ms) as p99,
  AVG(duration_ms) as avg_duration
FROM workflow_executions
WHERE workflow_name = 'listing-description-generator-v1'
  AND created_at > NOW() - INTERVAL '1 hour';

Identify bottleneck:

sql-- Check which node is slowest
-- (Requires custom logging in workflow to track per-node timing)

Check Claude API latency (compare to typical 1-2s response time)
Check database query performance with EXPLAIN ANALYZE
Monitor system resources (CPU, memory, disk I/O)

Optimization Strategies:
1. Database Optimization:
sql-- Ensure indexes exist
CREATE INDEX IF NOT EXISTS idx_properties_org_id ON properties(organization_id);
CREATE INDEX IF NOT EXISTS idx_properties_location ON properties(city, state);

-- Optimize slow queries
EXPLAIN ANALYZE
SELECT * FROM properties
WHERE organization_id = 'org-123' AND property_id = 'prop-456';
2. Caching:
javascript// Implement Redis caching for:
// - SEO keywords (TTL: 1 hour)
const cacheKey = `seo:${city}:${state}:${propertyType}`;
const cached = await redis.get(cacheKey);
if (cached) return JSON.parse(cached);

// - Comparable listings (TTL: 30 min)
// - Property data (TTL: 10 min)
3. Prompt Optimization:
javascript// Reduce prompt length from ~1500 to ~1000 tokens
// - Remove verbose examples
// - Simplify instructions
// - Reduce comparable context
4. Parallel Processing:
javascript// Fetch SEO keywords and comparables in parallel
const [seoKeywords, comparables] = await Promise.all([
  fetchSEOKeywords(),
  fetchComparables()
]);
Prevention:

Monitor response times continuously
Set performance budgets (<2s target)
Regular performance audits
Load test before major changes
Optimize queries proactively


Problem 6: Social media content doesn't post correctly
Symptoms:

Hashtags are malformed
Character count exceeds platform limits
Formatting issues on specific platforms

Diagnosis:

Check social_media_content table:

sqlSELECT platform, character_count, hashtags, post_text
FROM social_media_content
WHERE created_at > NOW() - INTERVAL '1 day'
ORDER BY created_at DESC
LIMIT 20;

Verify character counts against limits:

Twitter: 280 characters
Instagram: 2,200 characters (but ~150 recommended)
Facebook: 63,206 characters (but ~250 recommended)
LinkedIn: 3,000 characters


Check hashtag format (no spaces, alphanumeric only)

Solution:
Update social variant generation (Node 11):
javascript// Add validation and truncation
function generateSocialPost(platform, content, maxLength) {
  let post = buildPost(content);
  
  // Truncate if needed
  if (post.length > maxLength) {
    post = post.substring(0, maxLength - 3) + '...';
  }
  
  // Validate hashtags
  const cleanedHashtags = hashtags
    .map(tag => tag.replace(/[^a-zA-Z0-9]/g, ''))
    .filter(tag => tag.length > 0);
  
  return {
    post_text: post,
    hashtags: cleanedHashtags,
    character_count: post.length
  };
}
Prevention:

Add character count validation in workflow
Test social posts on actual platforms
Regular audits of posted content
Feedback loop from agents on social media success


Maintenance & Updates
Regular Maintenance Tasks
Weekly:

✅ Review error logs for new patterns:

sqlSELECT error_category, COUNT(*) as count
FROM workflow_errors
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY error_category
ORDER BY count DESC;

✅ Check performance metrics for degradation:

sql-- Compare this week to last week
SELECT 
  DATE_TRUNC('week', created_at) as week,
  PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY duration_ms) as p95_duration
FROM workflow_executions
WHERE workflow_name = 'listing-description-generator-v1'
  AND created_at > NOW() - INTERVAL '14 days'
GROUP BY week;

✅ Verify Claude API is healthy (check status page)
✅ Monitor API costs:

sqlSELECT 
  organization_id,
  SUM(tokens_used * 0.000017) as estimated_cost_usd
FROM property_descriptions
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY organization_id
ORDER BY estimated_cost_usd DESC;
Monthly:

✅ Update Claude API client if new model versions available
✅ Review and optimize slow database queries:

sql-- Find slow queries
SELECT query, mean_exec_time, calls
FROM pg_stat_statements
WHERE query LIKE '%property_descriptions%'
ORDER BY mean_exec_time DESC
LIMIT 10;

✅ Analyze agent ratings and feedback:

sqlSELECT 
  style,
  AVG(agent_rating) as avg_rating,
  COUNT(*) as total_ratings,
  COUNT(CASE WHEN agent_edited THEN 1 END) as edited_count
FROM property_descriptions
WHERE created_at > NOW() - INTERVAL '30 days'
  AND agent_rating IS NOT NULL
GROUP BY style;

✅ Review SEO keyword effectiveness (check property visibility/clicks)
✅ Update documentation for any workflow changes

Quarterly:

✅ Comprehensive performance audit

Load test with 500+ concurrent requests
Profile workflow execution
Identify optimization opportunities


✅ Security review

Audit RLS policies
Review data access logs for anomalies
Penetration testing for organization isolation


✅ Prompt template optimization

A/B test new prompt variations
Review latest Claude best practices
Update system prompts based on feedback


✅ Cost analysis and optimization

Review API usage trends
Identify high-cost organizations
Optimize token usage where possible




Update Procedures
When updating this workflow:

Create new version (don't modify existing)

bash# Export current workflow
n8n export:workflow --id=listing-description-generator-v1

# Create new version
# naming: listing-description-generator-v1.1, v1.2, v2.0, etc.

Test thoroughly in development


Run all test cases (10+ scenarios)
Verify organization isolation
Performance benchmark
Error handling validation


Deploy to staging


Import new workflow version
Run integration tests
Monitor for 24 hours
Get agent feedback


Gradual rollout to production

javascript// Route traffic gradually
// Day 1: 10% to new version
// Day 2: 25% to new version
// Day 3: 50% to new version
// Day 4: 100% to new version (if no issues)

Monitor production metrics

sql-- Compare old vs new version performance
SELECT 
  workflow_name,
  COUNT(*) as executions,
  AVG(duration_ms) as avg_duration,
  SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END)::FLOAT / COUNT(*) as error_rate
FROM workflow_executions
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY workflow_name;

Keep previous version for quick rollback


Don't delete old version for 7 days
Document rollback procedure


Rollback Procedure
bash# If issues detected in new version:

# Step 1: Immediately disable new workflow version in N8n
# (Stop all executions, disable webhook)

# Step 2: Re-enable previous stable version
# (Activate webhook for old version)

# Step 3: Verify old version is working
curl -X POST /api/generate-listing-description \
  -H "Content-Type: application/json" \
  -d @test_case_valid.json

# Step 4: Investigate issues in development
# - Review error logs
# - Check what changed
# - Identify root cause

# Step 5: Document what went wrong
# - Update changelog
# - Add to known issues
# - Plan fix

# Step 6: Fix and re-test before re-deploying
# - Address root cause
# - Add regression tests
# - Complete full test suite

Known Limitations
Current Limitations

Single Language Support

Impact: Only generates English descriptions currently
Workaround: Use external translation service post-generation
Roadmap: Multi-language support planned for v2.0 (Q2 2025)


Limited Comparable Analysis

Impact: Only considers properties in same city, not radius-based
Workaround: Manually review and adjust comparable properties
Roadmap: Implement geolocation-based comparable search (v1.5)


No Image Analysis

Impact: Descriptions don't incorporate insights from property photos
Workaround: Ensure property features are well-documented in metadata
Roadmap: Add vision model integration to analyze photos (v2.0)


Manual Publishing

Impact: Descriptions must be manually copied to MLS/website
Workaround: Copy/paste from UI
Roadmap: Auto-publish to integrated systems (v1.3)


No Real-time SEO Verification

Impact: Can't verify if keywords actually improve rankings
Workaround: Manual tracking of listing performance
Roadmap: Integrate with Google Search Console for ranking tracking




Future Enhancements

Automated A/B Testing

Priority: High
Estimated effort: 3-4 weeks
Dependencies: Analytics system, tracking infrastructure
Description: Automatically generate multiple variants, track performance, recommend best performer


Voice/Tone Training

Priority: Medium
Estimated effort: 2-3 weeks
Dependencies: Sufficient historical data
Description: Learn organization-specific voice and terminology preferences


Video Script Generation

Priority: Medium
Estimated effort: 2 weeks
Dependencies: Video marketing module
Description: Generate scripts for property tour videos


Market Insights Integration

Priority: High
Estimated effort: 4-6 weeks
Dependencies: Market data APIs
Description: Incorporate real-time market trends and buyer preferences


Competitive Intelligence

Priority: Low
Estimated effort: 3-4 weeks
Dependencies: MLS data access, web scraping
Description: Analyze competitor listings and differentiate automatically




Related Resources
Documentation

Strive Tech Main Documentation
API Reference
Database Schema Documentation
Claude API Documentation
N8n Documentation

Code Repositories

N8n workflows: https://github.com/strivetech/n8n-workflows
Frontend integration: https://github.com/strivetech/web-app
Database migrations: https://github.com/strivetech/db-migrations

Support

Technical issues: #tech-support Slack channel or support@strivetech.io
Feature requests: Product board at https://roadmap.strivetech.io
Bug reports: GitHub issues at https://github.com/strivetech/n8n-workflows/issues
Urgent/Critical: Page on-call via PagerDuty


Success Criteria
This workflow implementation is complete when:
Functionality:

✅ All required features implemented (4 styles, 4 channels, SEO, social variants)
✅ All 10 test cases pass with 100% success rate
✅ Edge cases handled appropriately (missing data, invalid input)
✅ Error messages are clear and actionable
✅ Integration with Supabase, Claude API working correctly

Performance:

✅ Response time <2s (95th percentile) under normal load
✅ Error rate <1% in production
✅ Handles 100 concurrent requests without degradation
✅ Database queries optimized (<50ms each)
✅ SEO keyword caching working (>70% hit rate)

Security:

✅ Organization isolation enforced and verified with multi-org tests
✅ User authentication/authorization working
✅ No hardcoded credentials (all in N8n credentials store)
✅ Input validation prevents injection attacks
✅ Sensitive data not logged or exposed

Code Quality:

✅ No placeholder code or TODOs
✅ Functions have clear, descriptive names
✅ Complex logic is commented
✅ Error handling is comprehensive (all scenarios covered)
✅ Code follows project standards (naming, structure)

Operations:

✅ Monitoring configured (metrics, dashboards)
✅ Alerts set up for critical failures
✅ Logging captures execution details
✅ Performance metrics tracked
✅ Cost tracking implemented

Documentation:

✅ Workflow purpose clearly documented
✅ All nodes have descriptive names
✅ Prompt engineering strategy explained
✅ Dependencies listed
✅ Troubleshooting guide covers common issues


Deliverables
✅ Complete N8n Workflow JSON

All 20 nodes configured and connected
Proper error handling paths
Credentials referenced (not hardcoded)
Ready to import into N8n instance

✅ Database Schema SQL Scripts
sql-- Complete DDL provided in Prerequisites section
-- Includes:
-- - property_descriptions table
-- - seo_keywords table
-- - social_media_content table
-- - All indexes
-- - RLS policies
-- - Triggers
✅ Test Procedures with Sample Data

10 comprehensive test cases
Step-by-step testing instructions
Expected outputs documented
Organization isolation verification
Performance benchmarking guide

✅ Complete Documentation

Workflow overview and business context
Technical architecture and data flow
Usage examples (curl, JavaScript)
Troubleshooting guide (6 common issues)
Maintenance procedures
Monitoring and alerting configuration

✅ Integration Guide
javascript// Frontend React component example provided
// API request/response formats documented
// Error handling patterns shown

Appendix
Glossary

LLM: Large Language Model (e.g., Claude, GPT-4)
SEO: Search Engine Optimization
MLS: Multiple Listing Service
CTA: Call To Action
TTL: Time To Live (cache duration)
RLS: Row Level Security (Supabase feature)
p95: 95th percentile (performance metric)

Reference Data
HTTP Status Codes Used:

200: Success - Description generated
400: Validation error - Invalid input
403: Unauthorized - User doesn't have access to organization
404: Not found - Property doesn't exist
429: Rate limit exceeded - Too many requests
500: Internal server error - Workflow or LLM failure

Error Categories:

VALIDATION_ERROR: Input validation failed
AUTH_ERROR: Authentication/authorization failed
NOT_FOUND_ERROR: Property not found
TIMEOUT_ERROR: Claude API timeout
RATE_LIMIT_ERROR: Claude API rate limit hit
LLM_RESPONSE_ERROR: Claude returned invalid response
SERVER_ERROR: External service error
UNKNOWN_ERROR: Unclassified error

Version History
Version 1.0.0 (2025-10-10)

Initial implementation
4 style variants (professional, casual, luxury, investment)
4 channel formats (MLS, website, social, flyer)
SEO keyword optimization
Social media variant generation
Multi-tenant organization isolation
Comprehensive error handling
Performance optimization (caching)
Complete testing suite


Implementation Notes
Environment-Specific Configuration
Development:

Use test Claude API key with rate limits
Verbose logging enabled
Mock external APIs where possible
Shorter cache TTLs for testing

Staging:

Production-like data
Moderate logging
Real external APIs
Normal cache TTLs

Production:

Production Claude API key
Minimal logging (errors + metrics only)
All external integrations live
Optimized cache TTLs

Feature Flags
Consider implementing feature flags for:
javascriptconst FEATURE_FLAGS = {
  ENABLE_SEO_KEYWORDS: true, // Can disable if keyword API is down
  ENABLE_SOCIAL_VARIANTS: true, // Can disable if not needed
  ENABLE_COMPARABLE_ANALYSIS: true, // Can disable to reduce latency
  ENABLE_CACHING: true, // Can disable for debugging
  ENABLE_A_B_TESTING: false // Future feature
};
Cost Optimization
Claude API Cost Breakdown:

Input tokens: $3 / million tokens
Output tokens: $15 / million tokens
Average description: ~$0.017
Monthly budget for 30,000 descriptions: ~$510

Optimization strategies:

Reduce prompt size (fewer examples, shorter instructions)
Cache aggressively (reduce duplicate generations)
Batch requests where possible (future enhancement)
Use cheaper models for non-critical channels (social media)


</enhanced_prompt>
