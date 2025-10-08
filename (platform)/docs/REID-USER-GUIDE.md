# REID Dashboard User Guide

**Real Estate Intelligence Dashboard**
**Version:** 1.0
**Last Updated:** 2025-10-07

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Dashboard Overview](#dashboard-overview)
3. [Market Heatmap](#market-heatmap)
4. [Demographics Analysis](#demographics-analysis)
5. [Market Trends](#market-trends)
6. [ROI Simulator](#roi-simulator)
7. [AI-Powered Profiles](#ai-powered-profiles-elite-only)
8. [Property Alerts](#property-alerts)
9. [Market Reports](#market-reports)
10. [User Preferences](#user-preferences)
11. [FAQ](#faq)

---

## Getting Started

### Who Can Access REID?

The REID Dashboard is available to users with:
- **Subscription Tier:** GROWTH or ELITE
- **Organization Role:** OWNER, ADMIN, or MEMBER
- **Global Role:** ADMIN, MODERATOR, or EMPLOYEE

### Accessing REID

1. Log in to your Strive account at [app.strivetech.ai](https://app.strivetech.ai)
2. From the sidebar navigation, click **Real Estate** → **REI Analytics**
3. The REID Dashboard will load with all available modules

### Subscription Tier Differences

| Feature | GROWTH Tier | ELITE Tier |
|---------|-------------|------------|
| Market Heatmap | ✅ Basic | ✅ Advanced |
| Demographics | ✅ Yes | ✅ Yes |
| Trends Analysis | ✅ Yes | ✅ Yes |
| ROI Simulator | ✅ Yes | ✅ Yes |
| Property Alerts | ✅ 10 max | ✅ Unlimited |
| Market Reports | ✅ 5/month | ✅ Unlimited |
| AI Profiles | ❌ No | ✅ Yes |
| Neighborhood Insights | ✅ 50 max | ✅ Unlimited |

**Upgrade to Elite:** Go to Settings → Billing to unlock all features.

---

## Dashboard Overview

The REID Dashboard consists of 8 core modules arranged in a data-dense, dark-themed layout:

```
┌─────────────────────────────────────────────────┐
│  REID Dashboard Header                          │
├──────────────────┬──────────────┬───────────────┤
│ Market Heatmap   │ Schools &    │ AI Profiles   │
│ (Large)          │ Amenities    │ (Elite)       │
│                  ├──────────────┤               │
│                  │ ROI          │               │
│                  │ Simulator    │               │
├──────────────────┤              ├───────────────┤
│ Demographics     │              │ Property      │
│ Panel            ├──────────────┤ Alerts        │
│                  │ Export       │               │
├──────────────────┤ Tools        │               │
│ Trends Chart     │              │               │
│                  │              │               │
└──────────────────┴──────────────┴───────────────┘
```

### Dark Theme Design

REID uses a professional dark theme optimized for data analysis:
- **Background:** Deep slate (#0f172a)
- **Cards:** Dark surface (#1e293b)
- **Accents:** Neon cyan (#06b6d4) and purple (#8b5cf6)
- **Typography:** Inter (UI) and Fira Code (data)

---

## Market Heatmap

### Overview

Interactive map showing real-time market data across different geographic areas.

### Features

**Visualization Layers:**
- **Price Layer:** Color-coded median prices
- **Inventory Layer:** Current inventory levels
- **Trend Layer:** Price change percentages

**Map Controls:**
- Pan: Click and drag
- Zoom: Scroll wheel or +/- buttons
- Layer Toggle: Dropdown in top-right corner

### How to Use

1. **Select Visualization Layer**
   - Click the dropdown in the map header
   - Choose: "Median Price", "Inventory Levels", or "Price Trends"

2. **Explore Areas**
   - Click any area on the map to see detailed metrics
   - Selected area highlights in cyan
   - Metrics panel appears below map

3. **View Area Details**
   - Median Price
   - Days on Market
   - Price Change (%)
   - Inventory Count

4. **Save Favorite Areas**
   - Click the bookmark icon on any area
   - Access saved areas from "My Areas" dropdown

### Color Coding

**Price Layer:**
- 🔴 Red: $2M+
- 🟠 Orange: $1.5M - $2M
- 🟡 Yellow: $1M - $1.5M
- 🟢 Green: $500K - $1M
- 🔵 Blue: <$500K

**Trend Layer:**
- 🔴 Red: -5% or worse (declining)
- 🟡 Yellow: -5% to +5% (stable)
- 🟢 Green: +5% or better (appreciating)

---

## Demographics Analysis

### Overview

Comprehensive demographic data for selected areas including population, income, age, and commute patterns.

### Available Metrics

**Population:**
- Total population
- Population density
- Household count
- Average household size

**Income:**
- Median household income
- Income distribution (quartiles)
- Poverty rate
- Employment rate

**Age Distribution:**
- Median age
- Age group breakdown
- Senior population %
- Youth population %

**Commute:**
- Average commute time
- Transportation mode distribution
- Work-from-home percentage

**Education:**
- High school graduation rate
- Bachelor's degree holders
- Advanced degree holders

### How to Use

1. **Select an Area**
   - Use the search bar or map to select an area
   - Area code appears in the header

2. **View Demographics**
   - Charts automatically populate with data
   - Hover over charts for detailed numbers

3. **Compare Areas**
   - Click "Add Comparison" button
   - Select up to 3 areas to compare side-by-side
   - Charts update to show all areas

4. **Export Data**
   - Click "Export" button
   - Choose CSV or PDF format
   - Download includes all visible metrics

---

## Market Trends

### Overview

Historical market trends showing price changes, inventory levels, and days on market over time.

### Available Charts

**Price Trends:**
- Median price over time
- Price per square foot
- Year-over-year comparison
- Seasonal patterns

**Inventory Trends:**
- Total listings
- New listings per month
- Sold properties
- Inventory months of supply

**Time on Market:**
- Average days on market
- Median days on market
- Distribution by price range

### How to Use

1. **Select Time Range**
   - Click date range selector
   - Choose: 3M, 6M, 1Y, 2Y, 5Y, or Custom
   - Charts update automatically

2. **Change Chart Type**
   - Click chart type toggle
   - Options: Line, Area, Bar, Candlestick
   - Preference saved to your profile

3. **Zoom In**
   - Click and drag on chart to zoom
   - Double-click to reset zoom
   - Use zoom controls in top-right

4. **View Data Points**
   - Hover over any point for exact values
   - Click point to see detailed breakdown
   - Right-click to copy value

5. **Download Chart**
   - Click "Download" icon
   - Choose PNG or SVG format
   - Chart downloads at current zoom level

---

## ROI Simulator

### Overview

Calculate potential return on investment for real estate purchases with customizable parameters.

### Input Parameters

**Purchase Details:**
- Purchase Price ($)
- Down Payment (%)
- Interest Rate (%)
- Loan Term (years)

**Income & Expenses:**
- Monthly Rent ($)
- Monthly Expenses ($)
- Property Tax (% or $)
- HOA Fees ($)
- Maintenance (% of value)

**Growth Assumptions:**
- Annual Appreciation (%)
- Rent Increase (%)
- Holding Period (years)

### Calculated Metrics

**Cash Flow:**
- Monthly Cash Flow
- Annual Cash Flow
- Cumulative Cash Flow

**Returns:**
- Cash-on-Cash Return (%)
- Cap Rate (%)
- Total ROI (%)
- IRR (Internal Rate of Return)

**Equity:**
- Principal Paydown
- Appreciation Gain
- Total Equity
- Equity as % of Value

### How to Use

1. **Enter Purchase Details**
   - Type purchase price
   - Adjust down payment slider
   - Set interest rate

2. **Configure Income**
   - Enter expected monthly rent
   - Add any additional income

3. **Set Expenses**
   - Enter monthly expenses (utilities, insurance, etc.)
   - Property tax and HOA fees
   - Maintenance estimate (typically 1-2% annually)

4. **Adjust Assumptions**
   - Set appreciation rate (historical average: 3-5%)
   - Projected rent increases (typically 2-3% annually)
   - Holding period (how long you plan to own)

5. **Analyze Results**
   - View calculated metrics in real-time
   - Check if investment meets your criteria
   - Adjust parameters to see different scenarios

6. **Save Scenario**
   - Click "Save Scenario" button
   - Name your analysis
   - Access from "Saved Scenarios" dropdown

7. **Compare Scenarios**
   - Load multiple saved scenarios
   - View side-by-side comparison
   - Identify best investment option

### Tips for Accurate Analysis

✅ **Do:**
- Use conservative estimates
- Include all expenses (even minor ones)
- Research local appreciation rates
- Factor in vacancy (assume 8-10% vacancy rate)
- Include closing costs in initial investment

❌ **Don't:**
- Use overly optimistic assumptions
- Forget about maintenance and repairs
- Ignore property tax increases
- Assume 100% occupancy
- Skip emergency fund planning

---

## AI-Powered Profiles (Elite Only)

### Overview

AI-generated neighborhood analysis providing deep insights, investment recommendations, and market forecasts.

**Requirement:** ELITE tier subscription

### Features

**Neighborhood Profile:**
- AI-written summary of the area
- Key characteristics and demographics
- Market conditions and trends
- Quality of life factors

**Investment Analysis:**
- Investment grade (A through D)
- Risk assessment
- Recommended strategy
- Comparable properties

**Market Forecast:**
- Appreciation predictions
- Rental demand outlook
- Development pipeline
- Economic indicators

**AI Insights:**
- Top 5 key insights
- Pros and cons analysis
- Hidden opportunities
- Risk factors

### How to Use

1. **Select an Area**
   - Navigate to any neighborhood in REID
   - Click "Generate AI Profile" button

2. **Wait for Analysis**
   - AI processing takes 30-60 seconds
   - Progress indicator shows status
   - Credits deducted from monthly quota (Elite: unlimited)

3. **Review Profile**
   - Read AI-generated summary
   - Check investment grade and reasoning
   - Review key insights

4. **Compare Multiple Areas**
   - Click "Compare with AI"
   - Select 2-5 areas to analyze
   - AI generates comparative analysis
   - Highlights best option based on your criteria

5. **Get Recommendations**
   - Click "Find Similar Areas"
   - AI suggests comparable neighborhoods
   - Includes pros/cons of each
   - Ranking based on your preferences

6. **Export Analysis**
   - Download as PDF report
   - Share link with team members
   - Add to market reports

### Understanding Investment Grades

| Grade | Meaning | Characteristics |
|-------|---------|----------------|
| A | Excellent | Strong fundamentals, low risk, high demand |
| B | Good | Solid market, moderate appreciation, stable |
| C | Fair | Mixed indicators, higher risk, potential upside |
| D | Caution | Weak fundamentals, high risk, speculative |

### AI Model Information

- **Model:** GPT-4 Turbo (OpenRouter)
- **Training Data:** Current to January 2025
- **Update Frequency:** Profiles regenerate monthly
- **Confidence Score:** Displayed as percentage (70%+ recommended)

---

## Property Alerts

### Overview

Automated notifications when market conditions meet your criteria.

### Alert Types

**Price Alerts:**
- Price Drop (%) - e.g., "Alert when price drops 5%+"
- Price Increase (%) - e.g., "Alert when price rises 10%+"
- Price Threshold - e.g., "Alert when median < $1M"

**Inventory Alerts:**
- Low Inventory - e.g., "Alert when inventory < 50 units"
- High Inventory - e.g., "Alert when inventory > 200 units"
- Inventory Change - e.g., "Alert when inventory drops 20%+"

**Market Alerts:**
- Days on Market - e.g., "Alert when DOM < 20 days"
- New Listings - e.g., "Alert for new listings in area"
- Sold Properties - e.g., "Alert when properties sold"

**Trend Alerts:**
- Market Shift - e.g., "Alert when market shifts to buyer's"
- Seasonal Change - e.g., "Alert at start of spring market"

### How to Create an Alert

1. **Click "Create Alert"**
   - Navigate to Alerts panel
   - Click "+ New Alert" button

2. **Configure Alert**
   - **Name:** Give your alert a descriptive name
   - **Type:** Choose alert type (Price Drop, Inventory, etc.)
   - **Areas:** Select ZIP codes or neighborhoods to monitor
   - **Criteria:** Set threshold values

3. **Set Notification Preferences**
   - **Email:** Toggle on/off
   - **SMS:** Toggle on/off (requires phone verification)
   - **Frequency:**
     - Immediate (as it happens)
     - Daily (digest at 9 AM)
     - Weekly (digest on Mondays)
     - Monthly (digest on 1st)

4. **Review and Save**
   - Preview alert summary
   - Click "Create Alert"
   - Alert becomes active immediately

### Managing Alerts

**Edit Alert:**
1. Find alert in list
2. Click "Edit" icon
3. Modify settings
4. Save changes

**Pause Alert:**
1. Toggle "Active" switch to off
2. Alert stops triggering (no deletion)
3. Re-enable anytime

**Delete Alert:**
1. Click "Delete" icon
2. Confirm deletion
3. Alert permanently removed

**View Trigger History:**
1. Click alert name
2. See all past triggers
3. Filter by date range
4. Acknowledge triggers to mark as reviewed

### Alert Limits

| Tier | Max Alerts | Notification Methods |
|------|-----------|---------------------|
| GROWTH | 10 alerts | Email only |
| ELITE | Unlimited | Email + SMS |

### Best Practices

✅ **Do:**
- Use specific criteria (avoid too broad)
- Set realistic thresholds
- Review and adjust quarterly
- Acknowledge triggers after review
- Combine multiple alert types

❌ **Don't:**
- Create duplicate alerts
- Set conflicting criteria
- Ignore triggered alerts
- Use extreme thresholds
- Forget to update phone number

---

## Market Reports

### Overview

Generate comprehensive market analysis reports with charts, tables, and AI insights.

### Report Types

**Neighborhood Analysis:**
- Single area deep-dive
- Historical trends
- Demographics
- Schools and amenities
- Investment outlook

**Market Overview:**
- Multiple area comparison
- Market statistics
- Price trends
- Inventory analysis

**Comparative Study:**
- Side-by-side area comparison
- Pros and cons
- Best value analysis
- Investment ranking

**Investment Analysis:**
- ROI calculations
- Cash flow projections
- Risk assessment
- Recommendation

**Custom Report:**
- Choose your own sections
- Mix and match data
- Add custom notes
- Client-ready format

### How to Generate a Report

1. **Click "Generate Report"**
   - Navigate to Reports panel
   - Click "+ New Report" button

2. **Select Report Type**
   - Choose from 5 report types
   - Each has different sections

3. **Configure Report**
   - **Title:** Report title (editable)
   - **Description:** Optional summary
   - **Areas:** Select neighborhoods to include
   - **Date Range:** Historical period to analyze
   - **Filters:** Price range, property type, etc.

4. **Choose Sections**
   - Toggle sections on/off
   - Reorder sections (drag and drop)
   - Customize chart types

5. **Generate**
   - Click "Generate Report"
   - Processing takes 1-3 minutes
   - Progress bar shows status

6. **Review Report**
   - Report opens in viewer
   - Navigate sections with sidebar
   - Charts are interactive

7. **Export Report**
   - **PDF:** Printer-friendly, client-ready
   - **CSV:** Raw data for further analysis
   - **Share Link:** Give view-only access to others

### Report Sections

**Executive Summary:**
- Key findings
- Investment recommendation
- Risk score

**Market Statistics:**
- Median price
- Price per sq ft
- Days on market
- Inventory levels
- Sold vs listed ratio

**Price Trends:**
- Historical price chart
- Year-over-year comparison
- Seasonal patterns
- Forecast (if Elite tier with AI)

**Demographics:**
- Population stats
- Income levels
- Age distribution
- Education levels

**Schools:**
- School ratings
- Proximity map
- Test scores
- Student-teacher ratio

**Amenities:**
- Walk score
- Bike score
- Transit score
- Nearby parks, restaurants, shopping

**Investment Analysis:**
- ROI calculation
- Cap rate
- Cash-on-cash return
- Appreciation forecast

**AI Insights (Elite Only):**
- AI-generated summary
- Investment grade
- Risk factors
- Opportunities

### Report Limits

| Tier | Reports/Month | PDF Export | CSV Export | Share Link |
|------|--------------|-----------|-----------|-----------|
| GROWTH | 5 | ✅ | ✅ | ✅ |
| ELITE | Unlimited | ✅ | ✅ | ✅ |

### Tips for Better Reports

✅ **Best Practices:**
- Choose meaningful date ranges (12+ months for trends)
- Include multiple comparison areas (3-5)
- Add custom notes for context
- Use executive summary for quick overview
- Share links instead of large PDF emails

🎨 **Customization:**
- Edit report title before generating
- Add your logo (Elite tier)
- Customize color scheme (Elite tier)
- Include custom disclaimers

---

## User Preferences

### Overview

Customize your REID Dashboard experience.

### Available Preferences

**Dashboard Layout:**
- Module positions (drag and drop)
- Module sizes (resize)
- Hidden modules
- Default view

**Display Settings:**
- Theme: Dark (default) or Light
- Chart type preference: Line, Area, or Bar
- Map style: Dark, Light, or Satellite
- Data density: Compact, Normal, or Comfortable

**Notification Settings:**
- Email digest frequency
- SMS alerts (Elite only)
- Digest day and time
- Quiet hours

**Data Preferences:**
- Price format: USD, abbreviated ($1.2M), or full ($1,200,000)
- Area unit: sq ft or sq m
- Date format: MM/DD/YYYY, DD/MM/YYYY, or YYYY-MM-DD
- Number format: US (1,234.56) or International (1.234,56)

**Default Areas:**
- Set favorite ZIP codes
- Auto-load on dashboard
- Quick access in dropdown

### How to Update Preferences

1. **Navigate to Preferences**
   - Click your avatar (top-right)
   - Select "REID Preferences"

2. **Modify Settings**
   - Change any preference
   - Preview updates in real-time

3. **Save Changes**
   - Click "Save Preferences"
   - Changes apply immediately
   - Syncs across all devices

### Resetting to Defaults

1. Click "Reset to Defaults" button
2. Confirm reset
3. All preferences revert to original settings

---

## FAQ

### General

**Q: Who can access the REID Dashboard?**
A: Users with GROWTH or ELITE tier subscriptions and MEMBER+ organization roles.

**Q: What's the difference between GROWTH and ELITE tiers?**
A: ELITE includes unlimited alerts, reports, and AI-powered features. GROWTH has limits: 50 insights, 10 alerts, 5 reports/month.

**Q: Can I try REID before upgrading?**
A: Contact sales@strivetech.ai for a demo or trial period.

### Data

**Q: How often is market data updated?**
A: Market data updates daily at 6 AM Pacific. Demographics update monthly.

**Q: Where does the data come from?**
A: We aggregate data from MLS feeds, public records, census data, and third-party providers.

**Q: Can I trust the AI-generated insights?**
A: AI insights are data-driven but should be verified. Always conduct your own due diligence. Confidence scores indicate reliability.

### Features

**Q: Why can't I see AI Profiles?**
A: AI Profiles require an ELITE tier subscription. Upgrade in Settings → Billing.

**Q: How do I create more than 10 alerts?**
A: GROWTH tier limits alerts to 10. Upgrade to ELITE for unlimited alerts.

**Q: Can I export my data?**
A: Yes! Generate reports and export as PDF or CSV. All your data is exportable.

**Q: How do I compare multiple neighborhoods?**
A: Use the "Add Comparison" feature in Demographics or generate a Comparative Study report.

### Technical

**Q: Why isn't the map loading?**
A: Check your internet connection. Clear browser cache. Disable ad blockers. If issues persist, contact support.

**Q: Charts are loading slowly. Why?**
A: Large date ranges or many areas can slow performance. Try narrowing your selection or using a shorter time frame.

**Q: Can I access REID on mobile?**
A: Yes! REID is fully responsive. Some features work better on tablets or desktops.

**Q: Is my data secure?**
A: Yes. All data is encrypted, multi-tenant isolated, and RBAC protected. We never share your data.

### Billing

**Q: How are report limits enforced?**
A: Reports reset monthly on your billing date. GROWTH tier: 5/month. ELITE: unlimited.

**Q: What happens if I downgrade from ELITE?**
A: Existing data remains. New alerts/reports limited to GROWTH tier caps. AI features disabled.

**Q: Can I purchase additional reports?**
A: Currently, no. Upgrade to ELITE for unlimited reports.

---

## Support

### Help Resources

- **Knowledge Base:** [help.strivetech.ai/reid](https://help.strivetech.ai/reid)
- **Video Tutorials:** [youtube.com/strivetech](https://youtube.com/strivetech)
- **API Docs:** [docs.strivetech.ai/api](https://docs.strivetech.ai/api)

### Contact Support

- **Email:** support@strivetech.ai
- **Live Chat:** Available in dashboard (bottom-right)
- **Phone:** 1-800-STRIVE-1 (Mon-Fri, 9 AM - 5 PM PT)

### Report Issues

- **Bug Reports:** bugs@strivetech.ai
- **Feature Requests:** product@strivetech.ai
- **Security Concerns:** security@strivetech.ai

---

**Last Updated:** 2025-10-07
**Version:** 1.0
**Feedback:** help us improve at feedback@strivetech.ai
