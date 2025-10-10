Prompt #41: System Performance Monitor (Enhanced)
Role
N8n Performance & Reliability Engineering Specialist with expertise in distributed systems monitoring, APM, and predictive analytics
Context

Volume: 50+ AI agents, 10,000+ workflows/day, 1M+ API calls/day
Performance: Real-time monitoring latency < 50ms, alerting < 10 seconds
Integration: Prometheus, Grafana, DataDog, PagerDuty, Slack, custom AI agents
Compliance: SLA 99.95% availability, MTTR < 15 minutes, data retention 90 days
Scale: 50% quarterly growth in workflow volume, 100+ agents by year-end

Primary Objective
Maintain system availability at 99.95% while detecting and auto-remediating 80% of performance issues before user impact.
Enhanced Requirements
Real-Time Performance Monitoring

Distributed Tracing Implementation

javascript// N8n Function Node: Performance Tracer
const tracer = {
  spans: new Map(),
  metrics: {
    histogram: new Map(),
    counters: new Map(),
    gauges: new Map()
  },
  
  startSpan(workflowId, spanName, parentSpanId = null) {
    const spanId = this.generateSpanId();
    const span = {
      traceId: parentSpanId ? this.spans.get(parentSpanId)?.traceId : this.generateTraceId(),
      spanId: spanId,
      parentSpanId: parentSpanId,
      operationName: spanName,
      startTime: Date.now(),
      tags: {
        workflowId: workflowId,
        nodeType: $node.type,
        nodeId: $node.id,
        environment: process.env.NODE_ENV
      },
      logs: [],
      metrics: {}
    };
    
    this.spans.set(spanId, span);
    return spanId;
  },
  
  endSpan(spanId, status = 'success') {
    const span = this.spans.get(spanId);
    if (!span) return;
    
    span.endTime = Date.now();
    span.duration = span.endTime - span.startTime;
    span.status = status;
    
    // Calculate metrics
    this.updateMetrics(span);
    
    // Check SLO violations
    if (span.duration > this.getSLOThreshold(span.operationName)) {
      this.handleSLOViolation(span);
    }
    
    // Export to monitoring backend
    this.export(span);
    
    // Clean up
    this.spans.delete(spanId);
    
    return span;
  },
  
  updateMetrics(span) {
    const operation = span.operationName;
    
    // Update histogram
    if (!this.metrics.histogram.has(operation)) {
      this.metrics.histogram.set(operation, []);
    }
    this.metrics.histogram.get(operation).push(span.duration);
    
    // Update counters
    const counterKey = `${operation}_${span.status}`;
    this.metrics.counters.set(
      counterKey,
      (this.metrics.counters.get(counterKey) || 0) + 1
    );
    
    // Calculate percentiles
    if (this.metrics.histogram.get(operation).length >= 100) {
      this.calculatePercentiles(operation);
    }
  },
  
  calculatePercentiles(operation) {
    const values = this.metrics.histogram.get(operation).sort((a, b) => a - b);
    const p50Index = Math.floor(values.length * 0.5);
    const p95Index = Math.floor(values.length * 0.95);
    const p99Index = Math.floor(values.length * 0.99);
    
    return {
      p50: values[p50Index],
      p95: values[p95Index],
      p99: values[p99Index],
      mean: values.reduce((a, b) => a + b, 0) / values.length
    };
  },
  
  getSLOThreshold(operation) {
    const thresholds = {
      'api_call': 200,      // ms
      'database_query': 100,
      'ai_agent': 5000,
      'workflow_execution': 30000,
      'webhook': 1000
    };
    
    return thresholds[operation] || 1000;
  },
  
  async handleSLOViolation(span) {
    // Log violation
    console.error(`SLO violation: ${span.operationName} took ${span.duration}ms`);
    
    // Create incident
    const incident = {
      id: this.generateIncidentId(),
      severity: this.calculateSeverity(span),
      span: span,
      timestamp: new Date().toISOString(),
      autoRemediation: true
    };
    
    // Attempt auto-remediation
    if (incident.autoRemediation) {
      await this.autoRemediate(incident);
    }
    
    // Alert if critical
    if (incident.severity === 'critical') {
      await this.sendAlert(incident);
    }
    
    return incident;
  },
  
  async autoRemediate(incident) {
    const remediations = {
      'high_latency': async () => {
        // Scale up resources
        await $workflow.execute('auto-scaler', {
          action: 'scale_up',
          service: incident.span.tags.nodeType,
          factor: 1.5
        });
      },
      'high_error_rate': async () => {
        // Circuit breaker activation
        await $workflow.execute('circuit-breaker', {
          service: incident.span.tags.nodeId,
          action: 'open',
          duration: 30000
        });
      },
      'resource_exhaustion': async () => {
        // Clear caches and restart
        await $workflow.execute('resource-manager', {
          action: 'clear_cache',
          service: incident.span.tags.nodeType
        });
      }
    };
    
    const remediationType = this.identifyRemediationType(incident);
    if (remediations[remediationType]) {
      await remediations[remediationType]();
      incident.remediation = {
        type: remediationType,
        status: 'completed',
        timestamp: new Date().toISOString()
      };
    }
  },
  
  generateSpanId() {
    return Math.random().toString(36).substring(2, 15);
  },
  
  generateTraceId() {
    return `trace-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  },
  
  generateIncidentId() {
    return `inc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  }
};

