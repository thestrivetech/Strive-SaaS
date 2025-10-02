# Property Alert System - Complete Implementation Guide

**Estimated Time:** 3-4 days  
**Difficulty:** Intermediate  
**Architecture:** n8n Workflow + Next.js Module  
**Dependencies:** MLS API access, SendGrid, Twilio (optional)

---

## Overview

The Property Alert System allows customers to save search criteria and automatically receive notifications when new properties match their preferences. This tool uses n8n for scheduled monitoring and notification delivery, with Next.js handling the CRUD operations for alert management.

**User Flow:**
1. Customer creates alert with search criteria (price, location, bedrooms, etc.)
2. n8n workflow runs every 30 minutes to check for new listings
3. Matching properties are identified and stored
4. Notifications sent via email/SMS based on customer preferences
5. Customer views matches in dashboard

---

## Step 1: Database Schema (30 minutes)

### Add to `prisma/schema.prisma`

```prisma
// Property Alert Models
model PropertyAlert {
  id String @id @default(uuid())
  organizationId String
  customerId String
  
  name String // e.g., "Downtown Condos Under $500k"
  criteria Json // Structured search criteria
  frequency AlertFrequency @default(IMMEDIATE)
  channels String[] // ["email", "sms", "push"]
  active Boolean @default(true)
  
  lastChecked DateTime?
  matchCount Int @default(0)
  
  customer Customer @relation(fields: [customerId], references: [id], onDelete: Cascade)
  organization Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  matches PropertyAlertMatch[]
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@index([organizationId])
  @@index([customerId])
  @@index([active])
  @@index([lastChecked])
  @@map("property_alerts")
}

model PropertyAlertMatch {
  id String @id @default(uuid())
  alertId String
  propertyId String
  
  matchScore Decimal // 0-1, how well it matches
  matchedFields Json // Which criteria matched
  sent Boolean @default(false)
  sentAt DateTime?
  viewed Boolean @default(false)
  viewedAt DateTime?
  
  alert PropertyAlert @relation(fields: [alertId], references: [id], onDelete: Cascade)
  property Property @relation(fields: [propertyId], references: [id], onDelete: Cascade)
  
  createdAt DateTime @default(now())
  
  @@unique([alertId, propertyId])
  @@index([alertId])
  @@index([propertyId])
  @@index([sent])
  @@index([createdAt(sort: Desc)])
  @@map("property_alert_matches")
}

enum AlertFrequency {
  IMMEDIATE // Send as soon as matches found
  HOURLY    // Batch hourly
  DAILY     // Daily digest
  WEEKLY    // Weekly digest
}
```

### Run Migration

```bash
cd app
npx prisma format
npx prisma generate
npx prisma db push
```

---

## Step 2: Module Structure (1 hour)

### Create Module Directory

```bash
mkdir -p lib/modules/property-alerts/{services,components}
```

### File Structure

```
lib/modules/property-alerts/
├── actions.ts           # Server Actions (create, update, delete)
├── queries.ts           # Data fetching functions
├── schemas.ts           # Zod validation schemas
├── types.ts             # TypeScript interfaces
├── constants.ts         # Alert frequency options, etc.
└── services/
    ├── matching-service.ts    # Property matching logic
    └── notification-service.ts # Email/SMS sending
```

---

## Step 3: Zod Schemas & Types (30 minutes)

### `lib/modules/property-alerts/schemas.ts`

