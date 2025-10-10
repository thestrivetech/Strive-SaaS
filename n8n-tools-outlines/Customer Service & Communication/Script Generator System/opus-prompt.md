Prompt #22: AI-Powered Script Generator System (Enhanced)
Role
N8n Conversational AI Engineer specializing in real estate sales optimization, NLP/NLU integration, and compliance-aware content generation
Context

Volume: 200-500 script requests per day across 50+ agents
Performance: Script generation < 2 seconds, personalization < 500ms
Integration: CRM systems, call recording platforms, compliance databases
Compliance: Fair Housing Act, RESPA, state-specific real estate regulations
Scale: 10,000 script variations, supporting 500 agents within 6 months

Primary Objective
Increase conversion rates by 35% through AI-optimized, personalized scripts while maintaining 100% regulatory compliance
Enhanced Requirements
Intelligent Script Generation Engine

Context-Aware Script Creation

python# N8n Code Node - Script Generation with GPT Integration
def generate_contextual_script(scenario_data):
    """
    Generate personalized scripts based on scenario and client context
    """
    # Extract context features
    context = {
        'scenario_type': scenario_data['type'],  # cold_call, follow_up, objection
        'client_profile': {
            'persona': classify_client_persona(scenario_data['client_data']),
            'stage': scenario_data['buyer_journey_stage'],
            'preferences': extract_preferences(scenario_data['interaction_history']),
            'pain_points': identify_pain_points(scenario_data['conversation_logs'])
        },
        'property_context': scenario_data.get('property_details', {}),
        'market_conditions': get_current_market_data(scenario_data['location']),
        'agent_style': scenario_data['agent_preferences']
    }
    
    # Build prompt for AI generation
    prompt = f"""
    Generate a {context['scenario_type']} script for a real estate agent.
    
    Client Profile:
    - Persona: {context['client_profile']['persona']}
    - Journey Stage: {context['client_profile']['stage']}
    - Key Interests: {context['client_profile']['preferences']}
    
    Context:
    - Market: {context['market_conditions']['summary']}
    - Agent Style: {context['agent_style']}
    
    Requirements:
    - Conversational and natural tone
    - Include 3 value propositions
    - Address likely objections
    - Include compliance disclaimers
    - Optimize for {scenario_data['goal']}
    """
    
    # Generate script with compliance check
    raw_script = await generate_with_ai(prompt, model='gpt-4')
    compliant_script = await ensure_compliance(raw_script)
    
    return {
        'script': compliant_script,
        'talking_points': extract_key_points(compliant_script),
        'objection_handlers': generate_objection_responses(context),
        'compliance_notes': get_compliance_requirements(context),
        'success_metrics': define_success_criteria(scenario_data['goal'])
    }
Compliance Validation System

Automated Fair Housing Compliance

javascript// N8n Function Node - Compliance Checker
const validateCompliance = async (script) => {
  const violations = [];
  const warnings = [];
  
  // Fair Housing Act compliance
  const fhaKeywords = [
    'family status', 'children', 'religion', 'race', 'color',
    'national origin', 'sex', 'disability', 'handicap'
  ];
  
  const scriptLower = script.toLowerCase();
  
  // Check for discriminatory language
  fhaKeywords.forEach(keyword => {
    const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
    const matches = script.match(regex);
    if (matches) {
      violations.push({
        type: 'FHA_VIOLATION',
        keyword: keyword,
        context: extractContext(script, keyword),
        suggestion: generateCompliantAlternative(script, keyword)
      });
    }
  });
  
  // Check for steering language
  const steeringPatterns = [
    /this neighborhood is perfect for (\w+) families/gi,
    /you'd fit in well here because/gi,
    /this area is very (\w+)-friendly/gi
  ];
  
  steeringPatterns.forEach(pattern => {
    if (pattern.test(script)) {
      warnings.push({
        type: 'POTENTIAL_STEERING',
        pattern: pattern.source,
        suggestion: 'Focus on property features, not demographic assumptions'
      });
    }
  });
  
  // RESPA compliance for referrals
  if (script.includes('recommend') || script.includes('refer')) {
    warnings.push({
      type: 'RESPA_DISCLOSURE',
      requirement: 'Include affiliated business disclosure if applicable'
    });
  }
  
  return {
    compliant: violations.length === 0,
    violations,
    warnings,
    complianceScore: calculateComplianceScore(violations, warnings),
    revisedScript: violations.length > 0 ? await autoFixViolations(script, violations) : script
  };
};
Technical Specifications
API Definition
typescriptinterface ScriptRequest {
  agentId: string;
  scenarioType: 'cold_call' | 'warm_lead' | 'follow_up' | 'listing_presentation' | 
                'buyer_consultation' | 'negotiation' | 'objection_handling';
  clientData: {
    id: string;
    interactionHistory: Interaction[];
    preferences: ClientPreferences;
    propertyInterests: Property[];
  };
  goal: 'appointment' | 'listing' | 'offer' | 'information' | 'relationship';
  tone: 'professional' | 'friendly' | 'consultative' | 'urgent';
  length: 'brief' | 'standard' | 'detailed';
}