// Usage in workflow
const spanId = tracer.startSpan($workflow.id, 'ai_agent_execution');
try {
  // Execute AI agent
  const result = await $workflow.execute('ai-agent', $input);
  tracer.endSpan(spanId, 'success');
  return result;
} catch (error) {
  tracer.endSpan(spanId, 'error');
  throw error;
}
Resource Monitoring & Auto-Scaling

Intelligent Resource Manager

javascript// N8n Function Node: Resource Monitor
const resourceMonitor = {
  thresholds: {
    cpu: { warning: 70, critical: 85, scaleUp: 80 },
    memory: { warning: 75, critical: 90, scaleUp: 85 },
    queueDepth: { warning: 100, critical: 500, scaleUp: 200 },
    errorRate: { warning: 1, critical: 5, scaleDown: 0.5 }
  },
  
  async collectMetrics() {
    const metrics = {
      system: await this.getSystemMetrics(),
      application: await this.getApplicationMetrics(),
      database: await this.getDatabaseMetrics(),
      queues: await this.getQueueMetrics(),
      apis: await this.getAPIMetrics()
    };
    
    // Analyze and take action
    const analysis = this.analyzeMetrics(metrics);
    
    if (analysis.requiresScaling) {
      await this.executeScaling(analysis.scalingPlan);
    }
    
    if (analysis.hasAnomalies) {
      await this.handleAnomalies(analysis.anomalies);
    }
    
    // Store for trending
    await this.storeMetrics(metrics);
    
    return {
      metrics,
      analysis,
      timestamp: new Date().toISOString()
    };
  },
  
  async getSystemMetrics() {
    const usage = process.cpuUsage();
    const memory = process.memoryUsage();
    
    return {
      cpu: {
        user: usage.user / 1000000, // Convert to seconds
        system: usage.system / 1000000,
        percentage: (usage.user + usage.system) / 1000000 / process.uptime() * 100
      },
      memory: {
        used: memory.heapUsed / 1024 / 1024, // MB
        total: memory.heapTotal / 1024 / 1024,
        percentage: (memory.heapUsed / memory.heapTotal) * 100,
        rss: memory.rss / 1024 / 1024,
        external: memory.external / 1024 / 1024
      },
      uptime: process.uptime(),
      pid: process.pid
    };
  },
  
  async getApplicationMetrics() {
    // Query internal metrics store
    const query = `
      SELECT 
        COUNT(*) as total_workflows,
        AVG(duration) as avg_duration,
        MAX(duration) as max_duration,
        SUM(CASE WHEN status = 'error' THEN 1 ELSE 0 END) as errors,
        COUNT(DISTINCT agent_id) as active_agents
      FROM workflow_executions
      WHERE timestamp > NOW() - INTERVAL '5 minutes'
    `;
    
    const result = await $db.query(query);
    
    return {
      workflows: {
        total: result[0].total_workflows,
        avgDuration: result[0].avg_duration,
        maxDuration: result[0].max_duration,
        errorCount: result[0].errors,
        errorRate: (result[0].errors / result[0].total_workflows) * 100
      },
      agents: {
        active: result[0].active_agents,
        utilization: await this.getAgentUtilization()
      }
    };
  },
  
  async getAgentUtilization() {
    const agents = await $db.query(`
      SELECT 
        agent_id,
        COUNT(*) as executions,
        AVG(response_time) as avg_response,
        MAX(response_time) as max_response
      FROM agent_executions
      WHERE timestamp > NOW() - INTERVAL '5 minutes'
      GROUP BY agent_id
    `);
    
    return agents.map(agent => ({
      id: agent.agent_id,
      utilization: Math.min(100, (agent.executions / 100) * 100), // Assuming 100 exec/5min is 100%
      performance: {
        avgResponse: agent.avg_response,
        maxResponse: agent.max_response
      }
    }));
  },
  
  analyzeMetrics(metrics) {
    const analysis = {
      requiresScaling: false,
      scalingPlan: null,
      hasAnomalies: false,
      anomalies: [],
      health: 'healthy',
      recommendations: []
    };
    
    // CPU analysis
    if (metrics.system.cpu.percentage > this.thresholds.cpu.scaleUp) {
      analysis.requiresScaling = true;
      analysis.scalingPlan = { 
        type: 'cpu',
        action: 'scale_up',
        currentValue: metrics.system.cpu.percentage,
        threshold: this.thresholds.cpu.scaleUp
      };
    }
    
    // Memory analysis
    if (metrics.system.memory.percentage > this.thresholds.memory.critical) {
      analysis.health = 'critical';
      analysis.anomalies.push({
        type: 'memory_exhaustion',
        severity: 'critical',
        value: metrics.system.memory.percentage,
        recommendation: 'Immediate memory optimization required'
      });
    }
    
    // Error rate analysis
    if (metrics.application.workflows.errorRate > this.thresholds.errorRate.critical) {
      analysis.health = 'critical';
      analysis.anomalies.push({
        type: 'high_error_rate',
        severity: 'critical',
        value: metrics.application.workflows.errorRate,
        recommendation: 'Investigate error patterns and root causes'
      });
    }
    
    // Queue depth analysis
    if (metrics.queues && metrics.queues.depth > this.thresholds.queueDepth.scaleUp) {
      analysis.requiresScaling = true;
      analysis.scalingPlan = {
        type: 'queue',
        action: 'add_workers',
        currentValue: metrics.queues.depth,
        threshold: this.thresholds.queueDepth.scaleUp
      };
    }
    
    // ML-based anomaly detection
    const mlAnomalies = await this.detectMLAnomalies(metrics);
    analysis.anomalies.push(...mlAnomalies);
    analysis.hasAnomalies = analysis.anomalies.length > 0;
    
    return analysis;
  },
  
  async detectMLAnomalies(metrics) {
    // Use statistical methods for anomaly detection
    const anomalies = [];
    const historicalData = await this.getHistoricalMetrics(24); // Last 24 hours
    
    // Calculate z-scores
    for (const [key, value] of Object.entries(metrics.application.workflows)) {
      const historical = historicalData.map(d => d.application.workflows[key]);
      const mean = historical.reduce((a, b) => a + b, 0) / historical.length;
      const stdDev = Math.sqrt(
        historical.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) / historical.length
      );
      
      const zScore = Math.abs((value - mean) / stdDev);
      
      if (zScore > 3) { // 3 standard deviations
        anomalies.push({
          type: 'statistical_anomaly',
          metric: key,
          value: value,
          zScore: zScore,
          severity: zScore > 4 ? 'critical' : 'warning',
          recommendation: `Investigate unusual ${key} value`
        });
      }
    }
    
    return anomalies;
  },
  
  async executeScaling(scalingPlan) {
    console.log('Executing scaling plan:', scalingPlan);
    
    const scalingActions = {
      scale_up: async () => {
        // Kubernetes scaling
        const response = await $http.request({
          method: 'PATCH',
          url: `${process.env.K8S_API}/apis/apps/v1/namespaces/default/deployments/n8n-workers`,
          headers: {
            'Authorization': `Bearer ${process.env.K8S_TOKEN}`,
            'Content-Type': 'application/strategic-merge-patch+json'
          },
          body: {
            spec: {
              replicas: await this.calculateNewReplicaCount('up')
            }
          }
        });
        
        return response;
      },
      add_workers: async () => {
        // Add queue workers
        const currentWorkers = await this.getCurrentWorkerCount();
        const newWorkers = Math.min(currentWorkers + 2, 20); // Max 20 workers
        
        await $workflow.execute('worker-manager', {
          action: 'scale',
          workers: newWorkers
        });
        
        return { workers: newWorkers };
      }
    };
    
    if (scalingActions[scalingPlan.action]) {
      const result = await scalingActions[scalingPlan.action]();
      
      // Log scaling event
      await this.logScalingEvent(scalingPlan, result);
      
      return result;
    }
  }
};

