# 📘 CRM Activity Feed AI - API Quick Reference

## 🔗 Base URL
```
https://your-n8n-instance.app.n8n.cloud
```

---

## 📨 API Endpoints

### 1. Create Activity
**POST** `/webhook/activity-stream`

Records a new client activity and triggers AI analysis.

**Headers:**
```http
Content-Type: application/json
```

**Request Body:**
```json
{
  "organization_id": "uuid",          // REQUIRED
  "client_id": "uuid",                // REQUIRED
  "type": "string",                   // REQUIRED: email|phone|sms|meeting|web_visit|property_view|social_message|form_submission|chat_message
  "channel": "string",                // REQUIRED: email|phone|sms|meeting|web|social|chat|in_person
  "direction": "string",              // REQUIRED: inbound|outbound
  "content": "string",                // REQUIRED: Activity content/message
  "agent_id": "uuid",                 // OPTIONAL: Agent handling this activity
  "timestamp": "ISO 8601",            // OPTIONAL: Defaults to NOW()
  "weight": 1.0,                      // OPTIONAL: Importance weight (0.0-2.0)
  "property_ids": ["uuid"],           // OPTIONAL: Related property IDs
  "related_activity_id": "uuid",      // OPTIONAL: Parent activity if follow-up
  "metadata": {}                      // OPTIONAL: Additional metadata
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "activity_id": "550e8400-e29b-41d4-a716-446655440000",
  "message": "Activity processed and stored successfully",
  "insights": {
    "sentiment": "positive",          // negative|neutral|positive
    "urgency": 4,                     // 1-5 scale
    "intent": "property_search"       // AI-detected intent
  }
}
```

**Response (400 Bad Request):**
```json
{
  "success": false,
  "error": "Missing required fields: client_id",
  "message": "Failed to process activity. Please try again."
}
```

**cURL Example:**
```bash
curl -X POST https://your-n8n.app.n8n.cloud/webhook/activity-stream \
  -H "Content-Type: application/json" \
  -d '{
    "organization_id": "123e4567-e89b-12d3-a456-426614174000",
    "client_id": "223e4567-e89b-12d3-a456-426614174001",
    "type": "email",
    "channel": "email",
    "direction": "inbound",
    "content": "I am looking for a 3-bedroom house in downtown",
    "agent_id": "323e4567-e89b-12d3-a456-426614174002"
  }'
```

---

### 2. Get Activity Feed
**POST** `/webhook/activity-feed`

Retrieves comprehensive activity feed with AI insights for a client.

**Request Body:**
```json
{
  "organization_id": "uuid",          // REQUIRED
  "client_id": "uuid",                // REQUIRED
  "limit": 100,                       // OPTIONAL: Max activities to return (default: 100)
  "include_archived": false,          // OPTIONAL: Include archived activities
  "date_from": "ISO 8601",            // OPTIONAL: Filter from date
  "date_to": "ISO 8601"               // OPTIONAL: Filter to date
}
```

**Response (200 OK):**
```json
{
  "client": {
    "client_id": "uuid",
    "organization_id": "uuid",
    "engagement_score": 75,           // 0-100
    "relationship_stage": "active",   // new|exploring|active|committed|closed|dormant
    "churn_risk": "low",              // low|medium|high
    "lifetime_value": 125000.00
  },
  "activities": [
    {
      "id": "uuid",
      "timestamp": "2025-10-11T03:00:00Z",
      "type": "email",
      "channel": "email",
      "direction": "inbound",
      "summary": "Client inquiring about properties...",
      "sentiment": "positive",
      "urgency": 4,
      "intent": "property_search",
      "topics": ["downtown", "3-bedroom", "budget"]
    }
  ],
  "insights": {
    "engagement_score": 75,
    "relationship_strength": 7.5,
    "stage": "active",
    "churn_risk": "low",
    "opportunity_score": 85,
    "preferred_channel": "email",
    "best_contact_time": "10:00:00",
    "interests": [
      {
        "type": "property",
        "criteria": {
          "bedrooms": 3,
          "location": "downtown",
          "budget": 500000
        },
        "confidence": 0.9
      }
    ],
    "behavioral_profile": {
      "communication_style": "professional",
      "decision_speed": "moderate",
      "response_pattern": "weekday_mornings"
    }
  },
  "recommendations": [
    {
      "action": "Send curated property list matching 3BR downtown criteria",
      "priority": "high",
      "confidence": 0.85,
      "expectedOutcome": "Increased engagement and property viewings",
      "suggestedTime": "2025-10-11T10:00:00Z",
      "suggestedChannel": "email",
      "rationale": "High urgency inquiry with specific, actionable criteria"
    }
  ],
  "opportunities": [
    {
      "id": "uuid",
      "type": "relocation",
      "confidence": 0.87,
      "trigger": "Expressed urgent timeline (3 months)",
      "action": "Schedule in-person consultation",
      "estimated_value": 15000.00,
      "score": 92,
      "priority": "high",
      "status": "identified"
    }
  ],
  "metadata": {
    "generated_at": "2025-10-11T03:15:00Z",
    "activity_count": 15,
    "opportunity_count": 2,
    "pattern_count": 5,
    "response_time_ms": 847
  }
}
```

