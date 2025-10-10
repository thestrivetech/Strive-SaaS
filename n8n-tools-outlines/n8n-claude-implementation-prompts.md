# N8n AI Agent Implementation Prompts for Strive Tech SaaS Platform

**Document Version:** 1.0  
**Created:** October 9, 2025  
**Purpose:** Complete set of Claude prompts for building all AI agents, tools, and workflows in N8n
**Target Role:** N8n Automation Engineer & AI Workflow Specialist

---

## Core Instructions for Claude

**Primary Role:** You are an expert N8n automation engineer specializing in AI agent orchestration, workflow automation, and real estate SaaS integrations. You have access to my N8n account via MCP and can directly create, modify, and deploy workflows. 

**Key Responsibilities:**
- Build production-ready N8n workflows for AI agents and automation
- Implement proper error handling, retry logic, and monitoring
- Create scalable architectures following N8n best practices
- Integrate with external APIs (MLS, Qdrant, OpenAI, Supabase)
- Ensure all workflows respect multi-tenant organization isolation
- Implement proper authentication and security measures

**Context:** The Strive Tech platform is a multi-tenant real estate SaaS with modules for CRM, Workspace, REID Analytics, Expense/Tax, and Marketplace. All workflows must respect organizational boundaries and RBAC permissions.

---

## Core AI Infrastructure Prompts

### Prompt #1: Central Sai Assistant Setup
```
Role: N8n AI Workflow Engineer

Task: Create the core "Sai Universal Assistant" workflow in N8n that serves as the central orchestrator for all AI capabilities in our real estate SaaS platform.

Requirements:
- Build a webhook-triggered workflow that receives user messages from our Next.js frontend
- Implement intent analysis to determine if query should be handled directly or routed to specialized agents
- Integrate with Qdrant vector database for RAG capabilities using real estate knowledge base
- Support multi-model AI (OpenAI GPT-4, Claude, local models) with dynamic model selection
- Implement conversation memory and context management per user session
- Add organization-level data isolation (organizationId parameter required)
- Include usage tracking and analytics logging
- Return structured JSON responses with conversation_id, response, suggested_actions, and confidence_score

Technical Specifications:
- Webhook endpoint: /api/ai/sai/chat
- Expected input: { user_id, organization_id, message, conversation_id?, model_preference? }
- RAG integration: Query Qdrant collections (properties, leads, market_data, documents)
- Response time target: <2 seconds for most queries
- Error handling: Graceful degradation with fallback responses

Create the complete N8n workflow with proper error handling, logging, and scalable architecture.
```

### Prompt #2: RAG System Integration Workflow  
```
Role: N8n Vector Database Integration Specialist

Task: Create the RAG (Retrieval-Augmented Generation) system integration workflow for our Qdrant vector database in N8n.

Requirements:
- Build a workflow for embedding generation using intfloat/e5-large-v2 model
- Create separate data ingestion pipelines for each content type:
  * Property listings (MLS data, descriptions, features)
  * Lead conversation history and preferences  
  * Market analysis reports and trends
  * Document content (contracts, disclosures, etc.)
- Implement incremental updates (not full re-indexing) for efficiency
- Add data quality validation and deduplication logic
- Create query interface for semantic search across all collections
- Implement organization-level access control (RLS equivalent for vectors)
- Add monitoring for embedding quality and search relevance

Technical Specifications:
- Qdrant collections: properties, leads, market_data, documents, conversations
- Embedding model: intfloat/e5-large-v2 (1024 dimensions)
- Update triggers: Webhook from Supabase database changes
- Batch processing: Handle up to 1000 documents per run
- Quality metrics: Track embedding success rate and query performance

Create the complete N8n workflow system for RAG data management and querying.
```

### Prompt #3: AI Hub Management System
```
Role: N8n Conversation Management Engineer

Task: Create the AI Hub management system workflow that handles conversation persistence, usage analytics, and user interaction tracking.

Requirements:
- Build conversation session management (create, update, retrieve, archive)
- Implement usage analytics tracking (tokens used, conversation length, satisfaction scores)
- Create conversation history search and retrieval system
- Add conversation export functionality for users
- Implement conversation sharing between team members (with permission checks)
- Track AI tool usage across all agents and calculate costs per organization
- Generate usage reports and billing data for subscription management
- Add conversation sentiment analysis and feedback collection

Technical Specifications:
- Database: Supabase with AI_conversations, usage_tracking, feedback tables
- Conversation retention: 90 days for free tier, unlimited for paid
- Analytics aggregation: Real-time for current usage, daily batch for historical
- Export formats: JSON, PDF, CSV
- Permission levels: Private, team, organization based on user role

Create the complete N8n workflow for conversation management and analytics.
```

---

## Lead Management Agent Prompts

### Prompt #4: 24/7 Lead Capture System
```
Role: N8n Lead Automation Specialist

Task: Create a 24/7 lead capture and instant response system that engages website visitors and captures leads through AI-powered conversations.

Requirements:
- Build a customer-facing chatbot workflow that handles website lead capture
- Implement intelligent lead qualification through conversational AI
- Create instant response system with <30 second response time
- Add lead scoring based on conversation content, behavior, and demographics
- Integrate with CRM module to automatically create lead records
- Implement BANT (Budget, Authority, Need, Timeline) qualification automation
- Add lead source tracking and attribution
- Create escalation rules for high-priority leads (immediate agent notification)
- Generate lead summary reports for real estate agents

Technical Specifications:
- Trigger: Website widget API calls and form submissions
- Lead scoring algorithm: 0-100 scale based on qualification criteria
- CRM integration: Create records in Supabase leads table with organization isolation
- Notification channels: Email, SMS, Slack, in-app notifications
- Response templates: Customizable by organization with merge fields

Create the complete N8n workflow for automated lead capture and qualification.
```

### Prompt #5: Lead Nurturing Automation Engine
```
Role: N8n Marketing Automation Engineer  

Task: Create an intelligent lead nurturing automation engine that manages multi-touch campaigns and personalizes outreach based on lead behavior and preferences.

Requirements:
- Build automated drip campaign system with trigger-based sequences
- Implement lead behavior tracking (email opens, link clicks, website visits)
- Create personalized content selection based on lead preferences and stage
- Add optimal send time prediction for each individual lead
- Implement lead scoring updates based on engagement metrics
- Create branch logic for different lead types (buyer, seller, investor, referral)
- Add A/B testing capabilities for email templates and sequences
- Integrate with email providers (SendGrid, Mailgun) and SMS services
- Generate nurturing campaign performance reports

Technical Specifications:
- Campaign triggers: Lead score changes, time-based, behavioral events
- Personalization: Property recommendations, market updates, educational content
- Frequency capping: Respect communication preferences and unsubscribe status
- Performance tracking: Open rates, click rates, conversion rates, unsubscribe rates
- Integration points: CRM data, property listings, market reports

Create the complete N8n workflow for intelligent lead nurturing automation.
```

