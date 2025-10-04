import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { workflowEngine } from "./workflow-engine";
import { connectorRegistry } from "./integrations/connector-registry";
import { teamOrchestrationEngine } from "./team-orchestration";
import { 
  insertWorkflowSchema, 
  insertAIAgentSchema, 
  insertAgentTeamSchema,
  insertIntegrationSchema,
  insertWorkflowExecutionSchema,
  insertAgentExecutionSchema,
  insertTemplateSchema
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // Mock user for demo - in production this would come from authentication
  const DEMO_USER_ID = 'demo-user';

  // Workflows API
  app.get('/api/workflows', async (req, res) => {
    try {
      const workflows = await storage.getWorkflows(DEMO_USER_ID);
      res.json(workflows);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch workflows' });
    }
  });

  app.get('/api/workflows/:id', async (req, res) => {
    try {
      const workflow = await storage.getWorkflow(req.params.id);
      if (!workflow) {
        return res.status(404).json({ message: 'Workflow not found' });
      }
      res.json(workflow);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch workflow' });
    }
  });

  app.post('/api/workflows', async (req, res) => {
    try {
      const workflowData = insertWorkflowSchema.parse({ ...req.body, userId: DEMO_USER_ID });
      const workflow = await storage.createWorkflow(workflowData);
      res.status(201).json(workflow);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid workflow data', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to create workflow' });
    }
  });

  app.put('/api/workflows/:id', async (req, res) => {
    try {
      const updateData = insertWorkflowSchema.partial().parse(req.body);
      const workflow = await storage.updateWorkflow(req.params.id, updateData);
      if (!workflow) {
        return res.status(404).json({ message: 'Workflow not found' });
      }
      res.json(workflow);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid workflow data', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to update workflow' });
    }
  });

  app.delete('/api/workflows/:id', async (req, res) => {
    try {
      const deleted = await storage.deleteWorkflow(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: 'Workflow not found' });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete workflow' });
    }
  });

  // AI Agents API
  app.get('/api/agents', async (req, res) => {
    try {
      const agents = await storage.getAgents(DEMO_USER_ID);
      res.json(agents);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch agents' });
    }
  });

  app.get('/api/agents/:id', async (req, res) => {
    try {
      const agent = await storage.getAgent(req.params.id);
      if (!agent) {
        return res.status(404).json({ message: 'Agent not found' });
      }
      res.json(agent);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch agent' });
    }
  });

  app.post('/api/agents', async (req, res) => {
    try {
      const agentData = insertAIAgentSchema.parse({ ...req.body, userId: DEMO_USER_ID });
      const agent = await storage.createAgent(agentData);
      res.status(201).json(agent);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid agent data', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to create agent' });
    }
  });

  app.put('/api/agents/:id', async (req, res) => {
    try {
      const updateData = insertAIAgentSchema.partial().parse(req.body);
      const agent = await storage.updateAgent(req.params.id, updateData);
      if (!agent) {
        return res.status(404).json({ message: 'Agent not found' });
      }
      res.json(agent);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid agent data', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to update agent' });
    }
  });

  app.delete('/api/agents/:id', async (req, res) => {
    try {
      const deleted = await storage.deleteAgent(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: 'Agent not found' });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete agent' });
    }
  });

  // Agent Teams API
  app.get('/api/teams', async (req, res) => {
    try {
      const teams = await storage.getTeams(DEMO_USER_ID);
      res.json(teams);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch teams' });
    }
  });

  app.post('/api/teams', async (req, res) => {
    try {
      const teamData = insertAgentTeamSchema.parse({ ...req.body, userId: DEMO_USER_ID });
      const team = await storage.createTeam(teamData);
      res.status(201).json(team);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid team data', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to create team' });
    }
  });

  app.get('/api/teams/:id/members', async (req, res) => {
    try {
      const members = await storage.getTeamMembers(req.params.id);
      res.json(members);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch team members' });
    }
  });

  app.post('/api/teams/:id/execute', async (req, res) => {
    try {
      const { task } = req.body;
      
      if (!task || typeof task !== 'string') {
        return res.status(400).json({ message: 'Task is required and must be a string' });
      }

      const result = await teamOrchestrationEngine.executeTeamTask(req.params.id, task);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Failed to execute team task' });
    }
  });

  // Integrations API
  app.get('/api/integrations', async (req, res) => {
    try {
      const integrations = await storage.getIntegrations(DEMO_USER_ID);
      res.json(integrations);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch integrations' });
    }
  });

  app.post('/api/integrations', async (req, res) => {
    try {
      const integrationData = insertIntegrationSchema.parse({ ...req.body, userId: DEMO_USER_ID });
      const integration = await storage.createIntegration(integrationData);
      res.status(201).json(integration);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid integration data', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to create integration' });
    }
  });

  // Integration Connectors API
  app.get('/api/connectors', async (req, res) => {
    try {
      const connectors = connectorRegistry.listConnectors();
      res.json(connectors);
    } catch (error) {
      res.status(500).json({ message: 'Failed to list connectors' });
    }
  });

  app.get('/api/connectors/:id', async (req, res) => {
    try {
      const connector = connectorRegistry.getConnector(req.params.id);
      res.json({
        config: connector.config,
        actions: connector.actions,
      });
    } catch (error: any) {
      if (error.message.includes('not found')) {
        return res.status(404).json({ message: error.message });
      }
      res.status(500).json({ message: 'Failed to get connector' });
    }
  });

  app.get('/api/connectors/:id/actions', async (req, res) => {
    try {
      const actions = connectorRegistry.getConnectorActions(req.params.id);
      res.json(actions);
    } catch (error: any) {
      if (error.message.includes('not found')) {
        return res.status(404).json({ message: error.message });
      }
      res.status(500).json({ message: 'Failed to get connector actions' });
    }
  });

  app.post('/api/connectors/:id/test', async (req, res) => {
    try {
      const connector = connectorRegistry.getConnector(req.params.id);
      
      if (!req.body.credentials || typeof req.body.credentials !== 'object') {
        return res.status(400).json({ 
          success: false,
          message: 'credentials object is required' 
        });
      }

      connector.setCredentials(req.body.credentials);
      const result = await connector.testConnection();
      res.json(result);
    } catch (error: any) {
      if (error.message.includes('not found')) {
        return res.status(404).json({ success: false, message: error.message });
      }
      res.status(500).json({ 
        success: false,
        message: error.message 
      });
    }
  });

  app.post('/api/connectors/:id/execute', async (req, res) => {
    try {
      const connector = connectorRegistry.getConnector(req.params.id);
      
      const { actionId, input, credentials } = req.body;
      if (!actionId) {
        return res.status(400).json({ message: 'actionId is required' });
      }

      if (credentials && typeof credentials === 'object') {
        connector.setCredentials(credentials);
      }

      const result = await connector.executeAction(actionId, input || {});
      res.json({ success: true, data: result });
    } catch (error: any) {
      if (error.message.includes('not found')) {
        return res.status(404).json({ success: false, message: error.message });
      }
      res.status(500).json({ 
        success: false,
        message: error.message 
      });
    }
  });

  // Workflow Executions API
  app.get('/api/executions', async (req, res) => {
    try {
      const { workflowId, limit } = req.query;
      const executions = await storage.getWorkflowExecutions(
        workflowId as string, 
        limit ? parseInt(limit as string) : undefined
      );
      res.json(executions);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch executions' });
    }
  });

  app.post('/api/executions', async (req, res) => {
    try {
      const executionData = insertWorkflowExecutionSchema.parse(req.body);
      const execution = await storage.createWorkflowExecution(executionData);
      res.status(201).json(execution);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid execution data', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to create execution' });
    }
  });

  app.put('/api/executions/:id', async (req, res) => {
    try {
      const updateData = insertWorkflowExecutionSchema.partial().parse(req.body);
      const execution = await storage.updateWorkflowExecution(req.params.id, updateData);
      if (!execution) {
        return res.status(404).json({ message: 'Execution not found' });
      }
      res.json(execution);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid execution data', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to update execution' });
    }
  });

  app.post('/api/workflows/:id/execute', async (req, res) => {
    try {
      const workflowId = req.params.id;
      const input = req.body.input || {};
      
      const result = await workflowEngine.executeWorkflow(workflowId, input);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ 
        message: 'Workflow execution failed', 
        error: error.message 
      });
    }
  });

  // Templates API
  app.get('/api/templates', async (req, res) => {
    try {
      const { category, public: isPublic } = req.query;
      let templates;
      
      if (isPublic === 'true') {
        templates = await storage.getPublicTemplates();
      } else {
        templates = await storage.getTemplates(category as string);
      }
      
      res.json(templates);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch templates' });
    }
  });

  app.get('/api/templates/:id', async (req, res) => {
    try {
      const template = await storage.getTemplate(req.params.id);
      if (!template) {
        return res.status(404).json({ message: 'Template not found' });
      }
      res.json(template);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch template' });
    }
  });

  app.post('/api/templates', async (req, res) => {
    try {
      const templateData = insertTemplateSchema.parse({ ...req.body, authorId: DEMO_USER_ID });
      const template = await storage.createTemplate(templateData);
      res.status(201).json(template);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid template data', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to create template' });
    }
  });

  // Dashboard Stats API
  app.get('/api/dashboard/stats', async (req, res) => {
    try {
      const workflows = await storage.getWorkflows(DEMO_USER_ID);
      const agents = await storage.getAgents(DEMO_USER_ID);
      const executions = await storage.getWorkflowExecutions();
      
      const todayExecutions = executions.filter(e => 
        e.createdAt && e.createdAt > new Date(Date.now() - 24 * 60 * 60 * 1000)
      );
      
      const failedTasks = executions.filter(e => e.status === 'FAILED').length;
      
      res.json({
        activeWorkflows: workflows.filter(w => w.status === 'ACTIVE').length,
        aiAgents: agents.length,
        executionsToday: todayExecutions.length,
        failedTasks
      });
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch dashboard stats' });
    }
  });

  // System Health API
  app.get('/api/system/health', async (req, res) => {
    try {
      // In a real app, these would be actual health checks
      res.json({
        apiResponse: 99.8,
        workflowSuccess: 97.2,
        agentUptime: 99.9,
        databaseLoad: 42,
        memoryUsage: 68
      });
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch system health' });
    }
  });

  // Analytics API
  app.get('/api/analytics/executions', async (req, res) => {
    try {
      const metrics = await storage.getExecutionMetrics(DEMO_USER_ID);
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch execution metrics' });
    }
  });

  app.get('/api/analytics/agents', async (req, res) => {
    try {
      const metrics = await storage.getAgentPerformanceMetrics(DEMO_USER_ID);
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch agent performance metrics' });
    }
  });

  app.get('/api/analytics/costs', async (req, res) => {
    try {
      const metrics = await storage.getCostMetrics(DEMO_USER_ID);
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch cost metrics' });
    }
  });

  return httpServer;
}
