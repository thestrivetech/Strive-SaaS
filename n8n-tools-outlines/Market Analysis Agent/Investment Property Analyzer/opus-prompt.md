Prompt #13: Investment Property Analyzer (Enhanced)
Role
Senior N8n Real Estate Investment Engineer with expertise in financial modeling, cash flow analysis, portfolio optimization, and automated underwriting systems.
Context

Volume: Analyze 2,000 properties daily, generate 500 detailed investment reports weekly
Performance: Complete analysis in <15 seconds per property, batch processing 100 properties in <5 minutes
Integration: MLS, rental platforms (Rentometer, RentBerry), financing APIs, tax databases, Supabase
Compliance: SEC investment advisory regulations, truth in lending, fair housing laws
Scale: Support 10,000 daily analyses within 6 months, 50,000 within 1 year

Primary Objective
Build an investment property analyzer achieving 90% accuracy in cash flow projections and ROI calculations while providing comprehensive investment recommendations in under 15 seconds.
Enhanced Requirements
Financial Analysis Engine
pythonimport numpy as np
import pandas as pd
from scipy.optimize import minimize
from dataclasses import dataclass
from typing import List, Dict, Optional

@dataclass
class InvestmentProperty:
    purchase_price: float
    rental_income: float
    operating_expenses: Dict[str, float]
    financing: Dict[str, float]
    appreciation_rate: float = 0.03
    rent_growth_rate: float = 0.025
    expense_growth_rate: float = 0.02
    holding_period: int = 5