### Prompt #6: Lead Scoring Engine
```
Role: N8n AI Analytics Engineer

Task: Create an advanced lead scoring engine that uses machine learning and behavioral analysis to predict lead quality and conversion probability.

Requirements:
- Build ML-based lead scoring using historical conversion data
- Implement real-time score updates based on lead behavior and interactions
- Create scoring factors: demographics, engagement, budget qualification, timeline urgency
- Add predictive analytics for conversion probability and optimal contact timing
- Implement lead lifecycle stage automation (cold → warm → hot → client)
- Create score-based automation triggers (alerts, campaigns, agent assignments)
- Add comparative analysis against similar successful conversions
- Generate lead intelligence reports with actionable insights
- Implement feedback loop to improve scoring accuracy over time

Technical Specifications:
- Scoring range: 0-100 with letter grades (A, B, C, D)
- Update frequency: Real-time for interactions, daily batch for demographic factors
- ML model: Classification model trained on historical conversion data
- Integration: CRM updates, automated campaign triggers, agent notifications
- Reporting: Individual lead reports, portfolio analytics, conversion predictions

Create the complete N8n workflow for intelligent lead scoring and lifecycle management.
```

---

## Property & Listing Agent Prompts

### Prompt #7: Listing Description Generator
```
Role: N8n Content Generation Engineer

Task: Create an AI-powered listing description generator that produces SEO-optimized, compelling property descriptions tailored to target audiences.

Requirements:
- Build property description generation using property data and comparable listings
- Implement SEO optimization with local keyword integration
- Create multiple description variants for different marketing channels (MLS, website, social)
- Add style customization (professional, casual, luxury, investment-focused)
- Implement competitive analysis to highlight unique selling propositions
- Create description templates based on property type and price range
- Add multi-language support for diverse markets
- Generate social media captions and hashtag recommendations
- Include call-to-action optimization based on listing goals

Technical Specifications:
- Input data: Property details, photos, neighborhood info, comparable sales
- Output formats: MLS description, website copy, social media posts, flyers
- SEO factors: Local keywords, search volume, competition analysis
- Quality metrics: Readability score, keyword density, engagement prediction
- Integration: MLS systems, website CMS, social media platforms

Create the complete N8n workflow for AI-powered listing content generation.
```

### Prompt #8: Property Photo Enhancement System
```
Role: N8n Visual Content Engineer

Task: Create an automated property photo enhancement and optimization system that improves listing photos and suggests virtual staging.

Requirements:
- Build automated photo enhancement (lighting, color correction, straightening)
- Implement virtual staging AI for empty rooms
- Create photo sequence optimization for maximum engagement
- Add object removal capabilities (personal items, clutter)
- Implement HDR processing and exposure correction
- Create thumbnail generation optimized for different platforms
- Add watermarking and branding automation
- Generate photo recommendation reports (missing angles, suggested improvements)
- Implement before/after comparison tracking

Technical Specifications:
- Image processing: OpenCV, commercial APIs (Photoroom, Remove.bg)
- Virtual staging: AI-powered furniture placement
- Output formats: Web-optimized, print-ready, social media sizes
- Quality metrics: Image quality score, predicted engagement
- Integration: Photo storage (Supabase), MLS upload, website galleries

Create the complete N8n workflow for automated photo enhancement and virtual staging.
```

### Prompt #9: Property Alert System
```
Role: N8n Real Estate Data Engineer

Task: Create an intelligent property alert system that monitors MLS listings and market changes to notify clients about relevant opportunities.

Requirements:
- Build real-time MLS monitoring for new listings and price changes
- Implement client preference matching (location, price, features, property type)
- Create intelligent filtering to reduce false positives and noise
- Add market condition alerts (price drops, new inventory, sold comparables)
- Implement multi-channel notifications (email, SMS, app push, portal)
- Create investor-focused alerts (cap rate, cash flow, deal analysis)
- Add geographic fence monitoring for specific neighborhoods
- Generate weekly market summary reports for clients
- Implement alert frequency management and unsubscribe handling

Technical Specifications:
- Data sources: MLS feeds, public records, real estate APIs
- Update frequency: Real-time for critical alerts, hourly for general updates
- Matching algorithm: Weighted scoring based on client preferences
- Notification timing: Respect time zones and preference settings
- Integration: CRM client data, property database, communication platforms

Create the complete N8n workflow for intelligent property monitoring and alerts.
```

### Prompt #10: Property Comparison Engine
```
Role: N8n Comparative Analysis Engineer

Task: Create a sophisticated property comparison engine that generates detailed side-by-side analyses for buyers and investors.

Requirements:
- Build automated comparable property selection using MLS data
- Implement multi-factor comparison (price, features, location, investment metrics)
- Create visual comparison reports with charts and maps
- Add investment analysis (ROI, cap rates, cash flow projections)
- Implement neighborhood comparison (schools, amenities, crime, trends)
- Create buyer-specific comparison criteria based on their priorities
- Add historical performance analysis for investment properties
- Generate recommendation scores and decision matrices
- Implement export functionality (PDF reports, spreadsheets)

Technical Specifications:
- Comparison factors: 50+ property attributes, financial metrics, location data
- Visual outputs: Tables, charts, maps, infographics
- Investment calculations: IRR, NPV, cash-on-cash return, DSCR
- Data sources: MLS, public records, census data, school ratings
- Report formats: Interactive web, PDF download, email-friendly

Create the complete N8n workflow for comprehensive property comparison and analysis.
```

---

## Market Analysis Agent Prompts

### Prompt #11: Automated CMA Generator
```
Role: N8n Real Estate Analytics Engineer

Task: Create an automated Comparative Market Analysis (CMA) generator that produces professional market analysis reports in under 30 seconds.

Requirements:
- Build automated comparable selection using advanced property matching algorithms
- Implement adjustment calculations for property differences (size, age, features, condition)
- Create professional CMA reports with charts, maps, and market trends
- Add confidence scoring for valuation accuracy
- Implement multiple valuation approaches (sales comparison, cost, income)
- Create market trend analysis and price forecasting
- Add days on market predictions and pricing strategy recommendations  
- Generate executive summary with key insights and recommendations
- Implement brand customization for different agents/brokerages

Technical Specifications:
- Comparable selection: 3-10 properties within 1 mile and 6 months
- Adjustment factors: Square footage, lot size, age, bedrooms, bathrooms, features
- Report generation: PDF output in <30 seconds
- Data sources: MLS, public records, market trend databases
- Accuracy target: Within 5% of actual sale price for 80% of properties

Create the complete N8n workflow for instant professional CMA generation.
```

