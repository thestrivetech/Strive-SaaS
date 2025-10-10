Prompt #39: IoT Property Monitoring (Enhanced)
Role
Principal IoT Systems Architect specializing in smart building automation, predictive maintenance, and edge computing
Context

Volume: 100K properties monitored, 1M devices connected, 10B sensor readings/day
Performance: <100ms local response, <1s cloud sync, 99.99% uptime for critical systems
Integration: Alexa, Google Home, SmartThings, HomeKit, 50+ device manufacturers
Compliance: Data privacy regulations, insurance requirements, local building codes
Scale: Supporting 1000 sensors per property, real-time monitoring, 30-day local storage

Primary Objective
Deliver comprehensive IoT property monitoring with <100ms response times while preventing 95% of maintenance issues through predictive analytics
Enhanced Requirements
Edge Computing Architecture

Distributed IoT Gateway System

pythonclass EdgeGatewaySystem:
    def __init__(self):
        self.device_registry = DeviceRegistry()
        self.edge_processor = EdgeProcessor()
        self.ml_inference = EdgeMLInference()
        self.local_storage = TimeSeriesDB(retention_days=30)
        
    async def process_sensor_data(self, device_id, data):
        """
        Process sensor data at the edge with ML inference
        """
        # Validate and enrich data
        enriched = await self.enrich_sensor_data(device_id, data)
        
        # Local processing for immediate actions
        if self.requires_immediate_action(enriched):
            await self.execute_local_action(enriched)
        
        # Run edge ML inference
        predictions = await self.ml_inference.predict({
            'current_reading': enriched,
            'historical_data': await self.get_recent_history(device_id),
            'environmental_context': await self.get_environmental_context()
        })
        
        # Detect anomalies
        if predictions['anomaly_score'] > 0.8:
            await self.handle_anomaly(device_id, enriched, predictions)
        
        # Predictive maintenance
        if predictions['failure_probability'] > 0.7:
            await self.schedule_maintenance(device_id, predictions)
        
        # Store locally with compression
        await self.local_storage.write(
            series=f"sensor.{device_id}",
            timestamp=enriched['timestamp'],
            value=enriched['value'],
            tags=enriched['tags']
        )
        
        # Batch upload to cloud
        if self.should_sync_to_cloud(enriched):
            await self.queue_for_cloud_sync(enriched)
        
        return {
            'processed': True,
            'local_action': enriched.get('local_action'),
            'predictions': predictions,
            'synced': False  # Will be synced in batch
        }
    
    async def handle_anomaly(self, device_id, data, predictions):
        """
        Intelligent anomaly handling with escalation
        """
        anomaly_type = self.classify_anomaly(predictions)
        
        if anomaly_type == 'critical':
            # Immediate local response
            await self.emergency_response(device_id, data)
            
            # Alert all relevant parties
            await self.send_critical_alert({
                'property': data['property_id'],
                'device': device_id,
                'type': anomaly_type,
                'description': predictions['anomaly_description'],
                'recommended_action': predictions['recommended_action'],
                'auto_response': 'executed'
            })
            
        elif anomaly_type == 'warning':
            # Log and monitor
            await self.log_warning(device_id, predictions)
            
            # Adjust monitoring frequency
            await self.increase_monitoring_frequency(device_id)
            
        # Update ML model with feedback loop
        await self.ml_feedback.record({
            'device_id': device_id,
            'anomaly': predictions,
            'actual_outcome': None  # Will be updated later
        })

Predictive Maintenance Engine

