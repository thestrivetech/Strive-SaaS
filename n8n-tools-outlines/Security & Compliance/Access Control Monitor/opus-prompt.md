Prompt #37: Access Control Monitor (Enhanced)
Role
Principal Identity & Access Management Architect specializing in RBAC, zero-trust security, and enterprise-scale authorization systems
Context

Volume: 100K users, 10K organizations, 1M authorization checks/minute
Performance: <50ms authorization decision, <10ms permission check from cache
Integration: 25 AI agents, Auth0/Okta SSO, LDAP/AD, SAML 2.0, OAuth 2.0/OIDC
Compliance: SOC 2 access controls, GDPR data access rights, HIPAA minimum necessary
Scale: 5-level permission hierarchy, 100+ granular permissions, 15 default roles

Primary Objective
Deliver sub-50ms authorization decisions with 100% RBAC enforcement accuracy while preventing all unauthorized access attempts
Enhanced Requirements
Advanced RBAC System

Hierarchical Permission Model

typescriptinterface PermissionHierarchy {
  // Organization-level isolation
  organization: {
    id: string;
    isolation: 'complete' | 'shared_resources';
    dataResidency: Region;
    complianceLevel: ComplianceProfile;
  };
  
  // Role definitions with inheritance
  roles: {
    superAdmin: {
      level: 0,
      inherits: [],
      permissions: ['*'],  // All permissions
      scope: 'platform',
      restrictions: ['cannot_delete_self']
    };
    
    orgAdmin: {
      level: 1,
      inherits: ['orgManager'],
      permissions: [
        'org:manage',
        'users:*',
        'roles:assign',
        'billing:manage',
        'integrations:*'
      ],
      scope: 'organization',
      restrictions: ['cannot_elevate_above_self']
    };
    
    orgManager: {
      level: 2,
      inherits: ['teamLead'],
      permissions: [
        'teams:manage',
        'workflows:*',
        'reports:create',
        'settings:modify'
      ],
      scope: 'organization'
    };
    
    teamLead: {
      level: 3,
      inherits: ['agent'],
      permissions: [
        'team:view',
        'team:assign_tasks',
        'reports:view_team',
        'analytics:team'
      ],
      scope: 'team'
    };
    
    agent: {
      level: 4,
      inherits: ['viewer'],
      permissions: [
        'ai:use',
        'leads:manage_assigned',
        'properties:manage_assigned',
        'documents:upload',
        'communications:send'
      ],
      scope: 'assigned_resources'
    };
    
    viewer: {
      level: 5,
      inherits: [],
      permissions: [
        'dashboard:view',
        'reports:view_own',
        'profile:read'
      ],
      scope: 'own_resources'
    };
  };
  
  // Dynamic permissions based on context
  contextualPermissions: {
    timeBased: Permission[];      // Active during business hours
    locationBased: Permission[];   // Based on geo-location
    riskBased: Permission[];       // Adjusted by risk score
    delegated: Permission[];       // Temporary delegations
  };
}

class RBACEngine {
  async evaluatePermission(
    principal: Principal,
    action: string,
    resource: Resource,
    context: Context
  ): Promise<AuthorizationDecision> {
    // Start with base role permissions
    let permissions = await this.getRolePermissions(principal.roles);
    
    // Apply organizational isolation
    if (!this.checkOrgIsolation(principal.orgId, resource.orgId)) {
      return this.deny('Organization isolation violation');
    }
    
    // Add contextual permissions
    permissions = this.mergeContextualPermissions(
      permissions,
      await this.getContextualPermissions(principal, context)
    );
    
    // Apply attribute-based controls (ABAC)
    const attributes = await this.evaluateAttributes(principal, resource, context);
    permissions = this.filterByAttributes(permissions, attributes);
    
    // Check specific permission
    const hasPermission = this.checkPermission(permissions, action, resource);
    
    if (!hasPermission) {
      return this.deny('Insufficient permissions');
    }
    
    // Additional security checks
    const securityChecks = await Promise.all([
      this.checkSessionValidity(principal.sessionId),
      this.checkRiskScore(principal, action),
      this.checkRateLimits(principal, action),
      this.checkComplianceRequirements(resource, action)
    ]);
    
    if (!securityChecks.every(check => check.passed)) {
      const failedCheck = securityChecks.find(c => !c.passed);
      return this.deny(failedCheck.reason);
    }
    
    // Grant access with conditions
    return this.allow({
      principal: principal.id,
      action: action,
      resource: resource.id,
      conditions: this.generateConditions(principal, resource, context),
      expiresAt: this.calculateExpiry(principal.sessionTimeout),
      auditId: this.generateAuditId()
    });
  }
  
