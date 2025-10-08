/**
 * Prisma Compatibility Types
 *
 * Temporary type definitions for Prisma enums/models that don't exist in the minimal schema yet.
 *
 * TODO: As you build UI and discover what you actually need, add these to the real schema.
 * When a type is added to schema.prisma, remove it from here and import from '@prisma/client' instead.
 */

// Admin & Audit
export type AdminAction = string;

// AI & Tools
export enum AgentCategory {
  SALES = 'SALES',
  MARKETING = 'MARKETING',
  SUPPORT = 'SUPPORT',
  ANALYTICS = 'ANALYTICS',
  CUSTOM = 'CUSTOM',
}

export enum AIModel {
  OPENAI_GPT4 = 'OPENAI_GPT4',
  OPENAI_GPT35 = 'OPENAI_GPT35',
  ANTHROPIC_CLAUDE = 'ANTHROPIC_CLAUDE',
  GROQ_LLAMA = 'GROQ_LLAMA',
}

export enum AIToolCategory {
  CONTENT_GENERATION = 'CONTENT_GENERATION',
  DATA_ANALYSIS = 'DATA_ANALYSIS',
  AUTOMATION = 'AUTOMATION',
  COMMUNICATION = 'COMMUNICATION',
}

export enum ComplexityLevel {
  SIMPLE = 'SIMPLE',
  MODERATE = 'MODERATE',
  COMPLEX = 'COMPLEX',
  ADVANCED = 'ADVANCED',
}

// Marketplace
export enum ToolCategory {
  CRM = 'CRM',
  ANALYTICS = 'ANALYTICS',
  MARKETING = 'MARKETING',
  AUTOMATION = 'AUTOMATION',
  INTEGRATION = 'INTEGRATION',
}

export enum ToolTier {
  FREE = 'FREE',
  BASIC = 'BASIC',
  PROFESSIONAL = 'PROFESSIONAL',
  ENTERPRISE = 'ENTERPRISE',
}

export enum BundleType {
  STARTER = 'STARTER',
  GROWTH = 'GROWTH',
  ENTERPRISE = 'ENTERPRISE',
}

export enum PurchaseStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

export enum PricingModel {
  FREE = 'FREE',
  ONE_TIME = 'ONE_TIME',
  SUBSCRIPTION = 'SUBSCRIPTION',
  USAGE_BASED = 'USAGE_BASED',
}

// Add more as needed when you encounter missing types during development
