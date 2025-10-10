Prompt #18: Compliance Monitor System (Enhanced)
Role
Senior N8n Real Estate Compliance Engineer specializing in regulatory automation, audit trail management, multi-jurisdictional compliance tracking, and automated violation remediation systems.
Context

Volume: Monitor 10,000+ active transactions, 50,000+ compliance checks daily
Performance: Compliance validation < 500ms, violation detection < 2 seconds
Integration: Federal/state/local regulation databases, MLS systems, document management, CRM
Compliance: RESPA, TILA, Fair Housing Act, state real estate laws, local ordinances
Scale: Support 50,000 active transactions within 6 months, 200,000 within 1 year

Primary Objective
Build an automated compliance monitoring system achieving 100% regulatory coverage with real-time violation detection and automated remediation workflows.
Enhanced Requirements
Compliance Rule Engine
pythonimport json
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
import re
from dataclasses import dataclass
from enum import Enum

class ComplianceLevel(Enum):
    FEDERAL = "federal"
    STATE = "state"
    LOCAL = "local"
    INDUSTRY = "industry"

@dataclass
class ComplianceRule:
    rule_id: str
    name: str
    level: ComplianceLevel
    category: str
    description: str
    requirements: List[Dict]
    validation_logic: str
    violation_severity: str
    remediation_steps: List[str]
    effective_date: datetime
    jurisdictions: List[str]

