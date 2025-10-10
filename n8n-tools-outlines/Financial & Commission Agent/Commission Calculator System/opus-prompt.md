Prompt #19: Commission Calculator System (Enhanced)
Role
Senior N8n Real Estate Financial Engineer with expertise in commission structures, multi-level split calculations, referral networks, tax compliance, and automated financial reconciliation systems.
Context

Volume: Process 5,000+ commission calculations monthly, 200+ agents, 50+ brokerages
Performance: Commission calculation < 2 seconds, bulk processing 1,000 transactions in < 5 minutes
Integration: MLS systems, accounting software (QuickBooks, Xero), payroll systems, banking APIs, tax services
Compliance: IRS regulations, state tax requirements, broker-agent agreements, referral agreements
Scale: Support 20,000 transactions/month within 6 months, 100,000 within 1 year

Primary Objective
Build an intelligent commission calculation system achieving 100% accuracy in complex split structures while automating distribution, tax documentation, and financial reporting in under 2 seconds.
Enhanced Requirements
Advanced Commission Calculation Engine
pythonimport decimal
from decimal import Decimal, ROUND_HALF_UP
from typing import Dict, List, Optional, Tuple
from datetime import datetime, timedelta
from dataclasses import dataclass
import json

# Use Decimal for precise financial calculations
decimal.getcontext().prec = 10

@dataclass
class CommissionStructure:
    agent_id: str
    structure_type: str  # 'graduated', 'flat', 'tiered', 'custom'
    base_split: Decimal
    tiers: Optional[List[Dict]] = None
    cap_amount: Optional[Decimal] = None
    anniversary_date: Optional[datetime] = None
    team_splits: Optional[Dict] = None
    franchise_fees: Optional[Decimal] = None