typescriptclass PredictiveMaintenanceEngine {
  private readonly models = {
    hvac: new HVACFailurePredictor(),
    plumbing: new LeakDetectionModel(),
    electrical: new ElectricalFaultPredictor(),
    structural: new StructuralIssueDetector(),
    appliance: new ApplianceLifecyclePredictor()
  };
  
  async analyzePredictiveMaintenance(
    propertyId: string
  ): Promise<MaintenanceAnalysis> {
    // Gather all sensor data
    const sensorData = await this.gatherPropertySensorData(propertyId);
    
    // Run system-specific predictions
    const predictions = await Promise.all([
      this.predictHVACMaintenance(sensorData.hvac),
      this.predictPlumbingIssues(sensorData.water),
      this.predictElectricalProblems(sensorData.electrical),
      this.predictApplianceFailures(sensorData.appliances),
      this.predictStructuralIssues(sensorData.structural)
    ]);
    
    // Generate maintenance schedule
    const schedule = this.optimizeMaintenanceSchedule(predictions, {
      urgency: this.calculateUrgencyScores(predictions),
      cost: await this.estimateMaintenanceCosts(predictions),
      availability: await this.checkContractorAvailability(propertyId),
      tenant_impact: this.assessTenantImpact(predictions)
    });
    
    // Calculate ROI of predictive maintenance
    const roi = this.calculateMaintenanceROI({
      prevented_failures: predictions.filter(p => p.prevented),
      early_detection_savings: this.calculateEarlyDetectionSavings(predictions),
      reduced_emergency_calls: this.estimateEmergencyReduction(predictions)
    });
    
    return {
      property_id: propertyId,
      predictions: predictions,
      maintenance_schedule: schedule,
      estimated_savings: roi.total_savings,
      priority_issues: this.prioritizeIssues(predictions),
      automated_work_orders: await this.createWorkOrders(schedule)
    };
  }
  
  private async predictHVACMaintenance(
    hvacData: HVACSensorData
  ): Promise<HVACPrediction> {
    // Analyze efficiency degradation
    const efficiencyTrend = this.analyzeEfficiencyTrend(hvacData.historical);
    
    // Detect abnormal patterns
    const patterns = {
      short_cycling: this.detectShortCycling(hvacData.runtime_data),
      temperature_drift: this.detectTemperatureDrift(hvacData.temp_data),
      pressure_anomalies: this.detectPressureAnomalies(hvacData.pressure_data),
      unusual_noise: this.analyzeAcousticSignature(hvacData.acoustic_data)
    };
    
    // Predict component failures
    const componentHealth = {
      compressor: await this.models.hvac.predictCompressorLife(hvacData),
      fan_motor: await this.models.hvac.predictFanMotorFailure(hvacData),
      refrigerant: this.detectRefrigerantLeak(hvacData),
      filters: this.predictFilterReplacement(hvacData)
    };
    
    // Generate recommendations
    const recommendations = this.generateHVACRecommendations({
      patterns,
      componentHealth,
      efficiency: efficiencyTrend
    });
    
    return {
      system_health: this.calculateOverallHealth(componentHealth),
      failure_probability: this.calculateFailureProbability(componentHealth),
      time_to_failure: this.estimateTimeToFailure(componentHealth),
      maintenance_needed: recommendations,
      estimated_cost: await this.estimateHVACMaintenanceCost(recommendations),
      energy_savings: this.calculatePotentialEnergySavings(efficiencyTrend)
    };
  }
}
Real-Time Monitoring Dashboard
javascript// N8n IoT Monitoring Workflow
{
  "nodes": [
    {
      "name": "IoT Event Stream Processor",
      "type": "n8n-nodes-base.code",
      "parameters": {
        "code": `
          const event = $input.item.json;
          
          // Classify event severity
          const severity = classifyEventSeverity(event);
          
          // Process based on severity
          switch(severity) {
            case 'emergency':
              // Immediate response required
              await handleEmergency(event);
              break;
              
            case 'critical':
              // Water leak detected
              if (event.type === 'water_leak') {
                // Shut off water valve
                await sendCommand(event.property_id, 'water_valve', 'close');
                
                // Send immediate alerts
                await sendAlert({
                  type: 'SMS',
                  recipients: ['owner', 'property_manager', 'plumber'],
                  message: \`URGENT: Water leak detected at \${event.location}\`
                });
                
                // Create emergency work order
                await createWorkOrder({
                  type: 'emergency',
                  category: 'plumbing',
                  property: event.property_id,
                  description: event.description,
                  photos: event.camera_snapshots
                });
              }
              
              // Fire/smoke detected
              if (event.type === 'fire_smoke') {
                // Trigger all safety protocols
                await executeSafetyProtocol('fire', event.property_id);
                
                // Call emergency services
                await callEmergencyServices({
                  type: 'fire',
                  address: event.property_address,
                  automated_call: true
                });
              }
              break;
              
            case 'warning':
              // HVAC efficiency drop
              if (event.type === 'hvac_efficiency') {
                // Adjust settings for optimization
                const optimized = await optimizeHVACSettings({
                  current: event.current_settings,
                  outdoor_temp: event.weather.temperature,
                  occupancy: event.occupancy_status,
                  time_of_day: event.timestamp
                });
                
                await updateHVACSettings(event.property_id, optimized);
                
                // Schedule maintenance if needed
                if (event.efficiency_drop > 20) {
                  await scheduleMaintenance({
                    type: 'hvac_service',
                    urgency: 'routine',
                    estimated_date: getNextAvailableSlot()
                  });
                }
              }
              
              // High energy consumption
              if (event.type === 'energy_spike') {
                // Identify cause
                const analysis = await analyzeEnergySpike(event);
                
                // Suggest optimizations
                await sendEnergyReport({
                  property: event.property_id,
                  analysis: analysis,
                  recommendations: generateEnergySavingTips(analysis),
                  potential_savings: calculateSavings(analysis)
                });
              }
              break;
              
            case 'info':
              // Routine sensor readings
              await logSensorData(event);
              
              // Update property health score
              await updatePropertyHealthScore({
                property: event.property_id,
                metric: event.sensor_type,
                value: event.value
              });
              break;
          }
          
          // ML-based pattern detection
          const patterns = await detectPatterns({
            current_event: event,
            historical_data: await getHistoricalData(event.property_id, 30),
            similar_properties: await getSimilarPropertyData(event.property_id)
          });
          
          if (patterns.anomaly_detected) {
            await investigateAnomaly(patterns);
          }
          
          // Update real-time dashboard
          await updateDashboard({
            property_id: event.property_id,
            sensor: event.sensor_id,
            value: event.value,
            status: severity,
            timestamp: event.timestamp,
            predictions: patterns.predictions
          });
          
          return {
            processed: true,
            severity: severity,
            actions_taken: event.actions || [],
            patterns: patterns
          };
        `
      }
    }
  ]
}
Technical Specifications
IoT Architecture
yamliot_architecture:
  edge_layer:
    gateways:
      primary: raspberry_pi_4
      compute: nvidia_jetson_nano
      protocol_support:
        - zigbee
        - z_wave
        - wifi
        - bluetooth_le
        - lora
        
    local_processing:
      ml_inference: tensorflow_lite
      time_series_db: influxdb
      message_broker: mqtt
      container_runtime: docker
      
  device_layer:
    sensors:
      environmental:
        - temperature_humidity: DHT22
        - air_quality: MQ135
        - co2: MH-Z19B
        - light: BH1750
        
      security:
        - motion: PIR_HC-SR501
        - door_window: magnetic_reed
        - glass_break: acoustic
        - cameras: ip_cameras_with_ai
        
      utilities:
        - water_leak: rope_sensor
        - water_flow: ultrasonic
        - electricity: current_transformer
        - gas: MQ5
        
      structural:
        - vibration: accelerometer
        - moisture: soil_moisture
        - pressure: barometric
        
  cloud_layer:
    platforms:
      - aws_iot_core
      - azure_iot_hub
      - google_cloud_iot
      
    analytics:
      stream_processing: kinesis
      batch_processing: spark
      ml_platform: sagemaker
      visualization: grafana
