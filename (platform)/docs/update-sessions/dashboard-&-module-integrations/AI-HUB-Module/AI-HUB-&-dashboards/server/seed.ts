import { db } from "./db";
import { users, aiAgents, templates } from "@shared/schema";
import { eq } from "drizzle-orm";

async function seed() {
  console.log('Seeding database...');

  // Check if demo user already exists
  const existing = await db.select().from(users).where(eq(users.username, 'demo'));
  
  if (existing.length > 0) {
    console.log('Demo user already exists, skipping seed');
    return;
  }

  // Create demo user
  const [demoUser] = await db.insert(users).values({
    username: 'demo',
    email: 'demo@neuroflow.ai',
    password: 'demo123',
  }).returning();

  if (!demoUser) {
    throw new Error('Failed to create demo user');
  }

  console.log('Created demo user:', demoUser.id);

  // Create demo AI agents
  await db.insert(aiAgents).values([
    {
      name: 'Sales Assistant',
      description: 'AI agent specialized in sales lead qualification and customer outreach',
      personality: {
        traits: ['Professional', 'Persuasive', 'Analytical'],
        communicationStyle: 'Formal and consultative',
        expertise: ['Sales', 'Lead Qualification', 'CRM Management']
      },
      modelConfig: {
        provider: 'openai',
        model: 'gpt-4o',
        parameters: { max_tokens: 4096 }
      },
      capabilities: ['Lead Analysis', 'Email Outreach', 'CRM Integration'],
      memory: {
        conversationHistory: [],
        knowledgeBase: []
      },
      status: 'ACTIVE',
      userId: demoUser.id,
    },
    {
      name: 'Customer Support',
      description: 'Intelligent customer support agent with sentiment analysis',
      personality: {
        traits: ['Empathetic', 'Patient', 'Solution-oriented'],
        communicationStyle: 'Friendly and helpful',
        expertise: ['Customer Service', 'Technical Support', 'Problem Resolution']
      },
      modelConfig: {
        provider: 'anthropic',
        model: 'claude-sonnet-4-20250514',
        parameters: { max_tokens: 4096 }
      },
      capabilities: ['Ticket Routing', 'Sentiment Analysis', 'Knowledge Base Search'],
      memory: {
        conversationHistory: [],
        knowledgeBase: []
      },
      status: 'ACTIVE',
      userId: demoUser.id,
    },
    {
      name: 'Data Analyst',
      description: 'Advanced data analysis and visualization specialist',
      personality: {
        traits: ['Analytical', 'Detail-oriented', 'Insightful'],
        communicationStyle: 'Clear and data-driven',
        expertise: ['Data Analysis', 'Statistics', 'Visualization']
      },
      modelConfig: {
        provider: 'openai',
        model: 'gpt-4o',
        parameters: { max_tokens: 8192 }
      },
      capabilities: ['Data Processing', 'Statistical Analysis', 'Chart Generation'],
      memory: {
        conversationHistory: [],
        knowledgeBase: []
      },
      status: 'IDLE',
      userId: demoUser.id,
    }
  ]).onConflictDoNothing();

  console.log('Created demo agents');

  // Create demo templates
  await db.insert(templates).values([
    {
      name: 'Sales Lead Automation',
      description: 'Auto-qualify leads, enrich data, and sync to CRM with AI scoring',
      category: 'Sales',
      nodes: [
        { id: 'trigger-1', type: 'trigger', data: { label: 'Webhook Trigger' } },
        { id: 'ai-1', type: 'ai', data: { label: 'Lead Qualification' } },
        { id: 'action-1', type: 'action', data: { label: 'Save to CRM' } }
      ],
      edges: [
        { id: 'e1', source: 'trigger-1', target: 'ai-1' },
        { id: 'e2', source: 'ai-1', target: 'action-1' }
      ],
      metadata: {
        tags: ['sales', 'automation', 'crm'],
        difficulty: 'Intermediate',
        estimatedTime: '30 minutes',
        usageCount: 1247,
        rating: 4.8
      },
      isPublic: true,
      authorId: demoUser.id,
    },
    {
      name: 'Customer Support Automation',
      description: 'Automatically route, prioritize, and respond to customer inquiries',
      category: 'Support',
      nodes: [
        { id: 'trigger-1', type: 'trigger', data: { label: 'Email Trigger' } },
        { id: 'ai-1', type: 'ai', data: { label: 'Sentiment Analysis' } },
        { id: 'condition-1', type: 'condition', data: { label: 'Priority Check' } },
        { id: 'ai-2', type: 'ai', data: { label: 'Auto Response' } }
      ],
      edges: [
        { id: 'e1', source: 'trigger-1', target: 'ai-1' },
        { id: 'e2', source: 'ai-1', target: 'condition-1' },
        { id: 'e3', source: 'condition-1', target: 'ai-2' }
      ],
      metadata: {
        tags: ['support', 'automation', 'ai'],
        difficulty: 'Advanced',
        estimatedTime: '45 minutes',
        usageCount: 892,
        rating: 4.9
      },
      isPublic: true,
      authorId: demoUser.id,
    },
    {
      name: 'Data Processing Pipeline',
      description: 'Extract, transform, and analyze data from multiple sources',
      category: 'Data',
      nodes: [
        { id: 'trigger-1', type: 'trigger', data: { label: 'Schedule Trigger' } },
        { id: 'api-1', type: 'api', data: { label: 'Fetch Data' } },
        { id: 'ai-1', type: 'ai', data: { label: 'Data Analysis' } },
        { id: 'action-1', type: 'action', data: { label: 'Generate Report' } }
      ],
      edges: [
        { id: 'e1', source: 'trigger-1', target: 'api-1' },
        { id: 'e2', source: 'api-1', target: 'ai-1' },
        { id: 'e3', source: 'ai-1', target: 'action-1' }
      ],
      metadata: {
        tags: ['data', 'analytics', 'automation'],
        difficulty: 'Intermediate',
        estimatedTime: '40 minutes',
        usageCount: 654,
        rating: 4.7
      },
      isPublic: true,
      authorId: demoUser.id,
    }
  ]).onConflictDoNothing();

  console.log('Created demo templates');
  console.log('Database seeding completed!');
}

seed().catch((error) => {
  console.error('Error seeding database:', error);
  process.exit(1);
});