class ComplianceMonitor:
    def __init__(self):
        self.rule_database = self.load_compliance_rules()
        self.violation_handlers = self.initialize_handlers()
        self.audit_logger = AuditLogger()
        self.remediation_engine = RemediationEngine()
        
    def monitor_transaction(self, transaction: Dict) -> Dict:
        """
        Comprehensive compliance monitoring for a transaction
        """
        compliance_results = {
            'transaction_id': transaction['id'],
            'timestamp': datetime.utcnow().isoformat(),
            'checks_performed': [],
            'violations': [],
            'warnings': [],
            'compliance_score': 100,
            'required_actions': []
        }
        
        # Get applicable rules based on jurisdiction
        applicable_rules = self.get_applicable_rules(
            transaction['property']['state'],
            transaction['property']['county'],
            transaction['property']['city'],
            transaction['transaction_type']
        )
        
        # Perform compliance checks
        for rule in applicable_rules:
            check_result = self.check_compliance(transaction, rule)
            compliance_results['checks_performed'].append({
                'rule_id': rule.rule_id,
                'name': rule.name,
                'result': check_result['status'],
                'details': check_result.get('details')
            })
            
            if check_result['status'] == 'violation':
                violation = self.create_violation_record(transaction, rule, check_result)
                compliance_results['violations'].append(violation)
                compliance_results['compliance_score'] -= self.calculate_penalty(rule)
                
                # Generate remediation actions
                remediation = self.remediation_engine.generate_remediation(
                    violation,
                    transaction,
                    rule
                )
                compliance_results['required_actions'].extend(remediation['actions'])
                
            elif check_result['status'] == 'warning':
                compliance_results['warnings'].append({
                    'rule_id': rule.rule_id,
                    'message': check_result['message'],
                    'recommendation': check_result.get('recommendation')
                })
        
        # Check for Fair Housing compliance
        fair_housing_check = self.check_fair_housing_compliance(transaction)
        if fair_housing_check['violations']:
            compliance_results['violations'].extend(fair_housing_check['violations'])
            compliance_results['compliance_score'] -= 25  # Severe penalty
        
        # Check disclosure requirements
        disclosure_check = self.check_disclosure_requirements(transaction)
        compliance_results['checks_performed'].append(disclosure_check)
        
        # Audit trail logging
        self.audit_logger.log_compliance_check(compliance_results)
        
        # Determine overall compliance status
        compliance_results['status'] = self.determine_compliance_status(
            compliance_results['compliance_score'],
            compliance_results['violations']
        )
        
        return compliance_results
    
    def check_compliance(self, transaction: Dict, rule: ComplianceRule) -> Dict:
        """
        Check transaction against specific compliance rule
        """
        if rule.category == 'timeline':
            return self.check_timeline_compliance(transaction, rule)
        elif rule.category == 'disclosure':
            return self.check_disclosure_compliance(transaction, rule)
        elif rule.category == 'financial':
            return self.check_financial_compliance(transaction, rule)
        elif rule.category == 'documentation':
            return self.check_documentation_compliance(transaction, rule)
        elif rule.category == 'communication':
            return self.check_communication_compliance(transaction, rule)
        else:
            return self.check_generic_compliance(transaction, rule)
    
    def check_timeline_compliance(self, transaction: Dict, rule: ComplianceRule) -> Dict:
        """
        Check compliance with timeline requirements (TRID, state-specific)
        """
        result = {'status': 'compliant', 'details': {}}
        
        if rule.rule_id == 'TRID_3_DAY_DISCLOSURE':
            # Check if Loan Estimate was provided within 3 business days
            application_date = datetime.fromisoformat(transaction.get('loan_application_date', ''))
            le_delivery_date = datetime.fromisoformat(transaction.get('loan_estimate_date', ''))
            
            business_days = self.calculate_business_days(application_date, le_delivery_date)
            
            if business_days > 3:
                result['status'] = 'violation'
                result['details'] = {
                    'application_date': application_date.isoformat(),
                    'le_delivery_date': le_delivery_date.isoformat(),
                    'business_days': business_days,
                    'requirement': 3
                }
                result['message'] = f'Loan Estimate delivered {business_days} business days after application (requirement: 3)'
        
        elif rule.rule_id == 'TRID_7_DAY_WAITING':
            # Check 7-day waiting period before consummation
            le_date = datetime.fromisoformat(transaction.get('loan_estimate_date', ''))
            closing_date = datetime.fromisoformat(transaction.get('closing_date', ''))
            
            days_between = (closing_date - le_date).days
            
            if days_between < 7:
                result['status'] = 'violation'
                result['details'] = {
                    'le_date': le_date.isoformat(),
                    'closing_date': closing_date.isoformat(),
                    'days_between': days_between,
                    'requirement': 7
                }
                result['message'] = f'Only {days_between} days between LE and closing (requirement: 7)'
        
        return result
    
    def check_fair_housing_compliance(self, transaction: Dict) -> Dict:
        """
        Check for Fair Housing Act compliance
        """
        violations = []
        
        # Check for discriminatory language in listings/communications
        communications = transaction.get('communications', [])
        discriminatory_patterns = [
            r'\b(no\s+)?(children|kids|families with children)\b',
            r'\b(perfect|ideal)\s+for\s+(singles|couples without)\b',
            r'\b(not\s+suitable|no)\s+(disabled|handicapped|wheelchairs)\b',
            r'\b(preferred|only)\s+(nationality|race|religion)\b'
        ]
        
        for comm in communications:
            text = comm.get('content', '').lower()
            for pattern in discriminatory_patterns:
                if re.search(pattern, text, re.IGNORECASE):
                    violations.append({
                        'type': 'fair_housing_violation',
                        'severity': 'critical',
                        'pattern_matched': pattern,
                        'communication_id': comm.get('id'),
                        'content_excerpt': text[:200]
                    })
        
        # Check for steering violations
        if transaction.get('showing_pattern'):
            steering_check = self.detect_steering_violations(transaction['showing_pattern'])
            if steering_check['violation_detected']:
                violations.append({
                    'type': 'potential_steering',
                    'severity': 'high',
                    'details': steering_check['details']
                })
        
        # Check for disparate treatment
        if transaction.get('buyer_interactions'):
            disparate_treatment = self.check_disparate_treatment(
                transaction['buyer_interactions']
            )
            if disparate_treatment['issues_found']:
                violations.extend(disparate_treatment['violations'])
        
        return {'violations': violations}
    
    def check_disclosure_requirements(self, transaction: Dict) -> Dict:
        """
        Check all required disclosures based on property and transaction type
        """
        required_disclosures = []
        provided_disclosures = transaction.get('disclosures', [])
        missing_disclosures = []
        
        # Federal disclosures
        if transaction['property'].get('year_built', 9999) < 1978:
            required_disclosures.append('lead_based_paint')
        
        # State-specific disclosures
        state = transaction['property']['state']
        state_disclosures = self.get_state_disclosure_requirements(state)
        required_disclosures.extend(state_disclosures)
        
        # Property-specific disclosures
        if transaction['property'].get('hoa'):
            required_disclosures.append('hoa_disclosure')
        
        if transaction['property'].get('flood_zone'):
            required_disclosures.append('flood_hazard')
        
        if state == 'CA':
            required_disclosures.extend([
                'natural_hazard_disclosure',
                'earthquake_guide',
                'environmental_hazards',
                'statewide_buyer_advisory'
            ])
        elif state == 'TX':
            required_disclosures.extend([
                'sellers_disclosure_notice',
                'mineral_rights_disclosure'
            ])
        elif state == 'FL':
            required_disclosures.extend([
                'property_disclosure_form',
                'radon_gas_disclosure'
            ])
        
        # Check which disclosures are missing
        provided_disclosure_types = [d['type'] for d in provided_disclosures]
        missing_disclosures = [
            d for d in required_disclosures 
            if d not in provided_disclosure_types
        ]
        
        return {
            'required': required_disclosures,
            'provided': provided_disclosure_types,
            'missing': missing_disclosures,
            'compliance': len(missing_disclosures) == 0
        }
    
    def generate_compliance_report(self, transaction_id: str) -> Dict:
        """
        Generate comprehensive compliance report for a transaction
        """
        # Retrieve all compliance checks for the transaction
        historical_checks = self.audit_logger.get_transaction_history(transaction_id)
        
        report = {
            'transaction_id': transaction_id,
            'report_date': datetime.utcnow().isoformat(),
            'compliance_summary': {
                'total_checks': len(historical_checks),
                'violations': 0,
                'warnings': 0,
                'current_status': 'compliant'
            },
            'timeline_compliance': [],
            'disclosure_compliance': [],
            'fair_housing_compliance': [],
            'remediation_history': [],
            'audit_trail': []
        }
        
        # Analyze historical compliance data
        for check in historical_checks:
            if check['violations']:
                report['compliance_summary']['violations'] += len(check['violations'])
            if check['warnings']:
                report['compliance_summary']['warnings'] += len(check['warnings'])
            
            # Categorize by type
            for performed_check in check['checks_performed']:
                if 'timeline' in performed_check['name'].lower():
                    report['timeline_compliance'].append(performed_check)
                elif 'disclosure' in performed_check['name'].lower():
                    report['disclosure_compliance'].append(performed_check)
                elif 'fair housing' in performed_check['name'].lower():
                    report['fair_housing_compliance'].append(performed_check)
        
        # Get remediation history
        report['remediation_history'] = self.remediation_engine.get_remediation_history(
            transaction_id
        )
        
        # Generate audit trail
        report['audit_trail'] = self.generate_audit_trail(transaction_id)
        
        # Determine current compliance status
        if report['compliance_summary']['violations'] > 0:
            report['compliance_summary']['current_status'] = 'non-compliant'
        elif report['compliance_summary']['warnings'] > 0:
            report['compliance_summary']['current_status'] = 'compliant_with_warnings'
        
        return report
