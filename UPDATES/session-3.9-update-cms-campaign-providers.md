# Session 3.9: Update CMS Campaign Providers

**Phase:** 3 - Full Feature Set
**Priority:** 🟡 MEDIUM
**Estimated Time:** 1.5 hours
**Agent:** `strive-agent-universal`

---

## 🎯 OBJECTIVE

Replace mock data with Prisma queries in CMS Campaigns module and link to existing `content` table.

---

## 📋 TASK (CONDENSED)

**Files to Update:**
- `lib/modules/content/campaigns/queries.ts`
- `lib/modules/content/campaigns/actions.ts`

**Pattern:**
```typescript
// ❌ OLD:
const campaigns = mockCampaignProvider.findMany();

// ✅ NEW:
const campaigns = await prisma.campaigns.findMany({
  where: { organization_id: organizationId },
  include: {
    email_campaigns: true,
    social_media_posts: true,
    campaign_content: {
      include: { content: true }
    }
  }
});
```

**Requirements:**
- Remove all mock conditionals
- Link campaigns to existing `content` table via `campaign_content` junction
- Add `organizationId` filtering
- Implement email scheduling
- Implement social post scheduling
- Add campaign performance tracking
- Test campaign creation and content linking

**DO NOT report success unless:**
- All mock code removed
- Campaign ↔ Content relationships functional
- Scheduling works
- Multi-tenancy enforced
- Tests passing

---

**Next:** Session 3.10 - Comprehensive Testing
