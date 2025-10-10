Prompt #31: MLS Data Integration Workflow (Enhanced)
Role
Senior MLS Integration Engineer with expertise in RESO Web API, RETS protocols, and real-time data synchronization architectures
Context

Volume: 2.5M active listings across 15 MLS systems, 500K daily updates
Performance: Sub-2s data retrieval, <5min sync delay for changes
Integration: CRMLS (1.2M listings), NWMLS (300K), HAR (250K), FMLS (200K), GBRMLS (150K), 10 regional systems
Compliance: RESO Data Dictionary 2.0, NAR data display requirements, MLS Terms of Use
Scale: Expected 40% YoY growth, expanding to 25 MLS systems within 12 months

Primary Objective
Achieve 99.9% data freshness across all MLS integrations with <5 minute sync latency and zero data quality violations
Enhanced Requirements
MLS Connection Management

Multi-Protocol Support

javascript// N8n MLS Connection Node Configuration
{
  "nodes": [
    {
      "parameters": {
        "mlsType": "={{$json.mlsConfig.protocol}}",
        "authentication": {
          "resoWebApi": {
            "clientId": "={{$credentials.mls.clientId}}",
            "clientSecret": "={{$credentials.mls.clientSecret}}",
            "tokenEndpoint": "={{$json.mlsConfig.tokenUrl}}",
            "scope": "OData"
          },
          "rets": {
            "loginUrl": "={{$json.mlsConfig.loginUrl}}",
            "username": "={{$credentials.mls.username}}",
            "password": "={{$credentials.mls.password}}",
            "version": "RETS/1.7.2"
          }
        },
        "rateLimiting": {
          "requestsPerSecond": "={{$json.mlsConfig.rateLimit}}",
          "burstSize": 100,
          "retryStrategy": "exponentialBackoff"
        }
      },
      "name": "MLS Connection Manager",
      "type": "n8n-nodes-mls-connector"
    }
  ]
}
Architecture Decision: Multi-protocol adapter pattern

Rationale: Different MLS systems use RESO Web API, RETS, or proprietary APIs
Alternatives considered: Single protocol with translation layer, separate workflows per MLS
Trade-offs: Higher complexity but better maintainability and scalability


Real-time Change Detection

pythonclass MLSChangeDetector:
    def __init__(self, mls_config):
        self.watermarks = {}
        self.webhook_endpoints = {}
        
    async def detect_changes(self, mls_id):
        """
        Implements hybrid change detection:
        1. Webhooks for systems that support them
        2. Modified timestamp polling for RESO systems
        3. Differential sync for legacy RETS
        """
        strategy = self.get_detection_strategy(mls_id)
        
        if strategy == 'webhook':
            return await self.process_webhook_queue(mls_id)
        elif strategy == 'polling':
            last_modified = self.watermarks.get(mls_id, datetime.now() - timedelta(hours=1))
            changes = await self.poll_changes(mls_id, last_modified)
            self.watermarks[mls_id] = datetime.now()
            return changes
        else:  # differential
            return await self.differential_sync(mls_id)
    
    async def poll_changes(self, mls_id, since):
        query = f"""
            $filter=ModificationTimestamp gt {since.isoformat()}Z
            &$orderby=ModificationTimestamp asc
            &$top=1000
            &$select=ListingKey,ModificationTimestamp,StandardStatus,ListPrice
        """
        return await self.execute_query(mls_id, query)