### Prompt #12: Predictive Analytics Engine
```
Role: N8n Predictive Modeling Engineer

Task: Create a predictive analytics engine that forecasts property values, market trends, and investment opportunities using machine learning.

Requirements:
- Build property value prediction models using historical sales data
- Implement market trend forecasting for different geographic areas
- Create investment opportunity scoring based on predicted appreciation
- Add risk assessment modeling (market volatility, economic indicators)
- Implement seasonal trend analysis and timing recommendations
- Create portfolio performance predictions for investors
- Add economic indicator integration (interest rates, employment, construction)
- Generate monthly market forecast reports
- Implement model accuracy tracking and continuous improvement

Technical Specifications:
- ML models: Time series forecasting, regression analysis, ensemble methods
- Prediction horizons: 6 months, 1 year, 3 years, 5 years
- Geographic granularity: Zip code, neighborhood, city, metro area
- Economic factors: 20+ indicators affecting real estate markets
- Accuracy metrics: MAPE, R-squared, confidence intervals

Create the complete N8n workflow for predictive real estate analytics and forecasting.
```

### Prompt #13: Investment Property Analyzer
```
Role: N8n Real Estate Investment Engineer

Task: Create a comprehensive investment property analyzer that evaluates rental properties, commercial deals, and real estate investment opportunities.

Requirements:
- Build automated financial analysis (cap rates, cash flow, ROI calculations)
- Implement rental income estimation using comparable rent data
- Create expense forecasting (taxes, insurance, maintenance, management)
- Add financing scenario analysis with different loan options
- Implement market demand analysis for rental properties
- Create investment risk assessment and diversification recommendations
- Add 1031 exchange opportunity identification
- Generate detailed investment reports with recommendations
- Implement portfolio analysis for multi-property investors

Technical Specifications:
- Financial calculations: IRR, NPV, cash-on-cash return, DSCR, BRRR analysis
- Rental comps: Automated rent estimation using market data
- Expense ratios: Location-specific operating expense assumptions
- Financing options: Multiple loan scenarios and terms
- Risk factors: Market volatility, vacancy rates, interest rate sensitivity

Create the complete N8n workflow for comprehensive investment property analysis.
```

### Prompt #14: Market Data Integration System
```
Role: N8n Real Estate Data Integration Engineer

Task: Create a comprehensive market data integration system that aggregates real estate information from multiple sources and maintains real-time market intelligence.

Requirements:
- Build MLS data integration with real-time listing updates
- Implement public records integration for sales history and property details
- Create economic data feeds (interest rates, employment, demographics)
- Add school district data and rating updates
- Implement neighborhood trend analysis and gentrification indicators
- Create data quality validation and error correction processes
- Add data normalization and standardization across sources
- Generate data freshness reports and integration monitoring
- Implement efficient data storage and retrieval optimization

Technical Specifications:
- Data sources: 10+ MLS systems, public records, economic APIs, school databases
- Update frequency: Real-time for listings, daily for public records, weekly for demographics
- Data volume: Handle 100k+ property updates per day
- Quality metrics: Completeness, accuracy, freshness scores
- Integration: Qdrant vector storage, Supabase relational data, Redis caching

Create the complete N8n workflow for comprehensive real estate data integration.
```

---

## Document Processing Agent Prompts

### Prompt #15: Contract Generation System
```
Role: N8n Legal Document Automation Engineer

Task: Create an intelligent contract generation system that auto-populates legal templates using CRM data and transaction details.

Requirements:
- Build automated contract template selection based on transaction type
- Implement data extraction from CRM to populate contract fields
- Create clause customization based on transaction specifics and state laws
- Add compliance checking for local and state real estate regulations
- Implement e-signature workflow integration with DocuSign/HelloSign
- Create contract comparison tools for reviewing multiple offers
- Add deadline and milestone tracking throughout transaction lifecycle
- Generate contract summaries for quick review
- Implement version control and change tracking

Technical Specifications:
- Document types: Purchase agreements, listing agreements, disclosures, addenda
- Data sources: CRM contacts, property details, MLS information
- Template engine: Dynamic field population with conditional logic
- Compliance database: State-specific requirements and mandatory disclosures
- Integration: E-signature platforms, document storage, CRM updates

Create the complete N8n workflow for intelligent contract generation and management.
```

### Prompt #16: Document Processing Automation
```
Role: N8n Document Intelligence Engineer

Task: Create an advanced document processing system that extracts key information from real estate documents using OCR and AI analysis.

Requirements:
- Build OCR processing for scanned documents and images
- Implement AI-powered data extraction for contract terms and conditions
- Create document classification system (contracts, disclosures, inspections, etc.)
- Add key date and deadline extraction with automatic calendar entries
- Implement compliance verification against regulatory requirements
- Create document comparison tools for identifying changes
- Add data validation and error correction workflows
- Generate document analysis reports with key insights
- Implement secure document storage with access controls

Technical Specifications:
- OCR engines: Tesseract, Google Vision API, AWS Textract
- Document types: PDFs, images, scanned documents, handwritten forms
- Extraction accuracy: 95%+ for printed text, 85%+ for handwritten
- Processing speed: <2 minutes for typical real estate contract
- Integration: Document storage, CRM updates, calendar systems

Create the complete N8n workflow for intelligent document processing and analysis.
```

### Prompt #17: Transaction Milestone Tracker
```
Role: N8n Transaction Management Engineer

Task: Create a comprehensive transaction milestone tracking system that monitors deal progress and alerts stakeholders of important deadlines.

Requirements:
- Build automated milestone recognition from contract terms
- Implement deadline calculation and countdown tracking
- Create stakeholder notification system (buyers, sellers, agents, lenders)
- Add task assignment and completion verification
- Implement risk assessment for deals falling behind schedule
- Create transaction dashboard with visual progress indicators
- Add escalation rules for missed deadlines or at-risk deals
- Generate transaction status reports for all parties
- Implement integration with calendar systems and task management

Technical Specifications:
- Milestone types: Inspection, appraisal, loan approval, closing preparation
- Notification channels: Email, SMS, in-app alerts, calendar reminders
- Risk scoring: Probability of on-time closing based on current progress
- Dashboard views: Agent, client, transaction coordinator, brokerage manager
- Integration: CRM, calendar systems, task management, reporting tools

Create the complete N8n workflow for comprehensive transaction tracking and management.
```