```typescript
import { z } from 'zod';

export const alertCriteriaSchema = z.object({
  // Price
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
  
  // Property type
  propertyTypes: z.array(z.enum([
    'SINGLE_FAMILY',
    'CONDO',
    'TOWNHOUSE',
    'MULTI_FAMILY',
    'LAND',
    'COMMERCIAL'
  ])).optional(),
  
  // Bedrooms/Bathrooms
  minBedrooms: z.number().min(0).optional(),
  maxBedrooms: z.number().optional(),
  minBathrooms: z.number().min(0).optional(),
  
  // Size
  minSquareFeet: z.number().optional(),
  maxSquareFeet: z.number().optional(),
  minLotSize: z.number().optional(),
  
  // Location
  cities: z.array(z.string()).optional(),
  zipCodes: z.array(z.string()).optional(),
  states: z.array(z.string()).optional(),
  maxDistanceFromPoint: z.object({
    latitude: z.number(),
    longitude: z.number(),
    radiusMiles: z.number()
  }).optional(),
  
  // Features
  requiredFeatures: z.array(z.string()).optional(), // pool, garage, etc.
  
  // Listing status
  statuses: z.array(z.enum(['ACTIVE', 'PENDING', 'COMING_SOON'])).default(['ACTIVE']),
});

export const createAlertSchema = z.object({
  organizationId: z.string().uuid(),
  customerId: z.string().uuid(),
  name: z.string().min(1).max(100),
  criteria: alertCriteriaSchema,
  frequency: z.enum(['IMMEDIATE', 'HOURLY', 'DAILY', 'WEEKLY']).default('DAILY'),
  channels: z.array(z.enum(['email', 'sms', 'push'])).min(1),
});

export const updateAlertSchema = createAlertSchema.partial().extend({
  id: z.string().uuid(),
});

export type AlertCriteria = z.infer<typeof alertCriteriaSchema>;
export type CreateAlertInput = z.infer<typeof createAlertSchema>;
export type UpdateAlertInput = z.infer<typeof updateAlertSchema>;
```

### `lib/modules/property-alerts/types.ts`

```typescript
import { PropertyAlert, PropertyAlertMatch, Property } from '@prisma/client';

export type AlertWithMatches = PropertyAlert & {
  matches: (PropertyAlertMatch & {
    property: Property;
  })[];
  customer: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
  };
};

export interface MatchingResult {
  property: Property;
  matchScore: number;
  matchedFields: string[];
}
```

---

## Step 4: Server Actions (1 hour)

### `lib/modules/property-alerts/actions.ts`

```typescript
'use server';

import { prisma } from '@/lib/prisma';
import { createServerSupabaseClientWithAuth } from '@/lib/supabase-server';
import { revalidatePath } from 'next/cache';
import { createAlertSchema, updateAlertSchema, type CreateAlertInput, type UpdateAlertInput } from './schemas';
import { N8nService } from '../real-estate/services/n8n-service';

export async function createPropertyAlert(input: CreateAlertInput) {
  const supabase = await createServerSupabaseClientWithAuth();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  // Validate input
  const validated = createAlertSchema.parse(input);

  // Verify customer belongs to organization
  const customer = await prisma.customer.findUnique({
    where: { id: validated.customerId },
    select: { organizationId: true },
  });

  if (!customer || customer.organizationId !== validated.organizationId) {
    throw new Error('Invalid customer');
  }

  // Create alert
  const alert = await prisma.propertyAlert.create({
    data: {
      name: validated.name,
      criteria: validated.criteria,
      frequency: validated.frequency,
      channels: validated.channels,
      customerId: validated.customerId,
      organizationId: validated.organizationId,
    },
    include: {
      customer: true,
    },
  });

  // Trigger initial n8n check (optional - runs immediately)
  try {
    await N8nService.triggerWorkflow('property-alerts-check', {
      alertId: alert.id,
      immediate: true,
    });
  } catch (error) {
    console.error('Failed to trigger n8n workflow:', error);
    // Don't fail the alert creation if workflow trigger fails
  }

  // Log activity
  await prisma.activityLog.create({
    data: {
      organizationId: validated.organizationId,
      userId: user.id,
      action: 'created_property_alert',
      resourceType: 'property_alert',
      resourceId: alert.id,
      newData: alert,
    },
  });

  revalidatePath('/alerts');
  return alert;
}

export async function updatePropertyAlert(input: UpdateAlertInput) {
  const supabase = await createServerSupabaseClientWithAuth();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  const validated = updateAlertSchema.parse(input);

  // Get existing alert
  const existingAlert = await prisma.propertyAlert.findUnique({
    where: { id: validated.id },
  });

  if (!existingAlert) {
    throw new Error('Alert not found');
  }

  // Update alert
  const updatedAlert = await prisma.propertyAlert.update({
    where: { id: validated.id },
    data: {
      ...(validated.name && { name: validated.name }),
      ...(validated.criteria && { criteria: validated.criteria }),
      ...(validated.frequency && { frequency: validated.frequency }),
      ...(validated.channels && { channels: validated.channels }),
      ...(validated.active !== undefined && { active: validated.active }),
    },
  });

  // Log activity
  await prisma.activityLog.create({
    data: {
      organizationId: existingAlert.organizationId,
      userId: user.id,
      action: 'updated_property_alert',
      resourceType: 'property_alert',
      resourceId: updatedAlert.id,
      oldData: existingAlert,
      newData: updatedAlert,
    },
  });

  revalidatePath('/alerts');
  revalidatePath(`/alerts/${validated.id}`);
  return updatedAlert;
}

export async function deletePropertyAlert(alertId: string) {
  const supabase = await createServerSupabaseClientWithAuth();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  // Get alert
  const alert = await prisma.propertyAlert.findUnique({
    where: { id: alertId },
  });

  if (!alert) {
    throw new Error('Alert not found');
  }

  // Delete alert (cascade will delete matches)
  await prisma.propertyAlert.delete({
    where: { id: alertId },
  });

  // Log activity
  await prisma.activityLog.create({
    data: {
      organizationId: alert.organizationId,
      userId: user.id,
      action: 'deleted_property_alert',
      resourceType: 'property_alert',
      resourceId: alertId,
      oldData: alert,
    },
  });

  revalidatePath('/alerts');
  return { success: true };
}

export async function toggleAlertActive(alertId: string, active: boolean) {
  const supabase = await createServerSupabaseClientWithAuth();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  const updatedAlert = await prisma.propertyAlert.update({
    where: { id: alertId },
    data: { active },
  });

  revalidatePath('/alerts');
  return updatedAlert;
}
```

