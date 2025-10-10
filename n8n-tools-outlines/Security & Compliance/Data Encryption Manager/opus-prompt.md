Prompt #36: Data Encryption Manager (Enhanced)
Role
Chief Security Architect specializing in cryptographic systems, zero-trust architecture, and regulatory compliance for SaaS platforms
Context

Volume: 10TB encrypted data at rest, 500GB daily data in transit, 1M encryption operations/hour
Performance: <10ms encryption overhead, <5ms key retrieval, transparent to end users
Integration: All 25 AI agents, 5 database systems, 10 external APIs, 3 cloud providers
Compliance: SOC 2 Type II, ISO 27001, GDPR, CCPA, HIPAA-compliant encryption
Scale: Supporting 10,000 organizations, 100K users, multi-region deployment

Primary Objective
Implement military-grade encryption with <10ms overhead while maintaining 100% compliance with global data protection regulations and zero security breaches
Enhanced Requirements
End-to-End Encryption System

Multi-Layer Encryption Architecture

pythonclass EncryptionManager:
    def __init__(self):
        self.kms_client = KMSClient()  # Hardware Security Module backed
        self.key_cache = SecureKeyCache(ttl=3600)
        self.crypto_provider = CryptoProvider()
        
    async def encrypt_data(self, data, context):
        """
        Multi-layer encryption with context-aware key selection
        """
        # Determine encryption requirements based on context
        classification = self.classify_data(data, context)
        
        # Get appropriate key hierarchy
        keys = await self.get_key_hierarchy(classification, context)
        
        # Layer 1: Field-level encryption for sensitive fields
        if classification.has_pii:
            data = await self.encrypt_pii_fields(data, keys['field_key'])
        
        # Layer 2: Record-level encryption
        encrypted_record = self.crypto_provider.encrypt(
            algorithm='AES-256-GCM',
            data=data,
            key=keys['record_key'],
            aad=self.generate_aad(context)  # Additional authenticated data
        )
        
        # Layer 3: Envelope encryption
        envelope = {
            'data': encrypted_record,
            'encrypted_key': await self.kms_client.encrypt(
                keys['record_key'],
                keys['master_key_id']
            ),
            'metadata': {
                'version': '2.0',
                'algorithm': 'AES-256-GCM',
                'key_id': keys['master_key_id'],
                'timestamp': datetime.utcnow().isoformat(),
                'classification': classification.level,
                'rotation_id': keys['rotation_id']
            }
        }
        
        # Audit logging
        await self.audit_encryption_operation({
            'operation': 'encrypt',
            'data_size': len(str(data)),
            'classification': classification.level,
            'user': context.user_id,
            'organization': context.org_id,
            'timestamp': datetime.utcnow()
        })
        
        return envelope
    
    def classify_data(self, data, context):
        """
        Intelligent data classification for encryption requirements
        """
        classification = DataClassification()
        
        # Check for PII using pattern matching and ML
        pii_fields = self.detect_pii(data)
        if pii_fields:
            classification.has_pii = True
            classification.pii_fields = pii_fields
            classification.level = 'highly_sensitive'
        
        # Check for financial data
        if self.contains_financial_data(data):
            classification.has_financial = True
            classification.level = 'highly_sensitive'
        
        # Check for health information (HIPAA)
        if self.contains_health_info(data):
            classification.has_phi = True
            classification.level = 'highly_sensitive'
            classification.requires_hipaa = True
        
        # Context-based classification
        if context.module in ['financial', 'contracts', 'legal']:
            classification.level = max(classification.level, 'sensitive')
        
        return classification
    
    async def encrypt_pii_fields(self, data, field_key):
        """
        Format-preserving encryption for PII fields
        """
        encrypted_data = data.copy()
        
        pii_handlers = {
            'ssn': lambda x: self.crypto_provider.fpe_encrypt(
                x, field_key, alphabet='0-9', format='###-##-####'
            ),
            'credit_card': lambda x: self.crypto_provider.fpe_encrypt(
                x, field_key, alphabet='0-9', format='####-####-####-####'
            ),
            'email': lambda x: self.encrypt_email(x, field_key),
            'phone': lambda x: self.crypto_provider.fpe_encrypt(
                x, field_key, alphabet='0-9', format='(###) ###-####'
            )
        }
        
        for field_path, field_type in self.detect_pii(data).items():
            if handler := pii_handlers.get(field_type):
                value = self.get_nested_value(encrypted_data, field_path)
                encrypted_value = await handler(value)
                self.set_nested_value(encrypted_data, field_path, encrypted_value)
        
        return encrypted_data

