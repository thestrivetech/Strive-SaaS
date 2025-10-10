# Chatbot → Database Integration Guide

**Complete guide for capturing lead information from chatbot conversations into Supabase**

---

## 🎯 What Gets Captured

### Example Conversation:
```
User: "Hi, I'm Billy Bob and I'm looking for a 3 bedroom house in Nashville for $500k.
       It needs to have a pool and a backyard."

Chatbot: "Nashville is an amazing city! Let me find the best matches for you..."
[Returns 5 properties]
```

### What Gets Stored in Database:

**leads table:**
```sql
id: "cm4x1y2z3..."
first_name: "Billy"
last_name: "Bob"
email: null (not provided yet)
phone: null (not provided yet)
organization_id: "your_org_id"
source: "CHATBOT"
status: "QUALIFIED" (because they have location + budget)
score: "WARM"
score_value: 45
budget: "500000"
timeline: null
notes: "Looking for: Nashville homes, $500k budget, 3 bed, pool, backyard"
tags: ["chatbot", "real-estate"]
custom_fields: {
  "chatbot_session_id": "session-123",
  "property_preferences": {
    "location": "Nashville",
    "maxPrice": 500000,
    "minBedrooms": 3,
    "minBathrooms": 2,
    "mustHaveFeatures": ["pool", "backyard"],
    "niceToHaveFeatures": [],
    "propertyType": "single-family",
    "timeline": null
  },
  "chatbot_engagement": {
    "message_count": 2,
    "last_message": "Hi, I'm Billy Bob and I'm looking for...",
    "last_interaction": "2025-10-07T10:30:00Z"
  },
  "viewed_properties": [],
  "last_property_search": "2025-10-07T10:30:15Z"
}
created_at: "2025-10-07T10:30:00Z"
updated_at: "2025-10-07T10:30:15Z"
last_contact_at: "2025-10-07T10:30:15Z"
```

**activities table:**
```sql
-- Activity 1: Message received
type: "NOTE"
title: "Chatbot: message"
description: "Chatbot conversation: \"Hi, I'm Billy Bob and I'm looking for...\""
lead_id: "cm4x1y2z3..."

-- Activity 2: Property search performed
type: "NOTE"
title: "Chatbot: property_search"
description: "Searched properties in Nashville under $500,000"
lead_id: "cm4x1y2z3..."
metadata: {
  "search_params": {
    "location": "Nashville",
    "maxPrice": 500000,
    "minBedrooms": 3,
    "mustHaveFeatures": ["pool", "backyard"]
  }
}
```

---

## 🛠️ Implementation Steps

### Step 1: Update Database Schema

**Add first_name and last_name columns to leads table**

Run this SQL in Supabase SQL Editor:

```sql
-- Add first_name and last_name columns
ALTER TABLE leads
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS last_name TEXT;

-- Create indexes for searching
CREATE INDEX IF NOT EXISTS leads_first_name_idx ON leads(first_name);
CREATE INDEX IF NOT EXISTS leads_last_name_idx ON leads(last_name);

-- Optional: Update existing leads with split names
UPDATE leads
SET
  first_name = SPLIT_PART(name, ' ', 1),
  last_name = CASE
    WHEN ARRAY_LENGTH(STRING_TO_ARRAY(name, ' '), 1) > 1
    THEN TRIM(SUBSTRING(name FROM POSITION(' ' IN name) + 1))
    ELSE NULL
  END
WHERE first_name IS NULL AND name IS NOT NULL AND name != '';
```

### Step 2: Update Prisma Schema

**File:** `shared/prisma/schema.prisma`

```prisma
model leads {
  id              String        @id @default(cuid())
  name            String        // Keep for backward compatibility
  first_name      String?       // NEW: First name
  last_name       String?       // NEW: Last name
  email           String?
  phone           String?
  company         String?
  source          LeadSource    @default(WEBSITE)
  status          LeadStatus    @default(NEW_LEAD)
  score           LeadScore     @default(COLD)
  score_value     Int           @default(0)
  budget          Decimal?      @db.Decimal(12, 2)
  timeline        String?
  notes           String?       @db.Text
  tags            String[]      @default([])
  custom_fields   Json?         @db.JsonB
  organization_id String
  assigned_to_id  String?
  created_at      DateTime      @default(now())
  updated_at      DateTime      @updatedAt
  last_contact_at DateTime?
  organizations   organizations @relation(fields: [organization_id], references: [id], onDelete: Cascade)
  assigned_to     users?        @relation("LeadAssignedTo", fields: [assigned_to_id], references: [id], onDelete: SetNull)
  activities      activities[]
  deals           deals[]

  @@index([organization_id])
  @@index([assigned_to_id])
  @@index([status])
  @@index([source])
  @@index([score])
  @@index([created_at])
  @@index([first_name])  // NEW
  @@index([last_name])   // NEW
  @@map("leads")
}
```