// Execute monitoring cycle
const monitoringResult = await resourceMonitor.collectMetrics();
return monitoringResult;
Technical Specifications
API Definition
typescriptinterface PerformanceMetrics {
  timestamp: Date;
  system: {
    cpu: CPUMetrics;
    memory: MemoryMetrics;
    disk: DiskMetrics;
    network: NetworkMetrics;
  };
  application: {
    workflows: WorkflowMetrics;
    agents: AgentMetrics[];
    queues: QueueMetrics;
    database: DatabaseMetrics;
  };
  slo: {
    availability: number;        // Percentage
    latency: LatencyMetrics;
    errorRate: number;           // Percentage
    throughput: number;          // Requests per second
  };
  incidents: IncidentRecord[];
}

interface LatencyMetrics {
  p50: number;
  p95: number;
  p99: number;
  mean: number;
  max: number;
}

interface ScalingDecision {
  trigger: 'cpu' | 'memory' | 'queue' | 'latency' | 'error_rate';
  action: 'scale_up' | 'scale_down' | 'no_action';
  currentValue: number;
  threshold: number;
  targetReplicas?: number;
  confidence: number;           // 0-1 confidence in decision
  estimatedImpact: {
    costIncrease: number;       // $/hour
    performanceGain: number;    // Percentage improvement
  };
}

