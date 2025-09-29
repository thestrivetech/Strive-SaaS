-- ==========================================
-- STRIVE TECH SAAS DASHBOARD - DATABASE SCHEMA BACKUP
-- ==========================================
-- Generated from Prisma Schema
-- Project: Strive Tech SaaS Platform
-- Date: 2025-09-29
-- ==========================================

-- Extensions (Required for Supabase)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ==========================================
-- ENUMS
-- ==========================================

CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'MODERATOR', 'EMPLOYEE', 'CLIENT');
CREATE TYPE "SubscriptionTier" AS ENUM ('FREE', 'BASIC', 'PRO', 'ENTERPRISE');
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'TRIAL', 'PAST_DUE', 'CANCELLED');
CREATE TYPE "OrgRole" AS ENUM ('OWNER', 'ADMIN', 'MEMBER', 'VIEWER');
CREATE TYPE "CustomerStatus" AS ENUM ('LEAD', 'PROSPECT', 'ACTIVE', 'CHURNED');
CREATE TYPE "CustomerSource" AS ENUM ('WEBSITE', 'REFERRAL', 'SOCIAL', 'EMAIL', 'OTHER');
CREATE TYPE "ProjectStatus" AS ENUM ('PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'CANCELLED');
CREATE TYPE "TaskStatus" AS ENUM ('TODO', 'IN_PROGRESS', 'REVIEW', 'DONE', 'CANCELLED');
CREATE TYPE "Priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
CREATE TYPE "AIContextType" AS ENUM ('GENERAL', 'PROJECT', 'CUSTOMER', 'TASK');
CREATE TYPE "AIModel" AS ENUM ('OPENAI_GPT4', 'CLAUDE_SONNET', 'GEMINI', 'GROK', 'KIMIK2');
CREATE TYPE "ToolType" AS ENUM ('CHATBOT', 'ANALYSIS', 'AUTOMATION', 'INTEGRATION');
CREATE TYPE "ResourceType" AS ENUM ('AI_TOKENS', 'API_CALLS', 'STORAGE', 'SEATS');
CREATE TYPE "AppointmentStatus" AS ENUM ('SCHEDULED', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW');
CREATE TYPE "ContentType" AS ENUM ('PAGE', 'BLOG_POST', 'DOCUMENTATION', 'TEMPLATE');
CREATE TYPE "ContentStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- ==========================================
-- CORE TABLES
-- ==========================================

-- Users Table
CREATE TABLE "users" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "clerk_user_id" TEXT UNIQUE,
    "email" TEXT UNIQUE NOT NULL,
    "name" TEXT,
    "avatar_url" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'EMPLOYEE',
    "subscription_tier" "SubscriptionTier" NOT NULL DEFAULT 'FREE',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Organizations Table
CREATE TABLE "organizations" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "name" TEXT NOT NULL,
    "slug" TEXT UNIQUE NOT NULL,
    "description" TEXT,
    "settings" JSONB,
    "subscription_status" "SubscriptionStatus" NOT NULL DEFAULT 'TRIAL',
    "billing_email" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Organization Members Table
CREATE TABLE "organization_members" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "user_id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "role" "OrgRole" NOT NULL DEFAULT 'MEMBER',
    "permissions" JSONB,
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE("user_id", "organization_id"),
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Customers Table
CREATE TABLE "customers" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "organization_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "company" TEXT,
    "status" "CustomerStatus" NOT NULL DEFAULT 'LEAD',
    "source" "CustomerSource" NOT NULL DEFAULT 'WEBSITE',
    "tags" TEXT[],
    "custom_fields" JSONB,
    "assigned_to" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY ("assigned_to") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- Projects Table
CREATE TABLE "projects" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "organization_id" UUID NOT NULL,
    "customer_id" UUID,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" "ProjectStatus" NOT NULL DEFAULT 'PLANNING',
    "priority" "Priority" NOT NULL DEFAULT 'MEDIUM',
    "start_date" TIMESTAMP(3),
    "due_date" TIMESTAMP(3),
    "completion_date" TIMESTAMP(3),
    "budget" DECIMAL(10,2),
    "progress_percentage" INTEGER NOT NULL DEFAULT 0,
    "project_manager_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    FOREIGN KEY ("project_manager_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Tasks Table
CREATE TABLE "tasks" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "project_id" UUID NOT NULL,
    "parent_task_id" UUID,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "TaskStatus" NOT NULL DEFAULT 'TODO',
    "priority" "Priority" NOT NULL DEFAULT 'MEDIUM',
    "assigned_to" UUID,
    "created_by" UUID NOT NULL,
    "due_date" TIMESTAMP(3),
    "estimated_hours" DECIMAL(5,2),
    "actual_hours" DECIMAL(5,2),
    "tags" TEXT[],
    "position" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY ("parent_task_id") REFERENCES "tasks"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    FOREIGN KEY ("assigned_to") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- AI Conversations Table
CREATE TABLE "ai_conversations" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "user_id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "title" TEXT,
    "context_type" "AIContextType" NOT NULL DEFAULT 'GENERAL',
    "context_id" TEXT,
    "ai_model" "AIModel" NOT NULL DEFAULT 'OPENAI_GPT4',
    "conversation_data" JSONB NOT NULL,
    "usage_tokens" INTEGER NOT NULL DEFAULT 0,
    "is_archived" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- AI Tools Table
CREATE TABLE "ai_tools" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "name" TEXT NOT NULL,
    "description" TEXT,
    "toolType" "ToolType" NOT NULL,
    "required_tier" "SubscriptionTier" NOT NULL,
    "configuration" JSONB,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Subscriptions Table
CREATE TABLE "subscriptions" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "organization_id" UUID UNIQUE NOT NULL,
    "stripe_subscription_id" TEXT UNIQUE,
    "stripe_customer_id" TEXT,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'TRIAL',
    "tier" "SubscriptionTier" NOT NULL DEFAULT 'FREE',
    "current_period_start" TIMESTAMP(3) NOT NULL,
    "current_period_end" TIMESTAMP(3) NOT NULL,
    "cancel_at_period_end" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Usage Tracking Table
CREATE TABLE "usage_tracking" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "organization_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "resource_type" "ResourceType" NOT NULL,
    "resource_name" TEXT NOT NULL,
    "usage_amount" INTEGER NOT NULL,
    "billing_period" TIMESTAMP(3) NOT NULL,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Appointments Table
CREATE TABLE "appointments" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "organization_id" UUID NOT NULL,
    "customer_id" UUID,
    "assigned_to" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3) NOT NULL,
    "status" "AppointmentStatus" NOT NULL DEFAULT 'SCHEDULED',
    "location" TEXT,
    "meeting_url" TEXT,
    "reminders_sent" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    FOREIGN KEY ("assigned_to") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Content Table
CREATE TABLE "content" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "organization_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content_type" "ContentType" NOT NULL,
    "content" TEXT NOT NULL,
    "excerpt" TEXT,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "author_id" UUID NOT NULL,
    "published_at" TIMESTAMP(3),
    "seo_meta" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE("organization_id", "slug"),
    FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Activity Logs Table
CREATE TABLE "activity_logs" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "organization_id" UUID NOT NULL,
    "user_id" UUID,
    "action" TEXT NOT NULL,
    "resource_type" TEXT NOT NULL,
    "resource_id" TEXT,
    "old_data" JSONB,
    "new_data" JSONB,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- ==========================================
-- INDEXES
-- ==========================================

-- Customer indexes
CREATE INDEX "customers_organization_id_idx" ON "customers"("organization_id");
CREATE INDEX "customers_email_idx" ON "customers"("email");
CREATE INDEX "customers_status_idx" ON "customers"("status");

-- Project indexes
CREATE INDEX "projects_organization_id_idx" ON "projects"("organization_id");
CREATE INDEX "projects_status_idx" ON "projects"("status");

-- Task indexes
CREATE INDEX "tasks_project_id_idx" ON "tasks"("project_id");
CREATE INDEX "tasks_status_idx" ON "tasks"("status");
CREATE INDEX "tasks_assigned_to_idx" ON "tasks"("assigned_to");

-- AI Conversation indexes
CREATE INDEX "ai_conversations_user_id_idx" ON "ai_conversations"("user_id");
CREATE INDEX "ai_conversations_organization_id_idx" ON "ai_conversations"("organization_id");
CREATE INDEX "ai_conversations_created_at_idx" ON "ai_conversations"("created_at");

-- Usage Tracking indexes
CREATE INDEX "usage_tracking_organization_id_billing_period_idx" ON "usage_tracking"("organization_id", "billing_period");

-- Appointment indexes
CREATE INDEX "appointments_organization_id_idx" ON "appointments"("organization_id");
CREATE INDEX "appointments_start_time_idx" ON "appointments"("start_time");

-- Content indexes
CREATE INDEX "content_status_idx" ON "content"("status");

-- Activity Log indexes
CREATE INDEX "activity_logs_organization_id_created_at_idx" ON "activity_logs"("organization_id", "created_at");
CREATE INDEX "activity_logs_user_id_idx" ON "activity_logs"("user_id");

-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

-- Enable RLS on all tables
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "organizations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "organization_members" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "customers" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "projects" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "tasks" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ai_conversations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ai_tools" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "subscriptions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "usage_tracking" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "appointments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "content" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "activity_logs" ENABLE ROW LEVEL SECURITY;

-- Multi-tenant isolation policies
CREATE POLICY "users_own_data" ON "users"
    FOR ALL USING (auth.uid()::text = clerk_user_id);

CREATE POLICY "org_member_access" ON "organizations"
    FOR ALL USING (
        id IN (
            SELECT organization_id FROM "organization_members"
            WHERE user_id IN (SELECT id FROM users WHERE auth.uid()::text = clerk_user_id)
        )
    );

CREATE POLICY "customers_org_access" ON "customers"
    FOR ALL USING (
        organization_id IN (
            SELECT organization_id FROM "organization_members"
            WHERE user_id IN (SELECT id FROM users WHERE auth.uid()::text = clerk_user_id)
        )
    );

CREATE POLICY "projects_org_access" ON "projects"
    FOR ALL USING (
        organization_id IN (
            SELECT organization_id FROM "organization_members"
            WHERE user_id IN (SELECT id FROM users WHERE auth.uid()::text = clerk_user_id)
        )
    );

CREATE POLICY "tasks_org_access" ON "tasks"
    FOR ALL USING (
        project_id IN (
            SELECT id FROM projects
            WHERE organization_id IN (
                SELECT organization_id FROM "organization_members"
                WHERE user_id IN (SELECT id FROM users WHERE auth.uid()::text = clerk_user_id)
            )
        )
    );

-- ==========================================
-- TRIGGERS FOR UPDATED_AT
-- ==========================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to all tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON "users" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON "organizations" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON "customers" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON "projects" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON "tasks" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ai_conversations_updated_at BEFORE UPDATE ON "ai_conversations" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ai_tools_updated_at BEFORE UPDATE ON "ai_tools" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON "subscriptions" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON "appointments" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_content_updated_at BEFORE UPDATE ON "content" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- INITIAL DATA (Optional)
-- ==========================================

-- Insert default AI tools
INSERT INTO "ai_tools" ("name", "description", "toolType", "required_tier") VALUES
('GPT-4 Assistant', 'Advanced AI assistant powered by OpenAI GPT-4', 'CHATBOT', 'BASIC'),
('Claude Sonnet', 'Anthropic Claude for complex reasoning tasks', 'CHATBOT', 'PRO'),
('Data Analyzer', 'AI-powered data analysis and insights', 'ANALYSIS', 'PRO'),
('Workflow Automator', 'Automated task and workflow management', 'AUTOMATION', 'ENTERPRISE'),
('CRM Integration', 'AI-enhanced customer relationship management', 'INTEGRATION', 'PRO');

-- ==========================================
-- SCHEMA VERIFICATION
-- ==========================================

-- Verify all tables were created
SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename IN (
    'users', 'organizations', 'organization_members', 'customers', 'projects',
    'tasks', 'ai_conversations', 'ai_tools', 'subscriptions', 'usage_tracking',
    'appointments', 'content', 'activity_logs'
) ORDER BY tablename;