class InvestmentAnalyzer:
    def __init__(self):
        self.tax_brackets = {
            'federal': [(10000, 0.10), (40000, 0.12), (85000, 0.22), (165000, 0.24)],
            'state': 0.053,  # Example state rate
            'capital_gains': {'short': 0.37, 'long': 0.20}
        }
        
    def calculate_cash_flow(self, property: InvestmentProperty, year: int = 1) -> Dict:
        """
        Calculate detailed cash flow analysis with tax implications
        """
        # Annual rental income with growth
        gross_income = property.rental_income * 12 * (1 + property.rent_growth_rate) ** (year - 1)
        
        # Vacancy and credit loss (market-specific)
        vacancy_rate = self.get_market_vacancy_rate(property.location)
        effective_income = gross_income * (1 - vacancy_rate)
        
        # Operating expenses with inflation
        operating_expenses = sum([
            expense * (1 + property.expense_growth_rate) ** (year - 1)
            for expense in property.operating_expenses.values()
        ])
        
        # Net Operating Income (NOI)
        noi = effective_income - operating_expenses
        
        # Debt service (if financed)
        if property.financing:
            annual_debt_service = self.calculate_debt_service(
                property.financing['loan_amount'],
                property.financing['interest_rate'],
                property.financing['term_years']
            )
        else:
            annual_debt_service = 0
        
        # Before-tax cash flow
        btcf = noi - annual_debt_service
        
        # Tax calculations
        depreciation = property.purchase_price * 0.8 / 27.5  # Residential depreciation
        mortgage_interest = self.calculate_mortgage_interest(
            property.financing['loan_amount'],
            property.financing['interest_rate'],
            year
        )
        
        taxable_income = noi - depreciation - mortgage_interest - operating_expenses
        taxes = self.calculate_taxes(taxable_income)
        
        # After-tax cash flow
        atcf = btcf - taxes
        
        return {
            'gross_income': gross_income,
            'effective_income': effective_income,
            'operating_expenses': operating_expenses,
            'noi': noi,
            'debt_service': annual_debt_service,
            'btcf': btcf,
            'depreciation': depreciation,
            'taxable_income': taxable_income,
            'taxes': taxes,
            'atcf': atcf,
            'cash_on_cash_return': atcf / property.financing['down_payment'] if property.financing else atcf / property.purchase_price
        }
    
    def calculate_irr(self, property: InvestmentProperty) -> float:
        """
        Calculate Internal Rate of Return including sale proceeds
        """
        cash_flows = []
        
        # Initial investment (negative)
        initial_investment = property.financing['down_payment'] if property.financing else property.purchase_price
        cash_flows.append(-initial_investment)
        
        # Annual cash flows
        for year in range(1, property.holding_period + 1):
            cf = self.calculate_cash_flow(property, year)
            
            if year == property.holding_period:
                # Add sale proceeds in final year
                sale_price = property.purchase_price * (1 + property.appreciation_rate) ** property.holding_period
                sale_proceeds = self.calculate_sale_proceeds(property, sale_price)
                cash_flows.append(cf['atcf'] + sale_proceeds)
            else:
                cash_flows.append(cf['atcf'])
        
        return np.irr(cash_flows)
    
    def calculate_brrr_analysis(self, property: Dict) -> Dict:
        """
        Buy, Rehab, Rent, Refinance analysis
        """
        total_investment = property['purchase_price'] + property['rehab_costs']
        after_repair_value = property['arv']
        
        # Refinance calculations (typically 70-80% LTV)
        refinance_amount = after_repair_value * property['refinance_ltv']
        cash_out = refinance_amount - total_investment
        cash_left_in = max(0, total_investment - refinance_amount)
        
        # New loan terms after refinance
        new_monthly_payment = self.calculate_mortgage_payment(
            refinance_amount,
            property['refinance_rate'],
            30
        )
        
        # Cash flow after refinance
        monthly_rent = property['expected_rent']
        monthly_expenses = property['monthly_expenses']
        monthly_cash_flow = monthly_rent - monthly_expenses - new_monthly_payment
        
        # Calculate returns
        annual_cash_flow = monthly_cash_flow * 12
        cash_on_cash_return = annual_cash_flow / cash_left_in if cash_left_in > 0 else float('inf')
        
        return {
            'total_investment': total_investment,
            'arv': after_repair_value,
            'refinance_amount': refinance_amount,
            'cash_out': cash_out,
            'cash_left_in': cash_left_in,
            'monthly_cash_flow': monthly_cash_flow,
            'annual_cash_flow': annual_cash_flow,
            'cash_on_cash_return': cash_on_cash_return,
            'infinite_return': cash_left_in == 0
        }
    
    def optimize_portfolio(self, properties: List[InvestmentProperty], 
                          constraints: Dict) -> Dict:
        """
        Optimize property portfolio using modern portfolio theory
        """
        returns = []
        risks = []
        
        for property in properties:
            irr = self.calculate_irr(property)
            risk = self.calculate_property_risk(property)
            returns.append(irr)
            risks.append(risk)
        
        # Correlation matrix (simplified - would use historical data)
        correlation_matrix = np.eye(len(properties)) * 0.7 + np.ones((len(properties), len(properties))) * 0.3
        
        # Portfolio optimization
        def portfolio_variance(weights):
            return np.dot(weights.T, np.dot(correlation_matrix, weights))
        
        def portfolio_return(weights):
            return np.dot(weights, returns)
        
        # Constraints
        constraints_list = [
            {'type': 'eq', 'fun': lambda x: np.sum(x) - 1},  # Weights sum to 1
            {'type': 'ineq', 'fun': lambda x: x}  # Non-negative weights
        ]
        
        if 'min_return' in constraints:
            constraints_list.append({
                'type': 'ineq',
                'fun': lambda x: portfolio_return(x) - constraints['min_return']
            })
        
        # Optimize for minimum variance
        result = minimize(
            portfolio_variance,
            x0=np.ones(len(properties)) / len(properties),
            constraints=constraints_list,
            bounds=[(0, 1) for _ in properties]
        )
        
        return {
            'optimal_weights': result.x,
            'expected_return': portfolio_return(result.x),
            'portfolio_risk': np.sqrt(portfolio_variance(result.x)),
            'sharpe_ratio': portfolio_return(result.x) / np.sqrt(portfolio_variance(result.x))
        }