interface IncidentRecord {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: string;
  description: string;
  startTime: Date;
  endTime?: Date;
  impact: {
    affectedWorkflows: number;
    affectedUsers: number;
    estimatedRevenueLoss: number;
  };
  remediation: {
    automatic: boolean;
    actions: string[];
    status: 'pending' | 'in_progress' | 'completed' | 'failed';
  };
}
Success Criteria
Performance Metrics

Monitoring Latency: P95 < 50ms for metric collection
Alert Latency: < 10 seconds from incident to alert
Dashboard Refresh: < 2 seconds for real-time views
Data Retention: 90 days of detailed metrics

Quality Metrics

Availability: 99.95% system uptime
MTTR: < 15 minutes mean time to recovery
False Positive Rate: < 5% for alerts
Auto-Remediation Success: > 80% of incidents

Business Impact Metrics

Cost Optimization: 25% reduction in infrastructure costs
Incident Prevention: 60% reduction in user-impacting incidents
Developer Productivity: 40% less time spent on debugging
SLA Compliance: 100% meeting of contractual obligations

Testing Requirements
javascript// Unit Tests for Performance Monitor
describe('Performance Monitoring Tests', () => {
  test('should detect CPU threshold violations', async () => {
    // Arrange
    const mockMetrics = {
      system: { cpu: { percentage: 86 } }
    };
    
    // Act
    const analysis = await monitor.analyzeMetrics(mockMetrics);
    
    // Assert
    expect(analysis.requiresScaling).toBe(true);
    expect(analysis.scalingPlan.action).toBe('scale_up');
  });
  
  test('should calculate percentiles correctly', () => {
    // Arrange
    const latencies = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
    
    // Act
    const percentiles = monitor.calculatePercentiles(latencies);
    
    // Assert
    expect(percentiles.p50).toBe(55);
    expect(percentiles.p95).toBe(95);
    expect(percentiles.p99).toBe(99);
  });
});
Implementation Checklist

 Week 1: Monitoring Infrastructure

 Deploy Prometheus and Grafana
 Set up time-series database
 Configure metric exporters


 Week 2: Instrumentation

 Add tracing to all workflows
 Implement custom metrics
 Set up log aggregation


 Week 3: Alerting System

 Define SLO/SLI targets
 Create alert rules
 Configure PagerDuty integration


 Week 4: Auto-Remediation

 Build remediation workflows
 Implement circuit breakers
 Create rollback mechanisms