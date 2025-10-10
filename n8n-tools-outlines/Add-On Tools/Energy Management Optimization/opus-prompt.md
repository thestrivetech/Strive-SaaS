Prompt #40: Energy Management Optimization (Enhanced)
Role
N8n Energy Management & Sustainability Engineering Specialist with expertise in IoT integration, machine learning-based optimization, and utility market dynamics
Context

Volume: 500+ properties, 10,000+ IoT devices, 50,000+ daily sensor readings
Performance: Real-time optimization decisions < 100ms, batch analytics < 5 seconds
Integration: Nest, Ecobee, Honeywell APIs, utility providers (ConEd, PG&E, etc.), solar inverters, Tesla Powerwall
Compliance: Energy Star certification, LEED requirements, local demand response programs
Scale: 30% annual property growth, 100% smart device adoption target

Primary Objective
Reduce energy costs by 35% while maintaining 95% tenant comfort satisfaction through intelligent HVAC optimization and demand response participation.
Enhanced Requirements
Smart Device Integration & Control

Multi-Brand Thermostat Integration

javascript// N8n Function Node: Smart Thermostat Controller
const thermostatController = {
  nest: {
    endpoint: 'https://smartdevicemanagement.googleapis.com/v1',
    auth: {
      type: 'OAuth2',
      clientId: '{{$credentials.nest.clientId}}',
      clientSecret: '{{$credentials.nest.clientSecret}}',
      scope: 'sdm.service'
    },
    rateLimit: {
      requests: 60,
      window: 60000, // 1 minute
      backoff: 'exponential'
    }
  },
  ecobee: {
    endpoint: 'https://api.ecobee.com/1',
    auth: {
      type: 'Bearer',
      token: '{{$credentials.ecobee.accessToken}}'
    },
    rateLimit: {
      requests: 500,
      window: 3600000 // 1 hour
    }
  }
};

// Unified device control function
async function setTemperature(deviceId, deviceType, targetTemp, mode) {
  const controller = thermostatController[deviceType];
  
  // Implement retry logic with circuit breaker
  const circuitBreaker = {
    failureCount: 0,
    lastFailTime: null,
    threshold: 3,
    timeout: 30000
  };
  
  try {
    // Check circuit breaker status
    if (circuitBreaker.failureCount >= circuitBreaker.threshold) {
      const timeSinceLastFail = Date.now() - circuitBreaker.lastFailTime;
      if (timeSinceLastFail < circuitBreaker.timeout) {
        throw new Error(`Circuit breaker open for ${deviceType}`);
      }
      circuitBreaker.failureCount = 0;
    }
    
    const response = await $http.request({
      method: 'POST',
      url: `${controller.endpoint}/devices/${deviceId}/command`,
      headers: {
        'Authorization': controller.auth.type === 'Bearer' 
          ? `Bearer ${controller.auth.token}` 
          : undefined
      },
      body: {
        command: 'sdm.devices.commands.ThermostatTemperatureSetpoint.SetRange',
        params: {
          heatCelsius: mode === 'heat' ? targetTemp : targetTemp - 2,
          coolCelsius: mode === 'cool' ? targetTemp : targetTemp + 2
        }
      }
    });
    
    // Reset circuit breaker on success
    circuitBreaker.failureCount = 0;
    return response;
    
  } catch (error) {
    circuitBreaker.failureCount++;
    circuitBreaker.lastFailTime = Date.now();
    
    // Log to monitoring system
    await $workflow.execute('error-logger', {
      service: 'thermostat-control',
      error: error.message,
      deviceId,
      timestamp: new Date().toISOString()
    });
    
    throw error;
  }
}

return { setTemperature };
Architecture Decision:

Rationale: Unified control layer abstracts device-specific APIs
Alternatives considered: Direct API integration, third-party aggregators
Trade-offs: Added complexity vs. flexibility and maintainability

Machine Learning Optimization Engine

Predictive HVAC Scheduling

python# N8n Python Code Node: ML Optimization Algorithm
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from datetime import datetime, timedelta
import joblib

