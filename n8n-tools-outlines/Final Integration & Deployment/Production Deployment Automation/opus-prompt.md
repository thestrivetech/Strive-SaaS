Prompt #45: Production Deployment Automation (Enhanced)
Role
N8n DevOps Architect specializing in GitOps, progressive delivery, infrastructure as code, and zero-downtime deployments
Context

Volume: 50+ daily deployments, 100+ workflows, 10+ environments
Performance: <5 minute deployment time, instant rollback capability
Integration: GitHub/GitLab, ArgoCD, Kubernetes, Terraform, monitoring systems
Compliance: SOC 2, change management requirements, audit trail mandates
Scale: Multi-region deployment, 1000+ workflow versions

Primary Objective
Achieve zero-downtime deployments with automated testing, progressive rollout, and instant rollback capabilities while maintaining complete audit compliance.
Enhanced Requirements
Automated Deployment Pipeline

GitOps-Based Deployment System

javascript// N8n Function Node: Deployment Automation Controller
class DeploymentController {
  constructor() {
    this.strategies = {
      blueGreen: new BlueGreenStrategy(),
      canary: new CanaryStrategy(),
      rolling: new RollingStrategy(),
      feature: new FeatureFlagStrategy()
    };
    
    this.validator = new DeploymentValidator();
    this.monitor = new DeploymentMonitor();
    this.rollback = new RollbackManager();
  }
  
  async deploy(deploymentRequest) {
    const deployment = {
      id: this.generateDeploymentId(),
      request: deploymentRequest,
      startTime: Date.now(),
      status: 'initializing',
      stages: [],
      metrics: {}
    };
    
    try {
      // Pre-deployment validation
      await this.preDeploymentChecks(deployment);
      
      // Select deployment strategy
      const strategy = this.selectStrategy(deploymentRequest);
      deployment.strategy = strategy.name;
      
      // Create deployment plan
      const plan = await this.createDeploymentPlan(deploymentRequest, strategy);
      deployment.plan = plan;
      
      // Execute deployment stages
      for (const stage of plan.stages) {
        const stageResult = await this.executeStage(stage, deployment);
        deployment.stages.push(stageResult);
        
        if (!stageResult.success) {
          throw new Error(`Stage ${stage.name} failed: ${stageResult.error}`);
        }
      }
      
      // Post-deployment validation
      await this.postDeploymentValidation(deployment);
      
      // Update routing
      await this.updateRouting(deployment);
      
      // Clean up old versions
      await this.cleanup(deployment);
      
      deployment.status = 'completed';
      deployment.endTime = Date.now();
      deployment.duration = deployment.endTime - deployment.startTime;
      
      return deployment;
      
    } catch (error) {
      deployment.status = 'failed';
      deployment.error = error.message;
      
      // Automatic rollback
      if (deploymentRequest.autoRollback) {
        await this.performRollback(deployment);
      }
      
      throw error;
      
    } finally {
      // Audit and notify
      await this.auditDeployment(deployment);
      await this.notifyStakeholders(deployment);
    }
  }
  
  async preDeploymentChecks(deployment) {
    const checks = [
      { name: 'version_validation', handler: this.validateVersion },
      { name: 'dependency_check', handler: this.checkDependencies },
      { name: 'security_scan', handler: this.runSecurityScan },
      { name: 'test_suite', handler: this.runTestSuite },
      { name: 'resource_availability', handler: this.checkResources },
      { name: 'backup_verification', handler: this.verifyBackups }
    ];
    
    const results = [];
    
    for (const check of checks) {
      const startTime = Date.now();
      
      try {
        const result = await check.handler.call(this, deployment);
        
        results.push({
          check: check.name,
          passed: result.passed,
          duration: Date.now() - startTime,
          details: result.details
        });
        
        if (!result.passed && result.blocking) {
          throw new Error(`Pre-deployment check failed: ${check.name}`);
        }
        
      } catch (error) {
        results.push({
          check: check.name,
          passed: false,
          error: error.message,
          duration: Date.now() - startTime
        });
        
        throw error;
      }
    }
    
    deployment.preChecks = results;
    return results;
  }
  