N8n Workflow Implementation
javascriptconst investmentAnalysisWorkflow = {
  name: 'Investment_Property_Analyzer',
  nodes: [
    {
      name: 'Property_Input',
      type: 'n8n-nodes-base.webhook',
      parameters: {
        path: 'investment/analyze',
        responseMode: 'responseNode'
      }
    },
    {
      name: 'Fetch_Rental_Comps',
      type: 'n8n-nodes-base.httpRequest',
      parameters: {
        url: '={{$env["RENTOMETER_API"]}}/rent-estimate',
        method: 'POST',
        body: {
          address: '={{$json["property"]["address"]}}',
          bedrooms: '={{$json["property"]["bedrooms"]}}',
          propertyType: '={{$json["property"]["type"]}}'
        }
      }
    },
    {
      name: 'Calculate_Expenses',
      type: 'n8n-nodes-base.function',
      parameters: {
        functionCode: `
          const property = $json["property"];
          const marketData = $json["marketData"];
          
          // Property-specific expense ratios
          const expenseRatios = {
            propertyTax: marketData.taxRate * property.purchasePrice,
            insurance: property.purchasePrice * 0.0035,  // 0.35% of property value
            hoa: property.hoaFees || 0,
            propertyManagement: $json["rentalEstimate"] * 0.08,  // 8% of rent
            maintenance: property.purchasePrice * 0.01,  // 1% rule
            utilities: property.ownerPaidUtilities || 0,
            vacancy: $json["rentalEstimate"] * marketData.vacancyRate,
            capEx: property.purchasePrice * 0.005,  // Capital expenditures
            landscaping: property.lotSize * 0.02 || 50,  // Per sq ft or minimum
            pestControl: 40,
            miscellaneous: 100
          };
          
          const totalMonthlyExpenses = Object.values(expenseRatios)
            .reduce((sum, expense) => sum + (expense / 12), 0);
          
          return {
            expenses: expenseRatios,
            totalMonthly: totalMonthlyExpenses,
            totalAnnual: totalMonthlyExpenses * 12,
            expenseRatio: (totalMonthlyExpenses * 12) / (rentalEstimate * 12)
          };
        `
      }
    },
    {
      name: 'Financing_Scenarios',
      type: 'n8n-nodes-base.function',
      parameters: {
        functionCode: `
          const purchasePrice = $json["property"]["purchasePrice"];
          const scenarios = [];
          
          // Generate multiple financing scenarios
          const ltvOptions = [0.7, 0.75, 0.8, 0.85];  // Loan-to-value ratios
          const rates = await fetchCurrentRates();
          
          for (const ltv of ltvOptions) {
            const loanAmount = purchasePrice * ltv;
            const downPayment = purchasePrice * (1 - ltv);
            
            // Different loan programs
            const programs = [
              { type: 'conventional', rate: rates.conventional[ltv], term: 30 },
              { type: 'conventional', rate: rates.conventional15[ltv], term: 15 },
              { type: 'portfolio', rate: rates.portfolio[ltv], term: 30 },
              { type: 'commercial', rate: rates.commercial[ltv], term: 20 }
            ];
            
            for (const program of programs) {
              const monthlyPayment = calculateMortgagePayment(
                loanAmount,
                program.rate,
                program.term
              );
              
              const cashFlow = $json["rentalEstimate"] - 
                              $json["expenses"]["totalMonthly"] - 
                              monthlyPayment;
              
              scenarios.push({
                loanType: program.type,
                ltv: ltv * 100,
                downPayment: downPayment,
                loanAmount: loanAmount,
                interestRate: program.rate,
                term: program.term,
                monthlyPayment: monthlyPayment,
                cashFlow: cashFlow,
                cashOnCashReturn: (cashFlow * 12) / downPayment,
                dscr: $json["noi"] / (monthlyPayment * 12)
              });
            }
          }
          
          // Sort by cash-on-cash return
          scenarios.sort((a, b) => b.cashOnCashReturn - a.cashOnCashReturn);
          
          return {
            bestScenario: scenarios[0],
            allScenarios: scenarios,
            recommendedLTV: determineBestLTV(scenarios)
          };
        `
      }
    },
    {
      name: 'Investment_Metrics',
      type: 'n8n-nodes-base.python',
      parameters: {
        pythonCode: `
from investment_analyzer import InvestmentAnalyzer
import json

# Parse input data
property_data = json.loads($json["property"])
financing = json.loads($json["financing"]["bestScenario"])
expenses = json.loads($json["expenses"])

# Create investment property object
property = InvestmentProperty(
    purchase_price=property_data["purchasePrice"],
    rental_income=property_data["rentalEstimate"],
    operating_expenses=expenses["expenses"],
    financing=financing
)

analyzer = InvestmentAnalyzer()

# Calculate all metrics
metrics = {
    "cashFlow": analyzer.calculate_cash_flow(property),
    "irr": analyzer.calculate_irr(property),
    "npv": analyzer.calculate_npv(property, discount_rate=0.08),
    "capRate": (property.rental_income * 12 - expenses["totalAnnual"]) / property.purchase_price,
    "grossRentMultiplier": property.purchase_price / (property.rental_income * 12),
    "breakEvenRatio": (expenses["totalAnnual"] + financing["annualDebtService"]) / (property.rental_income * 12),
    "debtCoverageRatio": analyzer.calculate_dscr(property)
}

# 5-year projection
projections = []
for year in range(1, 6):
    projections.append(analyzer.calculate_cash_flow(property, year))

# Investment score (0-100)
investment_score = calculate_investment_score(metrics)

return {
    "metrics": metrics,
    "projections": projections,
    "investmentScore": investment_score,
    "recommendation": generate_recommendation(investment_score, metrics)
}
        `
      }
    },
    {
      name: 'Generate_Report',
      type: 'n8n-nodes-base.function',
      parameters: {
        functionCode: `
          // Create comprehensive investment report
          const report = {
            executive_summary: {
              property: $json["property"]["address"],
              purchase_price: $json["property"]["purchasePrice"],
              investment_score: $json["metrics"]["investmentScore"],
              recommendation: $json["metrics"]["recommendation"],
              key_metrics: {
                cash_flow: $json["metrics"]["cashFlow"]["monthly"],
                cap_rate: $json["metrics"]["capRate"],
                cash_on_cash: $json["financing"]["bestScenario"]["cashOnCashReturn"],
                irr: $json["metrics"]["irr"]
              }
            },
            detailed_analysis: {
              income_analysis: $json["rentalComps"],
              expense_breakdown: $json["expenses"],
              financing_options: $json["financing"]["allScenarios"],
              cash_flow_projections: $json["projections"],
              sensitivity_analysis: $json["sensitivityAnalysis"]
            },
            risk_assessment: $json["riskAssessment"],
            market_analysis: $json["marketAnalysis"],
            appendix: {
              assumptions: $json["assumptions"],
              data_sources: $json["dataSources"],
              disclaimer: generateDisclaimer()
            }
          };
          
          // Generate PDF report
          const pdfUrl = await generatePDF(report, 'investment-analysis-template');
          
          // Store in database
          await storeAnalysis(report);
          
          return {
            reportId: generateReportId(),
            pdfUrl: pdfUrl,
            interactiveUrl: `/reports/investment/${report.id}`,
            summary: report.executive_summary,
            generatedAt: new Date().toISOString()
          };
        `
      }
    }
  ]
};
Success Criteria
Performance Metrics

