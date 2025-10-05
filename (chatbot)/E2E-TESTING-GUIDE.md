# 🧪 End-to-End Testing Guide - Sai Real Estate Chatbot

**Version:** 1.0
**Date:** 2025-10-04
**Status:** Ready for Testing

---

## ✅ Implementation Status

All 5 implementation phases have been completed:

- ✅ **Phase 1:** Natural Conversation Engine (system prompt, AI data extraction, orchestrator)
- ✅ **Phase 2:** CRM Integration (lead sync, activity logging, scoring)
- ✅ **Phase 3:** Enhanced Property Search (matching algorithm, property cards)
- ✅ **Phase 4:** Conversational Intelligence (follow-ups, memory)
- ✅ **Phase 5:** Appointment & Agent Handoff (scheduling, routing)

**Dev Server:** Running at `http://localhost:3000`

---

## 🎯 Testing Objectives

Verify that Sai:
1. Converses naturally like a real estate agent (not form-like)
2. Extracts multiple data points from single messages
3. Automatically saves all data to CRM
4. Triggers property search with minimum criteria (location + budget)
5. Displays top 5 property matches with accurate scoring
6. Provides action buttons (View Photos, Schedule Tour)
7. Prevents question repetition
8. Hands off to human agents when needed

---

## 🧪 Test Scenarios

### Scenario 1: Happy Path - Natural Conversation Flow

**Goal:** Test the exact conversation flow requested by the user.

**Steps:**
1. Open `http://localhost:3000/full`
2. Start conversation

**Expected Conversation:**

```
User: "Hi, I am looking for houses!"

Sai: "Hi there! I'd love to help you find your perfect home! 🏡
What area are you looking in and what is your budget range?"

User: "Nashville, TN and $700,000"

Sai: "Nashville is an amazing city! Great choice! 😊
How many bedrooms and bathrooms are you looking for?"

User: "3 bed 2 bath with a pool"

Sai: "Perfect! Love it! So you're looking for:
- 📍 Nashville, TN
- 💰 Up to $700,000
- 🛏️ 3+ bedrooms
- 🛁 2+ bathrooms
- 🏊 Pool

What type of property are you interested in? (Single-family home, condo, townhouse, etc.)"

User: "single family home"

Sai: [Automatically triggers property search]
"Awesome! Let me find the best matches for you in Nashville... 🔍"

[Property cards display showing top 5 matches]
```

**Verify:**
- ✅ Sai sounds natural and enthusiastic (not robotic)
- ✅ Location AND budget extracted from single message "Nashville, TN and $700,000"
- ✅ Bedrooms, bathrooms, AND pool extracted from "3 bed 2 bath with a pool"
- ✅ Property search triggers automatically after property type is provided
- ✅ 5 property cards display with:
  - Match percentage badge (color-coded)
  - Property details (price, beds, baths, sqft)
  - Match reasons listed
  - "View Photos" and "Schedule Tour" buttons
  - Favorite (heart) button

---

### Scenario 2: Data Extraction Intelligence

**Goal:** Test AI's ability to extract multiple fields from complex messages.

**Test Cases:**

| User Message | Expected Extraction |
|-------------|-------------------|
| "I want a 4 bedroom house in Memphis with a backyard and garage for under $400k" | location: Memphis, maxPrice: 400000, minBedrooms: 4, features: [backyard, garage] |
| "Looking for condos in Franklin, $500k max, 2 bed 2 bath" | location: Franklin, maxPrice: 500000, minBedrooms: 2, minBathrooms: 2, propertyType: condo |
| "$1.2M budget, Brentwood area, must have pool and good schools" | location: Brentwood, maxPrice: 1200000, features: [pool, good schools] |
| "3BR/2BA single family under $350k anywhere in Nashville" | bedrooms: 3, bathrooms: 2, propertyType: single-family, maxPrice: 350000, location: Nashville |

**Verify:**
- ✅ All fields extracted correctly from single message
- ✅ Dollar shorthand converted ($400k → 400000, $1.2M → 1200000)
- ✅ No repeated questions for already-provided info

---

### Scenario 3: CRM Integration

**Goal:** Verify all conversation data saves to CRM automatically.

**Steps:**
1. Complete a conversation with Sai (use Scenario 1)
2. Open platform at `http://localhost:3001` (if running)
3. Navigate to CRM → Leads
4. Find the lead created from chatbot session

**Verify in Database/Platform:**
- ✅ Lead record created with chatbot session ID
- ✅ Contact info saved (if provided - name, email, phone)
- ✅ Property preferences stored in `custom_fields`:
  ```json
  {
    "property_preferences": {
      "location": "Nashville, TN",
      "maxPrice": 700000,
      "minBedrooms": 3,
      "minBathrooms": 2,
      "mustHaveFeatures": ["pool"],
      "propertyType": "single-family"
    }
  }
  ```