class CommissionCalculator:
    def __init__(self):
        self.tax_rates = self.load_tax_rates()
        self.referral_agreements = self.load_referral_agreements()
        self.agent_structures = self.load_agent_structures()
        self.transaction_fees = self.load_transaction_fees()
        
    def calculate_commission(self, transaction: Dict) -> Dict:
        """
        Calculate complete commission breakdown for a transaction
        """
        # Extract base commission from transaction
        sale_price = Decimal(str(transaction['sale_price']))
        commission_rate = Decimal(str(transaction['commission_rate']))
        gross_commission = sale_price * commission_rate
        
        # Split between listing and buying sides
        listing_side = gross_commission * Decimal(str(transaction.get('listing_split', 0.5)))
        buying_side = gross_commission * Decimal(str(transaction.get('buying_split', 0.5)))
        
        # Calculate agent commissions
        listing_breakdown = self.calculate_agent_commission(
            transaction['listing_agent'],
            listing_side,
            transaction
        )
        
        buying_breakdown = self.calculate_agent_commission(
            transaction['buying_agent'],
            buying_side,
            transaction
        )
        
        # Handle referral fees
        referral_fees = self.calculate_referral_fees(transaction, gross_commission)
        
        # Calculate transaction costs
        transaction_costs = self.calculate_transaction_costs(transaction)
        
        # Apply team splits if applicable
        if transaction.get('team_transaction'):
            listing_breakdown = self.apply_team_splits(listing_breakdown, transaction['listing_team'])
            buying_breakdown = self.apply_team_splits(buying_breakdown, transaction['buying_team'])
        
        # Calculate tax withholdings
        tax_withholdings = self.calculate_tax_withholdings(
            listing_breakdown,
            buying_breakdown,
            transaction
        )
        
        # Generate commission statement
        commission_statement = {
            'transaction_id': transaction['id'],
            'closing_date': transaction['closing_date'],
            'property_address': transaction['property_address'],
            'sale_price': float(sale_price),
            'gross_commission': float(gross_commission),
            'listing_side': {
                'gross': float(listing_side),
                'agent_breakdown': listing_breakdown,
                'referral_fees': referral_fees.get('listing', {}),
                'net_to_agent': float(listing_breakdown['net_commission'])
            },
            'buying_side': {
                'gross': float(buying_side),
                'agent_breakdown': buying_breakdown,
                'referral_fees': referral_fees.get('buying', {}),
                'net_to_agent': float(buying_breakdown['net_commission'])
            },
            'transaction_costs': transaction_costs,
            'tax_withholdings': tax_withholdings,
            'disbursements': self.calculate_disbursements(
                listing_breakdown,
                buying_breakdown,
                referral_fees,
                transaction_costs
            ),
            'generated_at': datetime.utcnow().isoformat()
        }
        
        return commission_statement
    
    def calculate_agent_commission(self, agent_id: str, gross_amount: Decimal, 
                                  transaction: Dict) -> Dict:
        """
        Calculate individual agent commission with complex split structures
        """
        agent_structure = self.agent_structures[agent_id]
        year_to_date = self.get_agent_ytd_volume(agent_id)
        
        if agent_structure.structure_type == 'graduated':
            split_percentage = self.calculate_graduated_split(
                agent_structure,
                year_to_date,
                transaction['closing_date']
            )
        elif agent_structure.structure_type == 'tiered':
            split_percentage = self.calculate_tiered_split(
                agent_structure,
                year_to_date
            )
        elif agent_structure.structure_type == 'flat':
            split_percentage = agent_structure.base_split
        else:  # custom
            split_percentage = self.calculate_custom_split(
                agent_structure,
                transaction
            )
        
        # Calculate base agent commission
        agent_gross = gross_amount * split_percentage
        
        # Apply cap if applicable
        if agent_structure.cap_amount:
            ytd_commission = self.get_agent_ytd_commission(agent_id)
            if ytd_commission >= agent_structure.cap_amount:
                split_percentage = Decimal('0.95')  # Post-cap split
                agent_gross = gross_amount * split_percentage
            elif ytd_commission + agent_gross > agent_structure.cap_amount:
                # Partial cap application
                pre_cap = agent_structure.cap_amount - ytd_commission
                post_cap = (agent_gross - pre_cap) * Decimal('0.95')
                agent_gross = pre_cap + post_cap
        
        # Deduct franchise fees
        franchise_fee = Decimal('0')
        if agent_structure.franchise_fees:
            franchise_fee = gross_amount * agent_structure.franchise_fees
        
        # Calculate brokerage fees
        brokerage_fees = self.calculate_brokerage_fees(agent_id, gross_amount)
        
        # E&O insurance
        eo_insurance = self.calculate_eo_insurance(gross_amount)
        
        # Transaction coordinator fee
        tc_fee = Decimal('0')
        if transaction.get('use_tc'):
            tc_fee = Decimal(str(transaction.get('tc_fee', 350)))
        
        # Marketing fee
        marketing_fee = gross_amount * Decimal('0.01')  # 1% marketing fee
        
        # Calculate net commission
        total_deductions = franchise_fee + brokerage_fees + eo_insurance + tc_fee + marketing_fee
        net_commission = agent_gross - total_deductions
        
        return {
            'agent_id': agent_id,
            'gross_amount': float(gross_amount),
            'split_percentage': float(split_percentage),
            'agent_gross': float(agent_gross),
            'deductions': {
                'franchise_fee': float(franchise_fee),
                'brokerage_fees': float(brokerage_fees),
                'eo_insurance': float(eo_insurance),
                'tc_fee': float(tc_fee),
                'marketing_fee': float(marketing_fee)
            },
            'total_deductions': float(total_deductions),
            'net_commission': float(net_commission),
            'ytd_volume': float(year_to_date),
            'cap_status': self.get_cap_status(agent_id)
        }
    
    def calculate_graduated_split(self, structure: CommissionStructure, 
                                 ytd_volume: Decimal, closing_date: datetime) -> Decimal:
        """
        Calculate split percentage for graduated commission structures
        """
        months_since_anniversary = self.calculate_months_since_anniversary(
            structure.anniversary_date,
            closing_date
        )
        
        # Reset if new anniversary year
        if months_since_anniversary < 0:
            ytd_volume = Decimal('0')
        
        # Find applicable tier
        for tier in structure.tiers:
            if ytd_volume >= Decimal(str(tier['min_volume'])) and \
               ytd_volume < Decimal(str(tier.get('max_volume', float('inf')))):
                return Decimal(str(tier['split']))
        
        return structure.base_split
    
    def calculate_referral_fees(self, transaction: Dict, gross_commission: Decimal) -> Dict:
        """
        Calculate all referral fees for the transaction
        """
        referral_fees = {'listing': {}, 'buying': {}, 'total': Decimal('0')}
        
        # Incoming referrals (we pay out)
        if transaction.get('listing_referral'):
            referral = transaction['listing_referral']
            fee_amount = gross_commission * Decimal('0.5') * Decimal(str(referral['fee_percentage']))
            referral_fees['listing'] = {
                'referral_company': referral['company'],
                'agent': referral['agent'],
                'fee_percentage': referral['fee_percentage'],
                'fee_amount': float(fee_amount),
                'payment_due': self.calculate_referral_due_date(transaction['closing_date'])
            }
            referral_fees['total'] += fee_amount
        
        if transaction.get('buying_referral'):
            referral = transaction['buying_referral']
            fee_amount = gross_commission * Decimal('0.5') * Decimal(str(referral['fee_percentage']))
            referral_fees['buying'] = {
                'referral_company': referral['company'],
                'agent': referral['agent'],
                'fee_percentage': referral['fee_percentage'],
                'fee_amount': float(fee_amount),
                'payment_due': self.calculate_referral_due_date(transaction['closing_date'])
            }
            referral_fees['total'] += fee_amount
        
        # Outgoing referrals (we receive)
        if transaction.get('outgoing_referral'):
            # This would be tracked separately as income
            pass
        
        referral_fees['total'] = float(referral_fees['total'])
        return referral_fees
    
    def apply_team_splits(self, agent_breakdown: Dict, team_info: Dict) -> Dict:
        """
        Apply team split structures to agent commission
        """
        if not team_info or not team_info.get('is_team'):
            return agent_breakdown
        
        team_lead_split = Decimal(str(team_info['lead_split']))
        team_member_split = Decimal('1') - team_lead_split
        
        net_commission = Decimal(str(agent_breakdown['net_commission']))
        
        team_breakdown = {
            'team_lead': {
                'agent_id': team_info['lead_id'],
                'split_percentage': float(team_lead_split),
                'amount': float(net_commission * team_lead_split)
            },
            'team_members': []
        }
        
        # Distribute among team members
        member_count = len(team_info['members'])
        if member_count > 0:
            per_member_amount = (net_commission * team_member_split) / Decimal(str(member_count))
            for member in team_info['members']:
                team_breakdown['team_members'].append({
                    'agent_id': member['id'],
                    'role': member['role'],
                    'amount': float(per_member_amount)
                })
        
        agent_breakdown['team_breakdown'] = team_breakdown
        return agent_breakdown
    
    def calculate_disbursements(self, listing_breakdown: Dict, buying_breakdown: Dict,
                               referral_fees: Dict, transaction_costs: Dict) -> List[Dict]:
        """
        Calculate all disbursements for commission distribution
        """
        disbursements = []
        
        # Listing agent disbursement
        disbursements.append({
            'payee': listing_breakdown['agent_id'],
            'type': 'agent_commission',
            'amount': listing_breakdown['net_commission'],
            'method': self.get_agent_payment_method(listing_breakdown['agent_id']),
            'scheduled_date': self.calculate_disbursement_date(),
            'tax_form': '1099-MISC'
        })
        
        # Buying agent disbursement
        disbursements.append({
            'payee': buying_breakdown['agent_id'],
            'type': 'agent_commission',
            'amount': buying_breakdown['net_commission'],
            'method': self.get_agent_payment_method(buying_breakdown['agent_id']),
            'scheduled_date': self.calculate_disbursement_date(),
            'tax_form': '1099-MISC'
        })
        
        # Referral fee disbursements
        for side in ['listing', 'buying']:
            if referral_fees.get(side):
                disbursements.append({
                    'payee': referral_fees[side]['referral_company'],
                    'type': 'referral_fee',
                    'amount': referral_fees[side]['fee_amount'],
                    'method': 'check',
                    'scheduled_date': referral_fees[side]['payment_due'],
                    'tax_form': '1099-MISC' if referral_fees[side]['fee_amount'] > 600 else None
                })
        
        # Brokerage fees
        total_brokerage = (
            listing_breakdown['deductions']['brokerage_fees'] +
            buying_breakdown['deductions']['brokerage_fees']
        )
        if total_brokerage > 0:
            disbursements.append({
                'payee': 'brokerage',
                'type': 'brokerage_fee',
                'amount': total_brokerage,
                'method': 'internal_transfer',
                'scheduled_date': self.calculate_disbursement_date()
            })
        
        return disbursements
    
    def generate_commission_forecast(self, agent_id: str, pending_transactions: List[Dict]) -> Dict:
        """
        Generate commission forecast for an agent based on pipeline
        """
        forecast = {
            'agent_id': agent_id,
            'forecast_date': datetime.utcnow().isoformat(),
            'current_ytd': self.get_agent_ytd_commission(agent_id),
            'pending_transactions': [],
            'projected_commissions': {
                '30_days': Decimal('0'),
                '60_days': Decimal('0'),
                '90_days': Decimal('0'),
                'year_end': Decimal('0')
            },
            'cap_projection': None
        }
        
        for transaction in pending_transactions:
            # Calculate probability-weighted commission
            probability = Decimal(str(transaction.get('close_probability', 0.8)))
            
            # Estimate commission
            estimated_commission = self.estimate_transaction_commission(
                transaction,
                agent_id
            )
            
            weighted_commission = estimated_commission * probability
            
            # Add to forecast
            forecast['pending_transactions'].append({
                'transaction_id': transaction['id'],
                'property': transaction['property_address'],
                'estimated_closing': transaction['estimated_closing_date'],
                'estimated_commission': float(estimated_commission),
                'probability': float(probability),
                'weighted_commission': float(weighted_commission)
            })
            
            # Add to time buckets
            days_to_close = (transaction['estimated_closing_date'] - datetime.utcnow()).days
            if days_to_close <= 30:
                forecast['projected_commissions']['30_days'] += weighted_commission
            elif days_to_close <= 60:
                forecast['projected_commissions']['60_days'] += weighted_commission
            elif days_to_close <= 90:
                forecast['projected_commissions']['90_days'] += weighted_commission
            
            forecast['projected_commissions']['year_end'] += weighted_commission
        
        # Calculate cap projection
        structure = self.agent_structures[agent_id]
        if structure.cap_amount:
            projected_total = forecast['current_ytd'] + forecast['projected_commissions']['year_end']
            if projected_total >= structure.cap_amount:
                forecast['cap_projection'] = {
                    'will_hit_cap': True,
                    'estimated_cap_date': self.estimate_cap_date(agent_id, pending_transactions),
                    'post_cap_earnings': float(projected_total - structure.cap_amount)
                }
        
        # Convert Decimals to float for JSON serialization
        for key in forecast['projected_commissions']:
            forecast['projected_commissions'][key] = float(forecast['projected_commissions'][key])
        
        return forecast