### Prompt #18: Compliance Monitor System
```
Role: N8n Real Estate Compliance Engineer

Task: Create an automated compliance monitoring system that ensures all transactions meet federal, state, and local real estate regulations.

Requirements:
- Build regulatory requirement database for different jurisdictions
- Implement automated compliance checking for contracts and disclosures
- Create Fair Housing law compliance monitoring and alerts
- Add disclosure requirement verification by property type and location
- Implement license and certification tracking for agents and vendors
- Create audit trail documentation for all compliance checks
- Add regulatory update monitoring and system updates
- Generate compliance reports for brokerages and regulatory bodies
- Implement corrective action workflows for compliance violations

Technical Specifications:
- Regulatory database: Federal (RESPA, TILA, Fair Housing), state, and local laws
- Compliance checks: Document completeness, timeline adherence, disclosure accuracy
- Alert severity: Critical violations, warnings, recommendations
- Reporting: Individual transaction compliance, portfolio compliance summaries
- Integration: CRM, document management, agent training systems

Create the complete N8n workflow for automated real estate compliance monitoring.
```

---

## Financial & Commission Agent Prompts

### Prompt #19: Commission Calculator System
```
Role: N8n Real Estate Financial Engineer

Task: Create an intelligent commission calculation system that handles complex split structures, referral fees, and transaction costs.

Requirements:
- Build flexible commission split calculation engine
- Implement referral fee tracking and distribution
- Create transaction cost estimation (title, escrow, inspections)
- Add net proceeds calculation for sellers
- Implement agent performance tracking and commission forecasting  
- Create commission statement generation and distribution
- Add tax document preparation (1099s, expense tracking)
- Generate financial reports for agents and brokerages
- Implement integration with accounting software

Technical Specifications:
- Commission structures: Graduated splits, flat fees, per-transaction, team splits
- Referral networks: Internal and external referral tracking
- Cost databases: Regional averages for closing costs and fees
- Report formats: Individual agent statements, brokerage summaries, tax documents
- Integration: Accounting software (QuickBooks, Xero), payroll systems

Create the complete N8n workflow for comprehensive commission and financial management.
```

### Prompt #20: Rate Pricing Engine
```
Role: N8n Mortgage Rate Integration Engineer

Task: Create a dynamic interest rate and mortgage pricing engine that provides real-time rate quotes and loan comparisons.

Requirements:
- Build real-time mortgage rate integration with multiple lenders
- Implement loan program comparison (conventional, FHA, VA, jumbo)
- Create qualification pre-screening based on buyer financials
- Add closing cost estimation and cash-to-close calculations
- Implement rate lock monitoring and expiration alerts
- Create mortgage calculator tools for different scenarios
- Add pre-approval letter generation and management
- Generate loan comparison reports for buyers
- Implement lender relationship management and referral tracking

Technical Specifications:
- Lender integrations: 10+ major mortgage providers via API
- Rate updates: Real-time or hourly based on market conditions
- Loan programs: 50+ different mortgage products and terms
- Calculations: Payment, APR, closing costs, cash-to-close
- Integration: CRM buyer data, transaction management, lender systems

Create the complete N8n workflow for comprehensive mortgage rate and loan management.
```

---

## Customer Service & Communication Prompts

### Prompt #21: Booking Agent System
```
Role: N8n Appointment Scheduling Engineer

Task: Create an intelligent booking agent that manages appointment scheduling, calendar integration, and automated confirmations.

Requirements:
- Build automated appointment scheduling with calendar availability checking
- Implement client preference matching (time, property type, communication method)
- Create multi-agent calendar coordination for team scheduling
- Add appointment confirmation and reminder automation
- Implement rescheduling and cancellation workflow with automated rebooking
- Create waitlist management for popular time slots
- Add no-show tracking and follow-up automation
- Generate scheduling analytics and optimization recommendations
- Implement integration with video conferencing and showing apps

Technical Specifications:
- Calendar integration: Google Calendar, Outlook, Calendly, custom systems
- Notification channels: Email, SMS, phone calls, in-app notifications
- Scheduling rules: Buffer times, travel time, agent preferences
- Analytics: Booking rates, no-show patterns, optimal time slots
- Integration: CRM, property showing apps, video conferencing

Create the complete N8n workflow for intelligent appointment scheduling and management.
```

### Prompt #22: Script Generator System
```
Role: N8n Sales Communication Engineer

Task: Create an AI-powered script generator that provides call scripts, email templates, and conversation guides for different real estate scenarios.

Requirements:
- Build scenario-based script generation (cold calls, follow-ups, objection handling)
- Implement personalization using client data and interaction history
- Create objection handling responses with multiple alternative approaches
- Add success rate tracking for different scripts and approaches
- Implement A/B testing for script effectiveness
- Create conversation flow guides for complex discussions
- Add compliance checking for Fair Housing and regulatory requirements
- Generate training materials for new agents
- Implement voice coaching recommendations and improvement suggestions

Technical Specifications:
- Script categories: Prospecting, listing presentations, buyer consultations, negotiations
- Personalization data: Client preferences, history, property interests
- Success metrics: Conversion rates, appointment settings, closed deals
- Compliance checking: Fair Housing law adherence, disclosure requirements
- Integration: CRM data, call recording systems, training platforms

Create the complete N8n workflow for intelligent sales script generation and optimization.
```

### Prompt #23: Review Management System
```
Role: N8n Online Reputation Engineer

Task: Create an automated review management system that monitors, responds to, and generates online reviews across all major platforms.

Requirements:
- Build multi-platform review monitoring (Google, Zillow, Facebook, Yelp)
- Implement automated review response generation with personalized content
- Create review request automation after successful transactions
- Add sentiment analysis and reputation scoring
- Implement negative review alert system and damage control workflows
- Create review showcase integration for websites and marketing
- Add competitor review analysis and benchmarking
- Generate reputation reports and improvement recommendations
- Implement review fraud detection and reporting

Technical Specifications:
- Platforms: Google My Business, Zillow, Realtor.com, Facebook, Yelp, Better Homes
- Response time: <2 hours for negative reviews, <24 hours for positive
- Sentiment analysis: AI-powered emotion and satisfaction scoring
- Request timing: 24-48 hours after closing, based on transaction satisfaction
- Integration: CRM transaction data, website management, marketing tools

Create the complete N8n workflow for comprehensive online review management.
```

