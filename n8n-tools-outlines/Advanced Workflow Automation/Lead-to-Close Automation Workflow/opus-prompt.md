Prompt #28: Lead-to-Close Automation Workflow (Enhanced)
Role
N8n Enterprise Workflow Orchestration Architect specializing in complex multi-agent systems, state machines, and end-to-end process automation
Context

Volume: 5,000+ active leads, 500+ transactions monthly across 100+ agents
Performance: Workflow step execution < 1s, decision routing < 500ms
Integration: 8+ specialized AI agents, 15+ external systems, 20+ APIs
Compliance: RESPA, TILA, Fair Housing, state-specific real estate regulations
Scale: Supporting 10,000 concurrent workflows, 50,000 transactions/year

Primary Objective
Achieve 70% end-to-end automation rate with 0% compliance violations while reducing transaction time by 40%
Enhanced Requirements
Multi-Agent Orchestration System

Intelligent Workflow State Machine

python# N8n Code Node - Workflow Orchestration Engine
from enum import Enum
import asyncio
from typing import Dict, List, Optional

class WorkflowState(Enum):
    LEAD_CAPTURED = "lead_captured"
    QUALIFICATION = "qualification"
    NURTURING = "nurturing"
    ACTIVE_SEARCH = "active_search"
    PROPERTY_SHOWING = "showing"
    OFFER_PREPARATION = "offer_prep"
    NEGOTIATION = "negotiation"
    CONTRACT = "contract"
    CLOSING = "closing"
    CLOSED = "closed"
    LOST = "lost"

class LeadToCloseOrchestrator:
    def __init__(self, lead_id: str):
        self.lead_id = lead_id
        self.state = WorkflowState.LEAD_CAPTURED
        self.agents = self.initialize_agents()
        self.context = {}
        self.history = []
        
    def initialize_agents(self):
        """Initialize all specialized AI agents"""
        return {
            'qualifier': LeadQualificationAgent(),
            'matcher': PropertyMatchingAgent(),
            'nurture': LeadNurturingAgent(),
            'scheduler': AppointmentAgent(),
            'analyzer': MarketAnalysisAgent(),
            'negotiator': NegotiationAgent(),
            'compliance': ComplianceAgent(),
            'closer': TransactionClosingAgent()
        }
    
    async def execute_workflow(self):
        """Main workflow execution loop"""
        while self.state not in [WorkflowState.CLOSED, WorkflowState.LOST]:
            try:
                # Get current state handler
                handler = self.get_state_handler(self.state)
                
                # Execute state logic
                result = await handler()
                
                # Log state transition
                self.log_transition(self.state, result['next_state'], result)
                
                # Check compliance gates
                compliance_check = await self.agents['compliance'].validate_transition(
                    self.state, 
                    result['next_state'],
                    self.context
                )
                
                if not compliance_check['compliant']:
                    await self.handle_compliance_issue(compliance_check)
                    continue
                
                # Update state
                self.state = result['next_state']
                self.context.update(result.get('context_updates', {}))
                
                # Notify relevant parties
                await self.notify_stakeholders(result)
                
                # Check for human intervention needed
                if result.get('requires_human'):
                    await self.request_human_intervention(result['intervention_reason'])
                
            except Exception as e:
                await self.handle_error(e)
        
        return self.generate_workflow_summary()
    
    async def handle_lead_qualification(self):
        """LEAD_CAPTURED -> QUALIFICATION/NURTURING/LOST"""
        # Gather lead data from all sources
        lead_data = await self.gather_lead_intelligence()
        
        # Run qualification scoring
        qualification_result = await self.agents['qualifier'].score_lead(lead_data)
        
        if qualification_result['score'] >= 80:
            # High-quality lead - fast track
            next_state = WorkflowState.ACTIVE_SEARCH
            await self.assign_agent(priority='high')
            await self.schedule_initial_consultation(urgency='immediate')
            
        elif qualification_result['score'] >= 50:
            # Qualified but needs nurturing
            next_state = WorkflowState.NURTURING
            nurture_plan = await self.agents['nurture'].create_plan(lead_data)
            self.context['nurture_plan'] = nurture_plan
            
        else:
            # Not qualified
            next_state = WorkflowState.LOST
            self.context['loss_reason'] = 'low_qualification_score'
        
        return {
            'next_state': next_state,
            'qualification_score': qualification_result['score'],
            'context_updates': {
                'lead_quality': qualification_result['tier'],
                'estimated_timeline': qualification_result['timeline']
            }
        }
    
    async def handle_property_matching(self):
        """ACTIVE_SEARCH -> PROPERTY_SHOWING"""
        # Get client preferences
        preferences = self.context['client_preferences']
        
        # Find matching properties
        matches = await self.agents['matcher'].find_properties(preferences)
        
        # Score and rank matches
        scored_matches = await self.agents['analyzer'].score_properties(
            matches,
            preferences,
            self.context['client_profile']
        )
        
        # Create showing schedule
        showing_plan = await self.agents['scheduler'].create_showing_schedule(
            scored_matches[:10],  # Top 10 matches
            self.context['agent_id'],
            self.context['client_availability']
        )
        
        return {
            'next_state': WorkflowState.PROPERTY_SHOWING,
            'properties_matched': len(scored_matches),
            'showings_scheduled': len(showing_plan['appointments']),
            'context_updates': {
                'showing_plan': showing_plan,
                'top_properties': scored_matches[:10]
            }
        }
    
    async def handle_offer_preparation(self):
        """PROPERTY_SHOWING -> OFFER_PREPARATION"""
        selected_property = self.context['selected_property']
        
        # Market analysis
        market_analysis = await self.agents['analyzer'].analyze_property_value(
            selected_property,
            include_comps=True,
            include_trends=True
        )
        
        # Generate offer strategy
        offer_strategy = await self.agents['negotiator'].create_offer_strategy(
            property=selected_property,
            market_analysis=market_analysis,
            client_profile=self.context['client_profile'],
            competition_level=market_analysis['competition_score']
        )
        
        # Prepare documents
        offer_documents = await self.prepare_offer_documents(
            property=selected_property,
            offer_amount=offer_strategy['recommended_offer'],
            contingencies=offer_strategy['contingencies']
        )
        
        # Compliance check
        compliance_review = await self.agents['compliance'].review_offer(
            offer_documents,
            state=selected_property['state']
        )
        
        return {
            'next_state': WorkflowState.NEGOTIATION,
            'offer_prepared': True,
            'recommended_offer': offer_strategy['recommended_offer'],
            'context_updates': {
                'offer_strategy': offer_strategy,
                'offer_documents': offer_documents,
                'compliance_status': compliance_review
            }
        }