Key Management System

typescriptclass KeyManagementSystem {
  private readonly hsm: HardwareSecurityModule;
  private readonly keyRotationScheduler: CronScheduler;
  private readonly keyVersioning: KeyVersionManager;
  
  async generateKeyHierarchy(orgId: string): Promise<KeyHierarchy> {
    // Generate master key in HSM
    const masterKey = await this.hsm.generateKey({
      algorithm: 'RSA-4096',
      usage: ['encrypt', 'decrypt', 'wrap', 'unwrap'],
      exportable: false,
      metadata: {
        organizationId: orgId,
        createdAt: new Date(),
        purpose: 'master_key'
      }
    });
    
    // Generate data encryption keys (DEKs)
    const dataKeys = {
      ai_conversations: await this.generateDEK(masterKey, 'ai_conversations'),
      documents: await this.generateDEK(masterKey, 'documents'),
      user_data: await this.generateDEK(masterKey, 'user_data'),
      financial_data: await this.generateDEK(masterKey, 'financial_data'),
      api_tokens: await this.generateDEK(masterKey, 'api_tokens')
    };
    
    // Set up automatic rotation
    this.keyRotationScheduler.schedule({
      keyId: masterKey.id,
      rotationPeriod: '90d',
      gracePeriod: '30d',
      handler: async () => this.rotateKey(masterKey.id)
    });
    
    return {
      masterKeyId: masterKey.id,
      dataKeys: dataKeys,
      version: 1,
      algorithm: 'AES-256-GCM',
      rotationSchedule: '90d',
      createdAt: new Date()
    };
  }
  
  async rotateKey(keyId: string): Promise<KeyRotationResult> {
    // Create new key version
    const newVersion = await this.keyVersioning.createNewVersion(keyId);
    
    // Re-encrypt all data with new key (gradual migration)
    const migrationPlan = {
      strategy: 'gradual',
      batchSize: 1000,
      priority: ['financial_data', 'user_data', 'ai_conversations'],
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    };
    
    await this.startKeyMigration(keyId, newVersion, migrationPlan);
    
    // Update key metadata
    await this.updateKeyMetadata(keyId, {
      currentVersion: newVersion,
      previousVersion: newVersion - 1,
      rotatedAt: new Date(),
      nextRotation: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
    });
    
    // Audit log
    await this.auditKeyRotation({
      keyId: keyId,
      oldVersion: newVersion - 1,
      newVersion: newVersion,
      timestamp: new Date(),
      reason: 'scheduled_rotation'
    });
    
    return {
      success: true,
      newVersion: newVersion,
      migrationId: migrationPlan.id
    };
  }
}
Secure Backup & Recovery System
javascript// N8n Secure Backup Workflow
{
  "nodes": [
    {
      "name": "Backup Orchestrator",
      "type": "n8n-nodes-base.code",
      "parameters": {
        "code": `
          const backupConfig = {
            frequency: 'hourly',
            retention: {
              hourly: 24,
              daily: 30,
              weekly: 52,
              monthly: 36
            },
            encryption: {
              algorithm: 'AES-256-GCM',
              keyManagement: 'envelope',
              compression: 'zstd'
            }
          };
          
          // Prepare backup manifest
          const manifest = {
            backupId: generateBackupId(),
            timestamp: new Date(),
            type: determineBackupType(), // full or incremental
            sources: [
              'postgresql_primary',
              'mongodb_cluster',
              'elasticsearch_indices',
              'redis_snapshots',
              'file_storage'
            ],
            encryption: {
              keyId: await getBackupEncryptionKey(),
              algorithm: backupConfig.encryption.algorithm
            }
          };
          
          // Execute parallel backups
          const backupTasks = manifest.sources.map(source => ({
            source: source,
            task: createBackupTask(source, manifest)
          }));
          
          const results = await Promise.all(
            backupTasks.map(t => executeBackup(t))
          );
          
          // Encrypt and store backup
          for (const result of results) {
            // Encrypt backup data
            const encryptedBackup = await encryptBackup(
              result.data,
              manifest.encryption.keyId
            );
            
            // Store in multiple locations for redundancy
            await Promise.all([
              storeInPrimary(encryptedBackup, result.source),
              storeInSecondary(encryptedBackup, result.source),
              storeInColdStorage(encryptedBackup, result.source)
            ]);
            
            // Verify backup integrity
            const verification = await verifyBackup(encryptedBackup);
            if (!verification.valid) {
              throw new Error(\`Backup verification failed for \${result.source}\`);
            }
          }
          
          // Update backup catalog
          await updateBackupCatalog(manifest, results);
          
          // Test restore capability (on staging)
          if (shouldTestRestore()) {
            await testRestoreCapability(manifest.backupId);
          }
          
          return {
            backupId: manifest.backupId,
            status: 'completed',
            size: calculateTotalSize(results),
            duration: Date.now() - manifest.timestamp,
            nextBackup: calculateNextBackupTime(backupConfig.frequency)
          };
        `
      }
    }
  ]
}
Technical Specifications
Cryptographic Standards
yamlencryption_standards:
  algorithms:
    symmetric:
      primary: AES-256-GCM
      fallback: ChaCha20-Poly1305
      legacy_support: AES-256-CBC
      
    asymmetric:
      key_exchange: RSA-4096
      signing: Ed25519
      key_agreement: X25519
      
    hashing:
      passwords: Argon2id
      integrity: SHA3-256
      hmac: HMAC-SHA256
      
  key_management:
    storage: HSM
    rotation_period: 90_days
    key_derivation: HKDF
    backup: Shamir_Secret_Sharing
    
  compliance_mappings:
    GDPR:
      - right_to_erasure: crypto_shredding
      - data_portability: key_escrow
      - pseudonymization: format_preserving_encryption
      
    HIPAA:
      - encryption_required: true
      - key_length_minimum: 256
      - audit_trail: immutable
      
    PCI_DSS:
      - card_data: tokenization
      - transmission: TLS_1.3_only
      - storage: field_level_encryption