- ✅ Lead score calculated correctly:
  - COLD (0-24 points): Just started, minimal engagement
  - WARM (25-49 points): Provided some preferences
  - HOT (50-79 points): Provided full criteria, viewed properties
  - QUALIFIED (80+ points): Complete info + contact details + multiple interactions
- ✅ Activities logged:
  - "Chatbot conversation: [message snippet]"
  - "Property search performed: Nashville, TN"
  - If applicable: "Showing requested for [address]"

**Manual CRM Check (Prisma Studio):**
```bash
npx prisma studio --schema=../shared/prisma/schema.prisma
```

Look for:
- **Table:** `leads`
  - Check `custom_fields` JSON contains chatbot data
  - Check `score` and `score_value` are accurate
  - Check `status` progresses (NEW → CONTACTED → QUALIFIED)

- **Table:** `activities`
  - Check activities created for each message
  - Check property search activities exist

---

### Scenario 4: Property Matching Algorithm

**Goal:** Test the 11-category scoring system (max ~200 points).

**Setup:**
Use search criteria: Nashville, $500k, 3 bed, 2 bath, pool

**Expected Match Scoring:**

**High Match (90%+ = 180+ points):**
- Price: $450k (10% under budget) → +35 points
- Bedrooms: 4 (1 extra bedroom) → +30 points
- Bathrooms: 2.5 (extra half bath) → +25 points
- Pool: Has pool → +15 points
- Just listed (2 days old) → +15 points
- Great schools (8/10) → +10 points
- Large backyard → +10 points
- Total: ~140+ points = 70%+ match

**Medium Match (75-89% = 150-179 points):**
- Price: $490k (2% under budget) → +25 points
- Bedrooms: 3 (exactly as requested) → +25 points
- Bathrooms: 2 (exactly as requested) → +20 points
- No pool → -10 points penalty
- Older listing (30 days) → +5 points
- Average schools (6/10) → +5 points
- Total: ~70+ points = 35%+ match

**Low Match (60-74% = 120-149 points):**
- Price: $510k (2% over budget) → +15 points
- Bedrooms: 2 (less than requested) → +10 points
- Bathrooms: 1 (less than requested) → +5 points
- Has pool → +15 points
- Total: ~45+ points = 22%+ match

**Verify:**
- ✅ Properties sorted by match score (highest first)
- ✅ Match percentage displayed on card
- ✅ Badge color: Green (90%+), Blue (75%+), Yellow (60%+)
- ✅ Match reasons listed ("Great value", "Pool", "Just listed!")
- ✅ Missing features shown if applicable

---

### Scenario 5: Conversation Memory

**Goal:** Ensure Sai doesn't repeat questions.

**Steps:**
1. Start conversation: "I'm looking for houses in Nashville"
2. Sai should respond about budget (NOT about location again)
3. User: "What was my budget again?"
4. Sai should NOT ask about location (already knows Nashville)

**Test Question Repetition Prevention:**

```
User: "I'm looking in Nashville for $700k"
Sai: "Perfect! How many bedrooms?"

User: "Actually, can we talk about something else first?"
Sai: [Handles deviation]

User: "Okay, back to houses. What were we talking about?"
Sai: "We were discussing bedrooms! You're looking in Nashville with a $700k budget..."
```

**Verify:**
- ✅ Sai remembers location (Nashville)
- ✅ Sai remembers budget ($700k)
- ✅ Doesn't re-ask for already provided info
- ✅ Can reference previous conversation context

---

### Scenario 6: Minimum Search Criteria

**Goal:** Verify search triggers with just location + budget.

**Test Case 1: Immediate Search**
```
User: "Show me homes in Franklin for $600k"
Expected: Property search triggers immediately with defaults:
- location: Franklin
- maxPrice: 600000
- minBedrooms: 2 (default)
- minBathrooms: 1 (default)
```

**Test Case 2: Delayed Search**
```
User: "I'm looking in Brentwood"
Sai: "What's your budget?"
User: "$800k"
Sai: [Triggers search with location + budget + defaults]
```

**Verify:**
- ✅ Search triggers with only location + budget
- ✅ Smart defaults applied (2 bed, 1 bath)
- ✅ No errors if bedrooms/bathrooms not specified
- ✅ Property results display correctly

---

### Scenario 7: Property Card Actions

**Goal:** Test all property card interaction buttons.

**For Each Property Card:**

**Action 1: View Photos**
- Click "📸 Photos" button
- ✅ Photo gallery modal opens
- ✅ Images display correctly
- ✅ Navigation arrows work (if multiple photos)
- ✅ Image counter shows (e.g., "1 / 5")
- ✅ Close button works