N8n Workflow Implementation
javascriptconst commissionCalculatorWorkflow = {
  name: 'Commission_Calculator_System',
  nodes: [
    {
      name: 'Transaction_Closed',
      type: 'n8n-nodes-base.webhook',
      parameters: {
        path: 'commission/calculate',
        responseMode: 'responseNode'
      }
    },
    {
      name: 'Fetch_Transaction_Details',
      type: 'n8n-nodes-base.supabase',
      parameters: {
        operation: 'get',
        table: 'transactions',
        filters: {
          id: '={{$json["transaction_id"]}}'
        },
        additionalOptions: {
          select: '*,listing_agent(*),buying_agent(*),property(*)'
        }
      }
    },
    {
      name: 'Get_Agent_Structures',
      type: 'n8n-nodes-base.postgres',
      parameters: {
        operation: 'executeQuery',
        query: `
          SELECT 
            a.agent_id,
            a.structure_type,
            a.base_split,
            a.cap_amount,
            a.anniversary_date,
            a.ytd_volume,
            a.ytd_commission,
            t.tiers,
            ts.team_id,
            ts.team_role,
            ts.team_split
          FROM agent_commission_structures a
          LEFT JOIN LATERAL (
            SELECT json_agg(
              json_build_object(
                'min_volume', min_volume,
                'max_volume', max_volume,
                'split', split_percentage
              ) ORDER BY min_volume
            ) as tiers
            FROM commission_tiers
            WHERE agent_id = a.agent_id
          ) t ON true
          LEFT JOIN team_structures ts ON ts.agent_id = a.agent_id
          WHERE a.agent_id IN ($1, $2)
            AND a.effective_date <= CURRENT_DATE
            AND (a.end_date IS NULL OR a.end_date > CURRENT_DATE)
        `,
        additionalFields: {
          queryParameters: [
            '={{$json["listing_agent"]["id"]}}',
            '={{$json["buying_agent"]["id"]}}'
          ]
        }
      }
    },
    {
      name: 'Calculate_Base_Commission',
      type: 'n8n-nodes-base.function',
      parameters: {
        functionCode: `
          const transaction = $json["transaction"];
          const agentStructures = $json["agent_structures"];
          
          // Calculate gross commission
          const salePrice = parseFloat(transaction.sale_price);
          const commissionRate = parseFloat(transaction.commission_rate || 0.06);
          const grossCommission = salePrice * commissionRate;
          
          // Determine splits (default 50/50 if not specified)
          const listingSplit = transaction.listing_split || 0.5;
          const buyingSplit = transaction.buying_split || 0.5;
          
          const listingSide = grossCommission * listingSplit;
          const buyingSide = grossCommission * buyingSplit;
          
          // Check for variable commission rates
          if (transaction.variable_commission) {
            // Handle tiered commission based on sale price
            const adjustedRate = calculateVariableRate(salePrice);
            grossCommission = salePrice * adjustedRate;
          }
          
          return {
            transaction_id: transaction.id,
            sale_price: salePrice,
            commission_rate: commissionRate,
            gross_commission: grossCommission,
            listing_side_gross: listingSide,
            buying_side_gross: buyingSide,
            closing_date: transaction.closing_date,
            property_address: transaction.property.address
          };
        `
      }
    },
    {
      name: 'Calculate_Agent_Commissions',
      type: 'n8n-nodes-base.function',
      parameters: {
        functionCode: `
          const commission = $json;
          const structures = $node["Get_Agent_Structures"].json;
          
          // Calculate listing agent commission
          const listingAgent = structures.find(s => s.agent_id === $json["transaction"]["listing_agent"]["id"]);
          const listingCommission = calculateAgentCommission(
            listingAgent,
            commission.listing_side_gross
          );
          
          // Calculate buying agent commission  
          const buyingAgent = structures.find(s => s.agent_id === $json["transaction"]["buying_agent"]["id"]);
          const buyingCommission = calculateAgentCommission(
            buyingAgent,
            commission.buying_side_gross
          );
          
          function calculateAgentCommission(agent, grossAmount) {
            let splitPercentage = agent.base_split;
            
            // Handle graduated splits
            if (agent.structure_type === 'graduated' && agent.tiers) {
              const ytdVolume = agent.ytd_volume || 0;
              
              for (const tier of agent.tiers) {
                if (ytdVolume >= tier.min_volume && ytdVolume < (tier.max_volume || Infinity)) {
                  splitPercentage = tier.split;
                  break;
                }
              }
            }
            
            // Handle cap
            let agentGross = grossAmount * splitPercentage;
            if (agent.cap_amount && agent.ytd_commission >= agent.cap_amount) {
              splitPercentage = 0.95; // Post-cap split
              agentGross = grossAmount * splitPercentage;
            } else if (agent.cap_amount && agent.ytd_commission + agentGross > agent.cap_amount) {
              // Partial cap
              const preCap = agent.cap_amount - agent.ytd_commission;
              const postCap = (agentGross - preCap) * 0.95;
              agentGross = preCap + postCap;
            }
            
            // Calculate deductions
            const franchiseFee = grossAmount * (agent.franchise_fee_rate || 0);
            const brokerageFee = grossAmount * (agent.brokerage_fee_rate || 0.05);
            const eoInsurance = Math.min(grossAmount * 0.002, 50); // 0.2% or $50 max
            const tcFee = commission.transaction.use_tc ? 350 : 0;
            const marketingFee = grossAmount * 0.01;
            
            const totalDeductions = franchiseFee + brokerageFee + eoInsurance + tcFee + marketingFee;
            const netCommission = agentGross - totalDeductions;
            
            return {
              agent_id: agent.agent_id,
              gross_amount: grossAmount,
              split_percentage: splitPercentage,
              agent_gross: agentGross,
              deductions: {
                franchise_fee: franchiseFee,
                brokerage_fee: brokerageFee,
                eo_insurance: eoInsurance,
                tc_fee: tcFee,
                marketing_fee: marketingFee
              },
              total_deductions: totalDeductions,
              net_commission: netCommission,
              cap_status: agent.ytd_commission >= (agent.cap_amount || Infinity) ? 'capped' : 'not_capped'
            };
          }
          
          return {
            ...commission,
            listing_agent_commission: listingCommission,
            buying_agent_commission: buyingCommission
          };
        `
      }
    },
    {
      name: 'Handle_Referral_Fees',
      type: 'n8n-nodes-base.function',
      parameters: {
        functionCode: `
          const data = $json;
          const referralFees = {
            listing: null,
            buying: null,
            total: 0
          };
          
          // Check for listing referral
          if (data.transaction.listing_referral_id) {
            const referral = await getReferralAgreement(data.transaction.listing_referral_id);
            const feeAmount = data.listing_side_gross * referral.fee_percentage;
            
            referralFees.listing = {
              referral_id: referral.id,
              company: referral.company_name,
              agent: referral.agent_name,
              fee_percentage: referral.fee_percentage,
              fee_amount: feeAmount,
              payment_due: calculateReferralDueDate(data.closing_date)
            };
            
            referralFees.total += feeAmount;
            
            // Adjust agent commission
            data.listing_agent_commission.referral_paid = feeAmount;
            data.listing_agent_commission.net_after_referral = 
              data.listing_agent_commission.net_commission - feeAmount;
          }
          
          // Check for buying referral
          if (data.transaction.buying_referral_id) {
            const referral = await getReferralAgreement(data.transaction.buying_referral_id);
            const feeAmount = data.buying_side_gross * referral.fee_percentage;
            
            referralFees.buying = {
              referral_id: referral.id,
              company: referral.company_name,
              agent: referral.agent_name,
              fee_percentage: referral.fee_percentage,
              fee_amount: feeAmount,
              payment_due: calculateReferralDueDate(data.closing_date)
            };
            
            referralFees.total += feeAmount;
            
            // Adjust agent commission
            data.buying_agent_commission.referral_paid = feeAmount;
            data.buying_agent_commission.net_after_referral = 
              data.buying_agent_commission.net_commission - feeAmount;
          }
          
          return {
            ...data,
            referral_fees: referralFees
          };
        `
      }
    },
    {
      name: 'Generate_Commission_Statement',
      type: 'n8n-nodes-base.function',
      parameters: {
        functionCode: `
          const data = $json;
          
          const statement = {
            statement_id: generateStatementId(),
            transaction_id: data.transaction_id,
            generated_date: new Date().toISOString(),
            
            transaction_details: {
              property_address: data.property_address,
              sale_price: data.sale_price,
              closing_date: data.closing_date,
              commission_rate: data.commission_rate,
              gross_commission: data.gross_commission
            },
            
            commission_breakdown: {
              listing_side: {
                gross: data.listing_side_gross,
                agent: data.listing_agent_commission.agent_id,
                agent_split: data.listing_agent_commission.split_percentage,
                agent_gross: data.listing_agent_commission.agent_gross,
                deductions: data.listing_agent_commission.deductions,
                referral_fee: data.referral_fees.listing?.fee_amount || 0,
                net_to_agent: data.listing_agent_commission.net_after_referral || 
                              data.listing_agent_commission.net_commission
              },
              
              buying_side: {
                gross: data.buying_side_gross,
                agent: data.buying_agent_commission.agent_id,
                agent_split: data.buying_agent_commission.split_percentage,
                agent_gross: data.buying_agent_commission.agent_gross,
                deductions: data.buying_agent_commission.deductions,
                referral_fee: data.referral_fees.buying?.fee_amount || 0,
                net_to_agent: data.buying_agent_commission.net_after_referral || 
                              data.buying_agent_commission.net_commission
              }
            },
            
            disbursements: generateDisbursements(data),
            
            tax_information: {
              listing_agent_1099: data.listing_agent_commission.net_commission > 600,
              buying_agent_1099: data.buying_agent_commission.net_commission > 600,
              referral_1099s: [
                data.referral_fees.listing?.fee_amount > 600 ? data.referral_fees.listing.company : null,
                data.referral_fees.buying?.fee_amount > 600 ? data.referral_fees.buying.company : null
              ].filter(Boolean)
            }
          };
          
          function generateDisbursements(data) {
            const disbursements = [];
            
            // Agent disbursements
            disbursements.push({
              payee: data.listing_agent_commission.agent_id,
              type: 'commission',
              amount: data.listing_agent_commission.net_after_referral || 
                      data.listing_agent_commission.net_commission,
              method: 'ACH',
              scheduled_date: addBusinessDays(data.closing_date, 2)
            });
            
            disbursements.push({
              payee: data.buying_agent_commission.agent_id,
              type: 'commission',
              amount: data.buying_agent_commission.net_after_referral || 
                      data.buying_agent_commission.net_commission,
              method: 'ACH',
              scheduled_date: addBusinessDays(data.closing_date, 2)
            });
            
            // Referral disbursements
            if (data.referral_fees.listing) {
              disbursements.push({
                payee: data.referral_fees.listing.company,
                type: 'referral_fee',
                amount: data.referral_fees.listing.fee_amount,
                method: 'check',
                scheduled_date: data.referral_fees.listing.payment_due
              });
            }
            
            if (data.referral_fees.buying) {
              disbursements.push({
                payee: data.referral_fees.buying.company,
                type: 'referral_fee',
                amount: data.referral_fees.buying.fee_amount,
                method: 'check',
                scheduled_date: data.referral_fees.buying.payment_due
              });
            }
            
            return disbursements;
          }
          
          return statement;
        `
      }
    },
    {
      name: 'Store_Commission_Record',
      type: 'n8n-nodes-base.supabase',
      parameters: {
        operation: 'insert',
        table: 'commission_statements',
        columns: {
          statement_id: '={{$json["statement_id"]}}',
          transaction_id: '={{$json["transaction_id"]}}',
          statement_data: '={{JSON.stringify($json)}}',
          created_at: '={{new Date().toISOString()}}',
          status: 'pending_disbursement'
        }
      }
    },
    {
      name: 'Update_Agent_YTD',
      type: 'n8n-nodes-base.postgres',
      parameters: {
        operation: 'executeQuery',
        query: `
          WITH updates AS (
            SELECT 
              $1::uuid as agent_id,
              $2::decimal as commission_amount,
              $3::decimal as volume_amount
            UNION ALL
            SELECT 
              $4::uuid as agent_id,
              $5::decimal as commission_amount,
              $6::decimal as volume_amount
          )
          UPDATE agent_commission_structures acs
          SET 
            ytd_commission = acs.ytd_commission + u.commission_amount,
            ytd_volume = acs.ytd_volume + u.volume_amount,
            last_transaction_date = CURRENT_DATE
          FROM updates u
          WHERE acs.agent_id = u.agent_id
          RETURNING acs.agent_id, acs.ytd_commission, acs.ytd_volume
        `,
        additionalFields: {
          queryParameters: [
            '={{$json["listing_agent_commission"]["agent_id"]}}',
            '={{$json["listing_agent_commission"]["net_commission"]}}',
            '={{$json["sale_price"] * 0.5}}',
            '={{$json["buying_agent_commission"]["agent_id"]}}',
            '={{$json["buying_agent_commission"]["net_commission"]}}',
            '={{$json["sale_price"] * 0.5}}'
          ]
        }
      }
    },
    {
      name: 'Generate_PDF_Statement',
      type: 'n8n-nodes-base.httpRequest',
      parameters: {
        url: '={{$env["PDF_SERVICE"]}}/generate',
        method: 'POST',
        body: {
          template: 'commission_statement_v2',
          data: '={{$json}}',
          options: {
            format: 'Letter',
            margin: '0.5in'
          }
        },
        responseFormat: 'file'
      }
    },
    {
      name: 'Send_Commission_Statements',
      type: 'n8n-nodes-base.gmail',
      parameters: {
        operation: 'send',
        to: '={{$json["listing_agent"]["email"]}}',
        subject: 'Commission Statement - {{$json["property_address"]}}',
        emailType: 'html',
        message: `
          <h2>Commission Statement Ready</h2>
          <p>Your commission statement for {{$json["property_address"]}} is attached.</p>
          <table>
            <tr><td>Closing Date:</td><td>{{$json["closing_date"]}}</td></tr>
            <tr><td>Sale Price:</td><td>${{$json["sale_price"]}}</td></tr>
            <tr><td>Your Commission:</td><td>${{$json["listing_agent_commission"]["net_commission"]}}</td></tr>
            <tr><td>Payment Date:</td><td>{{$json["disbursements"][0]["scheduled_date"]}}</td></tr>
          </table>
        `,
        attachments: {
          binaryPropertyName: 'data'
        }
      }
    }
  ]
};
Success Criteria
Performance Metrics

