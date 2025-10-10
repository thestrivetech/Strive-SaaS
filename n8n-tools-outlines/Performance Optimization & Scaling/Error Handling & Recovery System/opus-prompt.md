Prompt #42: Error Handling & Recovery System (Enhanced)
Role
N8n Site Reliability Engineer specializing in fault tolerance, chaos engineering, and automated recovery systems
Context

Volume: 10,000+ potential error scenarios/day, 100+ external API dependencies
Performance: Error detection < 1 second, recovery initiation < 5 seconds
Integration: All AI agents, external APIs, databases, message queues
Compliance: 99.95% error handling success rate, zero data loss requirement
Scale: Supporting 50+ concurrent workflows, 1000+ API calls/minute

Primary Objective
Achieve 90% automatic error recovery rate while maintaining data consistency and preventing cascading failures across the system.
Enhanced Requirements
Intelligent Error Detection & Classification

Error Classification Engine

javascript// N8n Function Node: Error Classifier
class ErrorHandler {
  constructor() {
    this.errorPatterns = this.loadErrorPatterns();
    this.recoveryStrategies = this.loadRecoveryStrategies();
    this.circuitBreakers = new Map();
  }
  
  async handleError(error, context) {
    // Classify error
    const classification = this.classifyError(error);
    
    // Check circuit breaker
    const circuitBreaker = this.getCircuitBreaker(context.service);
    if (circuitBreaker.isOpen()) {
      return this.handleCircuitOpen(context);
    }
    
    // Select recovery strategy
    const strategy = this.selectStrategy(classification, context);
    
    // Execute recovery
    const result = await this.executeRecovery(strategy, error, context);
    
    // Update circuit breaker
    if (result.success) {
      circuitBreaker.recordSuccess();
    } else {
      circuitBreaker.recordFailure();
    }
    
    // Log and monitor
    await this.logError(error, classification, strategy, result);
    
    return result;
  }
  
  classifyError(error) {
    const classification = {
      category: 'unknown',
      severity: 'low',
      recoverable: true,
      retryable: false,
      userImpact: 'none',
      dataRisk: false
    };
    
    // Pattern matching for error classification
    const patterns = {
      network: {
        patterns: [/ECONNREFUSED/, /ETIMEDOUT/, /ENOTFOUND/, /socket hang up/],
        characteristics: {
          category: 'network',
          severity: 'medium',
          recoverable: true,
          retryable: true
        }
      },
      rateLimit: {
        patterns: [/429/, /rate limit/i, /too many requests/i],
        characteristics: {
          category: 'rate_limit',
          severity: 'low',
          recoverable: true,
          retryable: true,
          backoffRequired: true
        }
      },
      authentication: {
        patterns: [/401/, /403/, /unauthorized/i, /forbidden/i],
        characteristics: {
          category: 'auth',
          severity: 'high',
          recoverable: false,
          retryable: false,
          requiresIntervention: true
        }
      },
      database: {
        patterns: [/ER_LOCK/, /deadlock/i, /connection pool/i],
        characteristics: {
          category: 'database',
          severity: 'high',
          recoverable: true,
          retryable: true,
          dataRisk: true
        }
      },
      validation: {
        patterns: [/validation failed/i, /invalid input/i, /schema mismatch/i],
        characteristics: {
          category: 'validation',
          severity: 'low',
          recoverable: false,
          retryable: false,
          userError: true
        }
      }
    };
    
    // Check each pattern
    for (const [key, config] of Object.entries(patterns)) {
      const errorString = error.message || error.toString();
      const matches = config.patterns.some(pattern => pattern.test(errorString));
      
      if (matches) {
        Object.assign(classification, config.characteristics);
        break;
      }
    }
    
    // Enhanced classification using ML
    if (classification.category === 'unknown') {
      classification.mlPrediction = this.mlClassify(error);
    }
    
    return classification;
  }
  
