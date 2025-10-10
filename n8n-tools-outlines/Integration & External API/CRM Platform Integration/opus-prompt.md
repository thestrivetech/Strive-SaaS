Prompt #32: CRM Platform Integration (Enhanced)
Role
Senior CRM Integration Architect with expertise in Salesforce, HubSpot, and enterprise system integration patterns
Context

Volume: 50K contacts, 10K opportunities, 200K activities per month
Performance: <500ms sync latency for critical updates, <5min for bulk sync
Integration: Salesforce (primary), HubSpot, Pipedrive, Zoho CRM, MS Dynamics 365
Compliance: GDPR for data handling, SOC 2 for security, CAN-SPAM for communications
Scale: Supporting 500 concurrent users, expecting 3x growth in 6 months

Primary Objective
Establish bi-directional real-time synchronization with 5 major CRM platforms achieving 99.9% data consistency and <500ms sync latency
Enhanced Requirements
Bi-Directional Sync Engine

Conflict Resolution System

typescriptclass ConflictResolver {
  private strategies = {
    'last-modified-wins': (local: any, remote: any) => {
      return local.modifiedAt > remote.modifiedAt ? local : remote;
    },
    'source-system-wins': (local: any, remote: any, config: any) => {
      return config.sourceSystem === 'salesforce' ? remote : local;
    },
    'field-level-merge': (local: any, remote: any, rules: MergeRules) => {
      const merged = { ...local };
      for (const field of rules.fields) {
        if (rules.priorityMap[field] === 'remote') {
          merged[field] = remote[field];
        } else if (rules.priorityMap[field] === 'newest') {
          merged[field] = local[`${field}_modified`] > remote[`${field}_modified`] 
            ? local[field] : remote[field];
        }
      }
      return merged;
    },
    'manual-review': async (local: any, remote: any) => {
      await this.queueForReview({
        entityType: local.type,
        entityId: local.id,
        localVersion: local,
        remoteVersion: remote,
        detectedAt: new Date()
      });
      return null; // Don't auto-resolve
    }
  };
  
  async resolveConflict(conflict: SyncConflict): Promise<ResolvedEntity> {
    const strategy = this.determineStrategy(conflict);
    const resolved = await this.strategies[strategy](
      conflict.local,
      conflict.remote,
      conflict.config
    );
    
    await this.auditResolution({
      conflictId: conflict.id,
      strategy: strategy,
      resolution: resolved,
      timestamp: new Date()
    });
    
    return resolved;
  }
}

Field Mapping Engine

pythonclass FieldMapper:
    def __init__(self):
        self.mappings = self.load_mappings()
        self.transformers = self.load_transformers()
    
    def map_fields(self, source_system, target_system, entity):
        """
        Intelligent field mapping with type conversion and validation
        """
        mapping_key = f"{source_system}_to_{target_system}"
        field_map = self.mappings[mapping_key][entity['type']]
        
        mapped = {}
        for source_field, target_field in field_map.items():
            if source_field in entity:
                value = entity[source_field]
                
                # Apply transformations
                if target_field in self.transformers:
                    value = self.transformers[target_field](value)
                
                # Validate data type
                if not self.validate_type(target_system, target_field, value):
                    value = self.coerce_type(target_system, target_field, value)
                
                mapped[target_field] = value
        
        # Add system-specific required fields
        mapped.update(self.get_required_fields(target_system, entity['type']))
        
        return mapped
    
    def validate_type(self, system, field, value):
        schema = self.get_schema(system)
        field_type = schema[field]['type']
        
        validators = {
            'email': lambda v: re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', v),
            'phone': lambda v: re.match(r'^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$', v),
            'currency': lambda v: isinstance(v, (int, float)) and v >= 0,
            'date': lambda v: isinstance(v, datetime) or self.parse_date(v)
        }
        
        return validators.get(field_type, lambda v: True)(value)
