# REID Dashboard API Reference

## Authentication

All API endpoints require authentication via Supabase session.

**Header Requirements:**
```http
Authorization: Bearer <supabase_jwt_token>
Cookie: sb-access-token=<token>; sb-refresh-token=<token>
```

## Rate Limits

**Per Organization:**
- GROWTH tier: 100 requests/hour
- ELITE tier: 1000 requests/hour

**Rate Limit Headers:**
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640000000
```

**Rate Limit Exceeded Response:**
```json
{
  "error": "Rate limit exceeded",
  "retryAfter": 3600,
  "limit": 100,
  "resetAt": "2025-10-07T14:00:00Z"
}
```

## Error Responses

**Standard Error Format:**
```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": { ... },
  "timestamp": "2025-10-07T12:00:00Z"
}
```

**Common Error Codes:**
- `UNAUTHORIZED` (401) - No valid session
- `FORBIDDEN` (403) - Insufficient permissions
- `UPGRADE_REQUIRED` (402) - Tier upgrade needed
- `NOT_FOUND` (404) - Resource not found
- `VALIDATION_ERROR` (400) - Invalid input
- `RATE_LIMIT_EXCEEDED` (429) - Too many requests
- `INTERNAL_ERROR` (500) - Server error

---

## Endpoints

### Insights API

#### List Neighborhood Insights

**GET** `/api/v1/reid/insights`

Get all neighborhood insights for the authenticated user's organization.

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| areaCodes | string[] | No | Comma-separated area codes to filter |
| areaType | enum | No | ZIP, SCHOOL_DISTRICT, NEIGHBORHOOD, COUNTY, MSA |
| minPrice | number | No | Minimum median price |
| maxPrice | number | No | Maximum median price |
| minWalkScore | number | No | Minimum walk score (0-100) |
| minSchoolRating | number | No | Minimum school rating (0-10) |
| limit | number | No | Results per page (default: 50, max: 100) |
| offset | number | No | Pagination offset (default: 0) |
| sortBy | string | No | Field to sort by (default: areaName) |
| sortOrder | string | No | asc or desc (default: asc) |

**Example Request:**
```http
GET /api/v1/reid/insights?areaCodes=94110,94103&minPrice=500000&limit=20
```

**Success Response (200):**
```json
{
  "insights": [
    {
      "id": "cuid_123",
      "areaCode": "94110",
      "areaName": "Mission District",
      "areaType": "ZIP",
      "marketData": {
        "medianPrice": 1200000,
        "priceChange": 5.2,
        "inventory": 145,
        "daysOnMarket": 28
      },
      "demographics": {
        "population": 54321,
        "medianAge": 34,
        "medianIncome": 85000,
        "households": 23456
      },
      "amenities": {
        "walkScore": 95,
        "bikeScore": 88,
        "transitScore": 100,
        "schoolRating": 7.5,
        "parkProximity": 0.3
      },
      "latitude": 37.7599,
      "longitude": -122.4148,
      "lastUpdated": "2025-10-07T08:00:00Z",
      "createdAt": "2025-01-15T10:30:00Z",
      "updatedAt": "2025-10-07T08:00:00Z"
    }
  ],
  "total": 2,
  "limit": 20,
  "offset": 0
}
```

---

#### Get Specific Insight

**GET** `/api/v1/reid/insights/[areaCode]`

Get detailed insight for a specific area.

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| areaCode | string | Yes | Area code (ZIP, school district, etc.) |

**Example Request:**
```http
GET /api/v1/reid/insights/94110
```

**Success Response (200):**
```json
{
  "insight": {
    "id": "cuid_123",
    "areaCode": "94110",
    "areaName": "Mission District",
    "areaType": "ZIP",
    "marketData": { ... },
    "demographics": { ... },
    "amenities": { ... },
    "roiAnalysis": {
      "rentYield": 4.2,
      "appreciationRate": 5.5,
      "investmentGrade": "A",
      "capRate": 5.8
    },
    "aiProfile": "AI-generated profile text...",
    "aiInsights": [
      "Strong rental demand with low vacancy",
      "Rapid gentrification in progress",
      "Excellent public transit access"
    ],
    "boundary": {
      "type": "Polygon",
      "coordinates": [ ... ]
    }
  }
}
```

**Error Response (404):**
```json
{
  "error": "Neighborhood insight not found",
  "code": "NOT_FOUND"
}
```

---

#### Create Neighborhood Insight

**POST** `/api/v1/reid/insights`

Create a new neighborhood insight.

**RBAC:** Requires GROWTH+ tier, MEMBER+ org role

**Request Body:**
```json
{
  "areaCode": "94110",
  "areaName": "Mission District",
  "areaType": "ZIP",
  "marketData": {
    "medianPrice": 1200000,
    "priceChange": 5.2,
    "inventory": 145,
    "daysOnMarket": 28
  },
  "demographics": {
    "population": 54321,
    "medianAge": 34,
    "medianIncome": 85000
  },
  "amenities": {
    "walkScore": 95,
    "schoolRating": 7.5
  },
  "latitude": 37.7599,
  "longitude": -122.4148
}
```

**Success Response (201):**
```json
{
  "insight": {
    "id": "cuid_new",
    "areaCode": "94110",
    ...
  }
}
```

**Error Response (402):**
```json
{
  "error": "Upgrade required",
  "code": "UPGRADE_REQUIRED",
  "upgradeUrl": "/settings/billing",
  "requiredTier": "GROWTH"
}
```

---

#### Update Neighborhood Insight

**PUT** `/api/v1/reid/insights/[id]`

Update an existing neighborhood insight.

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | Insight ID (CUID) |

**Request Body:**
```json
{
  "marketData": {
    "medianPrice": 1250000,
    "priceChange": 6.1
  },
  "demographics": {
    "medianIncome": 87000
  }
}
```

**Success Response (200):**
```json
{
  "insight": {
    "id": "cuid_123",
    "updatedAt": "2025-10-07T12:00:00Z",
    ...
  }
}
```

---

#### Delete Neighborhood Insight

**DELETE** `/api/v1/reid/insights/[id]`

Delete a neighborhood insight.

**RBAC:** Requires ADMIN+ org role

**Success Response (200):**
```json
{
  "success": true,
  "id": "cuid_123"
}
```

---

### Alerts API

#### List Property Alerts

**GET** `/api/v1/reid/alerts`

Get all property alerts for the authenticated user's organization.

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| isActive | boolean | No | Filter by active status |
| alertType | enum | No | PRICE_DROP, PRICE_INCREASE, etc. |

**Success Response (200):**
```json
{
  "alerts": [
    {
      "id": "cuid_alert_1",
      "name": "Mission District Price Drop",
      "description": "Alert when prices drop 5%+",
      "alertType": "PRICE_DROP",
      "criteria": {
        "threshold": -5,
        "comparison": "percentage",
        "timeframe": "weekly"
      },
      "areaCodes": ["94110", "94103"],
      "isActive": true,
      "emailEnabled": true,
      "smsEnabled": false,
      "frequency": "DAILY",
      "lastTriggered": "2025-10-06T09:00:00Z",
      "triggerCount": 3,
      "createdAt": "2025-09-01T10:00:00Z"
    }
  ],
  "total": 5
}
```

---

#### Create Property Alert

**POST** `/api/v1/reid/alerts`

Create a new property alert.

**RBAC:** Requires GROWTH+ tier, MEMBER+ org role

**Tier Limits:**
- GROWTH: 10 alerts max
- ELITE: Unlimited

**Request Body:**
```json
{
  "name": "Price Drop Alert",
  "description": "Notify on significant price drops",
  "alertType": "PRICE_DROP",
  "criteria": {
    "threshold": -5,
    "comparison": "percentage"
  },
  "areaCodes": ["94110", "94103"],
  "emailEnabled": true,
  "smsEnabled": false,
  "frequency": "DAILY"
}
```

**Success Response (201):**
```json
{
  "alert": {
    "id": "cuid_new_alert",
    "name": "Price Drop Alert",
    ...
  }
}
```

**Error Response (402):**
```json
{
  "error": "Alert limit reached",
  "code": "TIER_LIMIT_EXCEEDED",
  "currentCount": 10,
  "limit": 10,
  "upgradeUrl": "/settings/billing"
}
```

---

#### Update Property Alert

**PUT** `/api/v1/reid/alerts/[id]`

Update an existing property alert.

**Request Body:**
```json
{
  "isActive": false,
  "frequency": "WEEKLY"
}
```

**Success Response (200):**
```json
{
  "alert": {
    "id": "cuid_alert_1",
    "isActive": false,
    "frequency": "WEEKLY",
    "updatedAt": "2025-10-07T12:00:00Z"
  }
}
```

---

#### Delete Property Alert

**DELETE** `/api/v1/reid/alerts/[id]`

Delete a property alert.

**Success Response (200):**
```json
{
  "success": true,
  "id": "cuid_alert_1"
}
```

---

#### List Alert Triggers

**GET** `/api/v1/reid/alerts/triggers`

Get alert trigger history.

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| alertId | string | No | Filter by specific alert |
| acknowledged | boolean | No | Filter by acknowledgment status |
| severity | enum | No | LOW, MEDIUM, HIGH, CRITICAL |
| startDate | string | No | ISO date (2025-01-01) |
| endDate | string | No | ISO date (2025-12-31) |

**Success Response (200):**
```json
{
  "triggers": [
    {
      "id": "cuid_trigger_1",
      "alertId": "cuid_alert_1",
      "alert": {
        "name": "Price Drop Alert"
      },
      "triggeredBy": {
        "areaCode": "94110",
        "oldPrice": 1200000,
        "newPrice": 1100000,
        "changePercent": -8.3
      },
      "message": "Price dropped 8.3% in Mission District (94110)",
      "severity": "HIGH",
      "emailSent": true,
      "smsSent": false,
      "acknowledged": false,
      "triggeredAt": "2025-10-07T09:00:00Z"
    }
  ],
  "total": 15
}
```

---

#### Acknowledge Alert Trigger

**POST** `/api/v1/reid/alerts/triggers/[id]/acknowledge`

Mark an alert trigger as acknowledged.

**Success Response (200):**
```json
{
  "trigger": {
    "id": "cuid_trigger_1",
    "acknowledged": true,
    "acknowledgedAt": "2025-10-07T12:00:00Z",
    "acknowledgedBy": "user_id_123"
  }
}
```

---

### Reports API

#### List Market Reports

**GET** `/api/v1/reid/reports`

Get all market reports for the authenticated user's organization.

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| reportType | enum | No | NEIGHBORHOOD_ANALYSIS, MARKET_OVERVIEW, etc. |
| startDate | string | No | ISO date |
| endDate | string | No | ISO date |

**Success Response (200):**
```json
{
  "reports": [
    {
      "id": "cuid_report_1",
      "title": "Mission District Q4 2024 Analysis",
      "description": "Comprehensive market analysis",
      "reportType": "NEIGHBORHOOD_ANALYSIS",
      "areaCodes": ["94110"],
      "dateRange": {
        "start": "2024-10-01",
        "end": "2024-12-31"
      },
      "summary": "Strong market with upward trends...",
      "pdfUrl": "https://storage.supabase.co/...",
      "csvUrl": "https://storage.supabase.co/...",
      "isPublic": false,
      "shareToken": null,
      "createdAt": "2025-01-05T10:00:00Z"
    }
  ],
  "total": 8
}
```

---

#### Generate Market Report

**POST** `/api/v1/reid/reports`

Generate a new market report.

**RBAC:** Requires GROWTH+ tier, MEMBER+ org role

**Tier Limits:**
- GROWTH: 5 reports/month
- ELITE: Unlimited

**Request Body:**
```json
{
  "title": "Mission District Analysis",
  "description": "Q4 2024 market analysis",
  "reportType": "NEIGHBORHOOD_ANALYSIS",
  "areaCodes": ["94110"],
  "dateRange": {
    "start": "2024-10-01",
    "end": "2024-12-31"
  },
  "filters": {
    "minPrice": 500000,
    "maxPrice": 2000000
  },
  "includeCharts": true,
  "includeTables": true,
  "generatePDF": true,
  "generateCSV": true
}
```

**Success Response (201):**
```json
{
  "report": {
    "id": "cuid_new_report",
    "title": "Mission District Analysis",
    "status": "generating",
    "estimatedTime": 60,
    ...
  }
}
```

**Processing:**
Report generation is asynchronous. Poll the GET endpoint to check status.

---

#### Get Market Report

**GET** `/api/v1/reid/reports/[id]`

Get a specific market report.

**Success Response (200):**
```json
{
  "report": {
    "id": "cuid_report_1",
    "title": "Mission District Analysis",
    "status": "completed",
    "insights": {
      "keyFindings": [
        "Median price increased 12% year-over-year",
        "Inventory down 15% from last quarter",
        "Days on market decreased to 24 days"
      ],
      "marketScore": 8.5,
      "investmentRating": "A"
    },
    "charts": [
      {
        "type": "line",
        "title": "Price Trends",
        "data": [ ... ]
      }
    ],
    "tables": [
      {
        "title": "Area Comparison",
        "headers": ["Area", "Price", "Change"],
        "rows": [ ... ]
      }
    ],
    "pdfUrl": "https://storage.supabase.co/...",
    "csvUrl": "https://storage.supabase.co/..."
  }
}
```

---

#### Generate PDF Export

**POST** `/api/v1/reid/reports/[id]/pdf`

Generate or regenerate PDF version of report.

**Success Response (200):**
```json
{
  "pdfUrl": "https://storage.supabase.co/...",
  "expiresAt": "2025-10-14T12:00:00Z"
}
```

---

#### Generate CSV Export

**POST** `/api/v1/reid/reports/[id]/csv`

Generate or regenerate CSV version of report data.

**Success Response (200):**
```json
{
  "csvUrl": "https://storage.supabase.co/...",
  "expiresAt": "2025-10-14T12:00:00Z"
}
```

---

### AI API (Elite Tier Only)

#### Generate AI Neighborhood Profile

**POST** `/api/v1/reid/ai/profile`

Generate AI-powered neighborhood analysis.

**RBAC:** Requires ELITE tier

**Request Body:**
```json
{
  "areaCode": "94110"
}
```

**Success Response (200):**
```json
{
  "profile": {
    "summary": "Mission District is a vibrant, culturally rich neighborhood...",
    "marketAnalysis": "Strong appreciation trends with consistent demand...",
    "demographics": "Young, diverse population with high education levels...",
    "investmentOutlook": "Excellent long-term investment potential...",
    "insights": [
      "95% walkability score indicates excellent pedestrian infrastructure",
      "Transit score of 100 provides exceptional commute options",
      "School ratings improving with recent investments"
    ],
    "investmentGrade": "A",
    "riskLevel": "Low",
    "recommendedStrategy": "Buy and hold for appreciation",
    "keyMetrics": {
      "appreciationForecast": 6.5,
      "rentalDemand": "Very High",
      "marketStability": "High"
    }
  },
  "generatedAt": "2025-10-07T12:00:00Z",
  "model": "gpt-4-turbo",
  "tokensUsed": 1250
}
```

**Error Response (402):**
```json
{
  "error": "AI features require Elite subscription",
  "code": "UPGRADE_REQUIRED",
  "upgradeUrl": "/settings/billing",
  "requiredTier": "ELITE"
}
```

---

#### Analyze Multiple Areas

**POST** `/api/v1/reid/ai/insights`

Compare multiple areas with AI analysis.

**RBAC:** Requires ELITE tier

**Request Body:**
```json
{
  "areaCodes": ["94110", "94103", "94102"],
  "analysisType": "comparative",
  "criteria": {
    "budget": 1500000,
    "investmentType": "rental",
    "riskTolerance": "moderate"
  }
}
```

**Success Response (200):**
```json
{
  "comparison": {
    "bestOverall": "94110",
    "bestValue": "94102",
    "lowestRisk": "94103",
    "areas": [
      {
        "areaCode": "94110",
        "areaName": "Mission District",
        "score": 8.5,
        "pros": [
          "Excellent walkability",
          "Strong appreciation history",
          "High rental demand"
        ],
        "cons": [
          "Higher entry price",
          "Competitive market"
        ],
        "recommendation": "Buy",
        "confidence": 0.85
      }
    ]
  }
}
```

---

#### Get Investment Recommendations

**POST** `/api/v1/reid/ai/recommendations`

Get AI-powered investment recommendations.

**RBAC:** Requires ELITE tier

**Request Body:**
```json
{
  "budget": 1500000,
  "investmentType": "rental",
  "riskTolerance": "moderate",
  "preferences": {
    "minWalkScore": 80,
    "minSchoolRating": 7,
    "preferredAreas": ["San Francisco", "Oakland"]
  }
}
```

**Success Response (200):**
```json
{
  "recommendations": [
    {
      "areaCode": "94110",
      "areaName": "Mission District",
      "matchScore": 92,
      "estimatedPrice": 1350000,
      "projectedROI": 8.5,
      "reasoning": "Excellent match based on walkability, transit access, and appreciation potential",
      "risks": ["Market saturation", "Higher competition"],
      "opportunities": ["New development nearby", "Improving school ratings"],
      "timeframe": "1-3 months",
      "confidence": 0.88
    }
  ],
  "marketConditions": "favorable",
  "timing": "good_time_to_buy"
}
```

---

## Webhooks (Coming Soon)

Future webhook support for:
- Alert triggers
- Report completion
- Market data updates
- AI analysis completion

---

## SDK Support (Coming Soon)

JavaScript/TypeScript SDK for easier API integration.

---

**Last Updated:** 2025-10-07
**API Version:** v1
**Status:** Production Ready