N8n Workflow Implementation
javascriptconst complianceMonitorWorkflow = {
  name: 'Compliance_Monitor_System',
  nodes: [
    {
      name: 'Transaction_Event',
      type: 'n8n-nodes-base.webhook',
      parameters: {
        path: 'compliance/check',
        responseMode: 'responseNode'
      }
    },
    {
      name: 'Load_Compliance_Rules',
      type: 'n8n-nodes-base.postgres',
      parameters: {
        operation: 'executeQuery',
        query: `
          SELECT * FROM compliance_rules
          WHERE jurisdiction IN ($1, $2, $3, 'federal')
            AND effective_date <= CURRENT_DATE
            AND (expiration_date IS NULL OR expiration_date > CURRENT_DATE)
            AND transaction_type = ANY($4::text[])
          ORDER BY level, priority
        `,
        additionalFields: {
          queryParameters: [
            '={{$json["property"]["state"]}}',
            '={{$json["property"]["county"]}}',
            '={{$json["property"]["city"]}}',
            '={{[$json["transaction_type"]]}}'
          ]
        }
      }
    },
    {
      name: 'Check_Federal_Compliance',
      type: 'n8n-nodes-base.function',
      parameters: {
        functionCode: `
          const transaction = $json["transaction"];
          const federalRules = $json["rules"].filter(r => r.level === 'federal');
          const violations = [];
          const warnings = [];
          
          // RESPA compliance
          if (transaction.financing) {
            // Check for kickbacks/referral fees
            if (transaction.referral_fees) {
              transaction.referral_fees.forEach(fee => {
                if (!isPermittedReferralFee(fee)) {
                  violations.push({
                    rule: 'RESPA_SECTION_8',
                    severity: 'critical',
                    description: 'Prohibited referral fee detected',
                    details: fee
                  });
                }
              });
            }
            
            // Check for required disclosures
            if (!transaction.disclosures?.includes('affiliated_business')) {
              if (hasAffiliatedBusinessRelationship(transaction)) {
                violations.push({
                  rule: 'RESPA_AFFILIATED_BUSINESS',
                  severity: 'high',
                  description: 'Missing Affiliated Business Arrangement Disclosure'
                });
              }
            }
          }
          
          // TRID compliance
          if (transaction.loan_application_date) {
            const tridChecks = checkTRIDCompliance(transaction);
            violations.push(...tridChecks.violations);
            warnings.push(...tridChecks.warnings);
          }
          
          // Fair Housing compliance
          const fairHousingCheck = checkFairHousingCompliance(transaction);
          if (fairHousingCheck.violations.length > 0) {
            violations.push(...fairHousingCheck.violations.map(v => ({
              ...v,
              rule: 'FAIR_HOUSING_ACT',
              severity: 'critical'
            })));
          }
          
          // Equal Credit Opportunity Act
          if (transaction.loan_application) {
            const ecoaCheck = checkECOACompliance(transaction.loan_application);
            violations.push(...ecoaCheck.violations);
          }
          
          return {
            federal_compliance: {
              checked: true,
              violations: violations,
              warnings: warnings,
              compliance_score: calculateComplianceScore(violations, warnings)
            }
          };
        `
      }
    },
    {
      name: 'Check_State_Compliance',
      type: 'n8n-nodes-base.function',
      parameters: {
        functionCode: `
          const transaction = $json["transaction"];
          const state = transaction.property.state;
          const stateRules = $json["rules"].filter(r => r.level === 'state');
          const violations = [];
          
          // State-specific compliance checks
          switch(state) {
            case 'CA':
              // California specific requirements
              if (!transaction.disclosures?.includes('natural_hazard')) {
                violations.push({
                  rule: 'CA_NATURAL_HAZARD_DISCLOSURE',
                  severity: 'high',
                  description: 'Missing Natural Hazard Disclosure Statement'
                });
              }
              
              if (!transaction.disclosures?.includes('statewide_buyer_advisory')) {
                violations.push({
                  rule: 'CA_BUYER_ADVISORY',
                  severity: 'medium',
                  description: 'Missing California Statewide Buyer Advisory'
                });
              }
              
              // Check cooling-off period
              if (transaction.type === 'home_solicitation_sale') {
                const coolingOffCheck = checkCoolingOffPeriod(transaction, 3);
                if (!coolingOffCheck.compliant) {
                  violations.push(coolingOffCheck.violation);
                }
              }
              break;
              
            case 'TX':
              // Texas specific requirements
              if (!transaction.disclosures?.includes('sellers_disclosure')) {
                violations.push({
                  rule: 'TX_SELLERS_DISCLOSURE',
                  severity: 'high',
                  description: 'Missing Texas Seller\\'s Disclosure Notice'
                });
              }
              
              if (transaction.property.hoa && !transaction.disclosures?.includes('hoa_addendum')) {
                violations.push({
                  rule: 'TX_HOA_ADDENDUM',
                  severity: 'medium',
                  description: 'Missing HOA Addendum for property with HOA'
                });
              }
              break;
              
            case 'FL':
              // Florida specific requirements
              if (!transaction.disclosures?.includes('property_disclosure')) {
                violations.push({
                  rule: 'FL_PROPERTY_DISCLOSURE',
                  severity: 'high',
                  description: 'Missing Florida Property Disclosure Form'
                });
              }
              
              if (transaction.property.coastal && !transaction.disclosures?.includes('coastal_construction')) {
                violations.push({
                  rule: 'FL_COASTAL_DISCLOSURE',
                  severity: 'medium',
                  description: 'Missing Coastal Construction Control Line Disclosure'
                });
              }
              break;
          }
          
          // Check state-specific timelines
          stateRules.forEach(rule => {
            if (rule.category === 'timeline') {
              const timelineCheck = checkTimelineCompliance(transaction, rule);
              if (!timelineCheck.compliant) {
                violations.push(timelineCheck.violation);
              }
            }
          });
          
          return {
            state_compliance: {
              state: state,
              violations: violations,
              rules_checked: stateRules.length
            }
          };
        `
      }
    },
    {
      name: 'Generate_Remediation_Plan',
      type: 'n8n-nodes-base.function',
      parameters: {
        functionCode: `
          const violations = [
            ...$json["federal_compliance"]["violations"],
            ...$json["state_compliance"]["violations"]
          ];
          
          const remediationPlan = {
            transaction_id: $json["transaction"]["id"],
            total_violations: violations.length,
            critical_violations: violations.filter(v => v.severity === 'critical').length,
            remediation_steps: [],
            estimated_completion: null,
            assigned_to: []
          };
          
          // Generate remediation steps for each violation
          violations.forEach(violation => {
            const steps = getRemediationSteps(violation);
            
            remediationPlan.remediation_steps.push({
              violation_id: violation.rule,
              severity: violation.severity,
              description: violation.description,
              steps: steps.actions,
              deadline: calculateRemediationDeadline(violation.severity),
              responsible_party: steps.responsible,
              automated_actions: steps.automated || []
            });
            
            // Add responsible parties
            if (!remediationPlan.assigned_to.includes(steps.responsible)) {
              remediationPlan.assigned_to.push(steps.responsible);
            }
          });
          
          // Calculate estimated completion time
          const latestDeadline = Math.max(
            ...remediationPlan.remediation_steps.map(s => new Date(s.deadline))
          );
          remediationPlan.estimated_completion = new Date(latestDeadline).toISOString();
          
          // Prioritize critical violations
          remediationPlan.remediation_steps.sort((a, b) => {
            const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
            return severityOrder[a.severity] - severityOrder[b.severity];
          });
          
          return remediationPlan;
        `
      }
    },
    {
      name: 'Create_Audit_Trail',
      type: 'n8n-nodes-base.supabase',
      parameters: {
        operation: 'insert',
        table: 'compliance_audit_trail',
        columns: {
          transaction_id: '={{$json["transaction"]["id"]}}',
          check_timestamp: '={{new Date().toISOString()}}',
          federal_compliance: '={{JSON.stringify($json["federal_compliance"])}}',
          state_compliance: '={{JSON.stringify($json["state_compliance"])}}',
          violations_found: '={{$json["remediation_plan"]["total_violations"]}}',
          critical_violations: '={{$json["remediation_plan"]["critical_violations"]}}',
          remediation_plan: '={{JSON.stringify($json["remediation_plan"])}}',
          compliance_score: '={{$json["federal_compliance"]["compliance_score"]}}',
          checked_by: '={{$json["system_id"] || "automated_system"}}'
        }
      }
    }
  ]
};
Success Criteria
Performance Metrics