Data Normalization Engine
typescriptinterface MLSNormalizer {
  normalizeAddress(raw: RawMLSAddress): StandardAddress {
    return {
      streetNumber: this.extractStreetNumber(raw),
      streetName: this.standardizeStreetName(raw),
      unitNumber: this.extractUnit(raw),
      city: this.validateCity(raw.city),
      state: this.standardizeState(raw.state),
      postalCode: this.normalizeZip(raw.zip),
      country: 'US',
      formatted: this.formatAddress(raw),
      coordinates: this.geocodeAddress(raw),
      confidence: this.calculateConfidence(raw)
    };
  }
  
  normalizePrice(raw: any): Price {
    const amount = this.parseAmount(raw);
    return {
      listPrice: amount,
      pricePerSqFt: amount / (raw.livingArea || 1),
      currency: 'USD',
      priceHistory: this.extractPriceHistory(raw),
      validation: {
        isReasonable: amount > 10000 && amount < 100000000,
        percentileRank: this.calculatePercentile(amount, raw.postalCode),
        outlierScore: this.detectPriceOutlier(amount, raw)
      }
    };
  }
}
Technical Specifications
API Definition
typescriptinterface MLSIntegrationRequest {
  action: 'sync' | 'fetch' | 'validate' | 'refresh';
  mlsSystems: string[];
  filters?: {
    modifiedSince?: Date;
    status?: StandardStatus[];
    propertyTypes?: PropertyType[];
    priceRange?: { min: number; max: number };
    geography?: GeoFilter;
  };
  options: {
    includePhotos: boolean;
    includeDocuments: boolean;
    validateAddress: boolean;
    enrichWithPublicData: boolean;
    deduplicationStrategy: 'strict' | 'fuzzy' | 'none';
  };
}

interface MLSIntegrationResponse {
  summary: {
    totalRecords: number;
    newListings: number;
    updatedListings: number;
    removedListings: number;
    errors: number;
    warnings: number;
    processingTime: number;
  };
  results: NormalizedListing[];
  errors: ValidationError[];
  syncToken: string;
}
Core Synchronization Algorithm
pythonasync def sync_mls_data(mls_config, last_sync_token=None):
    """
    High-performance MLS sync with intelligent batching and error recovery
    """
    sync_state = {
        'started': datetime.utcnow(),
        'mls_id': mls_config['id'],
        'records_processed': 0,
        'errors': []
    }
    
    try:
        # 1. Determine sync strategy
        if mls_config['supports_webhooks']:
            changes = await process_webhook_queue(mls_config)
        else:
            changes = await detect_changes_polling(mls_config, last_sync_token)
        
        # 2. Batch process with parallel execution
        batch_size = calculate_optimal_batch_size(mls_config)
        batches = chunk_changes(changes, batch_size)
        
        results = await asyncio.gather(*[
            process_batch(batch, mls_config)
            for batch in batches
        ], return_exceptions=True)
        
        # 3. Handle photos and documents
        photo_tasks = []
        for listing in flatten(results):
            if listing.get('photos'):
                photo_tasks.append(sync_photos(listing))
        
        await asyncio.gather(*photo_tasks)
        
        # 4. Validate and store
        validated = await validate_listings(results)
        await store_listings(validated)
        
        # 5. Update sync state
        sync_state['records_processed'] = len(validated)
        sync_state['completed'] = datetime.utcnow()
        await save_sync_state(sync_state)
        
        return {
            'success': True,
            'processed': len(validated),
            'duration': (sync_state['completed'] - sync_state['started']).seconds,
            'next_token': generate_sync_token(sync_state)
        }
        
    except Exception as e:
        await handle_sync_failure(e, sync_state)
        raise
Success Criteria
Performance Metrics

Response Time: P95 < 2s for single listing fetch, P99 < 5s
Sync Latency: 95% of changes reflected within 5 minutes, 99% within 15 minutes
Throughput: Process 100,000 listing updates per hour minimum
Availability: 99.9% uptime (43 minutes downtime/month max)
Resource Usage: CPU < 70% average, Memory < 4GB per MLS connection

Quality Metrics

Data Accuracy: >99.5% address standardization success rate
Duplicate Detection: <0.1% duplicate listings after deduplication
Photo Sync: >98% of photos successfully synchronized
Data Completeness: >95% of required RESO fields populated
Validation Pass Rate: >99% of listings pass business rule validation

Business Impact Metrics

Data Freshness: 40% reduction in stale listing complaints
Agent Efficiency: 2 hours/week saved per agent on data verification
Lead Quality: 25% increase in qualified leads from accurate listings
Compliance: 100% adherence to MLS display requirements
Cost Savings: $50K/month reduction in manual data management

