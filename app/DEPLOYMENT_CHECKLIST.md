# Pre-Deployment Checklist

**Project:** Strive Tech Unified App (Marketing + Platform)
**Version:** 2.0 Post-Migration
**Last Updated:** 2025-09-30

Use this checklist before deploying to production. Check off each item as completed.

---

## 🔧 Code Quality & Build

### TypeScript
- [ ] Zero TypeScript errors: `npx tsc --noEmit`
- [ ] All type definitions correct
- [ ] No `any` types in critical code
- [ ] Prisma client generated: `npx prisma generate`

### ESLint
- [ ] Critical errors resolved: `npm run lint`
- [ ] Warnings documented (if deferring)
- [ ] No unused variables in production code
- [ ] React best practices followed

### Build
- [ ] Production build succeeds: `npm run build`
- [ ] No build warnings (or documented)
- [ ] Bundle sizes reasonable (< 500KB per page)
- [ ] No console.log statements in production

### Dependencies
- [ ] All packages up to date (or documented)
- [ ] No security vulnerabilities: `npm audit`
- [ ] Lock file committed: `package-lock.json`
- [ ] No unnecessary dependencies

---

## 🗄️ Database

### Migrations
- [ ] All migrations applied: `npx prisma migrate deploy`
- [ ] Migration history clean
- [ ] Rollback plan documented
- [ ] Database backed up

### Schema
- [ ] Prisma schema matches production
- [ ] All relations defined correctly
- [ ] Indexes on frequently queried fields
- [ ] RLS policies enabled (Supabase)

### Data
- [ ] Test data removed (if any)
- [ ] Seed data prepared (if needed)
- [ ] No hardcoded IDs in code
- [ ] Multi-tenancy tested (organizationId)

---

## 🔐 Security

### Environment Variables
- [ ] All secrets generated securely
- [ ] Production values different from dev
- [ ] No secrets in code or git history
- [ ] `.env.local` in `.gitignore`
- [ ] Vercel env vars configured

### Authentication
- [ ] JWT_SECRET rotated for production
- [ ] Session timeout configured
- [ ] Password requirements enforced
- [ ] Failed login attempts limited
- [ ] CSRF protection enabled

### API Security
- [ ] Rate limiting on all public endpoints
- [ ] Input validation with Zod schemas
- [ ] SQL injection prevention (using Prisma)
- [ ] XSS prevention (React escaping)
- [ ] CORS configured correctly

### Headers & SSL
- [ ] Security headers configured (next.config.mjs)
- [ ] HTTPS enforced
- [ ] SSL certificates valid
- [ ] HSTS enabled
- [ ] Content Security Policy reviewed

---

## 🧪 Testing

### Marketing Site (strivetech.ai)
- [ ] Homepage loads without errors
- [ ] All navigation links work
- [ ] About page displays correctly
- [ ] Contact form submits
- [ ] Solutions pages load
- [ ] Resources page loads
- [ ] Portfolio page loads
- [ ] Legal pages accessible (privacy, terms, cookies)
- [ ] Chatbot iframe loads (if enabled)
- [ ] Mobile responsive on all pages

### Platform (app.strivetech.ai)
- [ ] Login page displays
- [ ] Signup flow works
- [ ] Email verification (if enabled)
- [ ] Dashboard loads after auth
- [ ] CRM pages functional
- [ ] Projects pages functional
- [ ] AI chat works (if enabled)
- [ ] Tools marketplace loads
- [ ] Settings pages work
- [ ] Team management functional

### Forms & Interactions
- [ ] Contact form sends emails
- [ ] Newsletter signup works
- [ ] Request demo form works
- [ ] Assessment form saves data
- [ ] Onboarding wizard completes
- [ ] All modals open/close correctly
- [ ] Dropdowns work properly
- [ ] File uploads work (if any)

### Database Operations
- [ ] CRUD operations work (Create, Read, Update, Delete)
- [ ] Queries return correct data
- [ ] Pagination works
- [ ] Search functions properly
- [ ] Filtering works
- [ ] Sorting works
- [ ] Multi-tenancy isolates data

### Authentication Flow
- [ ] Login with valid credentials
- [ ] Login with invalid credentials (proper error)
- [ ] Logout clears session
- [ ] Protected routes redirect to login
- [ ] Session persists on refresh
- [ ] Concurrent sessions handled
- [ ] Password reset flow (if implemented)

---

## 🚀 Performance

### Load Times
- [ ] First Contentful Paint < 1.8s
- [ ] Largest Contentful Paint < 2.5s
- [ ] Time to Interactive < 3.8s
- [ ] Speed Index < 3.4s
- [ ] Total Blocking Time < 200ms

### Core Web Vitals
- [ ] LCP (Largest Contentful Paint) < 2.5s
- [ ] FID (First Input Delay) < 100ms
- [ ] CLS (Cumulative Layout Shift) < 0.1

### Lighthouse Scores
- [ ] Performance: 90+
- [ ] Accessibility: 95+
- [ ] Best Practices: 95+
- [ ] SEO: 95+