Decision Tree Navigation

Intelligent Decision Routing

javascript// N8n Function Node - Decision Tree Engine
class DecisionTreeEngine {
  constructor(workflowContext) {
    this.context = workflowContext;
    this.decisions = [];
    this.currentNode = 'root';
  }
  
  async navigateDecisionTree(trigger) {
    const decisionTree = {
      'offer_received': {
        conditions: [
          {
            test: (ctx) => ctx.offer_price >= ctx.asking_price * 0.98,
            action: 'accept_offer',
            next: 'prepare_contract'
          },
          {
            test: (ctx) => ctx.offer_price >= ctx.asking_price * 0.90,
            action: 'counter_offer',
            next: 'negotiation'
          },
          {
            test: (ctx) => ctx.offer_price < ctx.asking_price * 0.90,
            action: 'evaluate_terms',
            next: 'deep_analysis'
          }
        ]
      },
      'inspection_complete': {
        conditions: [
          {
            test: (ctx) => ctx.inspection_issues.length === 0,
            action: 'proceed_to_closing',
            next: 'closing_preparation'
          },
          {
            test: (ctx) => ctx.inspection_issues.filter(i => i.severity === 'major').length > 0,
            action: 'request_repairs',
            next: 'repair_negotiation'
          },
          {
            test: (ctx) => ctx.inspection_issues.filter(i => i.cost > 5000).length > 0,
            action: 'request_credit',
            next: 'credit_negotiation'
          }
        ]
      },
      'appraisal_complete': {
        conditions: [
          {
            test: (ctx) => ctx.appraisal_value >= ctx.contract_price,
            action: 'proceed',
            next: 'loan_processing'
          },
          {
            test: (ctx) => ctx.appraisal_value < ctx.contract_price && 
                         ctx.appraisal_value >= ctx.contract_price * 0.95,
            action: 'negotiate_price_reduction',
            next: 'price_negotiation'
          },
          {
            test: (ctx) => ctx.appraisal_value < ctx.contract_price * 0.95,
            action: 'evaluate_options',
            next: 'strategic_decision'
          }
        ]
      }
    };
    
    const node = decisionTree[trigger];
    if (!node) {
      throw new Error(`Unknown decision trigger: ${trigger}`);
    }
    
    // Evaluate conditions
    for (const condition of node.conditions) {
      if (condition.test(this.context)) {
        // Log decision
        this.decisions.push({
          trigger,
          condition: condition.test.toString(),
          action: condition.action,
          timestamp: new Date(),
          context: { ...this.context }
        });
        
        // Execute action
        const actionResult = await this.executeAction(condition.action);
        
        // Update context
        this.context = { ...this.context, ...actionResult.updates };
        
        // Move to next node
        this.currentNode = condition.next;
        
        return {
          action: condition.action,
          nextNode: condition.next,
          result: actionResult,
          confidence: this.calculateDecisionConfidence(condition, this.context)
        };
      }
    }
    
    // No conditions met - escalate
    return {
      action: 'escalate_to_human',
      reason: 'no_matching_conditions',
      context: this.context
    };
  }
  