  private checkPermission(
    permissions: Permission[],
    action: string,
    resource: Resource
  ): boolean {
    // Handle wildcard permissions
    if (permissions.includes('*')) return true;
    
    // Check exact match
    if (permissions.includes(action)) return true;
    
    // Check pattern matching (e.g., 'users:*' matches 'users:create')
    const actionParts = action.split(':');
    for (const permission of permissions) {
      if (permission.includes('*')) {
        const permParts = permission.split(':');
        if (this.matchesPattern(actionParts, permParts)) {
          return true;
        }
      }
    }
    
    // Check resource-specific permissions
    if (resource.type === 'owned' && permissions.includes(`${action}:own`)) {
      return resource.ownerId === principal.id;
    }
    
    return false;
  }
}

Real-time Permission Monitoring

pythonclass PermissionMonitor:
    def __init__(self):
        self.redis_client = Redis(decode_responses=True)
        self.anomaly_detector = AnomalyDetector()
        self.alert_manager = AlertManager()
        
    async def monitor_access_attempt(self, attempt):
        """
        Real-time monitoring of all access attempts with anomaly detection
        """
        # Log attempt
        await self.log_attempt(attempt)
        
        # Update user behavior profile
        user_profile = await self.update_behavior_profile(
            attempt.user_id,
            attempt
        )
        
        # Check for anomalies
        anomaly_score = await self.anomaly_detector.score({
            'user': attempt.user_id,
            'action': attempt.action,
            'resource': attempt.resource,
            'time': attempt.timestamp,
            'location': attempt.location,
            'device': attempt.device,
            'historical_pattern': user_profile.pattern
        })
        
        if anomaly_score > 0.8:
            await self.handle_anomaly(attempt, anomaly_score)
        
        # Check for privilege escalation attempts
        if self.is_privilege_escalation(attempt):
            await self.alert_manager.send({
                'type': 'PRIVILEGE_ESCALATION_ATTEMPT',
                'severity': 'critical',
                'user': attempt.user_id,
                'details': attempt
            })
        
        # Update metrics
        await self.update_metrics({
            'total_attempts': 1,
            'denied_attempts': 1 if attempt.denied else 0,
            'anomalous_attempts': 1 if anomaly_score > 0.8 else 0,
            'by_user': {attempt.user_id: 1},
            'by_resource': {attempt.resource: 1},
            'by_action': {attempt.action: 1}
        })
        
        # Check for brute force attempts
        if await self.detect_brute_force(attempt.user_id):
            await self.trigger_lockout(attempt.user_id)
        
        return {
            'logged': True,
            'anomaly_score': anomaly_score,
            'alerts_triggered': anomaly_score > 0.8
        }
    
    async def detect_brute_force(self, user_id):
        """
        Detect brute force attempts using sliding window
        """
        key = f"failed_attempts:{user_id}"
        
        # Add current timestamp
        current_time = time.time()
        await self.redis_client.zadd(
            key,
            {str(current_time): current_time}
        )
        
        # Remove old entries (outside 5-minute window)
        await self.redis_client.zremrangebyscore(
            key,
            0,
            current_time - 300
        )
        
        # Count attempts in window
        attempt_count = await self.redis_client.zcard(key)
        
        # Set expiry
        await self.redis_client.expire(key, 300)
        
        return attempt_count > 10  # More than 10 attempts in 5 minutes