interface ScriptResponse {
  scriptId: string;
  primaryScript: string;
  alternativeApproaches: string[];
  talkingPoints: string[];
  objectionHandlers: ObjectionResponse[];
  complianceStatus: {
    compliant: boolean;
    issues: ComplianceIssue[];
    certificationId: string;
  };
  personalizationScore: number;
  estimatedSuccessRate: number;
  a_b_test_variant?: string;
}

interface ObjectionResponse {
  objection: string;
  responses: string[];
  confidenceLevel: number;
  successRate: number;
}
A/B Testing Framework
javascript// N8n Function Node - Script A/B Testing
const implementABTesting = async (scriptRequest) => {
  const testConfig = {
    testId: generateTestId(),
    variants: [],
    distribution: 'even', // or 'weighted'
    sampleSize: 100,
    metrics: ['conversion_rate', 'appointment_rate', 'response_time']
  };
  
  // Generate variant scripts
  const baseScript = await generateBaseScript(scriptRequest);
  
  // Variant A: Standard approach
  testConfig.variants.push({
    id: 'A',
    script: baseScript,
    weight: 0.33
  });
  
  // Variant B: Value-focused approach
  testConfig.variants.push({
    id: 'B',
    script: await modifyScriptFocus(baseScript, 'value_proposition'),
    weight: 0.33
  });
  
  // Variant C: Urgency-focused approach
  testConfig.variants.push({
    id: 'C',
    script: await modifyScriptFocus(baseScript, 'urgency'),
    weight: 0.34
  });
  
  // Assign variant based on distribution
  const assignedVariant = selectVariant(testConfig, scriptRequest.agentId);
  
  // Track assignment for analysis
  await trackTestAssignment({
    testId: testConfig.testId,
    agentId: scriptRequest.agentId,
    clientId: scriptRequest.clientData.id,
    variant: assignedVariant.id,
    timestamp: new Date()
  });
  
  return {
    script: assignedVariant.script,
    testId: testConfig.testId,
    variantId: assignedVariant.id
  };
};
Success Criteria
Performance Metrics

Response Time: P95 < 1.5s, P99 < 2s for script generation
Throughput: 100 concurrent script requests
Availability: 99.5% uptime
Cache Hit Rate: >80% for common scenarios

Quality Metrics

Compliance Rate: 100% Fair Housing compliant
Personalization Score: >85% relevance rating
Script Effectiveness: >30% conversion rate improvement
Agent Adoption: >90% daily active usage

Business Impact Metrics

Conversion Rate: +35% for cold calls, +25% for follow-ups
Time Saved: 30 minutes/day per agent on script preparation
Training Cost: 50% reduction in new agent onboarding time
Compliance Incidents: Zero Fair Housing violations

Testing Requirements
Unit Tests
javascriptdescribe('Script Generator Tests', () => {
  describe('Compliance Validation', () => {
    test('should detect Fair Housing violations', () => {
      const script = "This neighborhood is perfect for young families without kids";
      const result = validateCompliance(script);
      
      expect(result.compliant).toBe(false);
      expect(result.violations).toContainEqual(
        expect.objectContaining({
          type: 'FHA_VIOLATION',
          keyword: expect.any(String)
        })
      );
    });
    
    test('should provide compliant alternatives', async () => {
      const violatingScript = "This area is very family-friendly";
      const result = await validateCompliance(violatingScript);
      
      expect(result.revisedScript).not.toContain('family-friendly');
      expect(result.revisedScript).toContain('features');
    });
  });
  
  describe('A/B Testing', () => {
    test('should distribute variants evenly', async () => {
      const assignments = [];
      for (let i = 0; i < 300; i++) {
        const result = await implementABTesting(mockScriptRequest());
        assignments.push(result.variantId);
      }
      
      const distribution = countBy(assignments);
      expect(Math.abs(distribution.A - 100)).toBeLessThan(20);
      expect(Math.abs(distribution.B - 100)).toBeLessThan(20);
      expect(Math.abs(distribution.C - 100)).toBeLessThan(20);
    });
  });
});
Monitoring & Observability
yamldashboard:
  real_time_metrics:
    - metric: script_generation_time
      threshold: < 2s
      alert: warning if > 3s
    
    - metric: compliance_violations
      threshold: 0
      alert: critical if > 0
    
    - metric: personalization_score
      threshold: > 85%
      alert: warning if < 75%
  
  ab_testing_metrics:
    - metric: variant_conversion_rates
      measurement: per_variant_performance
      significance: p < 0.05
    
    - metric: script_effectiveness
      baseline: control_group
      improvement_target: > 25%

alerts:
  - name: compliance_violation_detected
    condition: violations > 0
    action: 
      - notify: compliance_team
      - block: script_delivery
      - log: detailed_violation