---

## Step 5: Query Functions (30 minutes)

### `lib/modules/property-alerts/queries.ts`

```typescript
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth/auth-helpers';
import type { AlertWithMatches } from './types';

export async function getPropertyAlerts(): Promise<AlertWithMatches[]> {
  const user = await getCurrentUser();
  
  if (!user || !user.organizationMembers[0]) {
    return [];
  }

  const organizationId = user.organizationMembers[0].organizationId;

  const alerts = await prisma.propertyAlert.findMany({
    where: { organizationId },
    include: {
      customer: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
      matches: {
        where: { sent: true },
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          property: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return alerts as AlertWithMatches[];
}

export async function getPropertyAlert(alertId: string): Promise<AlertWithMatches | null> {
  const user = await getCurrentUser();
  
  if (!user || !user.organizationMembers[0]) {
    return null;
  }

  const alert = await prisma.propertyAlert.findFirst({
    where: {
      id: alertId,
      organizationId: user.organizationMembers[0].organizationId,
    },
    include: {
      customer: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
      matches: {
        orderBy: { createdAt: 'desc' },
        include: {
          property: true,
        },
      },
    },
  });

  return alert as AlertWithMatches | null;
}

export async function getAlertMatchesForCustomer(customerId: string, limit = 20) {
  const matches = await prisma.propertyAlertMatch.findMany({
    where: {
      alert: {
        customerId,
      },
      sent: true,
    },
    include: {
      property: true,
      alert: {
        select: {
          name: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });

  return matches;
}
```

---

## Step 6: n8n Workflow (2 hours)

### Create Workflow in n8n UI

1. Log into n8n at `http://localhost:5678`
2. Create new workflow: "Property Alerts Monitor"
3. Add nodes as shown below:

### Workflow Structure

```
[Schedule Trigger] → [Get Active Alerts] → [Split in Batches]
  ↓
[For Each Alert]:
  → [Build Search Query]
  → [Search MLS API]
  → [Match Properties]
  → [IF: Has Matches?]
      ├─ TRUE → [Save Matches] → [Send Notifications]
      └─ FALSE → [Update Last Checked]
```

### Node Configurations

**1. Schedule Trigger Node**
```json
{
  "parameters": {
    "rule": {
      "interval": [
        {
          "field": "minutes",
          "minutesInterval": 30
        }
      ]
    }
  },
  "name": "Every 30 Minutes",
  "type": "n8n-nodes-base.scheduleTrigger"
}
```