Identity Provider Integration
javascript// N8n SSO Integration Workflow
{
  "nodes": [
    {
      "name": "SSO Authentication Handler",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "authentication": "oauth2",
        "method": "POST",
        "url": "={{ $json.provider.tokenEndpoint }}",
        "options": {
          "bodyContentType": "form-urlencoded"
        },
        "body": {
          "grant_type": "authorization_code",
          "code": "={{ $json.authCode }}",
          "client_id": "={{ $credentials.oauth.clientId }}",
          "client_secret": "={{ $credentials.oauth.clientSecret }}",
          "redirect_uri": "={{ $json.redirectUri }}"
        }
      }
    },
    {
      "name": "Token Validator",
      "type": "n8n-nodes-base.code",
      "parameters": {
        "code": `
          const token = $input.item.json.access_token;
          const idToken = $input.item.json.id_token;
          
          // Validate token signature
          const decoded = await validateJWT(idToken, {
            issuer: $json.provider.issuer,
            audience: $credentials.oauth.clientId,
            algorithms: ['RS256'],
            publicKey: await getProviderPublicKey($json.provider.jwksUri)
          });
          
          // Extract claims
          const claims = {
            sub: decoded.sub,
            email: decoded.email,
            name: decoded.name,
            groups: decoded.groups || [],
            roles: decoded.roles || [],
            organization: decoded.org_id,
            emailVerified: decoded.email_verified
          };
          
          // Map external roles to internal roles
          const internalRoles = await mapExternalRoles(
            claims.roles,
            $json.provider.name
          );
          
          // Check organization membership
          const orgMembership = await verifyOrgMembership(
            claims.email,
            claims.organization
          );
          
          if (!orgMembership.valid) {
            throw new Error('User not authorized for this organization');
          }
          
          // Create or update user
          const user = await syncUserFromSSO({
            externalId: claims.sub,
            email: claims.email,
            name: claims.name,
            provider: $json.provider.name,
            organizationId: orgMembership.orgId,
            roles: internalRoles,
            metadata: {
              lastLogin: new Date(),
              loginMethod: 'sso',
              provider: $json.provider.name
            }
          });
          
          // Generate session
          const session = await createSession({
            userId: user.id,
            organizationId: user.organizationId,
            roles: user.roles,
            authMethod: 'sso',
            provider: $json.provider.name,
            expiresIn: 3600, // 1 hour
            refreshToken: $input.item.json.refresh_token
          });
          
          // Set up continuous verification
          await setupContinuousVerification({
            sessionId: session.id,
            userId: user.id,
            riskProfile: await calculateInitialRisk(user),
            reauthInterval: 900 // 15 minutes for high-privilege users
          });
          
          return {
            user: user,
            session: session,
            permissions: await loadUserPermissions(user)
          };
        `
      }
    }
  ]
}
Technical Specifications
Authorization Architecture
yamlauthorization_system:
  architecture:
    policy_engine:
      type: OPA (Open Policy Agent)
      language: Rego
      deployment: sidecar
      cache: Redis
      
    permission_store:
      database: PostgreSQL
      cache: Redis
      replication: multi-region
      
    session_management:
      store: Redis
      backup: DynamoDB
      expiry: sliding_window
      
  performance:
    cache_layers:
      L1: in_memory (10MB per instance)
      L2: Redis (distributed)
      L3: PostgreSQL (persistent)
      
    optimization:
      permission_preloading: true
      batch_evaluation: true
      parallel_checks: true
      
  integration:
    identity_providers:
      - Auth0
      - Okta
      - Azure_AD
      - Google_Workspace
      - Custom_SAML
      
    protocols:
      - OAuth_2.0
      - OIDC
      - SAML_2.0
      - LDAP
      - Kerberos
Audit Logging System
pythonclass AuditLogger:
    def __init__(self):
        self.immutable_store = ImmutableAuditStore()  # Blockchain-based
        self.search_index = ElasticsearchClient()
        self.real_time_stream = KafkaProducer()
        
    async def log_access_event(self, event):
        """
        Create immutable audit record for access event
        """
        # Enrich event with context
        enriched_event = {
            'id': uuid.uuid4().hex,
            'timestamp': datetime.utcnow().isoformat(),
            'type': event.type,
            'principal': {
                'id': event.user_id,
                'roles': event.user_roles,
                'organization': event.org_id,
                'session': event.session_id
            },
            'action': event.action,
            'resource': {
                'type': event.resource_type,
                'id': event.resource_id,
                'classification': event.resource_classification
            },
            'result': event.result,  # 'allowed' or 'denied'
            'reason': event.reason,
            'context': {
                'ip_address': event.ip_address,
                'user_agent': event.user_agent,
                'location': await self.geocode_ip(event.ip_address),
                'device_id': event.device_id,
                'risk_score': event.risk_score
            },
            'compliance': {
                'regulations': self.applicable_regulations(event),
                'retention_period': self.calculate_retention(event),
                'data_residency': event.data_residency
            }
        }
        
        # Create cryptographic hash for integrity
        event_hash = self.calculate_hash(enriched_event)
        enriched_event['hash'] = event_hash
        
        # Store in immutable ledger
        ledger_receipt = await self.immutable_store.append(enriched_event)
        enriched_event['ledger_receipt'] = ledger_receipt
        
        # Index for searching
        await self.search_index.index(
            index='audit-logs',
            body=enriched_event
        )
        
        # Stream for real-time monitoring
        await self.real_time_stream.send(
            'audit-events',
            value=enriched_event
        )
        
        # Check for compliance reporting requirements
        if self.requires_compliance_reporting(enriched_event):
            await self.generate_compliance_report(enriched_event)
        
        return {
            'logged': True,
            'event_id': enriched_event['id'],
            'ledger_receipt': ledger_receipt
        }
Success Criteria
Performance Metrics

Authorization Latency: P95 < 50ms, P99 < 100ms
Cache Hit Rate: >95% for permission checks
Session Validation: P95 < 10ms
Audit Log Write: P99 < 100ms
System Availability: 99.99% uptime