  selectStrategy(classification, context) {
    const strategies = {
      network: {
        immediate: {
          type: 'exponential_backoff',
          maxRetries: 5,
          initialDelay: 1000,
          maxDelay: 32000,
          factor: 2
        },
        fallback: {
          type: 'cache_response',
          ttl: 300
        }
      },
      rate_limit: {
        immediate: {
          type: 'adaptive_throttle',
          method: 'token_bucket',
          refillRate: 10,
          bucketSize: 100
        },
        fallback: {
          type: 'queue_delay',
          delayMs: 60000
        }
      },
      database: {
        immediate: {
          type: 'transaction_retry',
          maxRetries: 3,
          isolationLevel: 'SERIALIZABLE'
        },
        fallback: {
          type: 'read_replica',
          consistency: 'eventual'
        }
      },
      auth: {
        immediate: {
          type: 'token_refresh',
          refreshUrl: context.authEndpoint
        },
        fallback: {
          type: 'manual_intervention',
          notifyAdmin: true
        }
      }
    };
    
    const categoryStrategy = strategies[classification.category] || strategies.network;
    
    // Decide between immediate and fallback based on context
    if (context.criticalPath) {
      return categoryStrategy.fallback;
    }
    
    return categoryStrategy.immediate;
  }
  
  async executeRecovery(strategy, error, context) {
    const recoveryHandlers = {
      exponential_backoff: async () => {
        let delay = strategy.initialDelay;
        
        for (let attempt = 1; attempt <= strategy.maxRetries; attempt++) {
          try {
            // Wait with jitter
            const jitter = Math.random() * 0.3 * delay;
            await this.sleep(delay + jitter);
            
            // Retry the operation
            const result = await context.retryFunction();
            
            return {
              success: true,
              attempt: attempt,
              result: result
            };
            
          } catch (retryError) {
            console.log(`Retry ${attempt} failed:`, retryError.message);
            
            if (attempt === strategy.maxRetries) {
              return {
                success: false,
                attempts: attempt,
                finalError: retryError
              };
            }
            
            // Increase delay
            delay = Math.min(delay * strategy.factor, strategy.maxDelay);
          }
        }
      },
      
      adaptive_throttle: async () => {
        const rateLimiter = this.getRateLimiter(context.service);
        
        // Wait for token
        const token = await rateLimiter.acquire();
        
        try {
          const result = await context.retryFunction();
          rateLimiter.release(token);
          
          return {
            success: true,
            throttled: true,
            result: result
          };
        } catch (error) {
          rateLimiter.penalize(token);
          throw error;
        }
      },
      
      transaction_retry: async () => {
        for (let attempt = 1; attempt <= strategy.maxRetries; attempt++) {
          const transaction = await context.db.beginTransaction({
            isolationLevel: strategy.isolationLevel
          });
          
          try {
            const result = await context.retryFunction(transaction);
            await transaction.commit();
            
            return {
              success: true,
              attempt: attempt,
              result: result
            };
            
          } catch (error) {
            await transaction.rollback();
            
            if (attempt === strategy.maxRetries || !this.isRetryableDBError(error)) {
              return {
                success: false,
                attempts: attempt,
                finalError: error
              };
            }
            
            // Add random delay to avoid deadlocks
            await this.sleep(Math.random() * 100 * attempt);
          }
        }
      },
      
      cache_response: async () => {
        const cacheKey = this.generateCacheKey(context);
        const cachedResponse = await this.cache.get(cacheKey);
        
        if (cachedResponse) {
          return {
            success: true,
            fromCache: true,
            result: cachedResponse,
            warning: 'Using cached response due to service unavailability'
          };
        }
        
        return {
          success: false,
          reason: 'No cached response available'
        };
      },
      
      queue_delay: async () => {
        // Add to delayed queue
        await this.queue.add({
          operation: context.operation,
          data: context.data,
          delay: strategy.delayMs
        });
        
        return {
          success: true,
          queued: true,
          executeAt: new Date(Date.now() + strategy.delayMs)
        };
      }
    };
    
    const handler = recoveryHandlers[strategy.type];
    if (handler) {
      return await handler();
    }
    
    return { success: false, reason: 'No recovery handler found' };
  }
  
  getCircuitBreaker(service) {
    if (!this.circuitBreakers.has(service)) {
      this.circuitBreakers.set(service, new CircuitBreaker({
        failureThreshold: 5,
        resetTimeout: 60000,
        monitoringPeriod: 10000
      }));
    }
    
    return this.circuitBreakers.get(service);
  }
  