**JavaScript Example:**
```javascript
const response = await fetch('https://your-n8n.app.n8n.cloud/webhook/activity-feed', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    organization_id: '123e4567-e89b-12d3-a456-426614174000',
    client_id: '223e4567-e89b-12d3-a456-426614174001',
    limit: 50
  })
});

const feed = await response.json();
console.log(`Engagement Score: ${feed.client.engagement_score}`);
console.log(`Activities: ${feed.activities.length}`);
console.log(`Opportunities: ${feed.opportunities.length}`);
```

---

## 📊 Data Models

### Activity Types
```typescript
type ActivityType = 
  | 'email'
  | 'phone'
  | 'sms'
  | 'meeting'
  | 'web_visit'
  | 'property_view'
  | 'social_message'
  | 'form_submission'
  | 'chat_message';
```

### Channels
```typescript
type Channel = 
  | 'email'
  | 'phone'
  | 'sms'
  | 'meeting'
  | 'web'
  | 'social'
  | 'chat'
  | 'in_person';
```

### Client Stages
```typescript
type ClientStage = 
  | 'new'          // First contact
  | 'exploring'    // Browsing/researching
  | 'active'       // Engaged in process
  | 'committed'    // Ready to transact
  | 'closed'       // Transaction complete
  | 'dormant';     // Inactive
```

### Opportunity Types
```typescript
type OpportunityType = 
  | 'relocation'          // Moving to new area
  | 'upgrade'             // Larger/better property
  | 'investment'          // Investment property
  | 'referral'            // Refer friends/family
  | 'seasonal_urgency'    // Market timing opportunity
  | 'equity_opportunity'; // Leverage home equity
```

---

## 🎯 Common Use Cases

### Use Case 1: Track Email Conversation
```javascript
// When client sends email
await createActivity({
  organization_id: orgId,
  client_id: clientId,
  type: 'email',
  channel: 'email',
  direction: 'inbound',
  content: emailBody,
  metadata: {
    subject: emailSubject,
    from: emailFrom,
    to: emailTo,
    received_at: emailDate
  }
});

// When agent replies
await createActivity({
  organization_id: orgId,
  client_id: clientId,
  type: 'email',
  channel: 'email',
  direction: 'outbound',
  content: replyBody,
  agent_id: agentId,
  related_activity_id: originalEmailActivityId,
  metadata: {
    subject: replySubject,
    sent_at: new Date().toISOString()
  }
});
```

### Use Case 2: Property Viewing Tracking
```javascript
// When client views property on website
await createActivity({
  organization_id: orgId,
  client_id: clientId,
  type: 'property_view',
  channel: 'web',
  direction: 'inbound',
  content: `Viewed property: ${propertyAddress}`,
  property_ids: [propertyId],
  weight: 1.5, // Higher weight for property views
  metadata: {
    property_id: propertyId,
    property_address: propertyAddress,
    property_price: propertyPrice,
    view_duration_seconds: 145,
    photos_viewed: 12
  }
});
```

### Use Case 3: Phone Call Logging
```javascript
// After phone call ends
await createActivity({
  organization_id: orgId,
  client_id: clientId,
  type: 'phone',
  channel: 'phone',
  direction: callDirection, // 'inbound' or 'outbound'
  content: callSummary,
  agent_id: agentId,
  weight: 2.0, // Phone calls are high-value interactions
  metadata: {
    call_duration_seconds: callDuration,
    call_recording_url: recordingUrl,
    phone_number: clientPhone,
    call_outcome: 'scheduled_viewing' // or 'voicemail', 'no_answer', etc.
  }
});
```