Then regenerate Prisma client:
```bash
cd ../shared
npx prisma generate
```

### Step 3: Update Data Extraction

**File:** `lib/ai/data-extraction.ts`

Update the ContactInfoSchema and extraction logic:

```typescript
// ADD THIS: New schema with split names
export const ContactInfoSchema = z.object({
  firstName: z.string().optional().describe('First name only'),
  lastName: z.string().optional().describe('Last name only'),
  fullName: z.string().optional().describe('Full name if provided together'),
  email: z.string().email().optional().describe('Email address'),
  phone: z.string().optional().describe('Phone number'),
});

export type ContactInfo = z.infer<typeof ContactInfoSchema>;

// UPDATE the extract_contact_info function in extractDataFromMessage:
{
  type: 'function' as const,
  function: {
    name: 'extract_contact_info',
    description: 'Extract contact information from user message',
    parameters: {
      type: 'object',
      properties: {
        firstName: {
          type: 'string',
          description: 'First name only (e.g., "Billy" from "Billy Bob")',
        },
        lastName: {
          type: 'string',
          description: 'Last name only (e.g., "Bob" from "Billy Bob")',
        },
        fullName: {
          type: 'string',
          description: 'Full name if provided as a single unit',
        },
        email: {
          type: 'string',
          description: 'Email address',
        },
        phone: {
          type: 'string',
          description: 'Phone number',
        },
      },
    },
  },
}

// ADD THIS: Helper function to split names
export function splitName(contactInfo: ContactInfo): { firstName?: string; lastName?: string; fullName: string } {
  // If firstName and lastName provided separately, use them
  if (contactInfo.firstName || contactInfo.lastName) {
    return {
      firstName: contactInfo.firstName,
      lastName: contactInfo.lastName,
      fullName: [contactInfo.firstName, contactInfo.lastName].filter(Boolean).join(' ') || 'Unknown',
    };
  }

  // If fullName provided, try to split it
  if (contactInfo.fullName) {
    const parts = contactInfo.fullName.trim().split(/\s+/);
    if (parts.length === 1) {
      return { firstName: parts[0], lastName: undefined, fullName: parts[0] };
    } else if (parts.length === 2) {
      return { firstName: parts[0], lastName: parts[1], fullName: contactInfo.fullName };
    } else {
      // More than 2 parts: first is firstName, rest is lastName
      return {
        firstName: parts[0],
        lastName: parts.slice(1).join(' '),
        fullName: contactInfo.fullName,
      };
    }
  }

  // No name provided
  return { firstName: undefined, lastName: undefined, fullName: 'Unknown' };
}
```

### Step 4: Update CRM Integration

**File:** `lib/services/crm-integration.ts`

Update the `syncLeadToCRM` function:

```typescript
import { splitName } from '@/lib/ai/data-extraction';

export async function syncLeadToCRM(params: {
  sessionId: string;
  organizationId: string;
  contactInfo?: ContactInfo;
  propertyPreferences?: PropertyPreferences;
  messageCount: number;
  hasSearched?: boolean;
  viewedProperties?: string[];
  lastMessage: string;
}): Promise<{ leadId: string; isNew: boolean }> {
  const {
    sessionId,
    organizationId,
    contactInfo,
    propertyPreferences,
    messageCount,
    hasSearched = false,
    viewedProperties = [],
    lastMessage,
  } = params;

  try {
    // Split name into first/last
    const { firstName, lastName, fullName } = contactInfo ? splitName(contactInfo) : { firstName: undefined, lastName: undefined, fullName: 'Chatbot Lead' };

    // Check if lead already exists for this session
    const existingLead = await prisma.leads.findFirst({
      where: {
        organization_id: organizationId,
        custom_fields: {
          path: ['chatbot_session_id'],
          equals: sessionId,
        },
      },
    });

    // Calculate lead score
    const hasContactInfo = !!(contactInfo?.email || contactInfo?.phone || firstName);
    const hasCompleteCriteria = !!(propertyPreferences?.location && propertyPreferences?.maxPrice);
    const { score, scoreValue } = calculateLeadScore(
      messageCount,
      hasContactInfo,
      hasCompleteCriteria,
      viewedProperties.length,
      propertyPreferences?.maxPrice
    );

    // Determine status
    const status = determineLeadStatus(hasCompleteCriteria, hasSearched, false);

    // Build custom fields JSON with all preferences explicitly
    const customFields = {
      chatbot_session_id: sessionId,

      // Property preferences (detailed)
      property_preferences: propertyPreferences ? {
        location: propertyPreferences.location,
        maxPrice: propertyPreferences.maxPrice,
        minBedrooms: propertyPreferences.minBedrooms,
        minBathrooms: propertyPreferences.minBathrooms,
        mustHaveFeatures: propertyPreferences.mustHaveFeatures || [],
        niceToHaveFeatures: propertyPreferences.niceToHaveFeatures || [],
        propertyType: propertyPreferences.propertyType,
        timeline: propertyPreferences.timeline,
        isFirstTimeBuyer: propertyPreferences.isFirstTimeBuyer,
        currentSituation: propertyPreferences.currentSituation,
      } : undefined,

      // Individual feature flags for easy querying
      has_pool: propertyPreferences?.mustHaveFeatures?.includes('pool') || false,
      has_backyard: propertyPreferences?.mustHaveFeatures?.includes('backyard') || false,
      has_garage: propertyPreferences?.mustHaveFeatures?.includes('garage') || false,

      // Search history
      last_property_search: hasSearched ? new Date().toISOString() : undefined,
      viewed_properties: viewedProperties,

      // Engagement metrics
      chatbot_engagement: {
        message_count: messageCount,
        last_message: lastMessage,
        last_interaction: new Date().toISOString(),
      },
    };

    // Build detailed notes string
    const notesLines: string[] = [];
    if (propertyPreferences?.location) notesLines.push(`📍 Location: ${propertyPreferences.location}`);
    if (propertyPreferences?.maxPrice) notesLines.push(`💰 Budget: $${propertyPreferences.maxPrice.toLocaleString()}`);
    if (propertyPreferences?.minBedrooms) notesLines.push(`🛏️ Bedrooms: ${propertyPreferences.minBedrooms}+`);
    if (propertyPreferences?.minBathrooms) notesLines.push(`🛁 Bathrooms: ${propertyPreferences.minBathrooms}+`);
    if (propertyPreferences?.mustHaveFeatures && propertyPreferences.mustHaveFeatures.length > 0) {
      notesLines.push(`✨ Must-haves: ${propertyPreferences.mustHaveFeatures.join(', ')}`);
    }
    notesLines.push(`\nLast message: "${lastMessage.slice(0, 200)}"`);

    if (existingLead) {
      // Update existing lead
      const updatedLead = await prisma.leads.update({
        where: { id: existingLead.id },
        data: {
          // Update names (keep existing if not provided)
          first_name: firstName || existingLead.first_name,
          last_name: lastName || existingLead.last_name,
          name: fullName || existingLead.name,

          // Update contact info (keep existing if not provided)
          email: contactInfo?.email || existingLead.email,
          phone: contactInfo?.phone || existingLead.phone,

          // Update property preferences
          budget: propertyPreferences?.maxPrice ? propertyPreferences.maxPrice.toString() : existingLead.budget,
          timeline: propertyPreferences?.timeline || existingLead.timeline,

          // Update scoring
          score: score,
          score_value: scoreValue,
          status: status as any,

          // Update notes and metadata
          notes: notesLines.join('\n'),
          custom_fields: customFields as any,
          last_contact_at: new Date(),
          updated_at: new Date(),
        },
      });

      console.log(`✅ Updated lead ${updatedLead.id} (${firstName} ${lastName}, score: ${score}, status: ${status})`);

      return { leadId: updatedLead.id, isNew: false };
    } else {
      // Create new lead
      const newLead = await prisma.leads.create({
        data: {
          organization_id: organizationId,

          // Names
          first_name: firstName,
          last_name: lastName,
          name: fullName,

          // Contact info
          email: contactInfo?.email || undefined,
          phone: contactInfo?.phone || undefined,

          // Lead metadata
          source: 'CHATBOT',
          status: status as any,
          score: score,
          score_value: scoreValue,

          // Property preferences
          budget: propertyPreferences?.maxPrice ? propertyPreferences.maxPrice.toString() : undefined,
          timeline: propertyPreferences?.timeline,

          // Notes and tags
          notes: notesLines.join('\n'),
          tags: ['chatbot', 'real-estate'],
          custom_fields: customFields as any,
          last_contact_at: new Date(),
        },
      });

      console.log(`✅ Created new lead ${newLead.id} (${firstName} ${lastName}, score: ${score}, status: ${status})`);

      return { leadId: newLead.id, isNew: true };
    }
  } catch (error) {
    console.error('❌ CRM sync error:', error);
    throw new Error('Failed to sync lead to CRM');
  }
}
```