class HVACOptimizer:
    def __init__(self):
        self.comfort_model = joblib.load('/models/comfort_predictor.pkl')
        self.energy_model = joblib.load('/models/energy_consumption.pkl')
        self.occupancy_model = joblib.load('/models/occupancy_forecast.pkl')
        
    def optimize_schedule(self, property_data):
        """
        Generate optimal HVAC schedule balancing comfort and energy costs
        
        Inputs:
        - property_data: Dict with occupancy patterns, weather forecast, utility rates
        
        Returns:
        - schedule: 24-hour temperature setpoint schedule
        - savings: Estimated cost savings
        - comfort_score: Predicted comfort satisfaction (0-100)
        """
        
        # Feature engineering
        features = self.extract_features(property_data)
        
        # Predict occupancy for next 24 hours
        occupancy_forecast = self.occupancy_model.predict(
            features['temporal_features']
        )
        
        # Initialize optimization parameters
        temp_range = np.arange(65, 78, 0.5)  # Temperature search space
        time_slots = 96  # 15-minute intervals for 24 hours
        
        # Dynamic programming optimization
        schedule = np.zeros(time_slots)
        total_cost = 0
        comfort_scores = []
        
        for t in range(time_slots):
            if occupancy_forecast[t] > 0.3:  # Occupied threshold
                # Optimize for comfort when occupied
                target_temp = self.optimize_comfort(
                    features['weather'][t],
                    features['humidity'][t]
                )
                weight_comfort = 0.8
                weight_cost = 0.2
            else:
                # Optimize for energy savings when unoccupied
                target_temp = self.optimize_energy(
                    features['weather'][t],
                    features['utility_rate'][t]
                )
                weight_comfort = 0.2
                weight_cost = 0.8
            
            # Calculate optimal setpoint
            costs = []
            comfort_preds = []
            
            for temp in temp_range:
                energy_use = self.energy_model.predict([[
                    temp,
                    features['weather'][t],
                    features['building_mass'],
                    features['insulation_r_value']
                ]])[0]
                
                cost = energy_use * features['utility_rate'][t]
                comfort = self.comfort_model.predict([[
                    temp,
                    features['humidity'][t],
                    features['air_quality'][t]
                ]])[0]
                
                costs.append(cost)
                comfort_preds.append(comfort)
            
            # Multi-objective optimization
            scores = weight_cost * (1 - np.array(costs)/max(costs)) + \
                    weight_comfort * np.array(comfort_preds)/100
            
            optimal_idx = np.argmax(scores)
            schedule[t] = temp_range[optimal_idx]
            total_cost += costs[optimal_idx]
            comfort_scores.append(comfort_preds[optimal_idx])
        
        # Calculate savings vs baseline
        baseline_cost = self.calculate_baseline_cost(property_data)
        savings = baseline_cost - total_cost
        
        return {
            'schedule': schedule.tolist(),
            'estimated_savings': round(savings, 2),
            'comfort_score': round(np.mean(comfort_scores), 1),
            'peak_reduction': self.calculate_peak_reduction(schedule),
            'carbon_reduction': self.estimate_carbon_savings(savings)
        }
    
    def extract_features(self, property_data):
        """Extract and engineer features for ML models"""
        return {
            'temporal_features': self.create_temporal_features(),
            'weather': property_data['weather_forecast'],
            'humidity': property_data['humidity_forecast'],
            'utility_rate': property_data['time_of_use_rates'],
            'building_mass': property_data['building']['thermal_mass'],
            'insulation_r_value': property_data['building']['r_value'],
            'air_quality': property_data['indoor_air_quality']
        }

optimizer = HVACOptimizer()
result = optimizer.optimize_schedule($input.property_data)
return result
Demand Response & Grid Integration

Automated Demand Response Participation

javascript// N8n Function Node: Demand Response Controller
const demandResponse = {
  async handleDREvent(event) {
    const strategy = this.selectStrategy(event);
    const affectedProperties = await this.identifyParticipants(event);
    
    const responses = await Promise.all(
      affectedProperties.map(async (property) => {
        try {
          // Calculate load shed potential
          const baseline = await this.getBaseline(property.id);
          const shedPotential = baseline * strategy.reductionTarget;
          
          // Implement load shedding
          const actions = [];
          
          // 1. Pre-cooling/heating strategy
          if (event.startTime - Date.now() > 3600000) { // 1 hour advance notice
            actions.push(await this.preCool(property, event));
          }
          
          // 2. Temperature setback
          actions.push({
            type: 'setback',
            devices: property.thermostats,
            adjustment: strategy.tempAdjustment,
            duration: event.duration
          });
          
          // 3. Cycling strategy for large loads
          if (property.hasPool || property.hasEVCharger) {
            actions.push({
              type: 'cycle',
              devices: property.largLoads,
              cycleTime: 15, // minutes on
              offTime: 15    // minutes off
            });
          }
          
          // 4. Solar + battery optimization
          if (property.hasSolar && property.hasBattery) {
            actions.push({
              type: 'battery_discharge',
              power: property.battery.maxDischarge,
              duration: event.duration,
              gridExport: event.allowsExport
            });
          }
          
          // Execute actions
          const results = await this.executeActions(property, actions);
          
          // Calculate incentive payment
          const actualReduction = await this.measureReduction(
            property.id,
            event.startTime,
            event.endTime
          );
          
          const payment = this.calculateIncentive(
            actualReduction,
            event.incentiveRate
          );
          
          return {
            propertyId: property.id,
            reduction: actualReduction,
            payment: payment,
            tenantImpact: await this.assessTenantImpact(property.id)
          };
          
        } catch (error) {
          console.error(`DR failed for property ${property.id}:`, error);
          return {
            propertyId: property.id,
            error: error.message,
            status: 'failed'
          };
        }
      })
    );
    
    // Report to utility
    await this.reportToUtility(event.id, responses);
    
    // Generate summary
    return {
      eventId: event.id,
      totalReduction: responses.reduce((sum, r) => sum + (r.reduction || 0), 0),
      totalPayment: responses.reduce((sum, r) => sum + (r.payment || 0), 0),
      participationRate: responses.filter(r => !r.error).length / responses.length,
      averageTenantImpact: this.calculateAverageImpact(responses)
    };
  },
  
  selectStrategy(event) {
    // Strategy selection based on event characteristics
    const strategies = {
      critical: {
        reductionTarget: 0.5,  // 50% reduction
        tempAdjustment: 4,      // 4°F adjustment
        allowOverride: false
      },
      moderate: {
        reductionTarget: 0.3,   // 30% reduction
        tempAdjustment: 3,      // 3°F adjustment
        allowOverride: true
      },
      economic: {
        reductionTarget: 0.2,   // 20% reduction
        tempAdjustment: 2,      // 2°F adjustment
        allowOverride: true
      }
    };
    
    // Select based on price signal
    if (event.priceMultiplier > 5) return strategies.critical;
    if (event.priceMultiplier > 2) return strategies.moderate;
    return strategies.economic;
  }
};

