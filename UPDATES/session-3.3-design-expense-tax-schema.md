# Session 3.3: Design Expense-Tax Schema

**Phase:** 3 - Full Feature Set
**Priority:** 🟡 MEDIUM
**Estimated Time:** 1.5 hours
**Agent:** `strive-agent-universal`

---

## 🎯 OBJECTIVE

Design Expense & Tax module schema with 5 models for expense tracking, categorization, tax calculations, reporting, and receipt management.

---

## 📋 TASK (CONDENSED)

**Design 5 Models:**

1. **expenses** - Expense records with amount, date, category, description
2. **expense_categories** - Predefined + custom categories (mileage, meals, office, marketing, etc.)
3. **tax_estimates** - Quarterly/annual tax estimates and calculations
4. **tax_reports** - Generated tax reports (1099, Schedule C, etc.)
5. **receipts** - Receipt uploads with OCR text extraction and storage URLs

**Key Requirements:**
- All models filter by `organization_id` (multi-tenancy)
- Receipts stored in Supabase Storage with RLS
- Integration with QuickBooks API (fields for external sync)
- Tax year tracking (fiscal year support)
- Mileage tracking (start/end locations, distance)
- Deduction categories (IRS-compliant)
- Receipt OCR data (JSON field for extracted text)

**Relationships:**
- Expense → Category (many-to-one)
- Expense → Receipt (one-to-many)
- Tax Estimate → Expenses (aggregation)
- Tax Report → Expenses (period-based)

**Output:** Complete schema design document

**DO NOT implement - design only**

---

## 📊 SUCCESS CRITERIA

✅ **Complete when:**
- 5 models fully designed
- QuickBooks integration fields included
- Receipt storage strategy defined
- Tax compliance requirements met
- Multi-tenancy RLS specified

---

**Next:** Session 3.4 - Design CMS Campaigns Schema