### Step 5: Update Chat Route (Already Done!)

The chat route at `app/api/chat/route.ts` already calls `syncLeadToCRM` at lines 245-291, so the enhanced data will automatically flow through!

---

## 📊 Data Flow Visualization

```
┌─────────────────────────────────────────────────────────────┐
│ USER MESSAGE                                                 │
│ "Hi, I'm Billy Bob. Looking for 3 bed house in Nashville   │
│  under $500k with pool and backyard"                        │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ STEP 1: Data Extraction (lib/ai/data-extraction.ts)         │
│                                                              │
│ extractDataFromMessage() using Groq AI                      │
│                                                              │
│ Extracted:                                                   │
│ • contactInfo:                                              │
│   - firstName: "Billy"                                      │
│   - lastName: "Bob"                                         │
│                                                              │
│ • propertyPreferences:                                      │
│   - location: "Nashville"                                   │
│   - maxPrice: 500000                                        │
│   - minBedrooms: 3                                          │
│   - mustHaveFeatures: ["pool", "backyard"]                 │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ STEP 2: Property Search (if location + budget present)      │
│                                                              │
│ RentCastService.searchProperties()                          │
│                                                              │
│ Returns: 5 matching properties                              │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ STEP 3: CRM Sync (lib/services/crm-integration.ts)          │
│                                                              │
│ syncLeadToCRM()                                             │
│                                                              │
│ Creates/Updates lead in Supabase:                           │
│                                                              │
│ leads table:                                                │
│ ├─ first_name: "Billy"                                      │
│ ├─ last_name: "Bob"                                         │
│ ├─ budget: "500000"                                         │
│ ├─ score: "WARM" (45 points)                               │
│ ├─ status: "QUALIFIED"                                      │
│ └─ custom_fields:                                           │
│    ├─ property_preferences: {...}                           │
│    ├─ has_pool: true                                        │
│    ├─ has_backyard: true                                    │
│    ├─ viewed_properties: []                                 │
│    └─ chatbot_engagement: {...}                             │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ STEP 4: Activity Logging                                    │
│                                                              │
│ logActivity()                                               │
│                                                              │
│ Creates 2 activities:                                        │
│ 1. "Chatbot: message" - Conversation activity               │
│ 2. "Chatbot: property_search" - Search performed            │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔍 Query Examples

### View all chatbot leads:

```sql
SELECT
  id,
  first_name,
  last_name,
  email,
  phone,
  budget,
  status,
  score,
  custom_fields->>'property_preferences' as preferences,
  custom_fields->'chatbot_engagement'->>'message_count' as messages,
  created_at
FROM leads
WHERE source = 'CHATBOT'
ORDER BY created_at DESC
LIMIT 20;
```

### View leads wanting specific features:

```sql
-- Leads wanting a pool
SELECT
  first_name,
  last_name,
  phone,
  email,
  budget,
  custom_fields->'property_preferences'->>'location' as location
FROM leads
WHERE
  source = 'CHATBOT'
  AND (custom_fields->>'has_pool')::boolean = true
ORDER BY score_value DESC;

-- Leads wanting backyard
SELECT
  first_name,
  last_name,
  budget,
  custom_fields->'property_preferences'->>'location' as location
FROM leads
WHERE
  source = 'CHATBOT'
  AND (custom_fields->>'has_backyard')::boolean = true;