Validation Speed: < 500ms per compliance check
Violation Detection: < 2 seconds for comprehensive scan
Report Generation: < 5 seconds for full compliance report
System Availability: 99.99% uptime

Quality Metrics

Rule Coverage: 100% of applicable regulations monitored
Detection Accuracy: 99% accuracy in violation identification
False Positive Rate: < 1% false positives
Audit Trail Completeness: 100% transaction coverage

Business Impact Metrics

Regulatory Violations: 95% reduction in actual violations
Fine Avoidance: $500k+ annual savings from avoided penalties
Compliance Time: 80% reduction in manual compliance review
Risk Mitigation: 90% reduction in compliance-related delays

Testing Requirements
pythondef test_respa_compliance():
    """Test RESPA violation detection"""
    transaction = {
        'referral_fees': [
            {'amount': 500, 'to': 'agent', 'for': 'referral', 'legitimate': False}
        ],
        'financing': True
    }
    
    result = monitor.check_federal_compliance(transaction)
    
    assert len(result['violations']) > 0
    assert any(v['rule'] == 'RESPA_SECTION_8' for v in result['violations'])

def test_fair_housing_detection():
    """Test Fair Housing violation detection"""
    transaction = {
        'communications': [
            {'content': 'Perfect for young couples without children'}
        ]
    }
    
    result = monitor.check_fair_housing_compliance(transaction)
    
    assert len(result['violations']) > 0
    assert result['violations'][0]['type'] == 'fair_housing_violation'

