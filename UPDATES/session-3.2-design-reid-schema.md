# Session 3.2: Design REID Analytics Schema

**Phase:** 3 - Full Feature Set
**Priority:** 🟡 MEDIUM
**Estimated Time:** 2 hours
**Agent:** `strive-agent-universal`

---

## 🎯 OBJECTIVE

Design REID (Real Estate Intelligence Dashboard) analytics schema with 7 models for market data, demographics, schools, ROI simulations, alerts, reports, and AI profiles.

---

## 📋 TASK (CONDENSED)

**Design 7 Models:**

1. **reid_market_data** - Market trends, pricing, inventory levels by region
2. **reid_demographics** - Population, income, age distribution by area
3. **reid_schools** - School ratings, test scores, proximity data
4. **reid_roi_simulations** - Investment ROI calculator results and scenarios
5. **reid_alerts** - Market condition alerts and price change notifications
6. **reid_reports** - Generated market analysis reports (PDF/export)
7. **reid_ai_profiles** - AI-generated property/neighborhood profiles

**Key Requirements:**
- All models filter by `organization_id` (multi-tenancy)
- Geographic indexing (zip_code, city, state, county)
- Time-series data support (market trends over time)
- External API integration fields (MLS, census data sources)
- JSON fields for complex nested data
- Subscription tier gating (GROWTH+ required for advanced analytics)

**Reference Patterns:**
- Read `prisma/SCHEMA-MODELS.md` for field naming conventions
- Match existing analytics table patterns
- Use PostGIS for geospatial queries (if available)

**Output:** Complete schema design document ready for implementation in Session 3.5

**DO NOT implement - design only**

---

## 📊 SUCCESS CRITERIA

✅ **Complete when:**
- 7 models fully designed with fields, types, relationships
- Geographic search indexes defined
- Multi-tenancy RLS requirements specified
- External data source integration planned
- Design validated against existing patterns

---

**Next:** Session 3.3 - Design Expense-Tax Schema