```

### View hot leads (high engagement):

```sql
SELECT
  first_name,
  last_name,
  email,
  phone,
  budget,
  score,
  score_value,
  (custom_fields->'chatbot_engagement'->>'message_count')::int as message_count,
  array_length((custom_fields->'viewed_properties')::jsonb, 1) as properties_viewed,
  last_contact_at
FROM leads
WHERE
  source = 'CHATBOT'
  AND score IN ('HOT', 'QUALIFIED')
ORDER BY score_value DESC, last_contact_at DESC;
```

### View conversion funnel:

```sql
SELECT
  status,
  count(*) as leads_count,
  avg(score_value) as avg_score,
  avg((custom_fields->'chatbot_engagement'->>'message_count')::int) as avg_messages
FROM leads
WHERE source = 'CHATBOT'
GROUP BY status
ORDER BY
  CASE status
    WHEN 'NEW_LEAD' THEN 1
    WHEN 'WORKING' THEN 2
    WHEN 'QUALIFIED' THEN 3
    WHEN 'CONTACTED' THEN 4
  END;
```

### Export leads for agent assignment:

```sql
SELECT
  id,
  first_name || ' ' || last_name as full_name,
  email,
  phone,
  budget::numeric as budget_amount,
  custom_fields->'property_preferences'->>'location' as location,
  custom_fields->'property_preferences'->>'minBedrooms' as bedrooms,
  custom_fields->'property_preferences'->>'mustHaveFeatures' as must_haves,
  score,
  score_value,
  (custom_fields->'chatbot_engagement'->>'message_count')::int as messages,
  last_contact_at,
  notes
FROM leads
WHERE
  source = 'CHATBOT'
  AND status = 'QUALIFIED'
  AND assigned_to_id IS NULL
ORDER BY score_value DESC, last_contact_at DESC
LIMIT 50;
```

---

## 📈 Lead Scoring System

**How leads are scored (0-100 points):**

| Activity | Points |
|----------|--------|
| Each message sent | +5 |
| Contact info provided (email or phone) | +30 |
| Complete search criteria (location + budget) | +20 |
| Each property viewed | +10 |
| Budget ≥ $500k | +15 |

**Score Tiers:**
- **COLD** (0-24 points): Just started, minimal engagement
- **WARM** (25-49 points): Moderate engagement, some criteria provided
- **HOT** (50-79 points): High engagement, active searching
- **QUALIFIED** (80+ points): Ready for agent contact, has provided contact info

**Status Progression:**
- **NEW_LEAD**: Just started conversation
- **WORKING**: Has provided location + budget (can search)
- **QUALIFIED**: Has viewed properties
- **CONTACTED**: Agent has engaged or showing scheduled

---

## 🎯 Example Lead Journeys

### Journey 1: Quick Qualifier

```
Message 1: "Hi, I'm Sarah Johnson. I'm looking for homes in Austin."
→ NEW_LEAD, score: 5, no first_name/last_name yet

Message 2: "My budget is $800k and I need at least 4 bedrooms."
→ WORKING, score: 25 (5+5+20-5 boost), still no name extracted

Message 3: "My email is sarah.j@gmail.com"
→ QUALIFIED, score: 60 (25+5+30)
→ first_name: "Sarah", last_name: "Johnson", email: "sarah.j@gmail.com"

[Property search triggered, views 3 properties]
→ QUALIFIED, score: 90 (60+30 from 3 views)
→ viewed_properties: ["prop1", "prop2", "prop3"]
```

### Journey 2: Slow Browser

```
Message 1: "Looking for houses"
→ NEW_LEAD, score: 5

Message 2: "In Nashville"
→ NEW_LEAD, score: 10 (no budget yet)

Message 3: "Under $600k"
→ WORKING, score: 30 (10+5+20), can search now

Message 4: "3 bedrooms with a pool"
→ WORKING, score: 35
→ must_haves: ["pool"], has_pool: true