---

## Module-Specific Integration Prompts

### Prompt #24: CRM Activity Feed AI
```
Role: N8n CRM Intelligence Engineer

Task: Create an intelligent activity feed system that summarizes client interactions, identifies opportunities, and provides actionable insights.

Requirements:
- Build automated activity summarization from all client touchpoints
- Implement opportunity identification based on behavior patterns
- Create next-best-action recommendations for each client relationship
- Add relationship strength scoring and engagement tracking
- Implement automated follow-up suggestions and timing optimization
- Create client lifecycle stage identification and advancement workflows
- Add cross-sell and upsell opportunity detection
- Generate client relationship reports and portfolio analysis
- Implement integration with all communication channels and platforms

Technical Specifications:
- Data sources: Emails, calls, texts, meetings, property views, website activity
- AI analysis: Natural language processing for interaction sentiment and intent
- Scoring algorithms: Engagement level, purchase readiness, referral potential
- Recommendations: Timing, channel, content, frequency for follow-ups
- Integration: Email, phone systems, website analytics, social media

Create the complete N8n workflow for intelligent CRM activity analysis and recommendations.
```

### Prompt #25: Expense Tracker AI
```
Role: N8n Financial Automation Engineer

Task: Create an AI-powered expense tracking system that processes receipts, categorizes expenses, and optimizes tax deductions for real estate agents.

Requirements:
- Build OCR processing for receipt images and expense documents
- Implement intelligent expense categorization using machine learning
- Create mileage tracking integration with GPS and calendar data
- Add tax deduction optimization and maximization recommendations
- Implement receipt validation and fraud detection
- Create expense approval workflows for team and brokerage management
- Add integration with accounting software and tax preparation tools
- Generate expense reports and tax-ready summaries
- Implement real-time expense tracking and budget monitoring

Technical Specifications:
- OCR accuracy: 95%+ for receipt data extraction
- Categories: 50+ real estate specific expense categories
- Mileage tracking: Automatic business vs personal trip classification
- Tax optimization: IRS compliance with maximum deduction recommendations
- Integration: QuickBooks, Xero, TaxAct, mobile expense apps

Create the complete N8n workflow for comprehensive expense tracking and tax optimization.
```

### Prompt #26: Social Media Auto-Posting
```
Role: N8n Social Media Automation Engineer

Task: Create an intelligent social media automation system that posts property listings, market updates, and educational content across multiple platforms.

Requirements:
- Build automated property listing posts with optimal timing and hashtags
- Implement content calendar management with educational and market content
- Create platform-specific content optimization (Facebook, Instagram, LinkedIn, Twitter)
- Add engagement tracking and response automation
- Implement hashtag research and trend analysis
- Create visual content generation (property cards, market infographics)
- Add lead tracking from social media interactions
- Generate social media performance reports and optimization recommendations
- Implement compliance checking for Fair Housing and advertising regulations

Technical Specifications:
- Platforms: Facebook, Instagram, LinkedIn, Twitter, YouTube, TikTok
- Content types: Property listings, market updates, educational posts, testimonials
- Posting frequency: Optimal timing based on audience engagement data
- Visual generation: Branded property cards, market charts, educational graphics
- Integration: CRM lead capture, property database, brand management

Create the complete N8n workflow for intelligent social media marketing automation.
```

### Prompt #27: Campaign ROI Tracker
```
Role: N8n Marketing Analytics Engineer

Task: Create a comprehensive marketing campaign ROI tracking system that measures performance across all marketing channels and campaigns.

Requirements:
- Build multi-channel attribution tracking (email, social, paid ads, organic)
- Implement lead source tracking from first touch to closed transaction
- Create campaign performance dashboards with real-time metrics
- Add cost-per-lead and cost-per-acquisition calculations across all channels
- Implement A/B testing framework for marketing campaigns
- Create lifetime value calculations for different lead sources
- Add competitive analysis and market share tracking
- Generate marketing ROI reports with optimization recommendations
- Implement budget allocation optimization based on performance data

Technical Specifications:
- Attribution models: First-touch, last-touch, multi-touch, time-decay
- Tracking methods: UTM parameters, pixel tracking, phone number tracking
- Metrics: CTR, conversion rates, cost-per-lead, ROI, lifetime value
- Integration: Google Analytics, Facebook Ads, email platforms, CRM
- Reporting: Real-time dashboards, weekly summaries, quarterly analysis

Create the complete N8n workflow for comprehensive marketing ROI tracking and optimization.
```

---

## Advanced Workflow Automation Prompts

### Prompt #28: Lead-to-Close Automation Workflow
```
Role: N8n Workflow Orchestration Engineer

Task: Create a comprehensive lead-to-close automation workflow that coordinates multiple AI agents and systems throughout the entire customer journey.

Requirements:
- Build multi-agent orchestration workflow connecting all lead management systems
- Implement automatic handoffs between lead capture, nurturing, showing, and closing
- Create decision trees for different lead types and transaction scenarios
- Add progress tracking and milestone management throughout the process
- Implement quality gates and approval processes for critical decisions
- Create escalation rules for deals requiring human intervention
- Add performance tracking and optimization feedback loops
- Generate end-to-end analytics and process improvement recommendations
- Implement integration with all CRM, transaction, and communication systems

Technical Specifications:
- Agent coordination: 8+ specialized AI agents working in sequence
- Decision points: Lead qualification, property matching, offer preparation, closing
- Quality gates: Compliance checks, document validation, financial verification
- Performance metrics: Conversion rates, time-to-close, customer satisfaction
- Integration: All platform modules, external APIs, communication channels

Create the complete N8n workflow for end-to-end lead-to-close automation.
```

### Prompt #29: Property Analysis Pipeline
```
Role: N8n Real Estate Analysis Engineer

Task: Create an automated property analysis pipeline that combines market intelligence, investment analysis, and comparative data to produce comprehensive property reports.

Requirements:
- Build automated data collection from MLS, public records, and market sources
- Implement multi-factor property analysis (market, financial, investment, risk)
- Create automated comparable property selection and adjustment calculations
- Add neighborhood analysis including schools, amenities, and trends
- Implement investment scenario modeling with different financing options
- Create professional report generation with charts, maps, and recommendations
- Add property alert integration for monitoring and updates
- Generate analysis accuracy tracking and model improvement
- Implement client-specific customization based on investor or buyer profiles

Technical Specifications:
- Data sources: MLS, public records, census data, school ratings, crime statistics
- Analysis models: CMA, investment analysis, risk assessment, trend forecasting
- Report generation: Professional PDF reports in <60 seconds
- Customization: Buyer vs investor focus, risk tolerance, investment criteria
- Integration: Property database, market data, client CRM profiles

Create the complete N8n workflow for comprehensive automated property analysis.
```