### Use Case 4: Social Media Engagement
```javascript
// When client interacts on social media
await createActivity({
  organization_id: orgId,
  client_id: clientId,
  type: 'social_message',
  channel: 'social',
  direction: 'inbound',
  content: messageContent,
  metadata: {
    platform: 'instagram', // or 'facebook', 'linkedin'
    post_id: postId,
    engagement_type: 'comment', // or 'like', 'share', 'dm'
    public_profile_url: profileUrl
  }
});
```

---

## 🔄 Webhook Integration Pattern

### Real-time Activity Streaming

```javascript
// Next.js API Route
export async function POST(req) {
  const activity = await req.json();
  
  // Validate and enrich
  const enrichedActivity = {
    ...activity,
    organization_id: await getOrgIdFromAuth(req),
    timestamp: new Date().toISOString(),
    metadata: {
      ...activity.metadata,
      source: 'web_app',
      ip_address: req.headers['x-forwarded-for']
    }
  };
  
  // Send to N8n workflow
  const result = await fetch(
    process.env.N8N_ACTIVITY_WEBHOOK_URL,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(enrichedActivity)
    }
  );
  
  return Response.json(await result.json());
}
```

---

## 📈 Performance Tips

### 1. Batch Activity Creation
For high-volume systems, consider batching:
```javascript
// Instead of sending activities one-by-one
activities.forEach(a => createActivity(a)); // ❌ Slow

// Batch them
await Promise.all(
  activities.map(a => createActivity(a))
); // ✅ Faster
```

### 2. Cache Activity Feeds
```javascript
// Use Redis or similar for caching
const cacheKey = `feed:${orgId}:${clientId}`;
let feed = await redis.get(cacheKey);

if (!feed) {
  feed = await fetchActivityFeed(orgId, clientId);
  await redis.setex(cacheKey, 300, JSON.stringify(feed)); // 5 min cache
}
```

### 3. Optimize Polling
```javascript
// Instead of polling every second
setInterval(fetchFeed, 1000); // ❌ Too frequent

// Poll based on user activity
const pollInterval = userIsActive ? 30000 : 300000; // 30s or 5min
setInterval(fetchFeed, pollInterval); // ✅ Adaptive
```

---

## 🐛 Error Handling

### Retry Logic
```javascript
async function createActivityWithRetry(activity, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await createActivity(activity);
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      
      // Exponential backoff
      await new Promise(r => setTimeout(r, 1000 * Math.pow(2, i)));
    }
  }
}
```

### Error Types
```typescript
interface ActivityError {
  code: string;
  message: string;
  details?: any;
}

// Error codes
const ERROR_CODES = {
  MISSING_FIELDS: 'MISSING_REQUIRED_FIELDS',
  INVALID_ORG: 'INVALID_ORGANIZATION_ID',
  INVALID_TYPE: 'INVALID_ACTIVITY_TYPE',
  AI_FAILURE: 'AI_ANALYSIS_FAILED',
  DATABASE_ERROR: 'DATABASE_CONNECTION_ERROR',
  RATE_LIMIT: 'RATE_LIMIT_EXCEEDED'
};
```

---

## 🎨 UI Component Examples

### Activity Timeline Component
```typescript
import { useActivityFeed } from '@/hooks/useActivityFeed';

export function ActivityTimeline({ clientId, organizationId }) {
  const { feed, loading, error } = useActivityFeed(clientId, organizationId);
  
  if (loading) return <Skeleton />;
  if (error) return <ErrorAlert error={error} />;
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2>Activity Timeline</h2>
        <Badge variant={feed.client.churn_risk}>
          {feed.client.churn_risk} churn risk
        </Badge>
      </div>
      
      <div className="space-y-2">
        {feed.activities.map(activity => (
          <ActivityCard key={activity.id} activity={activity} />
        ))}
      </div>
      
      {feed.recommendations.length > 0 && (
        <RecommendationsPanel recommendations={feed.recommendations} />
      )}
    </div>
  );
}
```

---

## 📞 Support

- **Documentation Issues:** Check N8n execution logs
- **API Errors:** Verify request payload matches schema
- **Performance Issues:** Review database indexes and query performance
- **AI Quality Issues:** Adjust Gemini prompts in workflow nodes

**Ready to integrate? Start with the Activity Stream endpoint and gradually add more features!** 🚀