### Optimization
- [ ] Images optimized (WebP, lazy loading)
- [ ] Code splitting implemented
- [ ] Unused code eliminated
- [ ] Critical CSS inlined
- [ ] Fonts preloaded
- [ ] Third-party scripts deferred

---

## 📱 Responsive & Cross-Browser

### Devices Tested
- [ ] Desktop (1920x1080)
- [ ] Laptop (1366x768)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667)
- [ ] Mobile (414x896)

### Browsers Tested
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

### Responsiveness
- [ ] Navigation collapses on mobile
- [ ] Forms usable on mobile
- [ ] Tables scroll horizontally on mobile
- [ ] Images scale properly
- [ ] Text readable without zoom
- [ ] Buttons large enough for touch

---

## ♿ Accessibility

### WCAG 2.1 AA Compliance
- [ ] Color contrast ratios meet 4.5:1 (normal text)
- [ ] Color contrast ratios meet 3:1 (large text)
- [ ] All images have alt text
- [ ] Form labels properly associated
- [ ] ARIA labels on interactive elements
- [ ] Landmark regions defined

### Keyboard Navigation
- [ ] All interactive elements reachable by Tab
- [ ] Focus indicators visible
- [ ] Escape closes modals
- [ ] Enter submits forms
- [ ] No keyboard traps
- [ ] Logical tab order

### Screen Reader Testing
- [ ] Page structure makes sense
- [ ] Headings in logical order (h1, h2, h3)
- [ ] Links descriptive (not "click here")
- [ ] Form errors announced
- [ ] Loading states communicated
- [ ] Dynamic content announced (aria-live)

---

## 🔍 SEO

### Meta Tags
- [ ] Every page has unique title
- [ ] Every page has meta description
- [ ] Meta descriptions 150-160 characters
- [ ] Keywords included (but not stuffed)
- [ ] Canonical URLs set

### Open Graph
- [ ] og:title on all pages
- [ ] og:description on all pages
- [ ] og:image on all pages (1200x630)
- [ ] og:url on all pages
- [ ] og:type set correctly

### Twitter Cards
- [ ] twitter:card type set
- [ ] twitter:title on all pages
- [ ] twitter:description on all pages
- [ ] twitter:image on all pages

### Structured Data
- [ ] Organization schema on homepage
- [ ] Article schema on blog posts (if any)
- [ ] Product schema on solutions
- [ ] BreadcrumbList schema
- [ ] Validated with Google Rich Results Test

### Technical SEO
- [ ] Sitemap.xml generated
- [ ] Sitemap.xml submitted to Google
- [ ] robots.txt configured
- [ ] 404 page exists
- [ ] Redirects configured (if needed)
- [ ] Internal links use descriptive anchor text

---

## 🌐 Infrastructure

### DNS Configuration
- [ ] A record for strivetech.ai
- [ ] CNAME for www.strivetech.ai
- [ ] A record for app.strivetech.ai
- [ ] A record for chatbot.strivetech.ai (if separate)
- [ ] TTL set appropriately (300-3600)
- [ ] DNS propagation verified

### SSL/TLS
- [ ] SSL certificate installed
- [ ] Certificate covers all subdomains
- [ ] Certificate not expiring soon (> 30 days)
- [ ] HTTP redirects to HTTPS
- [ ] SSL Labs grade A or A+

### Hosting/Platform
- [ ] Vercel project configured
- [ ] Environment variables set
- [ ] Custom domains added
- [ ] Build settings correct
- [ ] Root directory set to `app/`

### CDN & Caching
- [ ] Static assets on CDN
- [ ] Cache headers configured
- [ ] Image optimization enabled
- [ ] Browser caching enabled
- [ ] Edge caching enabled (if using Vercel)

---

## 📧 Email & Integrations

### SMTP Configuration
- [ ] SMTP credentials valid
- [ ] Test email sends successfully
- [ ] From address configured
- [ ] Reply-to address set
- [ ] Email templates reviewed
- [ ] Unsubscribe link (if newsletter)

### Supabase
- [ ] Project provisioned
- [ ] Database connected
- [ ] Authentication configured
- [ ] Storage buckets created (if needed)
- [ ] RLS policies enabled
- [ ] API keys correct

### AI Services (Optional)
- [ ] OpenRouter API key valid
- [ ] Groq API key valid (if used)
- [ ] Rate limits understood
- [ ] Cost monitoring enabled
- [ ] Error handling for AI failures

### Stripe (Optional)
- [ ] Live keys configured
- [ ] Webhooks configured
- [ ] Webhook signing secret set
- [ ] Test payments successful
- [ ] Refund process tested
- [ ] Subscription flow tested

### Analytics (Optional)
- [ ] Google Analytics installed
- [ ] Events tracked correctly
- [ ] Conversion goals set
- [ ] Privacy policy mentions analytics
- [ ] Cookie consent banner (if required)

---

## 📊 Monitoring & Logging