return demandResponse.handleDREvent($input.drEvent);
Technical Specifications
API Definition
typescript// Energy Management API Types
interface EnergyOptimizationRequest {
  propertyId: string;
  optimizationType: 'cost' | 'comfort' | 'balanced' | 'sustainability';
  constraints: {
    minTemp: number;        // Minimum allowed temperature (°F)
    maxTemp: number;        // Maximum allowed temperature (°F)
    maxDailyBudget?: number; // Maximum daily energy spend ($)
    comfortPriority?: number; // 0-1 scale
    carbonTarget?: number;   // Daily CO2 target (kg)
  };
  timeRange: {
    start: Date;
    end: Date;
  };
  occupancySchedule?: OccupancyPattern[];
  weatherForecast?: WeatherData[];
  utilityRates: TimeOfUseRate[];
}

interface EnergyOptimizationResponse {
  status: 'success' | 'partial' | 'failed';
  schedule: {
    timestamp: Date;
    setpoint: number;
    mode: 'heat' | 'cool' | 'auto' | 'off';
    confidence: number;  // 0-1 confidence in prediction
  }[];
  metrics: {
    estimatedCost: number;
    estimatedSavings: number;
    savingsPercentage: number;
    comfortScore: number;      // 0-100
    peakReduction: number;      // kW
    carbonReduction: number;    // kg CO2
    demandResponseEarnings: number;
  };
  recommendations: {
    immediate: string[];        // Actions to take now
    scheduled: {               // Future actions
      time: Date;
      action: string;
      impact: 'high' | 'medium' | 'low';
    }[];
    longTerm: string[];        // Infrastructure improvements
  };
  warnings?: string[];
}

interface DemandResponseEvent {
  eventId: string;
  utilityProvider: string;
  startTime: Date;
  endTime: Date;
  duration: number;            // minutes
  priceMultiplier: number;     // e.g., 3x normal rate
  incentiveRate: number;       // $/kWh reduced
  reductionTarget?: number;    // kW target
  allowsExport: boolean;       // Can export battery to grid
  eventType: 'critical' | 'economic' | 'test';
}
Success Criteria
Performance Metrics

Response Time: P95 < 100ms for control commands, P99 < 200ms
Throughput: 1,000 optimization calculations/second
Availability: 99.95% uptime (26 minutes downtime/month max)
Data Processing: 50,000 sensor readings/minute

Quality Metrics

Energy Savings: >35% reduction in energy costs
Comfort Satisfaction: >95% tenant satisfaction score
Forecast Accuracy: >90% for 24-hour energy predictions
DR Participation: >80% successful event participation

Business Impact Metrics

Cost Savings: $2,500/property/year average
ROI: 180% within 18 months
Carbon Reduction: 30% decrease in CO2 emissions
Revenue Generation: $500/property/year from demand response