  async executeAction(action) {
    const actions = {
      'accept_offer': async () => {
        await this.notifyAgent('offer_accepted', this.context);
        await this.prepareContract(this.context);
        return {
          success: true,
          updates: { status: 'contract_preparation' }
        };
      },
      'counter_offer': async () => {
        const counter = await this.generateCounterOffer(this.context);
        await this.sendCounterOffer(counter);
        return {
          success: true,
          updates: { 
            status: 'awaiting_response',
            counter_offer: counter
          }
        };
      },
      'request_repairs': async () => {
        const repairList = this.prioritizeRepairs(this.context.inspection_issues);
        await this.sendRepairRequest(repairList);
        return {
          success: true,
          updates: {
            status: 'repair_negotiation',
            requested_repairs: repairList
          }
        };
      }
    };
    
    const actionFn = actions[action];
    if (!actionFn) {
      throw new Error(`Unknown action: ${action}`);
    }
    
    return await actionFn();
  }
  
  calculateDecisionConfidence(condition, context) {
    // Calculate confidence based on data completeness and quality
    let confidence = 1.0;
    
    // Reduce confidence for missing data
    const requiredFields = this.extractRequiredFields(condition.test);
    const missingFields = requiredFields.filter(field => !context[field]);
    confidence -= missingFields.length * 0.1;
    
    // Reduce confidence for old data
    if (context.dataAge && context.dataAge > 7) {
      confidence -= 0.2;
    }
    
    // Reduce confidence for edge cases
    if (this.isEdgeCase(condition, context)) {
      confidence -= 0.3;
    }
    
    return Math.max(0, Math.min(1, confidence));
  }
}
Technical Specifications
API Definition
typescriptinterface WorkflowInstance {
  id: string;
  leadId: string;
  currentState: WorkflowState;
  startTime: Date;
  estimatedCompletion: Date;
  agents: {
    primary: string;
    secondary?: string;
    specialist?: string[];
  };
  context: WorkflowContext;
  history: StateTransition[];
  metrics: WorkflowMetrics;
  compliance: ComplianceStatus;
}

interface StateTransition {
  fromState: WorkflowState;
  toState: WorkflowState;
  timestamp: Date;
  trigger: string;
  decision: Decision;
  agentInvolved: string;
  success: boolean;
  duration: number;
}

interface WorkflowContext {
  lead: LeadProfile;
  properties: Property[];
  interactions: Interaction[];
  documents: Document[];
  tasks: Task[];
  deadlines: Deadline[];
  stakeholders: Stakeholder[];
}

interface Decision {
  id: string;
  type: string;
  confidence: number;
  factors: DecisionFactor[];
  outcome: string;
  alternativeOptions: Alternative[];
}
Quality Gates & Checkpoints
python# N8n Code Node - Quality Gate System
class QualityGateSystem:
    def __init__(self):
        self.gates = self.define_quality_gates()
        
    def define_quality_gates(self):
        return {
            'lead_qualification': {
                'required_data': ['contact_info', 'budget', 'timeline', 'preferences'],
                'validation_rules': [
                    lambda ctx: ctx['budget'] > 0,
                    lambda ctx: ctx['timeline'] in ['immediate', '3_months', '6_months', '12_months'],
                    lambda ctx: len(ctx['preferences']) > 0
                ],
                'compliance_checks': ['tcpa_consent', 'privacy_notice_acknowledged']
            },
            'offer_submission': {
                'required_data': ['offer_amount', 'earnest_money', 'contingencies', 'closing_date'],
                'validation_rules': [
                    lambda ctx: ctx['offer_amount'] > 0,
                    lambda ctx: ctx['earnest_money'] >= ctx['offer_amount'] * 0.01,
                    lambda ctx: ctx['closing_date'] > datetime.now()
                ],
                'compliance_checks': ['fair_housing_compliant', 'respa_compliant', 'state_requirements']
            },
            'closing_preparation': {
                'required_data': ['final_walkthrough', 'funds_verified', 'documents_signed', 'insurance_active'],
                'validation_rules': [
                    lambda ctx: ctx['final_walkthrough']['completed'],
                    lambda ctx: ctx['funds_verified']['amount'] >= ctx['closing_costs'],
                    lambda ctx: all(doc['signed'] for doc in ctx['closing_documents'])
                ],
                'compliance_checks': ['tila_compliance', 'closing_disclosure_timing', 'wire_fraud_prevention']
            }
        }
    
    async def validate_gate(self, gate_name, context):
        gate = self.gates.get(gate_name)
        if not gate:
            return {'passed': False, 'error': 'Unknown gate'}
        
        results = {
            'gate': gate_name,
            'passed': True,
            'issues': [],
            'warnings': []
        }
        
        # Check required data
        for field in gate['required_data']:
            if field not in context or context[field] is None:
                results['passed'] = False
                results['issues'].append(f'Missing required field: {field}')
        
        # Run validation rules
        for i, rule in enumerate(gate['validation_rules']):
            try:
                if not rule(context):
                    results['passed'] = False
                    results['issues'].append(f'Validation rule {i} failed')
            except Exception as e:
                results['warnings'].append(f'Validation rule {i} error: {str(e)}')
        
        # Check compliance
        for check in gate['compliance_checks']:
            compliance_result = await self.run_compliance_check(check, context)
            if not compliance_result['compliant']:
                results['passed'] = False
                results['issues'].append(f'Compliance check failed: {check}')
                results['compliance_details'] = compliance_result
        
        # Generate recommendations if gate failed
        if not results['passed']:
            results['recommendations'] = self.generate_remediation_steps(results['issues'])
        
        return results