**2. Get Active Alerts Node (PostgreSQL)**
```json
{
  "parameters": {
    "operation": "executeQuery",
    "query": "SELECT id, name, criteria, frequency, channels, customer_id FROM property_alerts WHERE active = true AND (last_checked IS NULL OR last_checked < NOW() - INTERVAL '30 minutes')",
    "options": {}
  },
  "name": "Get Active Alerts",
  "type": "n8n-nodes-base.postgres",
  "credentials": {
    "postgres": {
      "id": "your-credentials-id",
      "name": "Supabase PostgreSQL"
    }
  }
}
```

**3. Split in Batches Node**
```json
{
  "parameters": {
    "batchSize": 10,
    "options": {}
  },
  "name": "Split in Batches",
  "type": "n8n-nodes-base.splitInBatches"
}
```

**4. Build Search Query Node (Code)**
```javascript
// Function Node
const alert = $input.item.json;
const criteria = JSON.parse(alert.criteria);

// Build MLS API query parameters
const queryParams = {
  status: 'active',
  limit: 50,
};

// Price range
if (criteria.minPrice) queryParams.minPrice = criteria.minPrice;
if (criteria.maxPrice) queryParams.maxPrice = criteria.maxPrice;

// Bedrooms/Bathrooms
if (criteria.minBedrooms) queryParams.minBedrooms = criteria.minBedrooms;
if (criteria.minBathrooms) queryParams.minBathrooms = criteria.minBathrooms;

// Property types
if (criteria.propertyTypes && criteria.propertyTypes.length > 0) {
  queryParams.propertyType = criteria.propertyTypes.join(',');
}

// Location
if (criteria.cities && criteria.cities.length > 0) {
  queryParams.city = criteria.cities.join(',');
}
if (criteria.zipCodes && criteria.zipCodes.length > 0) {
  queryParams.zipCode = criteria.zipCodes.join(',');
}

// Only get properties listed in last 24 hours
queryParams.listedSince = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

return {
  alertId: alert.id,
  alertName: alert.name,
  customerId: alert.customer_id,
  channels: alert.channels,
  queryParams,
};
```

**5. Search MLS API Node (HTTP Request)**
```json
{
  "parameters": {
    "method": "GET",
    "url": "={{ $env.MLS_API_URL }}/properties/search",
    "authentication": "genericCredentialType",
    "genericAuthType": "httpHeaderAuth",
    "sendQuery": true,
    "queryParameters": {
      "parameters": "={{ Object.entries($json.queryParams).map(([key, value]) => ({ name: key, value: String(value) })) }}"
    },
    "options": {}
  },
  "name": "Search MLS API",
  "type": "n8n-nodes-base.httpRequest"
}
```

**6. Match Properties Node (Code)**
```javascript
// Calculate match scores
const alert = $node["Build Search Query"].json;
const properties = $node["Search MLS API"].json.results || [];

const matches = properties.map(property => {
  let matchScore = 0;
  let totalChecks = 0;
  const matchedFields = [];
  
  const criteria = alert.queryParams;
  
  // Price match (high weight)
  totalChecks++;
  if (property.price >= (criteria.minPrice || 0) && 
      property.price <= (criteria.maxPrice || Infinity)) {
    matchScore++;
    matchedFields.push('price');
  }
  
  // Bedrooms match
  totalChecks++;
  if (property.bedrooms >= (criteria.minBedrooms || 0)) {
    matchScore++;
    matchedFields.push('bedrooms');
  }
  
  // Location match
  totalChecks++;
  if (criteria.city && criteria.city.split(',').includes(property.city)) {
    matchScore++;
    matchedFields.push('location');
  }
  
  // Calculate final score (0-1)
  const finalScore = matchScore / totalChecks;
  
  return {
    alertId: alert.alertId,
    property,
    matchScore: finalScore,
    matchedFields,
  };
}).filter(match => match.matchScore >= 0.6); // Only include good matches

return matches;
```

**7. Has Matches? Node (IF)**
```json
{
  "parameters": {
    "conditions": {
      "boolean": [
        {
          "value1": "={{ $json.length }}",
          "operation": "largerEqual",
          "value2": 1
        }
      ]
    }
  },
  "name": "Has Matches?",
  "type": "n8n-nodes-base.if"
}
```