  async createDeploymentPlan(request, strategy) {
    const plan = {
      strategy: strategy.name,
      stages: [],
      rollbackPlan: null,
      estimatedDuration: 0
    };
    
    // Build stages based on strategy
    if (strategy.name === 'blueGreen') {
      plan.stages = [
        {
          name: 'prepare_green',
          actions: [
            { type: 'provision', target: 'green_environment' },
            { type: 'deploy', target: 'green_environment' },
            { type: 'healthcheck', target: 'green_environment' }
          ]
        },
        {
          name: 'smoke_test',
          actions: [
            { type: 'test', suite: 'smoke', target: 'green_environment' }
          ]
        },
        {
          name: 'switch_traffic',
          actions: [
            { type: 'route', from: 'blue', to: 'green', percentage: 100 }
          ]
        },
        {
          name: 'verify_green',
          actions: [
            { type: 'monitor', duration: 300000, target: 'green_environment' }
          ]
        },
        {
          name: 'decommission_blue',
          actions: [
            { type: 'backup', target: 'blue_environment' },
            { type: 'shutdown', target: 'blue_environment' }
          ]
        }
      ];
      
    } else if (strategy.name === 'canary') {
      plan.stages = [
        {
          name: 'deploy_canary',
          actions: [
            { type: 'deploy', target: 'canary', replicas: 1 }
          ]
        },
        {
          name: 'canary_10_percent',
          actions: [
            { type: 'route', target: 'canary', percentage: 10 },
            { type: 'monitor', duration: 600000, metrics: ['error_rate', 'latency'] }
          ]
        },
        {
          name: 'canary_25_percent',
          actions: [
            { type: 'route', target: 'canary', percentage: 25 },
            { type: 'monitor', duration: 600000, metrics: ['error_rate', 'latency'] }
          ]
        },
        {
          name: 'canary_50_percent',
          actions: [
            { type: 'route', target: 'canary', percentage: 50 },
            { type: 'monitor', duration: 600000, metrics: ['error_rate', 'latency'] }
          ]
        },
        {
          name: 'full_rollout',
          actions: [
            { type: 'route', target: 'canary', percentage: 100 },
            { type: 'monitor', duration: 1200000 }
          ]
        }
      ];
    }
    
    // Create rollback plan
    plan.rollbackPlan = this.createRollbackPlan(plan);
    
    // Calculate estimated duration
    plan.estimatedDuration = plan.stages.reduce((total, stage) => {
      const stageDuration = stage.actions.reduce((sum, action) => {
        return sum + (action.duration || 60000);
      }, 0);
      return total + stageDuration;
    }, 0);
    
    return plan;
  }
  
  async executeStage(stage, deployment) {
    const stageExecution = {
      name: stage.name,
      startTime: Date.now(),
      actions: [],
      success: true
    };
    
    console.log(`Executing stage: ${stage.name}`);
    
    for (const action of stage.actions) {
      const actionResult = await this.executeAction(action, deployment);
      stageExecution.actions.push(actionResult);
      
      if (!actionResult.success) {
        stageExecution.success = false;
        stageExecution.error = actionResult.error;
        
        // Check if we should continue
        if (!action.continueOnFailure) {
          break;
        }
      }
      
      // Check health metrics
      if (action.type === 'monitor') {
        const healthCheck = await this.checkHealth(deployment, action);
        
        if (!healthCheck.healthy) {
          stageExecution.success = false;
          stageExecution.error = 'Health check failed';
          break;
        }
      }
    }
    
    stageExecution.endTime = Date.now();
    stageExecution.duration = stageExecution.endTime - stageExecution.startTime;
    
    return stageExecution;
  }
  
  async executeAction(action, deployment) {
    const handlers = {
      provision: async () => {
        // Terraform provisioning
        const terraform = await $workflow.execute('terraform-provision', {
          environment: action.target,
          configuration: deployment.request.infrastructure
        });
        return terraform;
      },
      
      deploy: async () => {
        // Kubernetes deployment
        const k8sManifest = this.generateK8sManifest(deployment, action);
        
        const result = await $http.request({
          method: 'POST',
          url: `${process.env.K8S_API}/apis/apps/v1/namespaces/${action.target}/deployments`,
          headers: {
            'Authorization': `Bearer ${process.env.K8S_TOKEN}`,
            'Content-Type': 'application/yaml'
          },
          body: k8sManifest
        });
        
        // Wait for rollout
        await this.waitForRollout(action.target, deployment.request.version);
        
        return { success: true, deployment: result };
      },
      
      healthcheck: async () => {
        const checks = [
          this.checkReadiness(action.target),
          this.checkLiveness(action.target),
          this.checkStartupProbe(action.target)
        ];
        
        const results = await Promise.all(checks);
        
        return {
          success: results.every(r => r.healthy),
          checks: results
        };
      },
      
      test: async () => {
        // Run test suite
        const testResult = await $workflow.execute('test-runner', {
          suite: action.suite,
          target: action.target,
          version: deployment.request.version
        });
        
        return {
          success: testResult.passed,
          tests: testResult.results,
          coverage: testResult.coverage
        };
      },
      
      route: async () => {
        // Update load balancer or service mesh
        const routing = {
          service: deployment.request.service,
          rules: [
            {
              destination: action.to || action.target,
              weight: action.percentage
            }
          ]
        };
        
        if (action.from && action.percentage < 100) {
          routing.rules.push({
            destination: action.from,
            weight: 100 - action.percentage
          });
        }
        
        const result = await this.updateServiceMesh(routing);
        
        return {
          success: true,
          routing: routing,
          result: result
        };
      },
      
      monitor: async () => {
        // Monitor metrics for specified duration
        const endTime = Date.now() + action.duration;
        const metrics = [];
        
        while (Date.now() < endTime) {
          const currentMetrics = await this.collectMetrics(action.target);
          metrics.push(currentMetrics);
          
          // Check thresholds
          if (action.metrics) {
            for (const metricName of action.metrics) {
              const threshold = this.getThreshold(metricName);
              
              if (currentMetrics[metricName] > threshold) {
                return {
                  success: false,
                  error: `Metric ${metricName} exceeded threshold: ${currentMetrics[metricName]} > ${threshold}`,
                  metrics: metrics
                };
              }
            }
          }
          
          // Wait before next check
          await new Promise(resolve => setTimeout(resolve, 10000));
        }
        
        return {
          success: true,
          metrics: metrics,
          summary: this.summarizeMetrics(metrics)
        };
      }
    };
    
    const handler = handlers[action.type];
    
    if (!handler) {
      throw new Error(`Unknown action type: ${action.type}`);
    }
    
    try {
      const result = await handler();
      
      return {
        action: action.type,
        success: true,
        result: result,
        timestamp: Date.now()
      };
      
    } catch (error) {
      return {
        action: action.type,
        success: false,
        error: error.message,
        timestamp: Date.now()
      };
    }
  }
  
