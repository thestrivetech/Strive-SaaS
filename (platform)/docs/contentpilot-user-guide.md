# ContentPilot User Guide

**Version:** 1.0
**Last Updated:** 2025-10-07
**Module:** CMS & Marketing

## Table of Contents

1. [Overview](#overview)
2. [Getting Started](#getting-started)
3. [Content Management](#content-management)
4. [Media Library](#media-library)
5. [Campaign Management](#campaign-management)
6. [Analytics](#analytics)
7. [Best Practices](#best-practices)
8. [Keyboard Shortcuts](#keyboard-shortcuts)
9. [Troubleshooting](#troubleshooting)

---

## Overview

ContentPilot is Strive Tech's integrated Content Management System (CMS) and Marketing automation platform. It enables you to create, manage, and publish content across multiple channels while tracking performance through comprehensive analytics.

### Key Features

- **Content Management**: Create and publish blog posts, articles, pages, and landing pages
- **Rich Text Editor**: Professional editing with formatting, media embedding, and SEO optimization
- **Media Library**: Organize images, videos, and documents with folder structure
- **Email Campaigns**: Design and send targeted email campaigns
- **Social Media Scheduling**: Plan and schedule posts across multiple platforms
- **Analytics Dashboard**: Track content performance, engagement, and ROI

### Subscription Requirements

ContentPilot is available on **GROWTH tier and above**:
- **GROWTH** ($699/seat): 100 content items, 500 media assets, 5 campaigns per month
- **ELITE** ($999/seat): Unlimited content, media, and campaigns
- **ENTERPRISE**: Custom limits with white-label options

---

## Getting Started

### Accessing ContentPilot

1. Navigate to your Strive Tech dashboard
2. Click **"ContentPilot"** in the left sidebar under CMS & Marketing
3. You'll land on the ContentPilot Dashboard

### Dashboard Overview

The dashboard provides:
- **Content Overview**: Total content items, published count, drafts
- **Quick Actions**: One-click access to common tasks
- **Recent Content**: Your latest edited content
- **Active Campaigns**: Currently running campaigns
- **Content Calendar**: Scheduled content timeline

### First Steps

1. **Create Your First Content**
   - Click "New Article" in Quick Actions
   - Or navigate to Content Library → Create Content

2. **Upload Media**
   - Click "Upload Media" in Quick Actions
   - Or go to Media Library → Upload

3. **Launch a Campaign**
   - Click "Email Campaign" or "Schedule Post"
   - Follow the campaign builder wizard

---

## Content Management

### Creating Content

**Step 1: Navigate to Editor**
- From Dashboard: Click "New Article" in Quick Actions
- From Content Library: Click "+ Create Content" button
- Direct path: `/real-estate/cms-marketing/content/new`

**Step 2: Fill in Content Details**

**Required Fields:**
- **Title**: SEO-friendly title for your content (max 200 characters)
- **Slug**: URL path (auto-generated from title, editable)
- **Content Type**: Blog Post, Article, Page, Landing Page, Case Study, Guide
- **Status**: Draft, Review, Published, Scheduled, Archived

**Optional Fields:**
- **Excerpt**: Brief summary (recommended for SEO, max 500 characters)
- **Featured Image**: Main image for content (from Media Library)
- **Category**: Content categorization (Blog, News, Resources, Guides, Case Studies)
- **Tags**: Keywords for discovery (comma-separated)
- **SEO Settings**: Meta description, keywords, canonical URL
- **Author**: Content creator (defaults to current user)
- **Published Date**: When content goes live (for scheduling)

**Step 3: Write Your Content**

Use the rich text editor with:
- Text formatting (bold, italic, underline, strikethrough)
- Headings (H1-H6)
- Lists (bullets, numbered)
- Links and images
- Code blocks
- Quotes and callouts
- Tables
- Embeds (videos, tweets, documents)

**Keyboard Shortcuts:**
- **Ctrl/Cmd + S**: Save draft
- **Ctrl/Cmd + P**: Publish content
- **Ctrl/Cmd + B**: Bold
- **Ctrl/Cmd + I**: Italic
- **Ctrl/Cmd + K**: Insert link
- **Ctrl/Cmd + Z**: Undo
- **Ctrl/Cmd + Shift + Z**: Redo

**Step 4: SEO Optimization**

Complete the SEO section:
- **Meta Description**: 150-160 characters describing content
- **Focus Keywords**: 3-5 keywords you're targeting
- **Readability Check**: Aim for clear, scannable content
- **SEO Preview**: See how content appears in search results
- **Canonical URL**: Prevent duplicate content issues

**Step 5: Save or Publish**

- **Save Draft**: Work in progress (visible only to you)
- **Submit for Review**: Send to approvers (MODERATOR/ADMIN role)
- **Schedule**: Publish at future date/time
- **Publish Now**: Make live immediately (requires ADMIN role)

### Managing Content

**Content Library** (`/real-estate/cms-marketing/content`)

View all your content with:
- **Search**: Find content by title, excerpt, keywords
- **Filters**: Status, type, category, author, date range
- **Sort**: Recent, title, views, engagement
- **Bulk Actions**: Delete, change status, categorize

**Content Actions:**
- **Edit**: Make changes to content
- **Duplicate**: Create copy of content
- **View**: Preview published content
- **Analytics**: See performance metrics
- **Delete**: Permanently remove (confirm required, ADMIN only)

### Content Workflow

**Roles & Permissions:**
- **USER**: Create drafts, submit for review
- **MODERATOR**: Create, edit, submit for review
- **ADMIN**: Full access - create, edit, publish, delete
- **OWNER**: Full access + settings management

**Publishing Workflow:**
1. USER creates draft
2. USER submits for review
3. ADMIN reviews content
4. ADMIN publishes or requests changes
5. Content goes live at scheduled time

### Content Revisions

Every content update creates a revision:
- View revision history (last 50 revisions)
- Compare changes between versions
- Restore previous version
- See who made changes and when
- Track content evolution over time

---

## Media Library

### Uploading Media

**Supported File Types:**
- **Images**: JPG, PNG, GIF, WebP, SVG (max 10MB)
- **Videos**: MP4, WebM, MOV (max 50MB)
- **Documents**: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX (max 10MB)

**Upload Process:**
1. Navigate to Media Library (`/real-estate/cms-marketing/media`)
2. Click "Upload" button or drag-and-drop files
3. Select files from your computer
4. Wait for upload completion (progress bar shown)
5. Files appear in current folder

**Bulk Upload:**
- Select multiple files (Shift+Click or Ctrl+Click)
- Drag entire folders (creates folder structure automatically)
- Upload progress shown for each file
- Failed uploads can be retried

**Upload Limits by Tier:**
- **GROWTH**: 500 media assets, 5GB storage
- **ELITE**: Unlimited media assets, 50GB storage
- **ENTERPRISE**: Custom storage limits

### Organizing Media

**Folder Structure:**
- Create folders to organize media
- Nest folders (unlimited depth)
- Move assets between folders (drag-and-drop)
- Rename folders and assets
- Delete empty folders

**Media Properties:**
- **Title**: Descriptive name for asset
- **Alt Text**: Accessibility description (required for images)
- **Caption**: Display text below media
- **Tags**: Keywords for search and filtering
- **Folder**: Organizational location

**Best Practices:**
- Organize by campaign, content type, or date
- Use descriptive file names (e.g., `product-launch-hero-2025.jpg`)
- Add alt text to all images (improves SEO and accessibility)
- Tag media with relevant keywords
- Delete unused media regularly (storage limits)

### Using Media in Content

**Insert in Editor:**
1. Place cursor where you want media
2. Click image/media button in toolbar
3. Select from Media Library or upload new
4. Adjust size, alignment, alt text
5. Media is embedded in content

**Featured Images:**
- Set from content editor sidebar
- Appears in content previews and cards
- Used in social media shares
- Recommended size: 1200x630px

**Media in Campaigns:**
- Email campaigns: Insert images inline
- Social posts: Attach up to 4 images/videos
- Landing pages: Use as hero images or backgrounds

### Media Optimization

**Image Optimization:**
- Automatic compression on upload (quality: 85%)
- WebP conversion for modern browsers (fallback to original format)
- Responsive image sizes generated (thumbnail, medium, large, original)
- CDN delivery for fast loading worldwide
- Lazy loading for below-fold images

**Alt Text Guidelines:**
- Describe what the image shows
- Keep it concise (125 characters or less)
- Include keywords naturally
- Don't start with "Image of" or "Picture of"
- Example: "Team meeting in modern office with whiteboard"

**File Size Tips:**
- Compress images before upload (tools: TinyPNG, ImageOptim)
- Use JPG for photos, PNG for graphics with transparency
- Convert videos to MP4 H.264 for best compatibility
- Keep total email size under 500KB for deliverability

---

## Campaign Management

### Email Campaigns

**Creating Email Campaign:**

1. Navigate to Campaigns → Email → New Campaign
2. Fill campaign details:
   - **Campaign Name**: Internal identifier (not visible to recipients)
   - **Subject Line**: 50-60 characters recommended
   - **Preheader Text**: Preview text (40-50 characters)
   - **Sender Name**: Your name or company name
   - **Sender Email**: Verified email address
   - **Reply-To Email**: Where replies go (can be different from sender)

3. Design Email:
   - Choose template or start from scratch
   - Use drag-and-drop builder
   - Add content blocks (text, images, buttons, dividers, spacers)
   - Personalize with merge tags:
     - `{{firstName}}`: Recipient's first name
     - `{{lastName}}`: Recipient's last name
     - `{{company}}`: Company name
     - `{{email}}`: Email address

4. Select Audience:
   - **All Contacts**: Send to everyone
   - **Segment by Tags**: Target specific groups
   - **Custom Properties**: Filter by any field
   - **Upload CSV**: Import external list
   - **Exclude**: Unsubscribed, bounced, or specific tags

5. Review and Send:
   - Preview on desktop and mobile
   - Send test email to your inbox
   - Check spam score (aim for <5.0)
   - Review recipient count
   - Schedule or send immediately

**Email Templates:**
- **Newsletter**: Weekly/monthly updates
- **Promotion**: Sales and offers
- **Welcome**: New subscriber onboarding
- **Announcement**: Product launches, events
- **Drip Campaign**: Automated series

**Email Best Practices:**
- Personalize subject lines (50% higher open rates)
- Keep emails under 500KB total size
- Include clear call-to-action (CTA) button
- Test on multiple email clients (Gmail, Outlook, Apple Mail)
- Always include unsubscribe link (required by law)
- Send test emails before sending to full list
- Best send times: Tuesday-Thursday, 10am-2pm local time

**Deliverability Tips:**
- Authenticate your domain (SPF, DKIM, DMARC)
- Maintain list hygiene (remove bounces, unsubscribes)
- Avoid spam trigger words ("FREE!", "Act now!", excessive caps)
- Balance text and images (60/40 ratio)
- Include plain text version
- Don't send to purchased lists

### Social Media Scheduling

**Creating Social Post:**

1. Navigate to Campaigns → Social → New Post
2. Select platforms:
   - **Facebook**: Pages and groups
   - **Twitter/X**: Tweets and threads
   - **Instagram**: Feed posts and stories
   - **LinkedIn**: Personal and company pages

3. Create content:
   - Write post copy (platform-specific character limits)
   - Add images/videos (up to 4 per post)
   - Add hashtags (#) for discovery
   - Mention accounts (@) for engagement
   - Tag location (if platform supports)
   - Add first comment (pre-populated after posting)

4. Schedule post:
   - **Post Now**: Publish immediately
   - **Schedule**: Set specific date/time
   - **Add to Queue**: Auto-schedule in next available slot
   - **Save Draft**: Return to later

**Platform-Specific Limits:**
- **Twitter/X**: 280 characters, 4 images, 1 video (2:20 max)
- **Facebook**: 63,206 characters (but shorter is better), 10 images
- **Instagram**: 2,200 characters, 10 images, 30 hashtags, 1 video (60s max)
- **LinkedIn**: 3,000 characters, 9 images, 1 video (10 min max)

**Best Times to Post:**
- **Facebook**: Weekdays 1-4 PM EST
- **Twitter/X**: Weekdays 9 AM-12 PM EST
- **Instagram**: Weekdays 11 AM-2 PM EST
- **LinkedIn**: Weekdays 7-9 AM, 5-6 PM EST

**Social Media Best Practices:**
- Use high-quality images (min 1080px width)
- Include 5-10 relevant hashtags
- Ask questions to drive engagement
- Post consistently (1-2x daily on active platforms)
- Respond to comments within 1 hour
- Share user-generated content
- Use platform-native features (polls, stories, reels)

**Content Ideas:**
- Behind-the-scenes content
- Customer testimonials and case studies
- Industry news and commentary
- How-to guides and tips
- Team spotlights
- Product updates and launches
- Interactive content (polls, Q&A)

### Campaign Analytics

Track campaign performance from Analytics Dashboard:

**Email Metrics:**
- **Delivery Rate**: % successfully delivered (aim for >95%)
- **Open Rate**: % who opened email (aim for >20%)
- **Click Rate**: % who clicked links (aim for >3%)
- **Click-to-Open Rate**: % of openers who clicked
- **Bounce Rate**: Failed deliveries (keep <2%)
- **Unsubscribe Rate**: Opt-outs (keep <0.5%)
- **Spam Complaints**: Marked as spam (keep <0.1%)
- **Conversion Rate**: Goal completions (sales, sign-ups)

**Social Metrics:**
- **Reach**: Total unique users who saw post
- **Impressions**: Total times post was displayed
- **Engagement**: Likes, comments, shares, saves
- **Engagement Rate**: Engagement / Reach (aim for >2%)
- **Click-Through Rate**: Link clicks / Impressions
- **Video Views**: For video content
- **Profile Visits**: Users who visited your profile
- **Follower Growth**: New followers from campaign

**Comparative Metrics:**
- Compare campaigns over time
- A/B test subject lines, content, send times
- Identify top-performing content types
- Track ROI (revenue / campaign cost)

---

## Analytics

### Content Performance

**Available Metrics:**
- **Views**: Total page views (includes repeat views)
- **Unique Visitors**: Individual users (cookie-based)
- **Engagement**: Average time on page, scroll depth
- **Social Shares**: Facebook, Twitter, LinkedIn counts
- **Comments**: User interactions and discussions
- **Conversion Rate**: Goal completions (form fills, purchases)
- **Bounce Rate**: % who left without interaction
- **Traffic Sources**: Direct, search, social, referral

**Viewing Analytics:**
1. Navigate to Analytics Dashboard (`/real-estate/cms-marketing/analytics`)
2. Select date range (preset: 7d, 30d, 90d, custom)
3. Filter by:
   - Content type (blog, article, page)
   - Category (blog, news, resources)
   - Author (team member)
   - Tags (keywords)
4. Export reports (PDF, CSV, Excel)

**Top Performing Content:**
- Most viewed articles (last 30 days)
- Highest engagement content
- Most shared content
- Best converting content
- Trending topics

**Content Insights:**
- Optimal post length (words vs engagement)
- Best publish times (day/hour)
- Top traffic sources
- Audience demographics
- Device breakdown (mobile/desktop)

### Campaign Metrics

**Email Campaign Analytics:**

**Delivery Metrics:**
- **Sent**: Total emails sent
- **Delivered**: Successfully delivered
- **Bounced**: Failed deliveries (hard + soft bounces)
- **Delivery Rate**: Delivered / Sent

**Engagement Metrics:**
- **Opens**: Total opens (includes multiple opens)
- **Unique Opens**: Individual recipients who opened
- **Open Rate**: Unique Opens / Delivered
- **Clicks**: Total link clicks
- **Unique Clicks**: Individual recipients who clicked
- **Click Rate**: Unique Clicks / Delivered
- **Click-to-Open Rate**: Unique Clicks / Unique Opens

**List Health:**
- **Unsubscribes**: Recipients who opted out
- **Spam Complaints**: Marked as spam
- **List Growth Rate**: New subscribers vs unsubscribes

**Social Campaign Analytics:**

**Reach Metrics:**
- **Impressions**: Times post was displayed
- **Reach**: Unique users who saw post
- **Frequency**: Impressions / Reach (how often same user saw post)

**Engagement Metrics:**
- **Likes/Reactions**: Positive engagement
- **Comments**: Discussion and feedback
- **Shares/Retweets**: Content amplification
- **Saves/Bookmarks**: Content value indicator
- **Engagement Rate**: (Likes + Comments + Shares) / Reach

**Click Metrics:**
- **Link Clicks**: Clicks on URLs in post
- **Click-Through Rate**: Link Clicks / Impressions
- **Landing Page Views**: Users who reached destination

**Conversion Tracking:**
- Set up conversion goals (sign-ups, purchases, downloads)
- Track campaign attribution
- Calculate ROI (revenue - cost) / cost
- Multi-touch attribution (first click, last click, linear)

---

## Best Practices

### SEO Optimization

1. **Keyword Research**
   - Target 1-3 primary keywords per content piece
   - Use tools: Google Keyword Planner, Ahrefs, SEMrush
   - Focus on long-tail keywords (3+ words, less competition)
   - Check search volume and difficulty

2. **Title Tags**
   - Include primary keyword near the beginning
   - Keep under 60 characters (or it will be truncated)
   - Make it compelling (encourages clicks)
   - Use power words: Guide, Ultimate, Complete, Essential

3. **Meta Descriptions**
   - Compelling summary of content
   - 150-160 characters optimal length
   - Include primary keyword naturally
   - Add call-to-action (Learn more, Read now, Get started)

4. **Headings Structure**
   - Use H1 for main title (only one per page)
   - Use H2 for main sections
   - Use H3 for subsections
   - Include keywords in headings naturally

5. **Internal Links**
   - Link to 3-5 related content pieces
   - Use descriptive anchor text (not "click here")
   - Link to cornerstone content
   - Update old content with links to new content

6. **Image Alt Text**
   - Describe what image shows
   - Include keywords when relevant
   - Keep under 125 characters
   - Required for accessibility

7. **URL Slugs**
   - Short and descriptive
   - Include primary keyword
   - Use hyphens (not underscores)
   - Avoid stop words (a, the, and, of)
   - Example: `/blog/email-marketing-best-practices`

8. **Content Quality**
   - Minimum 1,000 words for SEO value
   - Answer user search intent
   - Use bullet points and lists (scannable)
   - Include multimedia (images, videos)
   - Update regularly (fresh content ranks better)

### Content Strategy

1. **Content Calendar**
   - Plan 2-4 weeks ahead
   - Balance content types (educational, promotional, entertaining)
   - Align with marketing campaigns and events
   - Leave room for timely/trending topics

2. **Publishing Consistency**
   - Set realistic schedule (1-2 posts per week better than sporadic)
   - Batch create content in advance
   - Use scheduling feature to maintain consistency
   - Communicate schedule to audience (e.g., "New post every Tuesday")

3. **Quality Over Quantity**
   - Better to publish 1 exceptional piece than 5 mediocre
   - Take time to research and craft content
   - Edit ruthlessly (remove fluff)
   - Get peer review before publishing

4. **Content Variety**
   - Mix formats: blog posts, guides, case studies, infographics, videos
   - Different lengths: Quick tips (500 words), deep dives (2,500+ words)
   - Content for all funnel stages: awareness, consideration, decision

5. **Repurpose Content**
   - Turn blog post into video script
   - Create infographic from data-heavy article
   - Break comprehensive guide into series of social posts
   - Extract quotes for social media
   - Update and republish evergreen content

6. **Content Updates**
   - Audit content quarterly
   - Update outdated statistics and information
   - Improve underperforming content (better titles, add media)
   - Redirect or delete irrelevant content
   - Republish updated content (new publish date)

### Email Marketing

1. **Segmentation**
   - Personalized emails get 6x higher click rates
   - Segment by: demographics, behavior, engagement level, purchase history
   - Create targeted campaigns for each segment
   - Test segment performance

2. **A/B Testing**
   - Test one element at a time (subject line, CTA, send time)
   - Minimum 1,000 recipients per variant
   - Let test run to statistical significance
   - Apply learnings to future campaigns

3. **Mobile Optimization**
   - 60%+ of emails opened on mobile devices
   - Use responsive email templates
   - Keep subject lines under 40 characters for mobile
   - Use large CTA buttons (min 44x44px)
   - Test on multiple mobile email clients

4. **Clear CTAs**
   - One primary action per email
   - Use button (not text link) for main CTA
   - Make CTA stand out (contrasting color)
   - Use action-oriented text: "Download Guide", "Start Free Trial"

5. **Permission-Based**
   - Only email people who opted in
   - Use double opt-in for quality lists
   - Make unsubscribe easy and honor immediately
   - Respect preferences (frequency, content types)

6. **Monitor Metrics**
   - Industry average open rate: 20-25%
   - Industry average click rate: 2-5%
   - If below average, test subject lines, send times, content
   - Monitor list growth rate and unsubscribe rate

### Social Media

1. **Platform Strategy**
   - Different content for each platform (not just cross-posting)
   - Understand audience demographics per platform
   - Use platform-specific features (Stories, Reels, Threads)
   - Post frequency: LinkedIn 1x/day, Twitter 3-5x/day, Instagram 1-2x/day

2. **Visual Content**
   - Posts with images get 2.3x more engagement
   - Use high-quality, relevant images
   - Create custom graphics (Canva, Adobe Express)
   - Video content gets even higher engagement

3. **Hashtag Research**
   - Use 5-10 relevant hashtags per post
   - Mix popular (100k+ posts) and niche (1k-10k posts) hashtags
   - Create branded hashtag for campaigns
   - Research trending hashtags in your industry

4. **Engagement**
   - Respond to comments within 1 hour
   - Ask questions to encourage comments
   - Run polls and interactive content
   - Engage with others' content (builds relationships)

5. **Posting Consistency**
   - Post 1-2x daily on active platforms
   - Use scheduling to maintain consistency
   - Don't abandon platforms (hurts algorithm)
   - Quality over quantity (don't spam)

6. **Storytelling**
   - Share behind-the-scenes content (humanizes brand)
   - Customer success stories and testimonials
   - Team member spotlights
   - Company culture and values

---

## Keyboard Shortcuts

### Content Editor

| Shortcut | Action |
|----------|--------|
| Ctrl/Cmd + S | Save draft |
| Ctrl/Cmd + P | Publish content |
| Ctrl/Cmd + B | Bold text |
| Ctrl/Cmd + I | Italic text |
| Ctrl/Cmd + U | Underline text |
| Ctrl/Cmd + K | Insert/edit link |
| Ctrl/Cmd + Z | Undo |
| Ctrl/Cmd + Shift + Z | Redo |
| Ctrl/Cmd + / | Show all shortcuts |

### Content Library

| Shortcut | Action |
|----------|--------|
| Ctrl/Cmd + F | Focus search |
| Ctrl/Cmd + N | New content |
| Escape | Clear filters |

### Email Campaign Builder

| Shortcut | Action |
|----------|--------|
| Ctrl/Cmd + S | Save campaign |
| Ctrl/Cmd + Shift + S | Send/schedule campaign |
| Ctrl/Cmd + Shift + T | Send test email |

### Navigation

| Shortcut | Action |
|----------|--------|
| Tab | Move to next element |
| Shift + Tab | Move to previous element |
| Escape | Close modal/dialog |
| Enter/Space | Activate button/link |

---

## Troubleshooting

### Content Not Publishing

**Problem**: "Publish" button is disabled or greyed out

**Solutions**:
1. Check all required fields are filled (title, slug, content)
2. Verify you have publishing permissions (ADMIN or OWNER role)
3. Check your subscription tier includes ContentPilot (GROWTH+)
4. Ensure slug is unique (no duplicate slugs allowed)
5. If scheduled, verify date is in the future

### Media Upload Failing

**Problem**: Files won't upload or show error message

**Solutions**:
1. Check file size limits:
   - Images: Max 10MB
   - Videos: Max 50MB
   - Documents: Max 10MB
2. Verify file type is supported (JPG, PNG, GIF, WebP, SVG, MP4, PDF, etc.)
3. Try renaming file (remove special characters like &, %, #)
4. Check your internet connection stability
5. Clear browser cache and try again
6. Try different browser (Chrome, Firefox, Safari, Edge)
7. Check storage quota (GROWTH: 5GB, ELITE: 50GB)

### Email Campaign Not Sending

**Problem**: Campaign stuck in "Scheduled" or "Sending" status

**Solutions**:
1. Verify sender email is verified in settings
2. Check recipient list isn't empty (minimum 1 recipient)
3. Ensure scheduled time is in future (at least 5 minutes)
4. Review campaign for spam triggers (too many links, ALL CAPS)
5. Check your email sending quota (GROWTH: 5 campaigns/month)
6. Contact support if issue persists after 10 minutes

### Slow Performance

**Problem**: ContentPilot pages loading slowly (>5 seconds)

**Solutions**:
1. Clear browser cache and cookies
2. Check internet connection speed (minimum 5 Mbps recommended)
3. Close unnecessary browser tabs (reduces memory usage)
4. Disable browser extensions temporarily (ad blockers can interfere)
5. Try incognito/private browsing mode (rules out extension issues)
6. Check Strive Tech status page (status.strivetech.ai)
7. Try different device or network

### Search Not Working

**Problem**: Can't find content in search or search returns no results

**Solutions**:
1. Check spelling and try different keywords
2. Try partial words (searches title, excerpt, content, tags)
3. Use filters to narrow results (status, type, category)
4. Verify content isn't deleted or archived
5. Wait 5 minutes for newly created content to be indexed
6. Clear search filters and try again
7. Check you have permission to view content (organization-level access)

### Editor Not Saving

**Problem**: Changes aren't being saved or "Save failed" error appears

**Solutions**:
1. Check internet connection (editor requires connection)
2. Try manual save (Ctrl/Cmd + S)
3. Copy content to clipboard (prevent data loss)
4. Refresh page and paste content back
5. Check for browser console errors (F12 → Console tab)
6. Try different browser
7. Contact support if issue persists

### Images Not Displaying

**Problem**: Images show broken icon or don't load

**Solutions**:
1. Check image URL is correct (right-click → Inspect)
2. Verify image still exists in Media Library (wasn't deleted)
3. Clear browser cache (Ctrl/Cmd + Shift + R)
4. Check Content Security Policy (CSP) isn't blocking images
5. Try re-uploading image to Media Library
6. Check file format is supported (JPG, PNG, GIF, WebP, SVG)

### Analytics Data Missing

**Problem**: Analytics dashboard shows no data or "No data available"

**Solutions**:
1. Check date range selected (may be too narrow)
2. Verify content is published (draft content has no analytics)
3. Wait 24 hours for data to populate (not real-time)
4. Check analytics tracking is enabled in settings
5. Verify content has been live long enough to collect data
6. Try different filter combinations

---

## Getting Help

### Support Resources

- **Help Center**: [help.strivetech.ai](https://help.strivetech.ai)
- **Video Tutorials**: [youtube.com/strivetech](https://youtube.com/strivetech)
- **Email Support**: support@strivetech.ai
- **Live Chat**: Available Mon-Fri 9am-5pm EST (in-app chat widget)
- **Feature Requests**: feedback@strivetech.ai
- **Community Forum**: [community.strivetech.ai](https://community.strivetech.ai)

### Response Times by Tier

- **ELITE/ENTERPRISE**:
  - 2-hour response time
  - 8-hour resolution for critical issues
  - Dedicated account manager
  - Priority phone support

- **GROWTH**:
  - 4-hour response time
  - 24-hour resolution for critical issues
  - Email and chat support

- **STARTER**:
  - 24-hour response time
  - 72-hour resolution for critical issues
  - Email support only

### Before Contacting Support

Please have ready:
1. Your organization name and email
2. Subscription tier (GROWTH, ELITE, ENTERPRISE)
3. Description of issue (what you were doing, what happened)
4. Steps to reproduce (if applicable)
5. Browser and operating system (Chrome 120 on Windows 11, etc.)
6. Screenshots or screen recording of issue (if possible)
7. Any error messages (exact text or screenshot)

### Status Updates

Check platform status: [status.strivetech.ai](https://status.strivetech.ai)
- System uptime: 99.9% SLA
- Scheduled maintenance: Sundays 2-4am EST
- Incident notifications: Email and SMS

---

**End of User Guide**

**Document Version**: 1.0
**Last Updated**: 2025-10-07
**Next Review**: 2025-11-07
**Maintained By**: Product Team