Real-Time Activity Sync
javascript// N8n Workflow for Activity Synchronization
{
  "nodes": [
    {
      "name": "Activity Webhook Receiver",
      "type": "n8n-nodes-base.webhook",
      "parameters": {
        "path": "crm-activity-sync",
        "responseMode": "responseNode",
        "options": {
          "allowedOrigins": "*",
          "responseHeaders": {
            "X-Sync-Status": "={{$json.syncResult}}"
          }
        }
      }
    },
    {
      "name": "Activity Processor",
      "type": "n8n-nodes-base.code",
      "parameters": {
        "code": `
          const activity = $input.item.json;
          const sourceSystem = activity.source;
          
          // Normalize activity data
          const normalized = {
            type: activity.type || 'note',
            subject: activity.subject || activity.title,
            description: activity.body || activity.description,
            timestamp: new Date(activity.created_at || activity.timestamp),
            duration: activity.duration_minutes || 0,
            contactIds: activity.contacts || [],
            opportunityId: activity.opportunity_id,
            ownerId: activity.assigned_to || activity.owner_id,
            source: sourceSystem,
            originalId: activity.id,
            metadata: {
              call_recording: activity.recording_url,
              email_thread_id: activity.thread_id,
              meeting_link: activity.meeting_url
            }
          };
          
          // Determine target systems
          const targets = await this.getTargetSystems(sourceSystem);
          
          // Queue for sync
          return {
            normalized: normalized,
            targets: targets,
            priority: activity.type === 'meeting' ? 'high' : 'normal'
          };
        `
      }
    }
  ]
}
Technical Specifications
API Gateway Configuration
yamlapi_gateway:
  endpoints:
    - path: /api/v1/crm/sync
      method: POST
      rate_limit: 1000/minute
      authentication: oauth2
      request_schema:
        type: object
        required: [entity_type, operation, data]
        properties:
          entity_type:
            enum: [contact, lead, account, opportunity, activity]
          operation:
            enum: [create, update, delete, merge]
          data:
            type: object
          options:
            type: object
            properties:
              skip_validation: boolean
              force_update: boolean
              trigger_workflows: boolean
    
    - path: /api/v1/crm/bulk
      method: POST
      rate_limit: 10/minute
      max_payload: 10MB
      async: true
      
  webhooks:
    inbound:
      - salesforce: /webhooks/salesforce
      - hubspot: /webhooks/hubspot
      - pipedrive: /webhooks/pipedrive
    outbound:
      retry_policy:
        max_attempts: 5
        backoff: exponential
        max_delay: 3600
Duplicate Detection Algorithm
pythonclass DuplicateDetector:
    def __init__(self):
        self.matchers = {
            'email': self.exact_match,
            'phone': self.normalize_and_match,
            'name': self.fuzzy_match,
            'company': self.company_match
        }
    
    def find_duplicates(self, entity, existing_records):
        """
        Multi-factor duplicate detection with confidence scoring
        """
        potential_duplicates = []
        
        # Phase 1: Quick exact matches
        exact_matches = self.quick_exact_match(entity, existing_records)
        if exact_matches:
            return [(match, 1.0) for match in exact_matches]
        
        # Phase 2: Fuzzy matching with scoring
        for record in existing_records:
            score = 0
            factors = {}
            
            # Email matching (highest weight)
            if entity.get('email') and record.get('email'):
                if self.matchers['email'](entity['email'], record['email']):
                    score += 0.4
                    factors['email'] = True
            
            # Phone matching
            if entity.get('phone') and record.get('phone'):
                if self.matchers['phone'](entity['phone'], record['phone']):
                    score += 0.25
                    factors['phone'] = True
            
            # Name matching
            if entity.get('name') and record.get('name'):
                name_similarity = self.matchers['name'](entity['name'], record['name'])
                if name_similarity > 0.85:
                    score += 0.2 * name_similarity
                    factors['name'] = name_similarity
            
            # Company matching
            if entity.get('company') and record.get('company'):
                company_similarity = self.matchers['company'](entity['company'], record['company'])
                if company_similarity > 0.8:
                    score += 0.15 * company_similarity
                    factors['company'] = company_similarity
            
            if score >= 0.7:  # Configurable threshold
                potential_duplicates.append({
                    'record': record,
                    'confidence': score,
                    'matching_factors': factors
                })
        
        return sorted(potential_duplicates, key=lambda x: x['confidence'], reverse=True)
    
    def fuzzy_match(self, str1, str2):
        """Uses Levenshtein distance for fuzzy string matching"""
        return 1 - (levenshtein_distance(str1.lower(), str2.lower()) / max(len(str1), len(str2)))