Zero-Trust Security Model
pythonclass ZeroTrustEnforcer:
    def __init__(self):
        self.policy_engine = PolicyEngine()
        self.identity_verifier = IdentityVerifier()
        self.risk_scorer = RiskScorer()
        
    async def authorize_access(self, request):
        """
        Zero-trust authorization with continuous verification
        """
        # Never trust, always verify
        identity = await self.identity_verifier.verify({
            'token': request.auth_token,
            'device_fingerprint': request.device_id,
            'location': request.ip_location,
            'behavior_pattern': request.behavior_signature
        })
        
        if not identity.verified:
            raise UnauthorizedError('Identity verification failed')
        
        # Calculate risk score
        risk_score = await self.risk_scorer.calculate({
            'user': identity.user_id,
            'action': request.action,
            'resource': request.resource,
            'context': {
                'time': datetime.utcnow(),
                'location': request.location,
                'device': request.device,
                'network': request.network_segment,
                'previous_actions': await self.get_recent_actions(identity.user_id)
            }
        })
        
        # Dynamic policy evaluation
        policy_decision = await self.policy_engine.evaluate({
            'subject': identity,
            'action': request.action,
            'resource': request.resource,
            'environment': {
                'risk_score': risk_score,
                'encryption_required': self.requires_encryption(request.resource),
                'compliance_requirements': self.get_compliance_requirements(request)
            }
        })
        
        if policy_decision.denied:
            await self.audit_denied_access(request, policy_decision.reason)
            raise ForbiddenError(f'Access denied: {policy_decision.reason}')
        
        # Grant temporary, limited access
        access_token = await self.generate_scoped_token({
            'user': identity.user_id,
            'resource': request.resource,
            'permissions': policy_decision.granted_permissions,
            'expires': datetime.utcnow() + timedelta(minutes=15),
            'conditions': policy_decision.conditions
        })
        
        # Set up continuous monitoring
        await self.monitor_session({
            'session_id': access_token.session_id,
            'user': identity.user_id,
            'risk_threshold': risk_score + 0.2,
            'reauthentication_trigger': risk_score > 0.7
        })
        
        return {
            'authorized': True,
            'access_token': access_token,
            'expires_in': 900,  # 15 minutes
            'refresh_allowed': risk_score < 0.5
        }
Success Criteria
Performance Metrics

Encryption Overhead: P95 < 10ms for encryption operations
Key Retrieval: P99 < 5ms from cache, < 50ms from HSM
Throughput: >1M encryption operations per hour
Backup Time: <1 hour for full backup, <10 min incremental
Recovery Time: RTO < 1 hour, RPO < 15 minutes

Security Metrics

Encryption Coverage: 100% of sensitive data encrypted
Key Rotation: 100% compliance with 90-day rotation
Vulnerability Score: CVSS < 4.0 for all components
Penetration Test: Zero critical findings
Compliance Score: 100% for SOC 2, GDPR, HIPAA