### Error Tracking
- [ ] Sentry (or similar) configured
- [ ] Error notifications enabled
- [ ] Source maps uploaded
- [ ] Sensitive data filtered from logs
- [ ] Error rate baseline established

### Uptime Monitoring
- [ ] Uptime monitor configured (e.g., UptimeRobot)
- [ ] Alert emails configured
- [ ] SMS alerts (if critical)
- [ ] Status page created (if public)

### Performance Monitoring
- [ ] Vercel Analytics enabled
- [ ] Core Web Vitals tracked
- [ ] API response times monitored
- [ ] Database query performance tracked
- [ ] Slow query alerts configured

### Logging
- [ ] Application logs centralized
- [ ] Log retention policy set
- [ ] PII excluded from logs
- [ ] Log levels configured (error, warn, info)
- [ ] Log search/filtering available

---

## 💾 Backup & Recovery

### Database Backups
- [ ] Automated backups enabled
- [ ] Backup frequency: Daily minimum
- [ ] Backup retention: 30 days minimum
- [ ] Backup restoration tested
- [ ] Point-in-time recovery available

### Code Backups
- [ ] Code in git repository
- [ ] Repository backed up externally
- [ ] Tags/releases created
- [ ] Deployment scripts versioned

### Rollback Plan
- [ ] Rollback procedure documented
- [ ] Previous deployment accessible
- [ ] Database rollback tested
- [ ] Rollback time estimated (< 5 min target)

---

## 📚 Documentation

### Technical Documentation
- [ ] README.md updated
- [ ] CLAUDE.md updated
- [ ] DEPLOYMENT.md reviewed
- [ ] API documentation current
- [ ] Architecture diagrams updated

### Operational Documentation
- [ ] Deployment procedure documented
- [ ] Rollback procedure documented
- [ ] Incident response plan
- [ ] Escalation contacts listed
- [ ] Runbook for common issues

### User Documentation
- [ ] User guides current (if any)
- [ ] FAQ updated
- [ ] Help center articles reviewed
- [ ] Support email configured
- [ ] Contact information current

---

## 🔔 Notifications & Communication

### Team Communication
- [ ] Deployment scheduled
- [ ] Team notified of deployment time
- [ ] Maintenance window communicated (if any)
- [ ] On-call rotation defined
- [ ] Emergency contact list current

### User Communication
- [ ] Users notified of downtime (if planned)
- [ ] Release notes prepared
- [ ] Support team briefed
- [ ] Social media posts scheduled (if applicable)
- [ ] Email announcement drafted (if applicable)

---

## ✅ Pre-Deploy Final Steps

### Last-Minute Checks
- [ ] All above sections reviewed
- [ ] Critical issues resolved
- [ ] Non-critical issues documented
- [ ] Deployment window confirmed
- [ ] Team standing by
- [ ] Rollback plan ready

### Go/No-Go Decision
- [ ] Product owner approval
- [ ] Technical lead approval
- [ ] QA sign-off
- [ ] Security review passed
- [ ] Performance metrics acceptable

### Deployment
- [ ] Database migrations run
- [ ] Environment variables set
- [ ] Build triggered
- [ ] Build completed successfully
- [ ] DNS updated (if needed)
- [ ] Cache cleared (if needed)

---

## 🎉 Post-Deployment

### Immediate Verification (First 15 minutes)
- [ ] Homepage loads (both domains)
- [ ] Login works
- [ ] Dashboard loads
- [ ] No 500 errors in logs
- [ ] No spike in error rate
- [ ] SSL certificate valid

### Short-Term Monitoring (First Hour)
- [ ] Performance metrics normal
- [ ] Error rate normal
- [ ] User reports reviewed
- [ ] Support tickets reviewed
- [ ] Database performance normal
- [ ] API response times normal

### Medium-Term Monitoring (First 24 Hours)
- [ ] Daily active users normal
- [ ] Conversion rates normal
- [ ] No security incidents
- [ ] No data loss
- [ ] Backups completing
- [ ] All services healthy

---

## 📝 Deployment Sign-Off

**Deployment Date:** _________________
**Deployed By:** _________________
**Verified By:** _________________

**Issues Encountered:**
- [ ] None
- [ ] Minor (documented below)
- [ ] Major (documented below and resolved)

**Notes:**
```
[Space for deployment notes, issues, and resolutions]
```

**Status:**
- [ ] ✅ Successful - Production ready
- [ ] ⚠️ Partial - Non-critical issues remain
- [ ] ❌ Failed - Rolled back

---

## 🚨 Emergency Contacts

**Technical Lead:** _________________
**DevOps:** _________________
**Database Admin:** _________________
**On-Call Engineer:** _________________

**External Support:**
- Vercel Support: https://vercel.com/support
- Supabase Support: https://supabase.com/support
- Sentry Support: https://sentry.io/support

---

**Last Updated:** 2025-09-30
**Checklist Version:** 2.0 (Post-Migration)
**Next Review Date:** _________________