**Action 2: Favorite Property**
- Click heart icon
- ✅ Heart fills with red color
- ✅ Property saved to favorites
- ✅ Click again to unfavorite

**Action 3: Schedule Tour**
- Click "📅 Schedule Tour" button
- ✅ Triggers showing request
- ✅ Creates appointment in `appointments` table
- ✅ Agent assigned
- ✅ Confirmation message displays

**Action 4: View Details** (if implemented)
- Click "ℹ️ Details" button
- ✅ Additional property details display

**Action 5: Share** (if implemented)
- Click "🔗 Share" button
- ✅ Share functionality works

---

### Scenario 8: Agent Handoff

**Goal:** Test automatic and manual agent handoff.

**Test Case 1: User Frustration**
```
User: "I want to speak to a person"
or
User: "This isn't helpful"
or
User: "Can I talk to a real agent?"

Expected: Auto-handoff triggers
```

**Test Case 2: Complex Question**
```
User: "What are the closing costs for a $500k home in Tennessee?"
or
User: "Can you explain the mortgage pre-approval process?"

Expected: Auto-handoff triggers (complex_question)
```

**Test Case 3: High-Value Lead**
```
User provides:
- Complete preferences
- Views 3+ properties
- High engagement (10+ messages)

Expected: Auto-handoff suggestion
```

**Verify:**
- ✅ Handoff triggered correctly
- ✅ Best agent selected (by location expertise or round-robin)
- ✅ Activity created in `activities` table:
  - Type: CALL
  - Title: "Chatbot Handoff: [reason]"
  - Description: Full conversation transcript + lead summary
- ✅ Lead status updated to CONTACTED
- ✅ Lead assigned to agent (`assigned_to_id`)
- ✅ Confirmation message shows:
  - Agent name
  - Agent contact info
  - Estimated response time

---

### Scenario 9: Follow-Up Questions

**Goal:** Verify context-aware follow-up generation.

**Conversation Stages:**

**Discovery Stage (first 2 messages):**
- Expected questions: "What's bringing you to the market?", "How soon are you hoping to move?"

**Qualifying Stage (missing location or budget):**
- Expected questions: "What area are you looking in?", "What's your maximum budget?"

**Search Results Stage (just showed properties):**
- Expected questions: "Which of these homes catches your eye?", "Would you like to schedule showings?"

**Post-Search Stage (after viewing results):**
- Expected questions: "Were any of these close to what you're looking for?", "Should I search with different criteria?"

**Closing Stage (has all info, ready for action):**
- Expected questions: "Would you like to schedule a showing?", "What's the best way to reach you?"

**Verify:**
- ✅ Follow-up questions match conversation stage
- ✅ Questions feel natural and conversational
- ✅ Don't ask for already-collected information
- ✅ Move conversation forward

---

### Scenario 10: Error Handling

**Goal:** Test graceful degradation.

**Test Case 1: RentCast API Error**
```
Simulate: RentCast API down or rate limited
Expected: Fallback message, doesn't crash
```

**Test Case 2: Missing Environment Variables**
```
Test without: GROQ_API_KEY or RENTCAST_API_KEY
Expected: Graceful error message
```

**Test Case 3: Database Connection Error**
```
Simulate: Supabase unreachable
Expected: Chatbot works, CRM sync fails silently with console error
```

**Test Case 4: Invalid User Input**
```
User: "asdfkjasldkfj" (gibberish)
Expected: Sai asks clarifying question, doesn't break
```

**Verify:**
- ✅ No crashes or white screens
- ✅ User-friendly error messages
- ✅ Fallback behavior works
- ✅ Errors logged to console (not exposed to user)

---

## 📊 Performance Benchmarks

**Target Metrics:**

- **First Token:** < 500ms (time to first AI response token)
- **Token Rate:** > 50 tokens/second (streaming speed)
- **Vector Search:** < 100ms (RAG similarity search)
- **Property Search:** < 2s (RentCast API + matching)
- **Overall Response:** < 3s (end-to-end chat response)

**How to Test:**
1. Open browser DevTools → Network tab
2. Send message to chatbot
3. Check timing waterfall for:
   - `/api/chat` request duration
   - Time to first byte (TTFB)
   - Time to first token streaming

**Verify:**
- ✅ Responses stream smoothly (not waiting for full response)
- ✅ No lag or freezing
- ✅ Property cards load within 2 seconds

---

## 🔧 Debugging Tools

### Console Logging

Key console outputs to check:

```
✅ Extracted data: { location: 'Nashville', maxPrice: 700000, ... }
✅ Lead synced to CRM: lead-id-123 (NEW → HOT)
✅ Property search triggered: 5 matches found
✅ Agent handoff initiated: agent-id-456
❌ [Error messages should be clear and actionable]
```

### Prisma Studio

```bash
cd (chatbot)
npx prisma studio --schema=../shared/prisma/schema.prisma
```