  async performRollback(deployment) {
    console.log('Initiating automatic rollback...');
    
    const rollbackDeployment = {
      id: this.generateDeploymentId(),
      type: 'rollback',
      originalDeployment: deployment.id,
      startTime: Date.now()
    };
    
    try {
      // Get previous stable version
      const previousVersion = await this.getPreviousStableVersion(deployment);
      
      // Quick switch for blue-green
      if (deployment.strategy === 'blueGreen') {
        await this.switchToBlue(deployment);
        
      // Gradual rollback for canary
      } else if (deployment.strategy === 'canary') {
        await this.rollbackCanary(deployment, previousVersion);
        
      // Rolling rollback
      } else {
        await this.rollingRollback(deployment, previousVersion);
      }
      
      rollbackDeployment.status = 'completed';
      rollbackDeployment.endTime = Date.now();
      
      // Verify rollback success
      const verification = await this.verifyRollback(previousVersion);
      
      if (!verification.success) {
        throw new Error('Rollback verification failed');
      }
      
      deployment.rollback = rollbackDeployment;
      
    } catch (error) {
      rollbackDeployment.status = 'failed';
      rollbackDeployment.error = error.message;
      
      // Emergency procedures
      await this.emergencyProcedures(deployment);
      
      throw error;
    }
  }
  
  generateK8sManifest(deployment, action) {
    return `
apiVersion: apps/v1
kind: Deployment
metadata:
  name: n8n-${deployment.request.service}-${deployment.request.version}
  namespace: ${action.target}
  labels:
    app: ${deployment.request.service}
    version: ${deployment.request.version}
    deployment: ${deployment.id}
spec:
  replicas: ${action.replicas || 3}
  selector:
    matchLabels:
      app: ${deployment.request.service}
      version: ${deployment.request.version}
  template:
    metadata:
      labels:
        app: ${deployment.request.service}
        version: ${deployment.request.version}
      annotations:
        prometheus.io/scrape: "true"
        prometheus.io/port: "9090"
    spec:
      containers:
      - name: ${deployment.request.service}
        image: ${deployment.request.image}:${deployment.request.version}
        ports:
        - containerPort: 5678
        env:
        - name: VERSION
          value: "${deployment.request.version}"
        - name: DEPLOYMENT_ID
          value: "${deployment.id}"
        livenessProbe:
          httpGet:
            path: /health
            port: 5678
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 5678
          initialDelaySeconds: 10
          periodSeconds: 5
        resources:
          requests:
            memory: "256Mi"
            cpu: "100m"
          limits:
            memory: "1Gi"
            cpu: "500m"
    `;
  }
}

// Usage
const deploymentController = new DeploymentController();
const deployment = await deploymentController.deploy({
  service: 'n8n-orchestrator',
  version: 'v2.1.0',
  image: 'registry.example.com/n8n',
  strategy: 'canary',
  environment: 'production',
  autoRollback: true,
  approvals: ['tech-lead', 'product-owner'],
  infrastructure: {
    replicas: 5,
    resources: {
      cpu: '500m',
      memory: '1Gi'
    }
  }
});

return deployment;
Success Criteria
Performance Metrics

Deployment Speed: <5 minutes for full deployment
Rollback Time: <30 seconds for emergency rollback
Test Execution: <2 minutes for smoke tests
Zero Downtime: 100% availability during deployment

Quality Metrics

Deployment Success Rate: >99%
Automated Rollback Success: 100%
Test Coverage: >95% for deployment paths
Configuration Drift: <1% deviation

Business Impact Metrics

Release Velocity: 10x increase in deployment frequency
MTTR: <5 minutes for failed deployments
Change Failure Rate: <5%
Lead Time: <1 hour from commit to production

Implementation Checklist

 Week 1: Pipeline Foundation

 Set up GitOps repository structure
 Configure CI/CD pipelines
 Implement version control


 Week 2: Deployment Strategies

 Build blue-green deployment
 Implement canary releases
 Create feature flags system


 Week 3: Testing & Validation

 Automated test suites
 Health check implementation
 Rollback mechanisms


 Week 4: Production Release

 Security scanning
 Compliance validation
 Production deployment


