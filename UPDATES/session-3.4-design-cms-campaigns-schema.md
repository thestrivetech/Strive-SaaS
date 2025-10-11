# Session 3.4: Design CMS Campaigns Schema

**Phase:** 3 - Full Feature Set
**Priority:** 🟡 MEDIUM
**Estimated Time:** 1.5 hours
**Agent:** `strive-agent-universal`

---

## 🎯 OBJECTIVE

Design CMS Campaigns module schema with 4 models for campaign management, email campaigns, social media posts, and content linking.

**Note:** `content` table already exists - just need relationships

---

## 📋 TASK (CONDENSED)

**Design 4 Models:**

1. **campaigns** - Campaign metadata (name, start/end dates, status, goals, budget)
2. **email_campaigns** - Email-specific campaigns (subject, body, recipients, send schedule)
3. **social_media_posts** - Social posts (platform, post text, media URLs, publish time)
4. **campaign_content** - Junction table linking campaigns to existing `content` items

**Key Requirements:**
- All models filter by `organization_id` (multi-tenancy)
- Link to existing `content` table (many-to-many via junction)
- Email integration (SMTP config, templates)
- Social media platform support (Facebook, Instagram, LinkedIn, Twitter/X)
- Scheduling system (future publish dates)
- Performance metrics (opens, clicks, engagement)
- Campaign types: EMAIL, SOCIAL, MIXED
- Campaign status: DRAFT, SCHEDULED, ACTIVE, COMPLETED, ARCHIVED

**Relationships:**
- Campaign → Email Campaigns (one-to-many)
- Campaign → Social Posts (one-to-many)
- Campaign ↔ Content (many-to-many via campaign_content)
- Organization → Campaigns (one-to-many)

**Output:** Complete schema design document

**DO NOT implement - design only**

---

## 📊 SUCCESS CRITERIA

✅ **Complete when:**
- 4 models fully designed
- Relationships to existing `content` table defined
- Email and social platform fields included
- Scheduling and metrics tracking planned
- Multi-tenancy RLS specified

---

**Next:** Session 3.5 - Implement All Schemas + Migrations
