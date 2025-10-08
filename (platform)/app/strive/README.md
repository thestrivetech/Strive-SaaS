# Strive Tech Internal & Future Features

**Access:** SUPER_ADMIN only (3 users in Strive Tech organization)

This directory contains internal tools, dashboards, and future features for Strive Tech platform administration.

**SUPER_ADMIN Users:** Grant Ramey, Garrett Holland, Jeff Meyer

## Directory Structure

### /platform-admin
- **Purpose:** Platform-wide administration dashboard
- **Access:** SUPER_ADMIN role only
- **Features:** System monitoring, all organization management, platform metrics
- **Route:** `/strive/platform-admin` (accessed via user dropdown menu)
- **Moved from:** `app/(platform-admin)/platform-admin/` (2025-10-08)

### /projects-future
- **Purpose:** Future projects module implementation
- **Status:** Not yet implemented (planned Q2 2026)
- **Components:** 8 components preserved from `components/real-estate/projects/`
- **Note:** Do not use in production yet - components ready for future implementation

### /admin
- **Purpose:** Organization & user administration tools
- **Access:** SUPER_ADMIN role
- **Features:** Internal organization management

### /dashboard
- **Purpose:** Internal analytics and monitoring
- **Access:** SUPER_ADMIN role
- **Features:** Platform metrics, usage tracking

### /sid
- **Purpose:** Strive Internal Development tools
- **Access:** SUPER_ADMIN role
- **Features:** Development utilities and testing tools

### /CRM
- **Purpose:** Internal CRM for Strive Tech organization
- **Access:** SUPER_ADMIN role
- **Features:** Client relationship management for Strive Tech

## SUPER_ADMIN Access

Only 3 individuals have SUPER_ADMIN access:
- **Grant Ramey** - Platform administrator
- **Garrett Holland** - Platform administrator
- **Jeff Meyer** - Platform administrator

### Capabilities
- Full platform visibility across all organizations
- Access to all organization data (multi-tenant admin)
- System administration capabilities
- Platform-wide metrics and monitoring
- Bypass all subscription tier gates

## Mock Data & Development

Mock data is enabled for showcase and development purposes. SUPER_ADMIN users bypass:
- Subscription tier gates (full access to all features via TierGate)
- Authentication on localhost (demo-user, demo-org)
- All feature restrictions for testing and development

## Security Notes

All SUPER_ADMIN actions should be:
- Logged for security and compliance
- Used only for platform-level administration
- Never used for regular business operations
- Restricted to authorized Strive Tech personnel only

---

**Last Updated:** 2025-10-08
**Component Cleanup:** Projects module moved to projects-future, platform-admin relocated to /strive
