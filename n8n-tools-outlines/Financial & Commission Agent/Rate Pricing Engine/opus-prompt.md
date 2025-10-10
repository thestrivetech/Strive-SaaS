Prompt #20: Rate Pricing Engine (Enhanced)
Role
Senior N8n Mortgage Rate Integration Engineer specializing in real-time rate aggregation, loan product comparison, automated underwriting integration, and predictive rate modeling.
Context

Volume: Process 10,000+ rate quotes daily, integrate with 20+ lenders
Performance: Real-time rate quotes < 2 seconds, comparison generation < 5 seconds
Integration: Lender APIs, credit bureaus, MLS, CRM, loan origination systems
Compliance: TILA, RESPA, Fair Lending laws, state licensing requirements
Scale: Support 50,000 quotes daily within 6 months, 200,000 within 1 year

Primary Objective
Build a dynamic rate pricing engine achieving real-time rate accuracy while providing comprehensive loan comparisons and pre-qualification decisions in under 5 seconds.
Enhanced Requirements
Real-Time Rate Aggregation System
pythonimport asyncio
import aiohttp
from typing import Dict, List, Optional, Tuple
from datetime import datetime, timedelta
from decimal import Decimal
import numpy as np
from dataclasses import dataclass
import redis
import json

@dataclass
class LoanScenario:
    loan_amount: Decimal
    purchase_price: Decimal
    property_type: str
    occupancy: str
    credit_score: int
    debt_to_income: Decimal
    loan_type: str
    term_years: int

