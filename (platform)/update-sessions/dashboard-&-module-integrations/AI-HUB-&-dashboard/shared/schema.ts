import { sql } from "drizzle-orm";
import { pgTable, text, varchar, json, timestamp, pgEnum, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const workflowStatusEnum = pgEnum('workflow_status', ['DRAFT', 'ACTIVE', 'PAUSED', 'ARCHIVED']);
export const executionStatusEnum = pgEnum('execution_status', ['PENDING', 'RUNNING', 'SUCCESS', 'FAILED', 'CANCELLED']);
export const integrationStatusEnum = pgEnum('integration_status', ['CONNECTED', 'DISCONNECTED', 'ERROR', 'PENDING']);
export const teamStructureEnum = pgEnum('team_structure', ['HIERARCHICAL', 'COLLABORATIVE', 'PIPELINE', 'DEMOCRATIC']);
export const agentStatusEnum = pgEnum('agent_status', ['ACTIVE', 'IDLE', 'BUSY', 'OFFLINE']);

// Users table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").default(sql`now()`),
});

// Workflows table
export const workflows = pgTable("workflows", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  nodes: json("nodes").$type<any[]>().notNull().default([]),
  edges: json("edges").$type<any[]>().notNull().default([]),
  status: workflowStatusEnum("status").notNull().default('DRAFT'),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

// AI Agents table
export const aiAgents = pgTable("ai_agents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  avatar: text("avatar"),
  personality: json("personality").$type<{
    traits: string[];
    communicationStyle: string;
    expertise: string[];
  }>().notNull(),
  modelConfig: json("model_config").$type<{
    provider: string;
    model: string;
    parameters: Record<string, any>;
  }>().notNull(),
  capabilities: text("capabilities").array().notNull().default([]),
  memory: json("memory").$type<{
    vectorEmbeddings?: any[];
    conversationHistory?: any[];
    knowledgeBase?: any[];
  }>().notNull().default({}),
  status: agentStatusEnum("status").notNull().default('IDLE'),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

// Agent Teams table
export const agentTeams = pgTable("agent_teams", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  structure: teamStructureEnum("structure").notNull().default('COLLABORATIVE'),
  configuration: json("configuration").$type<{
    roles: Record<string, any>;
    communicationPatterns: string[];
    decisionMaking: string;
  }>().notNull().default({ roles: {}, communicationPatterns: [], decisionMaking: '' }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

// Team Members table (junction table)
export const teamMembers = pgTable("team_members", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  teamId: varchar("team_id").notNull().references(() => agentTeams.id, { onDelete: 'cascade' }),
  agentId: varchar("agent_id").notNull().references(() => aiAgents.id, { onDelete: 'cascade' }),
  role: text("role").notNull(),
  permissions: json("permissions").$type<string[]>().notNull().default([]),
  createdAt: timestamp("created_at").default(sql`now()`),
});

// Integrations table
export const integrations = pgTable("integrations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  provider: text("provider").notNull(), // slack, gmail, salesforce, etc.
  configuration: json("configuration").$type<{
    apiKey?: string;
    webhook?: string;
    settings: Record<string, any>;
  }>().notNull(),
  status: integrationStatusEnum("status").notNull().default('PENDING'),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

// Workflow Executions table
export const workflowExecutions = pgTable("workflow_executions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  workflowId: varchar("workflow_id").notNull().references(() => workflows.id, { onDelete: 'cascade' }),
  status: executionStatusEnum("status").notNull().default('PENDING'),
  input: json("input").$type<any>(),
  output: json("output").$type<any>(),
  steps: json("steps").$type<any[]>().notNull().default([]),
  executionTime: integer("execution_time"), // in milliseconds
  errorMessage: text("error_message"),
  triggeredBy: text("triggered_by"),
  createdAt: timestamp("created_at").default(sql`now()`),
  completedAt: timestamp("completed_at"),
});

// Agent Executions table
export const agentExecutions = pgTable("agent_executions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  agentId: varchar("agent_id").notNull().references(() => aiAgents.id, { onDelete: 'cascade' }),
  workflowExecutionId: varchar("workflow_execution_id").references(() => workflowExecutions.id, { onDelete: 'cascade' }),
  task: text("task").notNull(),
  input: json("input").$type<any>(),
  output: json("output").$type<any>(),
  status: executionStatusEnum("status").notNull().default('PENDING'),
  executionTime: integer("execution_time"), // in milliseconds
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").default(sql`now()`),
  completedAt: timestamp("completed_at"),
});

// Templates table
export const templates = pgTable("templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  nodes: json("nodes").$type<any[]>().notNull(),
  edges: json("edges").$type<any[]>().notNull(),
  metadata: json("metadata").$type<{
    tags: string[];
    difficulty: string;
    estimatedTime: string;
    usageCount: number;
    rating: number;
  }>().notNull(),
  isPublic: boolean("is_public").notNull().default(false),
  authorId: varchar("author_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertWorkflowSchema = createInsertSchema(workflows).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAIAgentSchema = createInsertSchema(aiAgents).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAgentTeamSchema = createInsertSchema(agentTeams).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTeamMemberSchema = createInsertSchema(teamMembers).omit({
  id: true,
  createdAt: true,
});

export const insertIntegrationSchema = createInsertSchema(integrations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertWorkflowExecutionSchema = createInsertSchema(workflowExecutions).omit({
  id: true,
  createdAt: true,
  completedAt: true,
});

export const insertAgentExecutionSchema = createInsertSchema(agentExecutions).omit({
  id: true,
  createdAt: true,
  completedAt: true,
});

export const insertTemplateSchema = createInsertSchema(templates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Workflow = typeof workflows.$inferSelect;
export type InsertWorkflow = z.infer<typeof insertWorkflowSchema>;
export type AIAgent = typeof aiAgents.$inferSelect;
export type InsertAIAgent = z.infer<typeof insertAIAgentSchema>;
export type AgentTeam = typeof agentTeams.$inferSelect;
export type InsertAgentTeam = z.infer<typeof insertAgentTeamSchema>;
export type TeamMember = typeof teamMembers.$inferSelect;
export type InsertTeamMember = z.infer<typeof insertTeamMemberSchema>;
export type Integration = typeof integrations.$inferSelect;
export type InsertIntegration = z.infer<typeof insertIntegrationSchema>;
export type WorkflowExecution = typeof workflowExecutions.$inferSelect;
export type InsertWorkflowExecution = z.infer<typeof insertWorkflowExecutionSchema>;
export type AgentExecution = typeof agentExecutions.$inferSelect;
export type InsertAgentExecution = z.infer<typeof insertAgentExecutionSchema>;
export type Template = typeof templates.$inferSelect;
export type InsertTemplate = z.infer<typeof insertTemplateSchema>;