Testing Requirements
Unit Tests
javascript// Test: HVAC Optimization Algorithm
describe('HVAC Optimization Tests', () => {
  test('should optimize for comfort during occupied hours', async () => {
    // Arrange
    const mockData = {
      occupancy: 0.8,
      weather: 32, // Cold weather
      humidity: 45,
      utilityRate: 0.12
    };
    
    // Act
    const result = await optimizer.optimizeSetpoint(mockData);
    
    // Assert
    expect(result.setpoint).toBeGreaterThanOrEqual(68);
    expect(result.setpoint).toBeLessThanOrEqual(72);
    expect(result.comfortScore).toBeGreaterThan(85);
  });
  
  test('should reduce energy during unoccupied periods', async () => {
    // Arrange
    const mockData = {
      occupancy: 0.1,
      weather: 85, // Hot weather
      humidity: 60,
      utilityRate: 0.25 // Peak rate
    };
    
    // Act
    const result = await optimizer.optimizeSetpoint(mockData);
    
    // Assert
    expect(result.setpoint).toBeGreaterThanOrEqual(78);
    expect(result.estimatedCost).toBeLessThan(2.00);
  });
  
  test('should participate in demand response events', async () => {
    // Arrange
    const drEvent = {
      eventId: 'DR-2024-001',
      priceMultiplier: 4,
      reductionTarget: 100, // kW
      duration: 120 // minutes
    };
    
    // Act
    const response = await demandResponse.handleEvent(drEvent);
    
    // Assert
    expect(response.totalReduction).toBeGreaterThan(80);
    expect(response.participationRate).toBeGreaterThan(0.75);
  });
});
Integration Tests

Smart thermostat API connectivity and control
Utility provider data exchange
Solar inverter and battery system integration
Weather service API reliability

Load Tests
yaml# K6 Load Test Configuration
scenarios:
  normal_load:
    executor: 'constant-arrival-rate'
    rate: 100
    timeUnit: '1s'
    duration: '10m'
    preAllocatedVUs: 50
    
  peak_load:
    executor: 'ramping-arrival-rate'
    startRate: 50
    timeUnit: '1s'
    stages:
      - duration: '2m', target: 500
      - duration: '5m', target: 500
      - duration: '2m', target: 50
    
  demand_response_surge:
    executor: 'shared-iterations'
    vus: 100
    iterations: 1000
    maxDuration: '5m'

thresholds:
  http_req_duration: ['p(95)<100', 'p(99)<200']
  http_req_failed: ['rate<0.01']
  energy_optimization_duration: ['p(95)<5000']
Monitoring & Observability
Key Metrics Dashboard
yamldashboard:
  real_time_metrics:
    - metric: energy_consumption_kwh
      aggregation: sum
      interval: 15m
      alert: warning if > baseline * 1.2
    
    - metric: cost_per_sqft
      calculation: total_cost / total_sqft
      threshold: < $0.15/sqft/month
      alert: critical if > $0.20/sqft/month
    
    - metric: comfort_complaints
      source: tenant_feedback
      threshold: < 5 per 100 units
      alert: warning if > 10
      
    - metric: dr_participation_rate
      calculation: successful_dr_events / total_dr_events
      target: > 0.80
      alert: warning if < 0.70
  
  efficiency_metrics:
    - metric: hvac_runtime_hours
      comparison: week_over_week
      target: -10%
      
    - metric: peak_demand_kw
      window: 15-minute_peak
      target: < contracted_demand * 0.9
      
    - metric: solar_utilization
      calculation: solar_consumed / solar_generated
      target: > 0.85
      
  business_metrics:
    - metric: monthly_savings
      calculation: baseline_cost - actual_cost
      target: > $2000/property
      
    - metric: carbon_reduction_tons
      calculation: baseline_emissions - actual_emissions
      target: > 2 tons/property/month
      
    - metric: utility_incentives_earned
      aggregation: sum
      period: monthly
      target: > $500/property
Implementation Checklist

 Phase 1: Foundation (Week 1-2)

 Set up N8n development environment with Python nodes
 Configure OAuth for Nest, Ecobee, Honeywell APIs
 Establish database schema for energy data
 Create basic API endpoints for device control


 Phase 2: Device Integration (Week 3-4)

 Implement thermostat control workflows
 Add smart meter data ingestion
 Configure solar/battery system APIs
 Set up weather data integration


 Phase 3: ML Models (Week 5-6)

 Train occupancy prediction model
 Develop comfort prediction algorithm
 Create energy consumption forecaster
 Validate model accuracy with historical data


 Phase 4: Optimization Engine (Week 7-8)

 Implement dynamic programming optimizer
 Add multi-objective optimization
 Create scheduling algorithm
 Develop demand response strategies


 Phase 5: Testing & Validation (Week 9-10)

 Conduct unit testing for all components
 Perform integration testing
 Execute load testing scenarios
 Run pilot with 10 properties


 Phase 6: Monitoring & Deployment (Week 11-12)

 Set up Grafana dashboards
 Configure AlertManager rules
 Deploy to staging environment
 Progressive rollout to production