Testing Requirements
Unit Tests
javascriptdescribe('MLS Data Normalizer', () => {
  test('should normalize CRMLS address format correctly', async () => {
    // Arrange
    const rawAddress = {
      StreetNumber: '123',
      StreetDirPrefix: 'N',
      StreetName: 'MAIN',
      StreetSuffix: 'ST',
      City: 'LOS ANGELES',
      StateOrProvince: 'CA',
      PostalCode: '90001'
    };
    
    // Act
    const normalized = await normalizer.normalizeAddress(rawAddress);
    
    // Assert
    expect(normalized.formatted).toBe('123 N Main St, Los Angeles, CA 90001');
    expect(normalized.coordinates).toMatchObject({
      lat: expect.any(Number),
      lng: expect.any(Number)
    });
    expect(normalized.confidence).toBeGreaterThan(0.9);
  });
  
  test('should handle MLS rate limiting gracefully', async () => {
    // Arrange
    const rateLimiter = new MLSRateLimiter({ requestsPerSecond: 10 });
    const requests = Array(100).fill().map(() => mockRequest());
    
    // Act
    const start = Date.now();
    await Promise.all(requests.map(r => rateLimiter.execute(r)));
    const duration = Date.now() - start;
    
    // Assert
    expect(duration).toBeGreaterThanOrEqual(9000); // Should take ~10 seconds
    expect(duration).toBeLessThan(11000);
  });
});
Integration Tests

CRMLS ↔ Supabase full sync cycle validation
Multi-MLS deduplication across overlapping coverage areas
Photo CDN integration and optimization pipeline
Webhook processing with retry logic verification
Rate limiting and backoff strategy validation

Load Tests
yamlscenarios:
  - name: Peak Hour Sync
    duration: 60m
    users: 15  # Concurrent MLS connections
    rate: 100/s  # Updates per second
    assertions:
      - p95_response_time < 2000ms
      - error_rate < 0.1%
      - successful_syncs > 99.5%
  
  - name: Bulk Initial Load
    duration: 4h
    records: 2500000
    batch_size: 1000
    parallel_connections: 5
    assertions:
      - throughput > 150000/hour
      - memory_usage < 8GB
      - no_data_corruption: true
Monitoring & Observability
Key Metrics Dashboard
yamldashboard:
  real_time_metrics:
    - metric: mls_sync_latency
      aggregation: p95
      threshold: < 300s
      alert: critical if > 600s
    
    - metric: data_freshness_score
      formula: (current_listings / total_listings) * 100
      threshold: > 95%
      alert: warning if < 90%
    
    - metric: api_error_rate
      per_mls: true
      threshold: < 1%
      alert: critical if > 5%
  
  quality_metrics:
    - metric: duplicate_rate
      measurement: duplicates_found / total_processed
      threshold: < 0.1%
      
    - metric: normalization_success
      categories: [address, price, photos]
      threshold: > 98%
  
  business_metrics:
    - metric: listings_available
      breakdown: by_mls, by_status, by_property_type
      alert: if drops > 10% in 1 hour
Implementation Checklist

 Phase 1: Core Infrastructure (Week 1-2)

 Set up N8n MLS connector nodes
 Implement RESO Web API client
 Create RETS protocol handler
 Build rate limiting system
 Set up connection pool manager


 Phase 2: Data Processing (Week 3-4)

 Implement address normalization service
 Create price validation engine
 Build deduplication algorithm
 Set up photo sync pipeline
 Implement document handler


 Phase 3: Integration (Week 5-6)

 Connect to CRMLS (highest volume)
 Add NWMLS integration
 Implement remaining MLS systems
 Set up webhook endpoints
 Create fallback mechanisms


 Phase 4: Quality & Performance (Week 7-8)

 Implement comprehensive testing
 Conduct load testing
 Set up monitoring dashboards
 Create alerting rules
 Document API and workflows