### Prompt #30: Marketing Campaign Automation
```
Role: N8n Marketing Automation Engineer

Task: Create an intelligent marketing campaign automation system that manages multi-channel campaigns, content distribution, and performance optimization.

Requirements:
- Build automated campaign creation based on market conditions and inventory
- Implement multi-channel content distribution (email, social, web, print)
- Create audience segmentation and personalization engines
- Add campaign performance monitoring and real-time optimization
- Implement automated A/B testing for all campaign elements
- Create lead nurturing sequences triggered by campaign interactions
- Add budget management and spend optimization across channels
- Generate campaign performance reports and ROI analysis
- Implement competitive analysis and market opportunity detection

Technical Specifications:
- Channels: Email, social media, Google Ads, Facebook Ads, direct mail, website
- Segmentation: Demographics, behavior, transaction history, engagement level
- Optimization: Budget allocation, audience targeting, content selection, timing
- Performance tracking: Impressions, clicks, leads, conversions, revenue attribution
- Integration: CRM, social platforms, advertising networks, analytics tools

Create the complete N8n workflow for comprehensive marketing campaign automation.
```

---

## Integration & External API Prompts

### Prompt #31: MLS Data Integration Workflow
```
Role: N8n MLS Integration Engineer

Task: Create a comprehensive MLS data integration workflow that connects to multiple MLS systems and maintains real-time property data synchronization.

Requirements:
- Build connections to 10+ major MLS systems with different API protocols
- Implement real-time listing updates and change notifications
- Create data normalization and standardization across different MLS formats
- Add photo and document synchronization from MLS systems
- Implement error handling and retry logic for failed API calls
- Create data quality validation and duplicate detection
- Add historical data archiving and trend analysis
- Generate MLS connectivity reports and data freshness metrics
- Implement organization-level access control and permission management

Technical Specifications:
- MLS systems: CRMLS, NWMLS, HAR, FMLS, GBRMLS, and regional systems
- Update frequency: Real-time where available, hourly batch for others
- Data validation: Address standardization, price validation, photo verification
- Storage: Supabase for relational data, Qdrant for searchable content
- Monitoring: API health checks, data freshness alerts, error rate tracking

Create the complete N8n workflow for comprehensive MLS data integration.
```

### Prompt #32: CRM Platform Integration
```
Role: N8n CRM Integration Engineer

Task: Create seamless integration workflows with major CRM platforms (Salesforce, HubSpot, Pipedrive) to enable data synchronization and workflow automation.

Requirements:
- Build bi-directional sync with Salesforce, HubSpot, and other major CRMs
- Implement field mapping and data transformation between systems
- Create lead assignment and routing based on CRM territory rules
- Add activity synchronization (calls, emails, meetings, notes)
- Implement duplicate detection and merge workflows
- Create custom field synchronization for real estate specific data
- Add workflow trigger integration for automated campaigns
- Generate sync status reports and error handling
- Implement user permission mapping and access control

Technical Specifications:
- CRM platforms: Salesforce, HubSpot, Pipedrive, Zoho, Microsoft Dynamics
- Sync frequency: Real-time for critical updates, hourly for bulk data
- Data mapping: Contact, lead, opportunity, activity, custom objects
- Conflict resolution: Last-modified-wins, manual review, business rules
- Integration: REST APIs, webhooks, bulk import/export

Create the complete N8n workflow for comprehensive CRM platform integration.
```

### Prompt #33: Financial Services Integration
```
Role: N8n Financial Integration Engineer

Task: Create integration workflows with mortgage lenders, title companies, and financial service providers to streamline transaction processing.

Requirements:
- Build mortgage lender API integrations for rate quotes and pre-approvals
- Implement title company integration for order processing and status updates
- Create closing cost calculation integration with service providers
- Add loan origination system (LOS) connectivity for application tracking
- Implement credit reporting and verification services integration
- Create wire transfer and escrow account management workflows
- Add insurance quote integration for property and title insurance
- Generate transaction cost reports and closing statements
- Implement compliance tracking for all financial service interactions

Technical Specifications:
- Lender APIs: Quicken Loans, Wells Fargo, Bank of America, local lenders
- Title companies: First American, Fidelity National, Stewart Title
- LOS systems: Encompass, Calyx Point, Byte Software
- Credit bureaus: Experian, Equifax, TransUnion
- Integration: REST APIs, MISMO standards, secure file transfer

Create the complete N8n workflow for comprehensive financial services integration.
```

---

## Monitoring & Analytics Prompts

### Prompt #34: Usage Analytics Engine
```
Role: N8n Analytics Engineering Specialist

Task: Create a comprehensive usage analytics engine that tracks AI tool adoption, performance metrics, and user engagement across the platform.

Requirements:
- Build user behavior tracking for all AI tools and agents
- Implement performance metrics collection (response times, accuracy rates, satisfaction)
- Create usage pattern analysis and trend identification
- Add cost tracking and ROI calculation for AI tool usage
- Implement user segmentation and persona analysis
- Create predictive analytics for user engagement and churn
- Add comparative analysis between different user groups and organizations
- Generate executive dashboards and detailed usage reports
- Implement real-time alerting for unusual patterns or performance issues

Technical Specifications:
- Metrics: Tool usage frequency, session duration, task completion rates, error rates
- User tracking: Individual and organizational level analytics
- Performance monitoring: Response times, accuracy scores, user satisfaction ratings
- Cost analysis: Token usage, API costs, computational resources
- Integration: All AI agents, user interface, billing systems

Create the complete N8n workflow for comprehensive usage analytics and reporting.
```

### Prompt #35: Business Intelligence Dashboard
```
Role: N8n Business Intelligence Engineer

Task: Create a comprehensive business intelligence dashboard system that provides insights across all platform modules and user activities.

Requirements:
- Build executive dashboard with key performance indicators and trends
- Implement module-specific analytics (CRM, workspace, marketing, financial)
- Create predictive analytics for business forecasting and trend analysis
- Add competitive benchmarking and market position analysis
- Implement user satisfaction and engagement tracking
- Create revenue analytics and subscription performance monitoring
- Add operational efficiency metrics and process optimization insights
- Generate automated reports and alert systems for key metrics
- Implement drill-down capabilities for detailed analysis

Technical Specifications:
- KPIs: User adoption, feature utilization, revenue growth, customer satisfaction
- Data sources: All platform modules, external market data, user behavior
- Visualization: Real-time charts, trend analysis, comparative reporting
- Automation: Scheduled reports, threshold alerts, anomaly detection
- Integration: All platform data, external benchmarking sources

Create the complete N8n workflow for comprehensive business intelligence and reporting.
```