**8. Save Matches Node (PostgreSQL)**
```json
{
  "parameters": {
    "operation": "insert",
    "table": "property_alert_matches",
    "columns": "alert_id,property_id,match_score,matched_fields",
    "returnFields": "*",
    "options": {}
  },
  "name": "Save Matches",
  "type": "n8n-nodes-base.postgres"
}
```

**9. Send Notifications Node (HTTP Request - calls Next.js)**
```json
{
  "parameters": {
    "method": "POST",
    "url": "={{ $env.APP_URL }}/api/webhooks/send-alert-notification",
    "authentication": "genericCredentialType",
    "genericAuthType": "httpHeaderAuth",
    "sendBody": true,
    "specifyBody": "json",
    "jsonBody": "={{ JSON.stringify({ alertId: $json.alertId, matches: $json.matches }) }}",
    "options": {}
  },
  "name": "Send Notifications",
  "type": "n8n-nodes-base.httpRequest"
}
```

---

## Step 7: Notification Handler (1 hour)

### `app/api/webhooks/send-alert-notification/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { NotificationService } from '@/lib/modules/property-alerts/services/notification-service';

// Verify webhook is from n8n
function verifyWebhook(request: NextRequest): boolean {
  const apiKey = request.headers.get('x-api-key');
  return apiKey === process.env.N8N_WEBHOOK_SECRET;
}