  getRateLimiter(service) {
    // Token bucket implementation
    return {
      tokens: 100,
      lastRefill: Date.now(),
      refillRate: 10, // tokens per second
      
      async acquire() {
        this.refill();
        
        if (this.tokens > 0) {
          this.tokens--;
          return { acquired: Date.now() };
        }
        
        // Wait for token
        const waitTime = (1 / this.refillRate) * 1000;
        await new Promise(resolve => setTimeout(resolve, waitTime));
        
        return this.acquire();
      },
      
      refill() {
        const now = Date.now();
        const timePassed = (now - this.lastRefill) / 1000;
        const tokensToAdd = Math.floor(timePassed * this.refillRate);
        
        if (tokensToAdd > 0) {
          this.tokens = Math.min(this.tokens + tokensToAdd, 100);
          this.lastRefill = now;
        }
      },
      
      release(token) {
        // Token released successfully
      },
      
      penalize(token) {
        // Reduce refill rate temporarily
        this.refillRate = Math.max(1, this.refillRate * 0.8);
        
        // Restore rate after 1 minute
        setTimeout(() => {
          this.refillRate = 10;
        }, 60000);
      }
    };
  }
  
  async logError(error, classification, strategy, result) {
    const errorLog = {
      timestamp: new Date().toISOString(),
      error: {
        message: error.message,
        stack: error.stack,
        code: error.code
      },
      classification: classification,
      strategy: strategy,
      result: result,
      context: {
        workflowId: $workflow.id,
        nodeId: $node.id,
        executionId: $execution.id
      }
    };
    
    // Store in database
    await $db.insert('error_logs', errorLog);
    
    // Send to monitoring
    await $workflow.execute('monitoring-reporter', {
      type: 'error',
      data: errorLog
    });
    
    // Update metrics
    this.updateErrorMetrics(classification, result);
  }
  
  updateErrorMetrics(classification, result) {
    // Increment counters
    $metrics.increment('errors_total', {
      category: classification.category,
      severity: classification.severity,
      recovered: result.success
    });
    
    // Update success rate
    if (result.success) {
      $metrics.increment('error_recovery_success');
    } else {
      $metrics.increment('error_recovery_failed');
    }
  }
  
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Circuit Breaker Implementation
class CircuitBreaker {
  constructor(config) {
    this.failureThreshold = config.failureThreshold;
    this.resetTimeout = config.resetTimeout;
    this.monitoringPeriod = config.monitoringPeriod;
    this.failures = [];
    this.state = 'closed'; // closed, open, half-open
    this.nextAttempt = null;
  }
  
  isOpen() {
    this.updateState();
    return this.state === 'open';
  }
  
  recordSuccess() {
    if (this.state === 'half-open') {
      this.state = 'closed';
      this.failures = [];
    }
  }
  
  recordFailure() {
    this.failures.push(Date.now());
    this.updateState();
  }
  
  updateState() {
    // Remove old failures
    const cutoff = Date.now() - this.monitoringPeriod;
    this.failures = this.failures.filter(f => f > cutoff);
    
    // Check if we should open the circuit
    if (this.failures.length >= this.failureThreshold) {
      if (this.state !== 'open') {
        this.state = 'open';
        this.nextAttempt = Date.now() + this.resetTimeout;
      }
    }
    
    // Check if we should try half-open
    if (this.state === 'open' && Date.now() >= this.nextAttempt) {
      this.state = 'half-open';
    }
  }
}

// Usage
const errorHandler = new ErrorHandler();
const result = await errorHandler.handleError(error, {
  service: 'external-api',
  operation: 'fetch-data',
  criticalPath: false,
  retryFunction: async () => {
    return await $http.get('https://api.example.com/data');
  }
});

return result;
Success Criteria
Performance Metrics

Error Detection: < 1 second from occurrence to detection
Recovery Initiation: < 5 seconds from detection to recovery start
Circuit Breaker Response: < 10ms for open circuit detection
Retry Success Rate: > 70% within 3 attempts

Quality Metrics

Auto-Recovery Rate: > 90% for transient errors
Data Consistency: 100% maintaining ACID properties
False Positive Rate: < 2% for error classification
MTTR: < 5 minutes for critical errors

Business Impact Metrics

Downtime Reduction: 75% decrease in error-related downtime
User Impact: < 1% of users experiencing error states
Cost Savings: $10,000/month from reduced manual intervention
SLA Compliance: 99.99% availability achievement

Implementation Checklist

 Week 1: Error Classification System

 Define error taxonomy
 Build pattern matching engine
 Create ML classification model


 Week 2: Recovery Strategies

 Implement retry mechanisms
 Build circuit breakers
 Create fallback handlers


 Week 3: Integration

 Integrate with all services
 Add monitoring hooks
 Set up alerting


 Week 4: Testing & Optimization

 Chaos engineering tests
 Load testing with failures
 Recovery time optimization