class RatePricingEngine:
    def __init__(self):
        self.lender_apis = self.initialize_lender_connections()
        self.redis_cache = redis.Redis(decode_responses=True)
        self.rate_predictor = self.load_rate_prediction_model()
        self.underwriting_rules = self.load_underwriting_rules()
        
    async def get_real_time_rates(self, scenario: LoanScenario) -> Dict:
        """
        Fetch real-time rates from multiple lenders
        """
        # Check cache first
        cache_key = self.generate_cache_key(scenario)
        cached_rates = self.redis_cache.get(cache_key)
        
        if cached_rates and self.is_cache_valid(cache_key):
            return json.loads(cached_rates)
        
        # Fetch rates from all lenders in parallel
        tasks = []
        for lender_id, lender_api in self.lender_apis.items():
            task = self.fetch_lender_rates(lender_id, lender_api, scenario)
            tasks.append(task)
        
        # Wait for all rates with timeout
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Process and normalize rates
        all_rates = []
        for result in results:
            if isinstance(result, Exception):
                continue
            if result:
                all_rates.extend(result)
        
        # Apply adjustments and pricing
        adjusted_rates = self.apply_rate_adjustments(all_rates, scenario)
        
        # Sort by best rate
        adjusted_rates.sort(key=lambda x: x['apr'])
        
        # Enhance with additional calculations
        enhanced_rates = self.enhance_rate_data(adjusted_rates, scenario)
        
        # Cache results
        self.redis_cache.setex(
            cache_key,
            300,  # 5 minute cache
            json.dumps(enhanced_rates)
        )
        
        return {
            'scenario': scenario.__dict__,
            'rates': enhanced_rates,
            'fetched_at': datetime.utcnow().isoformat(),
            'lenders_queried': len(self.lender_apis),
            'rates_returned': len(enhanced_rates)
        }
    
    async def fetch_lender_rates(self, lender_id: str, lender_api: Dict, 
                                scenario: LoanScenario) -> List[Dict]:
        """
        Fetch rates from individual lender API
        """
        try:
            async with aiohttp.ClientSession() as session:
                # Build lender-specific request
                request_data = self.build_lender_request(lender_id, scenario)
                
                async with session.post(
                    lender_api['endpoint'],
                    json=request_data,
                    headers={'Authorization': f"Bearer {lender_api['token']}"},
                    timeout=aiohttp.ClientTimeout(total=3)
                ) as response:
                    
                    if response.status == 200:
                        data = await response.json()
                        return self.parse_lender_response(lender_id, data)
                    else:
                        return []
                        
        except asyncio.TimeoutError:
            # Log timeout but continue
            return []
        except Exception as e:
            # Log error but continue
            return []
    
    def apply_rate_adjustments(self, rates: List[Dict], scenario: LoanScenario) -> List[Dict]:
        """
        Apply loan-level price adjustments (LLPAs) and risk-based pricing
        """
        adjusted_rates = []
        
        for rate in rates:
            adjusted_rate = rate.copy()
            
            # Credit score adjustment
            credit_adjustment = self.calculate_credit_adjustment(
                scenario.credit_score,
                rate['loan_type']
            )
            
            # LTV adjustment
            ltv = float(scenario.loan_amount / scenario.purchase_price)
            ltv_adjustment = self.calculate_ltv_adjustment(ltv, rate['loan_type'])
            
            # Property type adjustment
            property_adjustment = 0
            if scenario.property_type == 'condo':
                property_adjustment = 0.25
            elif scenario.property_type == 'multi-family':
                property_adjustment = 0.375
            
            # Occupancy adjustment
            occupancy_adjustment = 0
            if scenario.occupancy == 'investment':
                occupancy_adjustment = 0.75
            elif scenario.occupancy == 'second_home':
                occupancy_adjustment = 0.375
            
            # Cash-out refinance adjustment
            cashout_adjustment = 0
            if rate.get('purpose') == 'cash_out':
                cashout_adjustment = self.calculate_cashout_adjustment(ltv, scenario.credit_score)
            
            # Apply all adjustments
            total_adjustment = (
                credit_adjustment + 
                ltv_adjustment + 
                property_adjustment + 
                occupancy_adjustment + 
                cashout_adjustment
            )
            
            adjusted_rate['rate'] = rate['rate'] + total_adjustment
            adjusted_rate['points'] = rate.get('points', 0)
            adjusted_rate['adjustments'] = {
                'credit': credit_adjustment,
                'ltv': ltv_adjustment,
                'property': property_adjustment,
                'occupancy': occupancy_adjustment,
                'cashout': cashout_adjustment,
                'total': total_adjustment
            }
            
            # Recalculate APR with adjustments
            adjusted_rate['apr'] = self.calculate_apr(
                adjusted_rate['rate'],
                scenario.loan_amount,
                adjusted_rate['points'],
                rate.get('fees', {}),
                scenario.term_years
            )
            
            adjusted_rates.append(adjusted_rate)
        
        return adjusted_rates
    
    def enhance_rate_data(self, rates: List[Dict], scenario: LoanScenario) -> List[Dict]:
        """
        Add payment calculations and comparison metrics
        """
        enhanced_rates = []
        
        for rate in rates:
            enhanced_rate = rate.copy()
            
            # Calculate monthly payment
            monthly_payment = self.calculate_monthly_payment(
                scenario.loan_amount,
                rate['rate'],
                scenario.term_years
            )
            
            # Calculate total interest
            total_payments = monthly_payment * scenario.term_years * 12
            total_interest = total_payments - scenario.loan_amount
            
            # Calculate closing costs
            closing_costs = self.calculate_closing_costs(
                scenario.loan_amount,
                rate.get('points', 0),
                rate.get('fees', {})
            )
            
            # Cash to close
            down_payment = scenario.purchase_price - scenario.loan_amount
            cash_to_close = down_payment + closing_costs
            
            # Break-even analysis if paying points
            break_even_months = None
            if rate.get('points', 0) > 0:
                no_points_payment = self.calculate_monthly_payment(
                    scenario.loan_amount,
                    rate['rate'] + 0.25,  # Typical rate without points
                    scenario.term_years
                )
                monthly_savings = no_points_payment - monthly_payment
                if monthly_savings > 0:
                    points_cost = scenario.loan_amount * rate['points'] / 100
                    break_even_months = int(points_cost / monthly_savings)
            
            enhanced_rate.update({
                'monthly_payment': float(monthly_payment),
                'total_payments': float(total_payments),
                'total_interest': float(total_interest),
                'closing_costs': float(closing_costs),
                'cash_to_close': float(cash_to_close),
                'break_even_months': break_even_months,
                'ltv': float(scenario.loan_amount / scenario.purchase_price) * 100,
                'dti': float(scenario.debt_to_income)
            })
            
            # Add pre-qualification status
            enhanced_rate['qualification'] = self.check_qualification(
                enhanced_rate,
                scenario
            )
            
            enhanced_rates.append(enhanced_rate)
        
        return enhanced_rates
    
    def check_qualification(self, rate: Dict, scenario: LoanScenario) -> Dict:
        """
        Check if borrower qualifies for the loan program
        """
        qualification = {
            'status': 'qualified',
            'issues': [],
            'conditions': []
        }
        
        # Check DTI limits
        max_dti = self.get_max_dti(rate['loan_type'], scenario.credit_score)
        if scenario.debt_to_income > max_dti:
            qualification['status'] = 'conditional'
            qualification['issues'].append(f'DTI {scenario.debt_to_income}% exceeds limit {max_dti}%')
        
        # Check credit score minimums
        min_score = self.get_min_credit_score(rate['loan_type'], rate['ltv'])
        if scenario.credit_score < min_score:
            qualification['status'] = 'not_qualified'
            qualification['issues'].append(f'Credit score {scenario.credit_score} below minimum {min_score}')
        
        # Check LTV limits
        max_ltv = self.get_max_ltv(rate['loan_type'], scenario.property_type, scenario.occupancy)
        if rate['ltv'] > max_ltv:
            qualification['status'] = 'not_qualified'
            qualification['issues'].append(f'LTV {rate["ltv"]}% exceeds limit {max_ltv}%')
        
        # Check loan limits
        loan_limit = self.get_loan_limit(rate['loan_type'], scenario.property_type)
        if scenario.loan_amount > loan_limit:
            qualification['status'] = 'not_qualified'
            qualification['issues'].append(f'Loan amount exceeds {rate["loan_type"]} limit of ${loan_limit:,}')
        
        # Add standard conditions
        if qualification['status'] == 'qualified':
            qualification['conditions'] = [
                'Income verification required',
                'Asset verification required',
                'Property appraisal required',
                'Title insurance required'
            ]
        
        return qualification
    
    def generate_rate_comparison(self, rates: List[Dict]) -> Dict:
        """
        Generate comprehensive rate comparison analysis
        """
        if not rates:
            return {}
        
        comparison = {
            'best_rate': min(rates, key=lambda x: x['rate']),
            'best_apr': min(rates, key=lambda x: x['apr']),
            'lowest_payment': min(rates, key=lambda x: x['monthly_payment']),
            'lowest_closing': min(rates, key=lambda x: x['closing_costs']),
            'statistics': {
                'rate_range': {
                    'min': min(r['rate'] for r in rates),
                    'max': max(r['rate'] for r in rates),
                    'average': sum(r['rate'] for r in rates) / len(rates)
                },
                'payment_range': {
                    'min': min(r['monthly_payment'] for r in rates),
                    'max': max(r['monthly_payment'] for r in rates),
                    'average': sum(r['monthly_payment'] for r in rates) / len(rates)
                }
            }
        }
        
        # Group by loan type
        by_loan_type = {}
        for rate in rates:
            loan_type = rate['loan_type']
            if loan_type not in by_loan_type:
                by_loan_type[loan_type] = []
            by_loan_type[loan_type].append(rate)
        
        comparison['by_loan_type'] = {
            loan_type: {
                'count': len(rates_list),
                'best_rate': min(rates_list, key=lambda x: x['rate'])['rate'],
                'best_lender': min(rates_list, key=lambda x: x['rate'])['lender']
            }
            for loan_type, rates_list in by_loan_type.items()
        }
        
        return comparison