Analysis Speed: P50 < 10s, P95 < 15s per property
Batch Processing: 100 properties in < 5 minutes
Report Generation: PDF ready in < 3 seconds
API Response: P99 < 1000ms for cached data

Quality Metrics

Cash Flow Accuracy: Within 5% of actual for 90% of properties
ROI Projections: Within 10% accuracy for 1-year projections
Expense Estimates: Within 8% of actual operating expenses
Rental Estimates: Within $100/month for 85% of properties

Business Impact Metrics

Investment Success Rate: 25% improvement in profitable investments
Decision Speed: 75% reduction in analysis time
Portfolio Performance: 20% better returns through optimization
Client Conversion: 40% increase in investment property sales

Testing Requirements
javascriptdescribe('Investment Analysis Tests', () => {
  test('should calculate accurate cash flow', async () => {
    const property = createTestProperty({
      purchasePrice: 300000,
      monthlyRent: 2500,
      expenses: standardExpenses
    });
    
    const analysis = await analyzer.analyze(property);
    
    expect(analysis.cashFlow.monthly).toBeCloseTo(750, 2);
    expect(analysis.capRate).toBeCloseTo(0.065, 3);
    expect(analysis.cashOnCashReturn).toBeCloseTo(0.12, 2);
  });
  
  test('should handle BRRR strategy correctly', async () => {
    const brrrProperty = {
      purchasePrice: 150000,
      rehabCosts: 50000,
      arv: 280000,
      expectedRent: 2200
    };
    
    const analysis = await analyzer.analyzeBRRR(brrrProperty);
    
    expect(analysis.cashOut).toBeGreaterThan(0);
    expect(analysis.infiniteReturn).toBe(true);
  });
});
Implementation Checklist

 Set up investment analysis infrastructure
 Integrate rental comparison APIs
 Build expense calculation engine
 Implement financing scenario generator
 Create cash flow projection system
 Build ROI calculation models
 Implement portfolio optimization
 Create risk assessment framework
 Build report generation system
 Set up data validation and QA
 Implement caching strategy
 Create testing suite
 Deploy staging environment
 Production rollout with monitoring