**Tables to inspect:**
- `leads` - All chatbot-generated leads
- `activities` - Conversation logs
- `appointments` - Scheduled showings
- `chatbot_knowledge` - RAG knowledge base (if using)

### Network Inspection

**Key endpoints:**
- `POST /api/chat` - Main chat endpoint
  - Check request body (messages, sessionId, organizationId)
  - Check response streaming (SSE format)
  - Check `property_results` events

- `GET /api/properties` (if exists) - Property search
  - Check RentCast integration

### Session State Cache

**In-memory cache (dev):**
```javascript
// In app/api/chat/route.ts
console.log('Current session state:', sessionStateCache.get(sessionId));
```

---

## ✅ Acceptance Criteria

**Conversation Flow:**
- ✅ Sai sounds natural, enthusiastic, friendly (not robotic)
- ✅ Never feels like filling out a form
- ✅ Extracts multiple fields from single message
- ✅ Doesn't repeat questions
- ✅ Uses smart defaults when info missing

**Data Extraction:**
- ✅ Handles: "Nashville and $700k" → extracts both
- ✅ Handles: "3 bed 2 bath with pool" → extracts all three
- ✅ Converts: "$500k" → 500000, "$1.2M" → 1200000
- ✅ Detects property types: single-family, condo, townhouse

**CRM Integration:**
- ✅ Lead created automatically on first message
- ✅ All preferences saved to `custom_fields`
- ✅ Lead score updates correctly
- ✅ Activities logged for each interaction
- ✅ Lead status progresses (NEW → WARM → HOT → QUALIFIED)

**Property Search:**
- ✅ Triggers with minimum criteria (location + budget)
- ✅ Applies smart defaults (2 bed, 1 bath if not specified)
- ✅ Returns top 5 matches sorted by score
- ✅ Match percentage accurate (based on ~200 point max)
- ✅ Match reasons listed clearly

**Property Cards:**
- ✅ Match badge color-coded (green/blue/yellow)
- ✅ All property details display correctly
- ✅ "View Photos" opens gallery modal
- ✅ "Schedule Tour" creates appointment
- ✅ Favorite button works
- ✅ No visual regressions (styling intact)

**Conversation Memory:**
- ✅ Remembers previous answers
- ✅ Never asks same question twice
- ✅ Can reference earlier conversation context

**Agent Handoff:**
- ✅ Auto-triggers on frustration keywords
- ✅ Auto-triggers on complex questions
- ✅ Finds best agent (location expertise → round-robin)
- ✅ Creates handoff activity with transcript
- ✅ Updates lead status to CONTACTED
- ✅ Shows agent info to user

---

## 🐛 Known Issues / Future Enhancements

### Current Limitations:
1. Session state stored in-memory (resets on server restart)
   - **Fix:** Migrate to Redis for production
2. Property images from Unsplash (demo data)
   - **Fix:** Integrate real RentCast images
3. No real-time updates (requires page refresh)
   - **Fix:** Add WebSocket or SSE for live updates

### Future Enhancements (from Phase 3 roadmap):
- Voice input/output
- Video property tours
- Market analytics dashboard
- Mortgage calculator integration
- Neighborhood comparison tool
- School district ratings
- Crime statistics overlay
- Commute time calculator

---

## 📝 Testing Checklist

Print this and check off as you test:

- [ ] **Scenario 1:** Happy path conversation (Nashville $700k example)
- [ ] **Scenario 2:** Multi-field extraction from single messages
- [ ] **Scenario 3:** CRM data verification (Prisma Studio)
- [ ] **Scenario 4:** Property match scoring accuracy
- [ ] **Scenario 5:** Question repetition prevention
- [ ] **Scenario 6:** Minimum criteria search trigger
- [ ] **Scenario 7:** All property card buttons work
- [ ] **Scenario 8:** Agent handoff triggers
- [ ] **Scenario 9:** Follow-up questions are contextual
- [ ] **Scenario 10:** Error handling (no crashes)
- [ ] **Performance:** All responses < 3s
- [ ] **Visual:** No style regressions (DO NOT CHANGE VISUALS)

---

## 🚀 Next Steps After Testing

1. **Report Bugs:** Document any issues found
2. **Provide Feedback:** Note any UX improvements needed
3. **Production Prep:**
   - [ ] Replace in-memory cache with Redis
   - [ ] Add environment variable validation
   - [ ] Set up error monitoring (Sentry)
   - [ ] Configure rate limiting
   - [ ] Add usage analytics
4. **Phase 3 Features:** Implement voice I/O, analytics, etc.

---

**Testing Started:** _____________
**Testing Completed:** _____________
**Test Result:** ⭐ PASS / ❌ FAIL
**Notes:**

---

**End of Testing Guide**