Success Criteria
Performance Metrics

Response Time: <100ms for local actions, <1s for cloud
Device Connectivity: 99.99% uptime for critical sensors
Data Processing: 10B readings/day with <1% loss
Alert Latency: <2s for emergency notifications
Prediction Accuracy: >90% for maintenance predictions

Quality Metrics

False Positive Rate: <5% for alerts
Maintenance Prevention: 95% of issues caught early
Energy Savings: 25% reduction through optimization
Device Compatibility: Support 95% of market devices
User Satisfaction: 4.8+ rating on monitoring accuracy

Business Impact Metrics

Maintenance Cost: 40% reduction in emergency repairs
Property Damage: 80% reduction in water/fire damage
Insurance Premiums: 20% discount for monitored properties
Occupancy Rates: 15% increase due to smart amenities
Energy Efficiency: 30% reduction in utility costs

Testing Requirements
IoT System Tests
python@pytest.mark.iot
class TestIoTMonitoring:
    async def test_sensor_data_processing(self):
        # Arrange
        gateway = EdgeGateway()
        sensor_data = generate_sensor_readings(count=10000)
        
        # Act
        start = time.time()
        results = await gateway.process_batch(sensor_data)
        processing_time = time.time() - start
        
        # Assert
        assert all(r['processed'] for r in results)
        assert processing_time < 1.0  # Process 10K readings in <1s
        
    async def test_emergency_response_time(self):
        # Arrange
        monitor = PropertyMonitor()
        water_leak_event = create_leak_event(severity='critical')
        
        # Act
        start = time.time()
        response = await monitor.handle_event(water_leak_event)
        response_time = time.time() - start
        
        # Assert
        assert response_time < 0.1  # <100ms response
        assert response['valve_closed'] == True
        assert response['alert_sent'] == True
        assert response['work_order_created'] == True
Monitoring & Observability
IoT Platform Metrics
yamliot_monitoring:
  device_health:
    - metric: device_online_rate
      threshold: > 99%
      alert: if < 95%
      
    - metric: sensor_reading_accuracy
      validation: cross_reference_multiple
      threshold: deviation < 5%
      
  system_performance:
    - metric: edge_processing_latency
      p95: < 100ms
      p99: < 500ms
      
    - metric: data_pipeline_throughput
      minimum: 100K_readings_per_second
      
  predictive_accuracy:
    - metric: maintenance_prediction_accuracy
      measurement: true_positives / total_predictions
      threshold: > 90%
      
    - metric: false_alarm_rate
      threshold: < 5%
      evaluation: weekly
Implementation Checklist

 Phase 1: Edge Infrastructure (Week 1-2)

 Deploy edge gateways
 Install local databases
 Set up ML inference
 Configure device protocols
 Test local processing


 Phase 2: Sensor Network (Week 3-4)

 Install environmental sensors
 Deploy security devices
 Add utility monitors
 Configure device mesh
 Validate data flow


 Phase 3: Intelligence Layer (Week 5-6)

 Train predictive models
 Deploy anomaly detection
 Build automation rules
 Create alert system
 Test predictions


 Phase 4: Integration & Launch (Week 7-8)

 Connect smart home platforms
 Build monitoring dashboard
 Create mobile apps
 User training
 Production rollout