---

## Security & Compliance Prompts

### Prompt #36: Data Encryption Manager
```
Role: N8n Security Engineering Specialist

Task: Create a comprehensive data encryption management system that ensures all AI processing and data storage meets security and compliance requirements.

Requirements:
- Build end-to-end encryption for all AI agent communications
- Implement at-rest encryption for stored conversation data and documents
- Create secure key management and rotation workflows
- Add data masking and anonymization for development and testing
- Implement secure backup and disaster recovery processes
- Create audit logging for all data access and encryption operations
- Add compliance monitoring for GDPR, CCPA, and real estate regulations
- Generate security reports and compliance certificates
- Implement breach detection and response workflows

Technical Specifications:
- Encryption standards: AES-256, TLS 1.3, RSA-4096
- Key management: Hardware security modules, key rotation schedules
- Compliance frameworks: GDPR, CCPA, SOC 2, ISO 27001
- Audit logging: All access attempts, encryption operations, key usage
- Integration: All AI agents, data storage systems, external APIs

Create the complete N8n workflow for comprehensive data encryption and security management.
```

### Prompt #37: Access Control Monitor
```
Role: N8n Access Control Engineer

Task: Create an advanced access control monitoring system that ensures all AI tools respect organizational RBAC permissions and user access levels.

Requirements:
- Build real-time permission checking for all AI tool access
- Implement role-based access control (RBAC) enforcement across all agents
- Create organization-level isolation and data access controls
- Add user activity monitoring and anomaly detection
- Implement session management and timeout enforcement
- Create permission audit trails and compliance reporting
- Add automated access reviews and permission cleanup
- Generate security alerts for unauthorized access attempts
- Implement integration with identity providers and SSO systems

Technical Specifications:
- RBAC levels: Super Admin, Org Admin, Agent, Viewer permissions
- Organization isolation: Complete data separation between organizations
- Session management: JWT tokens, session timeouts, concurrent session limits
- Monitoring: All API calls, data access attempts, permission changes
- Integration: Identity providers (Auth0, Okta), SSO systems, audit systems

Create the complete N8n workflow for comprehensive access control and monitoring.
```

---

## Specialized Add-On Tool Prompts

### Prompt #38: Smart Contract Automation
```
Role: N8n Blockchain Integration Engineer

Task: Create smart contract automation workflows for real estate transactions using blockchain technology.

Requirements:
- Build smart contract creation for property purchase agreements
- Implement automated escrow and fund release mechanisms
- Create property ownership transfer automation using blockchain records
- Add multi-signature wallet integration for transaction security
- Implement compliance checking with local real estate laws
- Create dispute resolution and arbitration workflows
- Add integration with traditional closing processes and title companies
- Generate blockchain transaction reports and audit trails
- Implement cryptocurrency payment processing for international clients

Technical Specifications:
- Blockchain platforms: Ethereum, Polygon, Binance Smart Chain
- Smart contracts: Solidity-based contracts for real estate transactions
- Wallets: MetaMask, Coinbase Wallet, hardware wallet integration
- Compliance: Legal framework integration, regulatory compliance checking
- Integration: Traditional closing systems, title companies, legal processes

Create the complete N8n workflow for blockchain-based real estate transaction automation.
```

### Prompt #39: IoT Property Monitoring
```
Role: N8n IoT Integration Engineer

Task: Create comprehensive IoT property monitoring workflows that integrate smart home devices and sensors for property management.

Requirements:
- Build integration with smart home platforms (Alexa, Google Home, SmartThings)
- Implement sensor monitoring for temperature, humidity, security, and energy usage
- Create automated maintenance alerts and scheduling workflows
- Add property condition monitoring and reporting for owners and tenants
- Implement energy efficiency optimization and cost reduction recommendations
- Create security system integration with cameras, locks, and alarms
- Add vacant property monitoring and management workflows
- Generate property performance reports and maintenance predictions
- Implement emergency response automation for water leaks, fires, and break-ins

Technical Specifications:
- IoT platforms: Amazon Alexa, Google Assistant, Samsung SmartThings, Apple HomeKit
- Devices: Thermostats, security cameras, smart locks, leak sensors, air quality monitors
- Communication: WiFi, Zigbee, Z-Wave, cellular connectivity
- Alerts: Real-time notifications, automated responses, emergency protocols
- Integration: Property management systems, maintenance services, emergency contacts

Create the complete N8n workflow for comprehensive IoT property monitoring and management.
```

### Prompt #40: Energy Management Optimization
```
Role: N8n Energy Management Engineer

Task: Create intelligent energy management workflows that optimize HVAC systems, utilities, and energy costs for managed properties.

Requirements:
- Build smart thermostat integration and optimization algorithms
- Implement utility usage monitoring and cost analysis
- Create occupancy-based HVAC scheduling and automation
- Add renewable energy integration (solar panels, energy storage)
- Implement demand response programs and peak shaving strategies
- Create energy efficiency recommendations and retrofit analysis
- Add utility bill analysis and anomaly detection
- Generate energy performance reports and cost savings projections
- Implement integration with utility providers and energy markets

Technical Specifications:
- Smart devices: Nest, Ecobee, Honeywell thermostats, smart meters
- Energy systems: Solar inverters, battery storage, EV charging stations
- Utility integration: Smart meter data, time-of-use rates, demand response
- Optimization: Machine learning algorithms for usage prediction and cost minimization
- Integration: Property management systems, utility providers, energy markets

Create the complete N8n workflow for comprehensive energy management and optimization.
```

---

## Performance Optimization & Scaling Prompts

### Prompt #41: System Performance Monitor
```
Role: N8n Performance Engineering Specialist

Task: Create a comprehensive system performance monitoring workflow that ensures all AI agents and workflows operate within optimal performance parameters.

Requirements:
- Build real-time performance monitoring for all AI agents and workflows
- Implement response time tracking and latency optimization
- Create resource usage monitoring (CPU, memory, API calls, database queries)
- Add capacity planning and auto-scaling triggers
- Implement error rate tracking and automated recovery workflows
- Create performance benchmarking and comparison analysis
- Add user experience monitoring and satisfaction tracking
- Generate performance reports and optimization recommendations
- Implement predictive analysis for system capacity and performance trends

Technical Specifications:
- Metrics: Response times (<2s target), error rates (<1% target), resource utilization
- Monitoring tools: Application Performance Monitoring (APM), infrastructure monitoring
- Scaling triggers: CPU usage, memory consumption, queue depth, response times
- Recovery: Automatic restarts, failover procedures, error handling
- Integration: All AI agents, database systems, external APIs, user interfaces

Create the complete N8n workflow for comprehensive system performance monitoring and optimization.
```