N8n Workflow Implementation
javascriptconst ratePricingWorkflow = {
  name: 'Rate_Pricing_Engine',
  nodes: [
    {
      name: 'Rate_Request',
      type: 'n8n-nodes-base.webhook',
      parameters: {
        path: 'rates/quote',
        responseMode: 'responseNode'
      }
    },
    {
      name: 'Validate_Scenario',
      type: 'n8n-nodes-base.function',
      parameters: {
        functionCode: `
          const scenario = $json;
          const errors = [];
          
          // Validate required fields
          if (!scenario.loan_amount || scenario.loan_amount < 50000) {
            errors.push('Invalid loan amount');
          }
          
          if (!scenario.purchase_price || scenario.purchase_price < scenario.loan_amount) {
            errors.push('Purchase price must be greater than loan amount');
          }
          
          if (!scenario.credit_score || scenario.credit_score < 300 || scenario.credit_score > 850) {
            errors.push('Invalid credit score');
          }
          
          // Calculate LTV
          const ltv = (scenario.loan_amount / scenario.purchase_price) * 100;
          if (ltv > 97) {
            errors.push(\`LTV \${ltv.toFixed(1)}% exceeds maximum\`);
          }
          
          // Validate DTI
          if (scenario.debt_to_income > 50) {
            errors.push(\`DTI \${scenario.debt_to_income}% exceeds maximum\`);
          }
          
          if (errors.length > 0) {
            throw new Error(errors.join(', '));
          }
          
          return {
            ...scenario,
            ltv: ltv,
            down_payment: scenario.purchase_price - scenario.loan_amount,
            down_payment_percentage: ((scenario.purchase_price - scenario.loan_amount) / scenario.purchase_price) * 100
          };
        `
      }
    },
    {
      name: 'Check_Rate_Cache',
      type: 'n8n-nodes-base.redis',
      parameters: {
        operation: 'get',
        key: '={{`rates:${JSON.stringify($json)}`}}',
        options: {
          expire: false,
          rawData: true
        }
      }
    },
    {
      name: 'Fetch_Lender_Rates',
      type: 'n8n-nodes-base.httpRequestBatch',
      parameters: {
        batchSize: 10,
        requests: [
          {
            url: '{{$env["LENDER_API_1"]}}/rates',
            method: 'POST',
            body: '={{$json}}',
            headers: {
              'X-API-Key': '{{$env["LENDER_1_KEY"]}}'
            }
          },
          {
            url: '{{$env["LENDER_API_2"]}}/rates',
            method: 'POST',
            body: '={{$json}}',
            headers: {
              'Authorization': 'Bearer {{$env["LENDER_2_TOKEN"]}}'
            }
          },
          // Add more lender APIs...
        ],
        options: {
          timeout: 3000,
          parallel: true
        }
      }
    },
    {
      name: 'Normalize_Rates',
      type: 'n8n-nodes-base.function',
      parameters: {
        functionCode: `
          const lenderResponses = $json["responses"];
          const scenario = $json["scenario"];
          const normalizedRates = [];
          
          // Process each lender response
          lenderResponses.forEach((response, index) => {
            if (response.success && response.data.rates) {
              const lenderRates = normalizeLenderRates(response.data, index);
              normalizedRates.push(...lenderRates);
            }
          });
          
          function normalizeLenderRates(data, lenderId) {
            return data.rates.map(rate => ({
              lender: data.lender_name || \`Lender \${lenderId + 1}\`,
              lender_id: data.lender_id || \`lender_\${lenderId + 1}\`,
              loan_type: mapLoanType(rate.product_name),
              rate: parseFloat(rate.interest_rate || rate.rate),
              apr: parseFloat(rate.apr),
              points: parseFloat(rate.points || 0),
              fees: {
                origination: rate.origination_fee || 0,
                processing: rate.processing_fee || 295,
                underwriting: rate.underwriting_fee || 595,
                appraisal: rate.appraisal_fee || 550,
                credit_report: rate.credit_fee || 35,
                title: estimateTitleFees(scenario.loan_amount),
                recording: 150,
                other: rate.other_fees || 0
              },
              term: rate.term || 360,
              lock_period: rate.lock_days || 30,
              requirements: rate.requirements || []
            }));
          }
          
          function mapLoanType(productName) {
            const mapping = {
              'Conventional': 'conventional',
              'FHA': 'fha',
              'VA': 'va',
              'USDA': 'usda',
              'Jumbo': 'jumbo',
              'Non-QM': 'non_qm'
            };
            
            for (const [key, value] of Object.entries(mapping)) {
              if (productName.includes(key)) {
                return value;
              }
            }
            return 'conventional';
          }
          
          function estimateTitleFees(loanAmount) {
            // Title insurance estimate based on loan amount
            if (loanAmount < 100000) return 850;
            if (loanAmount < 250000) return 1250;
            if (loanAmount < 500000) return 1750;
            if (loanAmount < 1000000) return 2500;
            return 3500;
          }
          
          return {
            scenario: scenario,
            rates: normalizedRates,
            lenders_contacted: lenderResponses.length,
            successful_responses: lenderResponses.filter(r => r.success).length
          };
        `
      }
    },
    {
      name: 'Apply_Pricing_Adjustments',
      type: 'n8n-nodes-base.function',
      parameters: {
        functionCode: `
          const data = $json;
          const scenario = data.scenario;
          const adjustedRates = [];
          
          data.rates.forEach(rate => {
            const adjustedRate = {...rate};
            let totalAdjustment = 0;
            
            // Credit score adjustments (LLPAs)
            const creditAdjustment = getCreditAdjustment(scenario.credit_score, scenario.ltv, rate.loan_type);
            totalAdjustment += creditAdjustment;
            
            // Property type adjustment
            if (scenario.property_type === 'condo') {
              totalAdjustment += 0.25;
            } else if (scenario.property_type === 'multi_family') {
              totalAdjustment += 0.5;
            }
            
            // Occupancy adjustment
            if (scenario.occupancy === 'investment') {
              totalAdjustment += 0.75;
            } else if (scenario.occupancy === 'second_home') {
              totalAdjustment += 0.375;
            }
            
            // High balance adjustment (for conforming loans approaching jumbo limit)
            if (rate.loan_type === 'conventional' && scenario.loan_amount > 647200) {
              totalAdjustment += 0.25;
            }
            
            // Apply adjustments
            adjustedRate.base_rate = rate.rate;
            adjustedRate.rate = rate.rate + totalAdjustment;
            adjustedRate.adjustments = {
              credit: creditAdjustment,
              property: scenario.property_type === 'condo' ? 0.25 : 0,
              occupancy: scenario.occupancy === 'investment' ? 0.75 : 
                        scenario.occupancy === 'second_home' ? 0.375 : 0,
              total: totalAdjustment
            };
            
            // Recalculate APR
            adjustedRate.apr = calculateAPR(
              adjustedRate.rate,
              scenario.loan_amount,
              adjustedRate.points,
              adjustedRate.fees,
              adjustedRate.term
            );
            
            adjustedRates.push(adjustedRate);
          });
          
          function getCreditAdjustment(creditScore, ltv, loanType) {
            // Simplified LLPA matrix
            if (loanType === 'fha' || loanType === 'va') return 0;
            
            if (creditScore >= 740 && ltv <= 60) return -0.25;
            if (creditScore >= 740 && ltv <= 75) return 0;
            if (creditScore >= 740 && ltv <= 80) return 0.125;
            if (creditScore >= 720 && ltv <= 80) return 0.25;
            if (creditScore >= 700 && ltv <= 80) return 0.5;
            if (creditScore >= 680 && ltv <= 80) return 0.75;
            if (creditScore >= 660 && ltv <= 80) return 1.25;
            if (creditScore >= 640 && ltv <= 80) return 1.75;
            
            return 2.0; // Below 640 or high LTV
          }
          
          function calculateAPR(rate, loanAmount, points, fees, termMonths) {
            const totalFees = Object.values(fees).reduce((sum, fee) => sum + fee, 0) + 
                              (points * loanAmount / 100);
            const effectiveLoanAmount = loanAmount - totalFees;
            
            // Simplified APR calculation
            const monthlyRate = rate / 100 / 12;
            const payment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, termMonths)) / 
                           (Math.pow(1 + monthlyRate, termMonths) - 1);
            
            // Iterative APR calculation (simplified)
            let apr = rate;
            let diff = 1;
            let iteration = 0;
            
            while (Math.abs(diff) > 0.00001 && iteration < 100) {
              const aprMonthly = apr / 100 / 12;
              const aprPayment = effectiveLoanAmount * 
                                (aprMonthly * Math.pow(1 + aprMonthly, termMonths)) / 
                                (Math.pow(1 + aprMonthly, termMonths) - 1);
              
              diff = aprPayment - payment;
              apr = apr - (diff * 0.001);
              iteration++;
            }
            
            return Math.round(apr * 1000) / 1000;
          }
          
          return {
            ...data,
            rates: adjustedRates
          };
        `
      }
    },
    {
      name: 'Calculate_Payments',
      type: 'n8n-nodes-base.function',
      parameters: {
        functionCode: `
          const data = $json;
          const scenario = data.scenario;
          
          const enhancedRates = data.rates.map(rate => {
            // Monthly payment calculation
            const monthlyRate = rate.rate / 100 / 12;
            const numPayments = rate.term;
            const monthlyPayment = scenario.loan_amount * 
                                  (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
                                  (Math.pow(1 + monthlyRate, numPayments) - 1);
            
            // Total costs
            const totalPayments = monthlyPayment * numPayments;
            const totalInterest = totalPayments - scenario.loan_amount;
            
            // Closing costs
            const pointsCost = (rate.points * scenario.loan_amount) / 100;
            const totalFees = Object.values(rate.fees).reduce((sum, fee) => sum + fee, 0);
            const totalClosingCosts = pointsCost + totalFees;
            
            // Cash to close
            const cashToClose = scenario.down_payment + totalClosingCosts;
            
            // Break-even analysis for points
            let breakEvenMonths = null;
            if (rate.points > 0) {
              // Find similar rate without points
              const noPointsRate = data.rates.find(r => 
                r.lender === rate.lender && 
                r.loan_type === rate.loan_type && 
                r.points === 0
              );
              
              if (noPointsRate) {
                const noPointsPayment = scenario.loan_amount * 
                  ((noPointsRate.rate / 100 / 12) * Math.pow(1 + (noPointsRate.rate / 100 / 12), numPayments)) /
                  (Math.pow(1 + (noPointsRate.rate / 100 / 12), numPayments) - 1);
                
                const monthlySavings = noPointsPayment - monthlyPayment;
                if (monthlySavings > 0) {
                  breakEvenMonths = Math.ceil(pointsCost / monthlySavings);
                }
              }
            }
            
            return {
              ...rate,
              monthly_payment: Math.round(monthlyPayment * 100) / 100,
              total_payments: Math.round(totalPayments),
              total_interest: Math.round(totalInterest),
              closing_costs: Math.round(totalClosingCosts),
              cash_to_close: Math.round(cashToClose),
              break_even_months: breakEvenMonths,
              effective_rate: ((totalInterest + totalClosingCosts) / scenario.loan_amount / (rate.term / 12)) * 100
            };
          });
          
          // Sort by APR
          enhancedRates.sort((a, b) => a.apr - b.apr);
          
          return {
            ...data,
            rates: enhancedRates,
            best_rate: enhancedRates.reduce((best, rate) => 
              rate.rate < best.rate ? rate : best
            ),
            best_payment: enhancedRates.reduce((best, rate) =>
              rate.monthly_payment < best.monthly_payment ? rate : best  
            ),
            best_closing: enhancedRates.reduce((best, rate) =>
              rate.closing_costs < best.closing_costs ? rate : best
            )
          };
        `
      }
    },
    {
      name: 'Store_Rate_Quote',
      type: 'n8n-nodes-base.supabase',
      parameters: {
        operation: 'insert',
        table: 'rate_quotes',
        columns: {
          quote_id: '={{generateId()}}',
          scenario: '={{JSON.stringify($json["scenario"])}}',
          rates: '={{JSON.stringify($json["rates"])}}',
          best_rate: '={{$json["best_rate"]["rate"]}}',
          best_payment: '={{$json["best_payment"]["monthly_payment"]}}',
          created_at: '={{new Date().toISOString()}}',
          expires_at: '={{new Date(Date.now() + 30 * 60000).toISOString()}}'
        }
      }
    },
    {
      name: 'Cache_Results',
      type: 'n8n-nodes-base.redis',
      parameters: {
        operation: 'set',
        key: '={{`rates:${JSON.stringify($json["scenario"])}`}}',
        value: '={{JSON.stringify($json)}}',
        expire: true,
        ttl: 300
      }
    }
  ]
};
Success Criteria
Performance Metrics