Business Impact Metrics

Security Incidents: Zero data breaches
Compliance Violations: Zero regulatory violations
Audit Performance: Pass all external audits
Customer Trust: 95% security satisfaction score
Insurance Premium: 20% reduction due to security posture

Testing Requirements
Security Testing Suite
python@pytest.mark.security
class TestEncryptionSecurity:
    def test_encryption_strength(self):
        # Arrange
        manager = EncryptionManager()
        sensitive_data = {
            'ssn': '123-45-6789',
            'credit_card': '4111-1111-1111-1111',
            'medical_record': 'HIPAA protected information'
        }
        
        # Act
        encrypted = manager.encrypt_data(sensitive_data, context)
        
        # Assert
        # Verify encryption algorithm
        assert encrypted['metadata']['algorithm'] == 'AES-256-GCM'
        
        # Verify no plaintext leakage
        encrypted_str = str(encrypted)
        assert '123-45-6789' not in encrypted_str
        assert '4111' not in encrypted_str
        
        # Verify authenticity
        assert 'tag' in encrypted['data']  # GCM auth tag
        
        # Test tamper detection
        encrypted['data']['ciphertext'] = 'tampered'
        with pytest.raises(AuthenticationError):
            manager.decrypt_data(encrypted)
    
    def test_key_rotation(self):
        # Arrange
        kms = KeyManagementSystem()
        key_id = kms.create_key('test_key')
        
        # Encrypt data with original key
        original_encrypted = encrypt_with_key(key_id, 'sensitive data')
        
        # Act - Rotate key
        rotation_result = kms.rotate_key(key_id)
        
        # Assert
        assert rotation_result.success
        assert rotation_result.new_version > 1
        
        # Verify old data can still be decrypted
        decrypted = decrypt_with_key(key_id, original_encrypted)
        assert decrypted == 'sensitive data'
        
        # Verify new encryption uses new key version
        new_encrypted = encrypt_with_key(key_id, 'new data')
        assert new_encrypted['key_version'] == rotation_result.new_version
Compliance Validation Tests
pythonclass TestComplianceRequirements:
    def test_gdpr_right_to_erasure(self):
        # Arrange
        user_id = 'user_123'
        store_user_data(user_id, {'name': 'John Doe', 'email': 'john@example.com'})
        
        # Act - Execute GDPR erasure
        erasure_result = execute_gdpr_erasure(user_id)
        
        # Assert
        assert erasure_result.success
        
        # Verify crypto-shredding
        assert erasure_result.method == 'crypto_shredding'
        
        # Verify data is irrecoverable
        with pytest.raises(DataErasedException):
            retrieve_user_data(user_id)
        
        # Verify audit trail
        audit = get_erasure_audit(user_id)
        assert audit.timestamp
        assert audit.legal_basis == 'GDPR Article 17'
Monitoring & Observability
Security Monitoring Dashboard
yamlsecurity_monitoring:
  encryption_metrics:
    - metric: encryption_operations_per_second
      threshold: > 1000
      alert: scale_up if consistently_below
      
    - metric: encryption_failures
      threshold: < 0.001%
      alert: critical if > 0.01%
      
    - metric: key_rotation_compliance
      measurement: days_since_rotation
      threshold: < 90
      alert: warning at 75, critical at 85
      
  threat_detection:
    - metric: anomalous_access_patterns
      detection: ml_based
      threshold: risk_score > 0.8
      action: require_mfa
      
    - metric: failed_authentication_rate
      window: 5_minutes
      threshold: > 10_per_user
      action: temporary_lockout
      
  compliance_monitoring:
    - metric: encryption_coverage
      measurement: encrypted_fields / total_sensitive_fields
      threshold: = 100%
      alert: critical if < 100%
Implementation Checklist

 Phase 1: Encryption Infrastructure (Week 1-2)

 Deploy HSM infrastructure
 Implement KMS service
 Set up key hierarchy
 Build encryption libraries
 Create key rotation system


 Phase 2: Data Classification (Week 3)

 Implement PII detection
 Build classification engine
 Create tagging system
 Set up policy framework
 Deploy scanning tools


 Phase 3: Zero-Trust Implementation (Week 4-5)

 Deploy identity verification
 Implement risk scoring
 Build policy engine
 Set up continuous monitoring
 Create session management


 Phase 4: Compliance & Audit (Week 6)

 Implement GDPR controls
 Add HIPAA compliance
 Build audit logging
 Create compliance reports
 Execute penetration testing