Security Metrics

Unauthorized Access: Zero successful breaches
Privilege Escalation: 100% detection rate
Anomaly Detection: <1% false positive rate
Audit Completeness: 100% of access attempts logged
Compliance Adherence: 100% pass rate on audits

Business Impact Metrics

User Experience: <2% of users experience access delays
Admin Efficiency: 70% reduction in permission management time
Compliance Cost: 50% reduction in audit preparation time
Security Incidents: 90% reduction in access-related incidents
Integration Time: <1 day for new SSO provider integration

Testing Requirements
RBAC Testing Suite
python@pytest.mark.rbac
class TestRBACEnforcement:
    async def test_organizational_isolation(self):
        # Arrange
        org1_user = create_user(org_id='org1', role='admin')
        org2_resource = create_resource(org_id='org2', type='sensitive')
        
        # Act
        decision = await rbac_engine.evaluate_permission(
            principal=org1_user,
            action='read',
            resource=org2_resource
        )
        
        # Assert
        assert decision.denied
        assert decision.reason == 'Organization isolation violation'
        
        # Verify audit log
        audit = await get_latest_audit(org1_user.id)
        assert audit.result == 'denied'
        assert audit.reason == 'Organization isolation violation'
    
    async def test_permission_inheritance(self):
        # Arrange
        team_lead = create_user(role='teamLead')
        
        # Act - Check inherited permissions
        base_permissions = await get_permissions('agent')
        inherited_permissions = await get_permissions('teamLead')
        
        # Assert
        for permission in base_permissions:
            assert permission in inherited_permissions
        
        # Test specific team lead permission
        decision = await rbac_engine.evaluate_permission(
            principal=team_lead,
            action='team:assign_tasks',
            resource=team_resource
        )
        assert decision.allowed
Load Testing
javascriptdescribe('Access Control Performance', () => {
  it('should handle 1M authorization checks per minute', async () => {
    // Arrange
    const users = generateUsers(1000);
    const resources = generateResources(100);
    const actions = ['read', 'write', 'delete', 'admin'];
    
    // Act
    const start = Date.now();
    const requests = [];
    
    for (let i = 0; i < 1000000; i++) {
      const user = users[i % users.length];
      const resource = resources[i % resources.length];
      const action = actions[i % actions.length];
      
      requests.push(
        authorizationService.check(user, action, resource)
      );
      
      // Batch requests to avoid overwhelming
      if (requests.length >= 1000) {
        await Promise.all(requests);
        requests.length = 0;
      }
    }
    
    const duration = Date.now() - start;
    
    // Assert
    expect(duration).toBeLessThan(60000); // Under 1 minute
    
    // Check error rate
    const metrics = await getMetrics();
    expect(metrics.errorRate).toBeLessThan(0.001); // <0.1% errors
    expect(metrics.p95Latency).toBeLessThan(50); // <50ms P95
  });
});
Monitoring & Observability
Access Control Dashboard
yamlmonitoring_dashboard:
  real_time_metrics:
    - metric: authorization_requests_per_second
      visualization: line_graph
      threshold: > 10000
      
    - metric: authorization_latency
      percentiles: [p50, p95, p99]
      threshold_p95: < 50ms
      alert: page if > 100ms
      
    - metric: failed_authorization_rate
      calculation: denied / total
      threshold: < 20%
      breakdown: by_reason
      
  security_metrics:
    - metric: privilege_escalation_attempts
      detection: pattern_matching
      alert: immediate
      action: block_user
      
    - metric: anomalous_access_patterns
      detection: ml_anomaly_detection
      threshold: score > 0.8
      action: require_reauthentication
      
    - metric: brute_force_attempts
      window: 5_minutes
      threshold: > 10_failures
      action: account_lockout
      
  compliance_metrics:
    - metric: audit_log_completeness
      measurement: logged_events / total_events
      requirement: = 100%
      
    - metric: permission_review_compliance
      frequency: quarterly
      completion_rate: > 95%
Implementation Checklist

 Phase 1: Core RBAC (Week 1-2)

 Design permission hierarchy
 Implement role definitions
 Build evaluation engine
 Create permission store
 Set up caching layer


 Phase 2: SSO Integration (Week 3-4)

 Integrate Auth0
 Add Okta support
 Implement SAML 2.0
 Build role mapping
 Test federation


 Phase 3: Monitoring & Audit (Week 5-6)

 Deploy audit logging
 Implement anomaly detection
 Build monitoring dashboard
 Set up alerting
 Create compliance reports


 Phase 4: Advanced Security (Week 7-8)

 Implement zero-trust checks
 Add continuous verification
 Deploy risk scoring
 Build session management
 Execute security testing