Rate Quote Speed: < 2 seconds for initial quote
Cached Response: < 100ms for cached scenarios
Lender API Success: >95% successful responses
System Availability: 99.95% uptime

Quality Metrics

Rate Accuracy: 100% match with lender rates
Calculation Accuracy: 100% accurate payment calculations
Comparison Completeness: All eligible programs included
Qualification Accuracy: 95% match with actual underwriting

Business Impact Metrics

Lead Conversion: 35% improvement in mortgage lead conversion
Client Satisfaction: 4.8/5 rating on rate shopping experience
Referral Generation: 50% increase in lender referrals
Revenue Per Lead: $500 average commission per closed loan

Testing Requirements
pythondef test_rate_calculation():
    """Test accurate rate and payment calculations"""
    scenario = LoanScenario(
        loan_amount=Decimal('400000'),
        purchase_price=Decimal('500000'),
        credit_score=740,
        loan_type='conventional'
    )
    
    rate = 6.5
    payment = calculate_monthly_payment(scenario.loan_amount, rate, 30)
    
    assert abs(payment - 2528.27) < 0.01

def test_llpa_adjustments():
    """Test loan-level price adjustments"""
    adjustment = calculate_credit_adjustment(
        credit_score=680,
        ltv=85,
        loan_type='conventional'
    )
    
    assert adjustment == 1.25  # Expected LLPA for this scenario

def test_qualification_logic():
    """Test loan qualification rules"""
    scenario = LoanScenario(
        loan_amount=Decimal('600000'),
        purchase_price=Decimal('750000'),
        credit_score=620,
        debt_to_income=Decimal('45')
    )
    
    qualification = check_qualification(scenario, 'fha')
    
    assert qualification['status'] == 'not_qualified'
    assert 'credit score' in qualification['issues'][0].lower()
Implementation Checklist

 Set up lender API integrations
 Build rate aggregation system
 Implement caching strategy
 Create LLPA adjustment engine
 Build payment calculator
 Implement qualification rules
 Create comparison engine
 Set up rate lock tracking
 Build pre-approval system
 Create lender portal
 Implement rate alerts
 Build reporting system
 Create API documentation
 Set up monitoring
 Deploy with load balancing