Success Criteria
Performance Metrics

Workflow Execution: P95 < 1s per step transition
Decision Routing: P99 < 500ms for decision logic
Concurrent Workflows: Support 10,000 active workflows
System Availability: 99.99% uptime

Quality Metrics

Automation Rate: >70% end-to-end without human intervention
Decision Accuracy: >95% correct routing decisions
Compliance Rate: 100% regulatory compliance
Error Recovery: <5 minutes mean time to recovery

Business Impact Metrics

Transaction Time: 40% reduction in average closing time
Agent Productivity: 3x increase in transactions per agent
Client Satisfaction: >4.7/5 process rating
Cost Reduction: 60% reduction in transaction coordination costs

Testing Requirements
javascriptdescribe('Lead-to-Close Workflow Tests', () => {
  describe('State Transitions', () => {
    test('should handle all valid state transitions', async () => {
      const workflow = new LeadToCloseOrchestrator('test_lead_123');
      const transitions = [
        { from: 'lead_captured', to: 'qualification' },
        { from: 'qualification', to: 'nurturing' },
        { from: 'nurturing', to: 'active_search' }
      ];
      
      for (const transition of transitions) {
        workflow.state = transition.from;
        const result = await workflow.transitionTo(transition.to);
        expect(result.success).toBe(true);
        expect(workflow.state).toBe(transition.to);
      }
    });
    
    test('should enforce quality gates', async () => {
      const gate = new QualityGateSystem();
      const context = {
        offer_amount: 500000,
        earnest_money: 5000,
        contingencies: ['inspection', 'financing'],
        closing_date: new Date('2024-12-31')
      };
      
      const result = await gate.validateGate('offer_submission', context);
      expect(result.passed).toBe(true);
    });
  });
  
  describe('Multi-Agent Coordination', () => {
    test('should coordinate multiple agents correctly', async () => {
      const orchestrator = new LeadToCloseOrchestrator('lead_456');
      const agents = await orchestrator.assignAgentsForTask('complex_negotiation');
      
      expect(agents).toContainEqual(
        expect.objectContaining({
          role: 'negotiator',
          assigned: true
        })
      );
      expect(agents).toContainEqual(
        expect.objectContaining({
          role: 'analyzer',
          assigned: true
        })
      );
    });
  });
});
Monitoring & Observability
yamldashboard:
  workflow_metrics:
    - metric: active_workflows
      measurement: count by state
      visualization: funnel chart
    
    - metric: state_transition_time
      measurement: p50, p95, p99 by transition
      alert: warning if p95 > 5s
    
    - metric: automation_rate
      calculation: fully_automated / total_workflows
      target: > 70%
  
  quality_gates:
    - metric: gate_pass_rate
      per_gate: true
      threshold: > 95%
      alert: critical if < 90%
    
    - metric: compliance_violations
      threshold: 0
      alert: critical if > 0
  
  business_impact:
    - metric: average_closing_time
      baseline: 45 days
      target: < 27 days
    
    - metric: transaction_success_rate
      calculation: closed / total_started
      target: > 85%

alerts:
  - name: workflow_stuck
    condition: state_unchanged > 24 hours
    action:
      - investigate: identify blocking issue
      - escalate: to human agent
      - notify: workflow_manager