[Views 5 properties but doesn't provide contact info]
→ WORKING, score: 85 (35+50 from 5 views)
→ HOT lead but not QUALIFIED (no contact info)
```

---

## ✅ Testing Checklist

### Manual Test Conversation:

```bash
# Start chatbot
npm run dev

# Test conversation:
User: "Hi, I'm Billy Bob"
→ Check: first_name="Billy", last_name="Bob" extracted

User: "I'm looking for a 3 bedroom house in Nashville"
→ Check: location="Nashville", minBedrooms=3

User: "My budget is $500k and I need a pool and backyard"
→ Check: maxPrice=500000, mustHaveFeatures=["pool", "backyard"]
→ Check: Property search triggered

User: "My email is billy.bob@email.com"
→ Check: email captured, score boosted to QUALIFIED
```

### Database Verification Queries:

```sql
-- 1. Check if lead was created
SELECT * FROM leads
WHERE first_name = 'Billy'
ORDER BY created_at DESC
LIMIT 1;

-- 2. Check property preferences
SELECT
  first_name,
  last_name,
  custom_fields->'property_preferences'
FROM leads
WHERE first_name = 'Billy';

-- 3. Check activities logged
SELECT
  type,
  title,
  description,
  created_at
FROM activities
WHERE lead_id = (
  SELECT id FROM leads WHERE first_name = 'Billy' ORDER BY created_at DESC LIMIT 1
)
ORDER BY created_at;

-- 4. Check feature flags
SELECT
  first_name,
  last_name,
  (custom_fields->>'has_pool')::boolean as has_pool,
  (custom_fields->>'has_backyard')::boolean as has_backyard,
  (custom_fields->>'has_garage')::boolean as has_garage
FROM leads
WHERE first_name = 'Billy';
```

---

## 🚀 Deployment Steps

### Step 1: Update Database Schema
```bash
# Run SQL migration in Supabase
# (Copy SQL from Step 1 above)
```

### Step 2: Update Prisma Schema
```bash
cd ../shared
# Edit prisma/schema.prisma (add first_name, last_name)
npx prisma generate
```

### Step 3: Update Code Files
```bash
cd ../\(chatbot\)

# Update these files:
# 1. lib/ai/data-extraction.ts (add splitName function)
# 2. lib/services/crm-integration.ts (use first_name/last_name)

# Test locally
npm run dev
```

### Step 4: Test End-to-End
```bash
# Run test conversation (see Testing Checklist above)
# Verify data in Supabase
```

### Step 5: Deploy
```bash
git add .
git commit -m "Enhanced chatbot database integration with first/last names"
git push
# Deploy to Vercel
```

---

## 📞 Support & Troubleshooting

### Issue: Names not splitting correctly

**Problem:** "Billy Bob" becomes first_name="Billy Bob", last_name=null

**Solution:**
```typescript
// Check if AI extracted fullName instead of split names
// The splitName() function should handle this:

const { firstName, lastName } = splitName({
  fullName: "Billy Bob"
});
// Returns: { firstName: "Billy", lastName: "Bob" }
```

### Issue: Custom fields not saving

**Problem:** custom_fields is null in database

**Solution:**
```typescript
// Ensure you cast to 'any' for Prisma
custom_fields: customFields as any,

// Check Prisma schema has:
custom_fields   Json?         @db.JsonB
```

### Issue: Lead score not updating

**Problem:** Score stays at 5 even after providing info

**Solution:**
```typescript
// Verify calculateLeadScore() is being called
// Check that messageCount, hasContactInfo, etc. are correct

console.log({
  messageCount,
  hasContactInfo,
  hasCompleteCriteria,
  viewedPropertiesCount: viewedProperties.length,
  budget: propertyPreferences?.maxPrice
});
```

---

## 🎉 Success Metrics

After implementation, you should see:

✅ **Lead Creation:**
- Each chatbot conversation creates exactly 1 lead
- Lead is updated as conversation progresses (not duplicated)

✅ **Data Completeness:**
- First/last names properly separated
- Property preferences captured in detail
- Feature flags set correctly (has_pool, has_backyard, etc.)
- Engagement metrics tracked

✅ **Activity Logging:**
- 2 activities per property search (message + search)
- Property views tracked separately

✅ **Lead Scoring:**
- Scores increase as engagement grows
- Status progresses from NEW_LEAD → WORKING → QUALIFIED → CONTACTED

✅ **Agent Handoff:**
- QUALIFIED leads have complete info for agent follow-up
- Notes field has human-readable summary
- Contact info readily available

---

**You're all set! 🚀 The chatbot will now automatically capture and organize all lead information into your Supabase database.**
