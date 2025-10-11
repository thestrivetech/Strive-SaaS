import 'server-only';

import { prisma } from '@/lib/database/prisma';
import { setTenantContext } from '@/lib/database/prisma-middleware';
import { ExecutionStatus } from '@prisma/client';
import { topologicalSort, validateWorkflowDefinition } from './utils';
import type { ExecutionLog } from './schemas';

/**
 * Execute a workflow
 * Multi-tenancy: ALWAYS filter by organizationId
 */
export async function executeWorkflow(
  workflowId: string,
  organizationId: string,
  input?: Record<string, any>
) {
  await setTenantContext({ organizationId });

  // Get workflow
  const workflow = await prisma.automation_workflows.findFirst({
    where: { id: workflowId, organization_id: organizationId },
  });

  if (!workflow) {
    throw new Error('Workflow not found');
  }

  if (!workflow.is_active) {
    throw new Error('Workflow is not active');
  }

  // Validate workflow definition
  const validation = validateWorkflowDefinition(
    workflow.nodes as any[],
    workflow.edges as any[]
  );

  if (!validation.valid) {
    throw new Error(`Invalid workflow: ${validation.error}`);
  }

  // Create execution record
  const execution = await prisma.workflow_executions.create({
    data: {
      id: `wf_exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      workflow_id: workflowId,
      workflow_type: 'automation',
      status: ExecutionStatus.PENDING,
      input: input || {},
    },
  });

  // Start execution in background (don't await)
  executeWorkflowNodes(execution.id, workflow, input).catch(error => {
    console.error('[Workflow Execution] Failed:', error);
  });

  return execution;
}

/**
 * Execute workflow nodes in order
 */
async function executeWorkflowNodes(
  executionId: string,
  workflow: any,
  input?: Record<string, any>
) {
  const logs: ExecutionLog[] = [];
  let currentData = input || {};
  const startTime = Date.now();

  try {
    // Update status to RUNNING
    await prisma.workflow_executions.update({
      where: { id: executionId },
      data: { status: ExecutionStatus.RUNNING },
    });

    // Get nodes in execution order
    const nodes = topologicalSort(
      workflow.nodes as any[],
      workflow.edges as any[]
    );

    let nodesExecuted = 0;
    let totalTokens = 0;
    let totalCost = 0;

    // Execute each node
    for (const node of nodes) {
      const nodeStartTime = Date.now();

      try {
        // Log node start
        logs.push({
          nodeId: node.id,
          nodeName: node.data?.label || 'Unnamed Node',
          status: ExecutionStatus.RUNNING,
          timestamp: new Date(),
          message: `Executing node: ${node.data?.label || node.type}`,
        });

        // Execute node based on type
        const result = await executeNode(node, currentData);

        // Update current data with node output
        currentData = { ...currentData, ...result.output };
        totalTokens += result.tokensUsed || 0;
        totalCost += result.cost || 0;
        nodesExecuted++;

        // Log node completion
        logs.push({
          nodeId: node.id,
          nodeName: node.data?.label || 'Unnamed Node',
          status: ExecutionStatus.COMPLETED,
          timestamp: new Date(),
          message: `Node completed in ${Date.now() - nodeStartTime}ms`,
          data: result.output,
        });
      } catch (error: any) {
        // Log node failure
        logs.push({
          nodeId: node.id,
          nodeName: node.data?.label || 'Unnamed Node',
          status: ExecutionStatus.FAILED,
          timestamp: new Date(),
          message: `Node failed: ${error.message}`,
          error: error.message,
        });

        throw error;
      }
    }

    // Update execution as completed
    await prisma.workflow_executions.update({
      where: { id: executionId },
      data: {
        status: ExecutionStatus.COMPLETED,
        completed_at: new Date(),
        duration: Date.now() - startTime,
        output: currentData,
        logs: logs as any,
        nodes_executed: nodesExecuted,
        tokens_used: totalTokens,
        cost: totalCost,
      },
    });

    // Update workflow execution count
    await prisma.automation_workflows.update({
      where: { id: workflow.id },
      data: {
        execution_count: { increment: 1 },
        last_executed: new Date(),
      },
    });
  } catch (error: any) {
    // Update execution as failed
    await prisma.workflow_executions.update({
      where: { id: executionId },
      data: {
        status: ExecutionStatus.FAILED,
        completed_at: new Date(),
        duration: Date.now() - startTime,
        error: error.message,
        logs: logs as any,
      },
    });

    throw error;
  }
}

/**
 * Execute a single node based on type
 * Returns output, tokens used, and cost
 */
async function executeNode(node: any, input: Record<string, any>) {
  // Node execution logic based on type
  switch (node.type) {
    case 'trigger':
      return { output: input, tokensUsed: 0, cost: 0 };

    case 'aiAgent':
      // Execute AI agent node (implemented in Session 3)
      return await executeAIAgentNode(node, input);

    case 'agentTeam':
      // Execute agent team node (implemented in Session 4)
      return await executeAgentTeamNode(node, input);

    case 'integration':
      // Execute integration node (implemented in Session 5)
      return await executeIntegrationNode(node, input);

    case 'condition':
      // Execute conditional logic
      return await executeConditionNode(node, input);

    case 'transform':
      // Execute data transformation
      return await executeTransformNode(node, input);

    default:
      throw new Error(`Unknown node type: ${node.type}`);
  }
}

// AI Agent Node Execution (Session 3 - Implemented)
async function executeAIAgentNode(node: any, input: any) {
  try {
    // Import the execution function directly
    const { executeAgent } = await import('../agents/execution');

    const agentId = node.data?.agentId;
    const task = node.data?.task || JSON.stringify(input);
    const context = node.data?.context || input;

    if (!agentId) {
      throw new Error('Agent ID is required for AI Agent node');
    }

    // Get organizationId from the workflow (should be available in context)
    const organizationId = node.data?.organizationId;
    if (!organizationId) {
      throw new Error('Organization ID is required for agent execution');
    }

    const result = await executeAgent(
      agentId,
      organizationId,
      task,
      context
    );

    return {
      output: result.output,
      tokensUsed: result.tokensUsed,
      cost: result.cost,
    };
  } catch (error: any) {
    throw new Error(`AI Agent execution failed: ${error.message}`);
  }
}

// Agent Team Node Execution (Session 4 - Implemented)
async function executeAgentTeamNode(node: any, input: any) {
  try {
    // Import the execution function directly
    const { executeTeam } = await import('../teams/execution');

    const teamId = node.data?.teamId;
    const task = node.data?.task || JSON.stringify(input);
    const context = node.data?.context || input;
    const patternOverride = node.data?.patternOverride;

    if (!teamId) {
      throw new Error('Team ID is required for Agent Team node');
    }

    // Get organizationId from the workflow (should be available in context)
    const organizationId = node.data?.organizationId;
    if (!organizationId) {
      throw new Error('Organization ID is required for team execution');
    }

    const result = await executeTeam(
      teamId,
      organizationId,
      task,
      context,
      patternOverride
    );

    return {
      output: result.output,
      tokensUsed: result.totalTokens,
      cost: result.totalCost,
    };
  } catch (error: any) {
    throw new Error(`Agent Team execution failed: ${error.message}`);
  }
}

// Integration Node Execution (Session 5 - Implemented)
async function executeIntegrationNode(node: any, input: any) {
  try {
    // Import the execution function directly
    const { executeIntegration } = await import('../integrations/actions');

    const integrationId = node.data?.integrationId;
    const action = node.data?.action || 'execute';
    const params = node.data?.params || input;

    if (!integrationId) {
      throw new Error('Integration ID is required for Integration node');
    }

    // Get organizationId from the workflow (should be available in context)
    const organizationId = node.data?.organizationId;
    if (!organizationId) {
      throw new Error('Organization ID is required for integration execution');
    }

    const result = await executeIntegration({
      integrationId,
      action,
      params,
      organizationId,
    });

    return {
      output: result.output,
      tokensUsed: 0, // Integrations don't use AI tokens
      cost: 0,
    };
  } catch (error: any) {
    throw new Error(`Integration execution failed: ${error.message}`);
  }
}

async function executeConditionNode(node: any, input: any) {
  // TODO: Implement condition evaluation logic
  // Evaluate node.data.condition against input
  return { output: input, tokensUsed: 0, cost: 0 };
}

async function executeTransformNode(node: any, input: any) {
  // TODO: Implement data transformation logic
  // Apply node.data.transform to input
  return { output: input, tokensUsed: 0, cost: 0 };
}