Success Criteria
Performance Metrics

Sync Latency: P95 < 500ms for single record, P99 < 2s
Bulk Processing: 10,000 records/minute throughput
API Response Time: P95 < 200ms, P99 < 500ms
Queue Processing: 95% of queued items processed within 30 seconds
Availability: 99.95% uptime (22 minutes downtime/month max)

Quality Metrics

Data Consistency: >99.9% field accuracy across systems
Duplicate Prevention: <0.05% duplicate rate after detection
Mapping Accuracy: >99% correct field transformations
Conflict Resolution: 95% auto-resolved, <5% require manual review
Activity Sync: 100% of activities synced within 5 minutes

Business Impact Metrics

Sales Efficiency: 30% reduction in CRM data entry time
Lead Response: 50% faster lead response time
Data Quality: 75% reduction in duplicate records
Pipeline Visibility: 100% opportunity visibility across systems
ROI: $200K annual savings from automation

Testing Requirements
Unit Tests
javascriptdescribe('CRM Field Mapper', () => {
  test('should map Salesforce to HubSpot fields correctly', () => {
    // Arrange
    const salesforceContact = {
      FirstName: 'John',
      LastName: 'Doe',
      Email: 'john@example.com',
      Phone: '555-1234',
      Account: { Name: 'Acme Corp' },
      LeadSource: 'Web',
      Custom_Field__c: 'Value'
    };
    
    // Act
    const hubspotContact = mapper.map(
      'salesforce',
      'hubspot',
      salesforceContact
    );
    
    // Assert
    expect(hubspotContact).toEqual({
      firstname: 'John',
      lastname: 'Doe',
      email: 'john@example.com',
      phone: '555-1234',
      company: 'Acme Corp',
      leadsource: 'Web',
      custom_property: 'Value'
    });
  });
  
  test('should detect duplicates with high confidence', () => {
    // Arrange
    const newContact = {
      name: 'Jonathan Doe',
      email: 'j.doe@example.com',
      phone: '(555) 123-4567'
    };
    
    const existing = [
      {
        id: '123',
        name: 'John Doe',
        email: 'j.doe@example.com',
        phone: '5551234567'
      }
    ];
    
    // Act
    const duplicates = detector.findDuplicates(newContact, existing);
    
    // Assert
    expect(duplicates).toHaveLength(1);
    expect(duplicates[0].confidence).toBeGreaterThan(0.8);
    expect(duplicates[0].matching_factors).toMatchObject({
      email: true,
      phone: true
    });
  });
});
Implementation Checklist

 Phase 1: Foundation (Week 1-2)

 Set up OAuth2 for each CRM platform
 Create unified data models
 Build field mapping configuration
 Implement basic CRUD operations
 Set up webhook endpoints


 Phase 2: Sync Engine (Week 3-4)

 Build bi-directional sync logic
 Implement conflict resolution
 Create queue management system
 Add retry mechanisms
 Set up change tracking


 Phase 3: Intelligence Layer (Week 5-6)

 Implement duplicate detection
 Build merge capabilities
 Create activity correlation
 Add data enrichment
 Implement workflow triggers


 Phase 4: Platform Integration (Week 7-8)

 Complete Salesforce integration
 Add HubSpot connector
 Implement Pipedrive sync
 Test Zoho CRM integration
 Validate MS Dynamics connection