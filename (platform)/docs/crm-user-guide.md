# CRM User Guide

**Strive Tech Real Estate CRM**
Version 1.0
Last Updated: 2025-01-04

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Leads Management](#leads-management)
3. [Contacts Management](#contacts-management)
4. [Deals Pipeline](#deals-pipeline)
5. [Property Listings](#property-listings)
6. [Calendar & Appointments](#calendar--appointments)
7. [Analytics & Reporting](#analytics--reporting)
8. [Best Practices](#best-practices)
9. [Troubleshooting](#troubleshooting)

---

## Getting Started

### Accessing the CRM

1. Log in to your Strive Tech platform account
2. Navigate to **CRM** from the main navigation menu
3. You'll land on the CRM Dashboard showing key metrics and recent activity

### CRM Dashboard Overview

The dashboard provides a quick overview of your CRM performance:

- **Total Leads**: Current lead count and conversion rate
- **Active Deals**: Pipeline value and expected revenue
- **Appointments**: Upcoming meetings and their status
- **Recent Activity**: Latest interactions across all modules

---

## Leads Management

### What are Leads?

Leads are potential clients who have expressed interest in your services but haven't been formally qualified yet. They represent the top of your sales funnel.

### Creating a Lead

1. Navigate to **CRM → Leads**
2. Click **New Lead** button
3. Fill in the required information:
   - **Name** (required): Contact's full name
   - **Email**: Primary email address
   - **Phone**: Contact number
   - **Company**: Business or organization name
   - **Source**: How the lead found you (Website, Referral, etc.)
   - **Budget**: Estimated budget (optional)
   - **Timeline**: Expected decision timeframe
4. Click **Create Lead**

### Lead Scoring

Leads are automatically scored based on engagement and fit:

- **🔥 Hot (90-100)**: High engagement, ready to convert
- **🌡️ Warm (50-89)**: Moderate engagement, needs nurturing
- **❄️ Cold (0-49)**: Low engagement, long-term prospect

**Updating Lead Score:**

1. Open the lead detail page
2. Click **Update Score**
3. Adjust the score based on recent interactions
4. Add notes explaining the score change

### Lead Statuses

- **New Lead**: Just entered the system
- **Contacted**: Initial outreach completed
- **Qualified**: Meets criteria for further pursuit
- **Unqualified**: Does not meet criteria
- **Converted**: Successfully converted to contact/customer

### Converting a Lead

When a lead is qualified and ready to become a customer:

1. Open the lead detail page
2. Click **Convert Lead**
3. The system will:
   - Create a new Contact record
   - Update lead status to "Converted"
   - Preserve all activity history
4. You can now create deals for this contact

---

## Contacts Management

### What are Contacts?

Contacts are qualified leads who have become active clients or are in active business discussions. They can have multiple deals associated with them.

### Creating a Contact

1. Navigate to **CRM → Contacts**
2. Click **New Contact**
3. Fill in contact information:
   - **Name** (required)
   - **Email**
   - **Phone**
   - **Company**
   - **Type**: Client, Partner, Vendor
   - **Status**: Active, Inactive, etc.
4. Click **Create Contact**

### Managing Contact Information

**Updating Contact Details:**

- Click on any contact to view their detail page
- Click **Edit** to modify information
- All changes are tracked in the activity log

**Contact Types:**

- **Client**: Active paying customer
- **Prospect**: Qualified lead in discussion
- **Partner**: Business partner or referral source
- **Vendor**: Service provider

---

## Deals Pipeline

### Understanding the Pipeline

The deals pipeline represents your active sales opportunities organized by stage. Each stage represents progress toward closing.

### Pipeline Stages

1. **Qualification** (0-25% probability)
   - Initial opportunity identified
   - Requirements gathering phase

2. **Proposal** (25-50% probability)
   - Formal proposal submitted
   - Pricing discussed

3. **Negotiation** (50-75% probability)
   - Terms being negotiated
   - Contract under review

4. **Contract** (75-90% probability)
   - Contract sent for signature
   - Final details being confirmed

5. **Closed Won** (100% probability)
   - Deal successfully closed
   - Customer onboarded

6. **Closed Lost** (0% probability)
   - Deal was not won
   - Reason documented

### Creating a Deal

1. Navigate to **CRM → Deals**
2. Click **New Deal**
3. Fill in deal information:
   - **Title** (required): Descriptive deal name
   - **Value**: Monetary value
   - **Contact**: Associated contact (required)
   - **Stage**: Current pipeline stage
   - **Probability**: Likelihood of closing (%)
   - **Expected Close Date**: Target closing date
   - **Assigned To**: Team member responsible
4. Click **Create Deal**

### Moving Deals Through Pipeline

**Drag and Drop:**

- Simply drag deal cards between pipeline columns
- Drop in the appropriate stage column
- Probability updates automatically based on stage

**Manual Update:**

1. Open deal detail page
2. Click **Update Stage**
3. Select new stage and update probability
4. Add notes about the stage change

### Closing a Deal

**Mark as Won:**

1. Open the deal detail page
2. Click **Mark as Won**
3. Confirm the actual closing details
4. Deal moves to "Closed Won" stage

**Mark as Lost:**

1. Open the deal detail page
2. Click **Mark as Lost**
3. **Required**: Select a lost reason:
   - Price too high
   - Competitor chosen
   - Budget constraints
   - Timeline mismatch
   - Other (specify)
4. Add detailed notes for future reference

---

## Property Listings

### Managing Listings

Property listings are real estate properties you're marketing or managing.

### Creating a Listing

1. Navigate to **CRM → Listings**
2. Click **New Listing**
3. Fill in property details:
   - **Address** (required)
   - **Price**: Listing price
   - **Type**: Residential, Commercial, Land
   - **Status**: Active, Pending, Sold
   - **Bedrooms/Bathrooms**: Property specs
   - **Square Footage**: Property size
   - **Description**: Detailed property description
   - **Photos**: Upload property images
4. Click **Create Listing**

### Listing Statuses

- **Active**: Currently on market
- **Pending**: Under contract/offer accepted
- **Sold**: Successfully sold
- **Withdrawn**: Removed from market
- **Expired**: Listing period ended

---

## Calendar & Appointments

### Scheduling Appointments

1. Navigate to **CRM → Calendar**
2. Click on a date/time slot OR click **New Appointment**
3. Fill in appointment details:
   - **Title** (required): Meeting purpose
   - **Contact**: Who you're meeting with
   - **Start Time**: Meeting start
   - **End Time**: Meeting end
   - **Location**: Physical or virtual location
   - **Notes**: Meeting agenda or notes
4. Click **Schedule Appointment**

### Appointment Types

- **Meeting**: In-person or virtual meeting
- **Call**: Phone call scheduled
- **Property Tour**: Property viewing
- **Consultation**: Initial consultation
- **Closing**: Final closing meeting

### Managing Your Calendar

**Calendar Views:**

- **Month View**: See all appointments for the month
- **Week View**: Detailed weekly schedule
- **Day View**: Hour-by-hour daily schedule
- **List View**: All appointments in list format

**Filters:**

- Filter by appointment type
- Filter by status (Scheduled, Completed, Cancelled)
- Filter by assigned team member

---

## Analytics & Reporting

### Understanding CRM Analytics

Analytics provides insights into your sales performance and team productivity.

### Key Performance Indicators (KPIs)

**Lead Metrics:**

- **Total Leads**: Current lead count
- **Conversion Rate**: Percentage of leads converted to contacts
- **Average Lead Score**: Overall lead quality metric
- **New Leads (30 days)**: Recent lead generation performance

**Pipeline Metrics:**

- **Total Pipeline Value**: Sum of all open deal values
- **Weighted Pipeline**: Pipeline value adjusted by probability
- **Average Deal Size**: Mean value of all deals
- **Win Rate**: Percentage of deals won vs. lost

**Revenue Metrics:**

- **Closed Revenue (MTD)**: Revenue closed this month
- **Closed Revenue (YTD)**: Revenue closed this year
- **Forecast Revenue**: Expected revenue from open pipeline
- **Revenue by Stage**: Breakdown of pipeline value by stage

**Agent Performance:**

- **Deals Closed**: Number of deals each agent has closed
- **Revenue Generated**: Total revenue per agent
- **Average Days to Close**: How long deals take to close
- **Win Rate by Agent**: Individual agent success rates

### Viewing Reports

1. Navigate to **CRM → Analytics**
2. Select time period (This Month, This Quarter, This Year, Custom)
3. View dashboard charts and metrics
4. Click **Export** to download reports as CSV/PDF

### Custom Reports

Create custom reports by:

1. Clicking **Create Custom Report**
2. Selecting metrics and dimensions
3. Applying filters (date range, agent, deal stage, etc.)
4. Saving the report for future use

---

## Best Practices

### Lead Management

1. **Qualify Quickly**: Review new leads within 24 hours
2. **Update Scores Regularly**: Keep lead scores current based on engagement
3. **Document Interactions**: Log all calls, emails, and meetings
4. **Set Follow-up Reminders**: Never let a hot lead go cold

### Contact Management

1. **Keep Information Current**: Update contact details regularly
2. **Tag Appropriately**: Use tags for easy segmentation
3. **Link Related Records**: Connect contacts to relevant deals and listings
4. **Respect Privacy**: Comply with data protection regulations

### Deal Management

1. **Keep Pipeline Clean**: Archive or close stale deals
2. **Update Probabilities**: Adjust based on actual progress, not wishful thinking
3. **Document Objections**: Record concerns and how you addressed them
4. **Set Realistic Close Dates**: Avoid over-optimistic forecasting

### Activity Logging

1. **Log Everything**: Every interaction should be recorded
2. **Be Specific**: Include action items and outcomes
3. **Use Consistent Formatting**: Make notes easy to scan
4. **Set Next Steps**: Always define what happens next

---

## Troubleshooting

### Common Issues

**Can't See My Leads/Contacts/Deals**

- **Check Filters**: Make sure no active filters are hiding records
- **Verify Permissions**: Ensure you have appropriate role permissions
- **Organization Context**: Confirm you're in the correct organization

**Deal Not Moving in Pipeline**

- **Check Status**: Ensure deal status is "Open" (not Won or Lost)
- **Verify Permissions**: Confirm you have edit rights for the deal
- **Stage Requirements**: Some stages may have required fields

**Calendar Not Showing Appointments**

- **Date Range**: Check selected date range
- **View Setting**: Try switching between Month/Week/Day views
- **Filters**: Clear any active filters that might hide appointments

**Import/Export Issues**

- **File Format**: Ensure CSV file has correct columns and formatting
- **Required Fields**: All required fields must have values
- **Duplicates**: System will flag potential duplicate records

### Getting Help

**In-App Support:**

- Click the **Help** icon in the top right
- Search the knowledge base
- Submit a support ticket

**Contact Support:**

- Email: support@strivetech.ai
- Phone: 1-800-STRIVE-TECH
- Live Chat: Available 9 AM - 5 PM EST

---

## Keyboard Shortcuts

Speed up your workflow with these keyboard shortcuts:

- `Ctrl+K` (or `Cmd+K`): Quick search
- `N`: Create new (when on list views)
- `E`: Edit current record
- `S`: Save changes
- `/`: Focus search bar
- `Esc`: Close dialogs/modals

---

## Glossary

- **CRM**: Customer Relationship Management
- **Lead**: Potential client not yet qualified
- **Contact**: Qualified individual or business
- **Deal**: Sales opportunity with monetary value
- **Pipeline**: Visual representation of sales stages
- **Probability**: Likelihood of closing a deal (%)
- **Close Date**: Expected or actual date of closing
- **Win Rate**: Percentage of deals won out of total closed

---

**Need more help?** Visit our Help Center at help.strivetech.ai or contact support@strivetech.ai