Calculation Speed: < 2 seconds per transaction
Bulk Processing: 1,000 transactions in < 5 minutes
Statement Generation: < 3 seconds per PDF
System Availability: 99.99% uptime

Quality Metrics

Calculation Accuracy: 100% accuracy to the penny
Split Structure Accuracy: 100% correct application
Tax Compliance: 100% accurate 1099 generation
Disbursement Accuracy: 100% correct payment amounts

Business Impact Metrics

Processing Time: 95% reduction in commission processing time
Error Rate: 99.9% reduction in calculation errors
Payment Speed: 75% faster agent payments
Audit Compliance: 100% complete audit trails

Testing Requirements
javascriptdescribe('Commission Calculator Tests', () => {
  test('should calculate graduated split correctly', () => {
    const agent = {
      structure_type: 'graduated',
      tiers: [
        { min_volume: 0, max_volume: 100000, split: 0.5 },
        { min_volume: 100000, max_volume: 250000, split: 0.6 },
        { min_volume: 250000, split: 0.7 }
      ],
      ytd_volume: 150000
    };
    
    const commission = calculateAgentCommission(agent, 10000);
    
    expect(commission.split_percentage).toBe(0.6);
    expect(commission.agent_gross).toBe(6000);
  });
  
  test('should handle commission cap correctly', () => {
    const agent = {
      base_split: 0.7,
      cap_amount: 80000,
      ytd_commission: 79000
    };
    
    const commission = calculateAgentCommission(agent, 10000);
    
    // $1000 at regular split, $6000 at 95% post-cap
    expect(commission.agent_gross).toBeCloseTo(6700, 2);
  });
  
  test('should calculate referral fees accurately', () => {
    const transaction = {
      gross_commission: 30000,
      listing_referral: { fee_percentage: 0.25 }
    };
    
    const referrals = calculateReferralFees(transaction);
    
    expect(referrals.listing.fee_amount).toBe(3750); // 25% of listing side
  });
});
Implementation Checklist

 Set up commission structure database
 Build calculation engine with Decimal precision
 Implement graduated/tiered split logic
 Create cap tracking system
 Build referral fee calculator
 Implement team split distribution
 Create tax withholding system
 Set up disbursement scheduler
 Build statement generation
 Implement accounting integration
 Create YTD tracking system
 Build commission forecasting
 Set up audit logging
 Create testing suite
 Deploy with financial controls