export async function POST(request: NextRequest) {
  // Verify authentication
  if (!verifyWebhook(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { alertId, matches } = await request.json();

  // Get alert with customer data
  const alert = await prisma.propertyAlert.findUnique({
    where: { id: alertId },
    include: {
      customer: true,
    },
  });

  if (!alert) {
    return NextResponse.json({ error: 'Alert not found' }, { status: 404 });
  }

  try {
    // Send notifications based on channels
    if (alert.channels.includes('email') && alert.customer.email) {
      await NotificationService.sendEmailAlert(
        alert.customer.email,
        alert.customer.name || 'Customer',
        alert.name,
        matches
      );
    }

    if (alert.channels.includes('sms') && alert.customer.phone) {
      await NotificationService.sendSMSAlert(
        alert.customer.phone,
        alert.name,
        matches.length,
        alertId
      );
    }

    // Update alert metadata
    await prisma.propertyAlert.update({
      where: { id: alertId },
      data: {
        lastChecked: new Date(),
        matchCount: {
          increment: matches.length,
        },
      },
    });

    // Mark matches as sent
    await prisma.propertyAlertMatch.updateMany({
      where: {
        alertId,
        sent: false,
      },
      data: {
        sent: true,
        sentAt: new Date(),
      },
    });

    return NextResponse.json({ 
      success: true, 
      sent: matches.length,
      channels: alert.channels,
    });
  } catch (error) {
    console.error('Failed to send alert notifications:', error);
    return NextResponse.json(
      { error: 'Failed to send notifications' },
      { status: 500 }
    );
  }
}
```

### `lib/modules/property-alerts/services/notification-service.ts`

```typescript
import { Resend } from 'resend';
import { Twilio } from 'twilio';

const resend = new Resend(process.env.RESEND_API_KEY);
const twilio = process.env.TWILIO_ACCOUNT_SID
  ? new Twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    )
  : null;

export class NotificationService {
  static async sendEmailAlert(
    to: string,
    customerName: string,
    alertName: string,
    matches: any[]
  ) {
    await resend.emails.send({
      from: 'Property Alerts <alerts@yourdomain.com>',
      to,
      subject: `New Properties Match Your Alert: ${alertName}`,
      html: this.generateEmailHTML(customerName, alertName, matches),
    });
  }

  static async sendSMSAlert(
    to: string,
    alertName: string,
    matchCount: number,
    alertId: string
  ) {
    if (!twilio) {
      console.warn('Twilio not configured, skipping SMS');
      return;
    }

    await twilio.messages.create({
      from: process.env.TWILIO_PHONE_NUMBER,
      to,
      body: `${matchCount} new ${matchCount === 1 ? 'property matches' : 'properties match'} your alert "${alertName}". View them at ${process.env.NEXT_PUBLIC_APP_URL}/alerts/${alertId}`,
    });
  }

  private static generateEmailHTML(
    customerName: string,
    alertName: string,
    matches: any[]
  ): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #0070f3; color: white; padding: 20px; text-align: center; }
          .property { border: 1px solid #ddd; margin: 15px 0; padding: 15px; border-radius: 5px; }
          .property img { max-width: 100%; height: auto; }
          .price { font-size: 24px; font-weight: bold; color: #0070f3; }
          .details { margin: 10px 0; }
          .cta { background: #0070f3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>New Property Matches!</h1>
          </div>
          
          <p>Hi ${customerName},</p>
          <p>Great news! We found ${matches.length} new ${matches.length === 1 ? 'property' : 'properties'} matching your saved alert "<strong>${alertName}</strong>".</p>
          
          ${matches.map(match => `
            <div class="property">
              ${match.property.images?.[0] ? `<img src="${match.property.images[0]}" alt="${match.property.address}" />` : ''}
              <div class="price">$${match.property.price.toLocaleString()}</div>
              <div class="details">
                <strong>${match.property.address}</strong><br>
                ${match.property.city}, ${match.property.state} ${match.property.zipCode}<br>
                ${match.property.bedrooms} beds • ${match.property.bathrooms} baths • ${match.property.squareFeet.toLocaleString()} sqft
              </div>
              ${match.property.description ? `<p>${match.property.description.substring(0, 150)}...</p>` : ''}
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/properties/${match.property.id}" class="cta">View Property</a>
            </div>
          `).join('')}
          
          <p style="margin-top: 30px;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/alerts/${alertId}">View all matches</a> •
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/alerts/${alertId}/edit">Edit alert</a> •
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/alerts/${alertId}/unsubscribe">Unsubscribe</a>
          </p>
        </div>
      </body>
      </html>
    `;
  }
}
```

---

## Step 8: UI Components (2-3 hours)

### Create Alert List Page

```typescript
// app/(platform)/alerts/page.tsx
import { requireAuth } from '@/lib/auth/auth-helpers';
import { getPropertyAlerts } from '@/lib/modules/property-alerts/queries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Bell, BellOff } from 'lucide-react';
import Link from 'next/link';
import { AlertActions } from '@/components/property-alerts/alert-actions';

export default async function PropertyAlertsPage() {
  await requireAuth();
  const alerts = await getPropertyAlerts();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Property Alerts</h1>
          <p className="text-muted-foreground">
            Get notified when properties match your criteria
          </p>
        </div>
        <Button asChild>
          <Link href="/alerts/new">
            <Plus className="mr-2 h-4 w-4" />
            Create Alert
          </Link>
        </Button>
      </div>

      {/* Alerts List */}
      {alerts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Bell className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No alerts yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Create your first alert to start receiving notifications about new properties
            </p>
            <Button asChild>
              <Link href="/alerts/new">Create Alert</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {alerts.map((alert) => (
            <Card key={alert.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <CardTitle>{alert.name}</CardTitle>
                      {alert.active ? (
                        <Badge variant="success">
                          <Bell className="mr-1 h-3 w-3" />
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          <BellOff className="mr-1 h-3 w-3" />
                          Paused
                        </Badge>
                      )}
                    </div>
                    <CardDescription>
                      For {alert.customer.name} • {alert.matchCount} matches • 
                      {' '}{alert.frequency.toLowerCase()} notifications
                    </CardDescription>
                  </div>
                  <AlertActions alertId={alert.id} active={alert.active} />
                </div>
              </CardHeader>
              <CardContent>
                {/* Show criteria summary */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {alert.criteria.minPrice && (
                    <Badge variant="outline">
                      ${alert.criteria.minPrice.toLocaleString()}+
                    </Badge>
                  )}
                  {alert.criteria.maxPrice && (
                    <Badge variant="outline">
                      Up to ${alert.criteria.maxPrice.toLocaleString()}
                    </Badge>
                  )}
                  {alert.criteria.minBedrooms && (
                    <Badge variant="outline">
                      {alert.criteria.minBedrooms}+ beds
                    </Badge>
                  )}
                  {alert.criteria.cities && alert.criteria.cities.length > 0 && (
                    <Badge variant="outline">
                      {alert.criteria.cities.join(', ')}
                    </Badge>
                  )}
                </div>

                {/* Recent matches */}
                {alert.matches.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Recent Matches</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {alert.matches.slice(0, 3).map((match) => (
                        <Link
                          key={match.id}
                          href={`/properties/${match.property.id}`}
                          className="block border rounded-lg p-3 hover:border-primary transition-colors"
                        >
                          <div className="font-semibold text-sm">
                            ${match.property.price.toLocaleString()}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {match.property.address}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {match.property.bedrooms} beds • {match.property.bathrooms} baths
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

## Step 9: Testing (1 hour)

### Manual Testing Checklist

1. **Create Alert**
   - [ ] Create alert with various criteria combinations
   - [ ] Verify alert saved to database
   - [ ] Check n8n workflow triggered (optional)

2. **n8n Workflow**
   - [ ] Manually trigger workflow in n8n
   - [ ] Verify MLS API called with correct parameters
   - [ ] Check properties matched correctly
   - [ ] Verify matches saved to database

3. **Notifications**
   - [ ] Test email delivery (check spam folder)
   - [ ] Test SMS delivery (if configured)
   - [ ] Verify notification content accurate

4. **UI**
   - [ ] List alerts page displays correctly
   - [ ] Create/edit alert forms work
   - [ ] Toggle active/inactive works
   - [ ] Delete alert works

### Automated Tests

```typescript
// __tests__/property-alerts.test.ts
import { describe, it, expect } from 'vitest';
import { createPropertyAlert } from '@/lib/modules/property-alerts/actions';

describe('Property Alerts', () => {
  it('should create alert with valid input', async () => {
    const input = {
      organizationId: 'test-org-id',
      customerId: 'test-customer-id',
      name: 'Test Alert',
      criteria: {
        minPrice: 200000,
        maxPrice: 500000,
        minBedrooms: 3,
        cities: ['Austin'],
      },
      frequency: 'DAILY',
      channels: ['email'],
    };

    const alert = await createPropertyAlert(input);
    expect(alert.name).toBe('Test Alert');
    expect(alert.active).toBe(true);
  });
});
```

---

## Step 10: Deployment & Monitoring (30 minutes)

### Environment Variables

Add to `.env.local`:

```env
# n8n
N8N_WEBHOOK_URL=http://localhost:5678/webhook
N8N_API_KEY=your-api-key
N8N_WEBHOOK_SECRET=your-webhook-secret

# MLS API
MLS_API_URL=https://api.mlsgateway.com/v2
MLS_API_KEY=your-mls-api-key

# Notifications
RESEND_API_KEY=your-resend-api-key
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_PHONE_NUMBER=+1234567890
```

### Monitoring

Set up monitoring in n8n:
1. Enable webhook for workflow failures
2. Set up Slack/email notifications
3. Monitor execution times

```javascript
// Add to n8n workflow - Error Workflow
{
  "parameters": {
    "url": "{{ $env.SLACK_WEBHOOK_URL }}",
    "options": {
      "bodyParametersUi": {
        "parameter": [
          {
            "name": "text",
            "value": "Alert workflow failed: {{ $json.error }}"
          }
        ]
      }
    }
  },
  "name": "Notify on Failure",
  "type": "n8n-nodes-base.httpRequest"
}
```

---

## Troubleshooting

**n8n workflow not triggering:**
- Check n8n is running: `docker ps`
- Verify webhook URL in Next.js matches n8n
- Check n8n logs: `docker logs n8n`

**No matches found:**
- Verify MLS API credentials
- Check query parameters being sent
- Test MLS API directly with curl

**Notifications not sending:**
- Check API keys for Resend/Twilio
- Verify customer has email/phone
- Check spam folder for emails

---

## Next Steps

1. **Add More Notification Channels**
   - Push notifications (Firebase)
   - In-app notifications

2. **Enhanced Matching**
   - ML-based match scoring
   - Personalized recommendations

3. **Analytics**
   - Track alert performance
   - Measure conversion rates

4. **Mobile App**
   - React Native app for alerts
   - Instant push notifications

---

## Resources

- [n8n Documentation](https://docs.n8n.io/)
- [Prisma Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)
- [Next.js Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions)
- [Resend Email API](https://resend.com/docs)
- [Twilio SMS API](https://www.twilio.com/docs/sms)