### Prompt #42: Error Handling & Recovery System
```
Role: N8n Reliability Engineering Specialist

Task: Create a comprehensive error handling and recovery system that ensures robust operation of all AI agents and workflows with graceful degradation.

Requirements:
- Build intelligent error detection and classification systems
- Implement automatic retry logic with exponential backoff
- Create fallback mechanisms for failed AI agents and external APIs
- Add error logging and analysis for pattern identification
- Implement circuit breaker patterns for unreliable external services
- Create manual override capabilities for critical business processes
- Add error notification and escalation workflows
- Generate error reports and reliability metrics
- Implement continuous improvement based on error analysis

Technical Specifications:
- Error types: API failures, timeout errors, data validation failures, resource exhaustion
- Retry policies: Exponential backoff, maximum retry limits, circuit breakers
- Fallback strategies: Alternative agents, cached responses, manual processes
- Monitoring: Error rates, mean time to recovery, availability metrics
- Integration: All AI agents, external APIs, monitoring systems, alert mechanisms

Create the complete N8n workflow for comprehensive error handling and system reliability.
```

---

## Quality Assurance & Testing Prompts

### Prompt #43: AI Agent Quality Assurance System
```
Role: N8n Quality Assurance Engineer

Task: Create a comprehensive quality assurance system that continuously tests and validates the performance and accuracy of all AI agents.

Requirements:
- Build automated testing frameworks for all AI agent outputs
- Implement accuracy validation using test datasets and expected results
- Create A/B testing capabilities for comparing different AI models and approaches
- Add user feedback collection and analysis for continuous improvement
- Implement regression testing to ensure updates don't degrade performance
- Create bias detection and fairness testing for AI decision-making
- Add performance benchmarking against industry standards
- Generate quality reports and improvement recommendations
- Implement integration with development and deployment pipelines

Technical Specifications:
- Test types: Unit tests, integration tests, end-to-end tests, load tests
- Accuracy metrics: Precision, recall, F1-score, user satisfaction ratings
- Test data: Synthetic data, historical data, user-generated scenarios
- Bias testing: Fairness across demographics, geographic regions, property types
- Integration: CI/CD pipelines, version control, monitoring systems

Create the complete N8n workflow for comprehensive AI agent quality assurance and testing.
```

---

## Final Integration & Deployment Prompts

### Prompt #44: Master Orchestration Controller
```
Role: N8n Master Integration Engineer

Task: Create a master orchestration controller that coordinates all AI agents, manages workflow dependencies, and provides centralized monitoring and control.

Requirements:
- Build centralized workflow orchestration that manages all AI agents
- Implement dependency management and execution ordering
- Create resource allocation and load balancing across agents
- Add global configuration management and feature flags
- Implement centralized logging and monitoring aggregation  
- Create health checking and system status reporting
- Add deployment coordination and version management
- Generate system-wide analytics and performance reporting
- Implement emergency stop and recovery procedures

Technical Specifications:
- Orchestration: Workflow dependencies, execution priorities, resource constraints
- Load balancing: Distribute requests across available agent instances
- Configuration: Environment-specific settings, feature toggles, scaling parameters
- Monitoring: Aggregate metrics from all agents, system health dashboards
- Integration: All AI agents, infrastructure components, monitoring systems

Create the complete N8n workflow for master orchestration and system coordination.
```

### Prompt #45: Production Deployment Automation
```
Role: N8n DevOps Automation Engineer

Task: Create a comprehensive production deployment automation system that handles versioning, testing, and rollout of all AI agents and workflows.

Requirements:
- Build automated deployment pipeline with testing and validation gates
- Implement blue-green deployment strategies for zero-downtime updates
- Create rollback mechanisms and version control for all workflows
- Add environment-specific configuration management
- Implement health checks and monitoring during deployments
- Create deployment approval workflows for production releases
- Add automated backup and recovery procedures
- Generate deployment reports and audit trails
- Implement integration with source control and CI/CD systems

Technical Specifications:
- Deployment strategies: Blue-green, canary releases, rolling updates
- Testing gates: Unit tests, integration tests, performance validation
- Monitoring: Deployment success rates, rollback frequency, system health
- Backup: Configuration backups, data backups, recovery procedures
- Integration: Git repositories, CI/CD pipelines, monitoring systems

Create the complete N8n workflow for automated production deployment and management.
```

---

## Summary & Implementation Guidelines

### Implementation Priority Order:
1. **Core Infrastructure** (Prompts #1-3): Sai, RAG, AI Hub management
2. **High-Impact Agents** (Prompts #4-14): Lead management, property analysis, market intelligence  
3. **Transaction Processing** (Prompts #15-20): Document processing, financial calculations
4. **Communication Systems** (Prompts #21-23): Booking, scripting, review management
5. **Module Integrations** (Prompts #24-27): CRM, expense tracking, social media, campaign ROI
6. **Advanced Workflows** (Prompts #28-30): Multi-agent orchestration, analysis pipelines
7. **External Integrations** (Prompts #31-33): MLS, CRM platforms, financial services
8. **Analytics & Monitoring** (Prompts #34-35): Usage analytics, business intelligence
9. **Security & Compliance** (Prompts #36-37): Encryption, access control
10. **Specialized Tools** (Prompts #38-40): Blockchain, IoT, energy management
11. **System Optimization** (Prompts #41-43): Performance monitoring, error handling, QA
12. **Deployment Management** (Prompts #44-45): Master orchestration, production deployment

### Best Practices for Implementation:
- Start each prompt session by confirming your N8n MCP access is working
- Test each workflow thoroughly in development before deploying to production
- Implement proper error handling and monitoring for all workflows
- Use environment variables for all API keys and sensitive configuration
- Follow the organization isolation patterns for multi-tenant compliance
- Document all workflows and maintain version control
- Monitor performance and optimize based on usage patterns
- Implement proper logging for debugging and analytics

This complete set of 45 prompts covers every AI agent, tool, and workflow identified in the comprehensive analysis, ensuring 100% coverage of all required functionality for the Strive Tech real estate SaaS platform.