def test_state_disclosure_requirements():
    """Test state-specific disclosure requirements"""
    ca_transaction = {
        'property': {'state': 'CA', 'year_built': 1960},
        'disclosures': ['sellers_disclosure']  # Missing required CA disclosures
    }
    
    result = monitor.check_state_compliance(ca_transaction)
    
    assert 'CA_NATURAL_HAZARD_DISCLOSURE' in [v['rule'] for v in result['violations']]

def test_trid_timeline_compliance():
    """Test TRID timeline requirements"""
    transaction = {
        'loan_application_date': '2024-01-01',
        'loan_estimate_date': '2024-01-08',  # 7 days later (violation)
        'closing_date': '2024-01-20'
    }
    
    rule = ComplianceRule(
        rule_id='TRID_3_DAY_DISCLOSURE',
        category='timeline'
    )
    
    result = monitor.check_timeline_compliance(transaction, rule)
    
    assert result['status'] == 'violation'
    assert result['details']['business_days'] > 3
Implementation Checklist

 Set up compliance rule database
 Build federal regulation engine
 Implement state law matrices
 Create local ordinance tracking
 Build violation detection system
 Implement remediation workflows
 Create audit trail infrastructure
 Set up automated notifications
 Build compliance dashboard
 Implement report generation
 Create training detection models
 Set up continuous rule updates
 Build testing framework
 Deploy monitoring system
 Production rollout with oversight