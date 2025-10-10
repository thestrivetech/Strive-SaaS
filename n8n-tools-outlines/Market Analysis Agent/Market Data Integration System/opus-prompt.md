Prompt #14: Market Data Integration System (Enhanced)
Role
Senior N8n Real Estate Data Integration Engineer specializing in ETL pipelines, data quality management, real-time synchronization, and distributed data systems.
Context

Volume: Process 100k+ property updates daily, maintain 10M+ property records
Performance: Real-time updates < 500ms latency, batch processing 50k records/minute
Integration: 15+ MLS systems, public records, economic APIs, school databases, demographic sources
Compliance: MLS data usage agreements, GDPR, CCPA, data residency requirements
Scale: Support 500k daily updates within 6 months, 2M within 1 year

Primary Objective
Create a unified market data platform achieving 99.5% data accuracy and completeness while maintaining real-time synchronization across all integrated sources.
Enhanced Requirements
Data Integration Pipeline
pythonimport asyncio
import aiohttp
from typing import Dict, List, Optional
import apache_beam as beam
from apache_beam.options.pipeline_options import PipelineOptions
from confluent_kafka import Producer, Consumer
import redis
from qdrant_client import QdrantClient
import hashlib
import json

class MarketDataIntegrator:
    def __init__(self):
        self.kafka_producer = Producer({
            'bootstrap.servers': 'kafka-broker:9092',
            'compression.type': 'snappy',
            'batch.size': 16384,
            'linger.ms': 10
        })
        
        self.redis_client = redis.Redis(
            host='redis-cluster',
            port=6379,
            decode_responses=True,
            connection_pool=redis.BlockingConnectionPool(max_connections=50)
        )
        
        self.qdrant_client = QdrantClient(
            host="qdrant-server",
            port=6333,
            api_key="your-api-key"
        )
        
        self.data_sources = {
            'mls': MLSIntegrator(),
            'public_records': PublicRecordsIntegrator(),
            'economic': EconomicDataIntegrator(),
            'schools': SchoolDataIntegrator(),
            'demographics': DemographicsIntegrator()
        }
    
    async def process_real_time_updates(self):
        """
        Process real-time property updates from multiple MLS feeds
        """
        async with aiohttp.ClientSession() as session:
            tasks = []
            
            for mls_system in self.mls_configs:
                task = self.subscribe_to_mls_feed(session, mls_system)
                tasks.append(task)
            
            await asyncio.gather(*tasks)
    
    async def subscribe_to_mls_feed(self, session, mls_config):
        """
        Subscribe to real-time MLS WebSocket feed
        """
        ws_url = mls_config['websocket_url']
        
        async with session.ws_connect(ws_url) as websocket:
            await websocket.send_json({
                'action': 'subscribe',
                'auth': mls_config['credentials'],
                'filters': {
                    'event_types': ['new_listing', 'price_change', 'status_change', 'sold'],
                    'property_types': ['residential', 'condo', 'townhouse']
                }
            })
            
            async for msg in websocket:
                if msg.type == aiohttp.WSMsgType.TEXT:
                    update = json.loads(msg.data)
                    await self.process_mls_update(update, mls_config['source_id'])
    
    async def process_mls_update(self, update: Dict, source_id: str):
        """
        Process individual MLS update with validation and enrichment
        """
        # Validate update
        if not self.validate_mls_data(update):
            await self.handle_invalid_data(update, source_id)
            return
        
        # Normalize data
        normalized = self.normalize_mls_data(update, source_id)
        
        # Check for duplicates using content hash
        content_hash = self.generate_content_hash(normalized)
        if await self.is_duplicate(content_hash):
            return
        
        # Enrich with additional data
        enriched = await self.enrich_property_data(normalized)
        
        # Update vector embeddings
        await self.update_vector_embeddings(enriched)
        
        # Publish to Kafka for downstream processing
        self.kafka_producer.produce(
            'property-updates',
            key=enriched['property_id'],
            value=json.dumps(enriched),
            callback=self.delivery_report
        )
        
        # Update cache
        await self.update_cache(enriched)
        
        # Track metrics
        await self.track_ingestion_metrics(source_id, 'success')
    
    def normalize_mls_data(self, data: Dict, source_id: str) -> Dict:
        """
        Normalize MLS data to standard schema
        """
        mapping = self.get_field_mapping(source_id)
        normalized = {}
        
        for standard_field, source_field in mapping.items():
            value = self.extract_nested_value(data, source_field)
            
            # Apply field-specific transformations
            if standard_field == 'price':
                value = self.normalize_price(value)
            elif standard_field == 'square_feet':
                value = self.normalize_area(value, source_id)
            elif standard_field == 'property_type':
                value = self.normalize_property_type(value, source_id)
            
            normalized[standard_field] = value
        
        # Add metadata
        normalized['source'] = source_id
        normalized['ingested_at'] = datetime.utcnow().isoformat()
        normalized['data_version'] = self.schema_version
        
        return normalized
    
    async def enrich_property_data(self, property_data: Dict) -> Dict:
        """
        Enrich property with additional data sources
        """
        enrichment_tasks = [
            self.enrich_with_public_records(property_data),
            self.enrich_with_school_data(property_data),
            self.enrich_with_demographics(property_data),
            self.enrich_with_economic_data(property_data),
            self.enrich_with_crime_data(property_data),
            self.enrich_with_walkability(property_data),
            self.enrich_with_tax_data(property_data)
        ]
        
        enrichments = await asyncio.gather(*enrichment_tasks, return_exceptions=True)
        
        # Merge enrichments
        for enrichment in enrichments:
            if not isinstance(enrichment, Exception):
                property_data.update(enrichment)
        
        return property_data
    
    def create_beam_pipeline(self):
        """
        Apache Beam pipeline for batch processing
        """
        pipeline_options = PipelineOptions([
            '--runner=DataflowRunner',
            '--project=your-project',
            '--region=us-central1',
            '--temp_location=gs://your-bucket/temp',
            '--streaming'
        ])
        
        with beam.Pipeline(options=pipeline_options) as pipeline:
            # Read from multiple sources
            mls_data = (
                pipeline
                | 'Read MLS' >> beam.io.ReadFromPubSub(topic='mls-updates')
                | 'Parse MLS' >> beam.Map(json.loads)
            )
            
            public_records = (
                pipeline
                | 'Read Public Records' >> beam.io.ReadFromBigQuery(
                    query='SELECT * FROM public_records.properties WHERE updated_at > TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 1 DAY)'
                )
            )
            
            # Join and process
            merged_data = (
                {'mls': mls_data, 'public': public_records}
                | 'CoGroup' >> beam.CoGroupByKey()
                | 'Merge Data' >> beam.ParDo(MergePropertyData())
            )
            
            # Data quality checks
            validated_data = (
                merged_data
                | 'Validate' >> beam.ParDo(ValidatePropertyData())
                | 'Filter Valid' >> beam.Filter(lambda x: x['is_valid'])
            )
            
            # Write to multiple sinks
            validated_data | 'Write to BigQuery' >> beam.io.WriteToBigQuery(
                table='processed.properties',
                schema=PROPERTY_SCHEMA,
                write_disposition=beam.io.BigQueryDisposition.WRITE_APPEND
            )
            
            validated_data | 'Write to Elasticsearch' >> beam.ParDo(WriteToElasticsearch())
            
            validated_data | 'Update Vectors' >> beam.ParDo(UpdateQdrantVectors())
Data Quality Management
javascript// N8n workflow for data quality monitoring
const dataQualityWorkflow = {
  name: 'Data_Quality_Monitor',
  nodes: [
    {
      name: 'Schedule_Trigger',
      type: 'n8n-nodes-base.cron',
      parameters: {
        cronExpression: '*/15 * * * *'  // Every 15 minutes
      }
    },
    {
      name: 'Check_Data_Freshness',
      type: 'n8n-nodes-base.postgres',
      parameters: {
        operation: 'executeQuery',
        query: `
          SELECT 
            source_system,
            MAX(updated_at) as last_update,
            EXTRACT(EPOCH FROM (NOW() - MAX(updated_at))) as seconds_since_update,
            COUNT(*) as updates_today
          FROM property_updates
          WHERE updated_at > CURRENT_DATE
          GROUP BY source_system
        `
      }
    },
    {
      name: 'Validate_Completeness',
      type: 'n8n-nodes-base.function',
      parameters: {
        functionCode: `
          const sources = $json["data"];
          const issues = [];
          
          // Check each data source
          for (const source of sources) {
            // Freshness check
            if (source.seconds_since_update > 3600) {  // 1 hour
              issues.push({
                type: 'staleness',
                severity: source.seconds_since_update > 7200 ? 'critical' : 'warning',
                source: source.source_system,
                message: \`No updates for \${Math.round(source.seconds_since_update / 60)} minutes\`,
                last_update: source.last_update
              });
            }
            
            // Volume check
            const expectedVolume = getExpectedVolume(source.source_system);
            const volumeRatio = source.updates_today / expectedVolume;
            
            if (volumeRatio < 0.8) {
              issues.push({
                type: 'low_volume',
                severity: volumeRatio < 0.5 ? 'critical' : 'warning',
                source: source.source_system,
                message: \`Only \${source.updates_today} updates today (expected \${expectedVolume})\`,
                volume_ratio: volumeRatio
              });
            }
          }
          
          return { issues, timestamp: new Date().toISOString() };
        `
      }
    },
    {
      name: 'Check_Data_Accuracy',
      type: 'n8n-nodes-base.postgres',
      parameters: {
        operation: 'executeQuery',
        query: `
          WITH accuracy_checks AS (
            SELECT 
              'price_outliers' as check_type,
              COUNT(*) as issue_count
            FROM properties
            WHERE price < 10000 OR price > 100000000
            
            UNION ALL
            
            SELECT 
              'invalid_coordinates' as check_type,
              COUNT(*) as issue_count
            FROM properties
            WHERE latitude NOT BETWEEN -90 AND 90
               OR longitude NOT BETWEEN -180 AND 180
            
            UNION ALL
            
            SELECT 
              'missing_required_fields' as check_type,
              COUNT(*) as issue_count
            FROM properties
            WHERE address IS NULL
               OR price IS NULL
               OR property_type IS NULL
          )
          SELECT * FROM accuracy_checks WHERE issue_count > 0
        `
      }
    },
    {
      name: 'Generate_Quality_Report',
      type: 'n8n-nodes-base.function',
      parameters: {
        functionCode: `
          const freshnessIssues = $node["Validate_Completeness"].json.issues;
          const accuracyIssues = $node["Check_Data_Accuracy"].json;
          
          const qualityScore = calculateQualityScore({
            freshness: freshnessIssues,
            accuracy: accuracyIssues
          });
          
          const report = {
            timestamp: new Date().toISOString(),
            overall_score: qualityScore,
            status: qualityScore > 95 ? 'healthy' : qualityScore > 85 ? 'degraded' : 'critical',
            metrics: {
              freshness: {
                score: calculateFreshnessScore(freshnessIssues),
                issues: freshnessIssues
              },
              accuracy: {
                score: calculateAccuracyScore(accuracyIssues),
                issues: accuracyIssues
              },
              completeness: {
                score: await calculateCompletenessScore(),
                missing_fields: await getMissingFieldStats()
              },
              consistency: {
                score: await calculateConsistencyScore(),
                conflicts: await getDataConflicts()
              }
            },
            recommendations: generateRecommendations(qualityScore)
          };
          
          // Store report
          await storeQualityReport(report);
          
          // Send alerts if critical
          if (report.status === 'critical') {
            await sendAlert({
              severity: 'high',
              title: 'Critical Data Quality Issues',
              details: report
            });
          }
          
          return report;
        `
      }
    }
  ]
};
Success Criteria
Performance Metrics

Real-time Latency: P50 < 200ms, P99 < 500ms
Batch Throughput: 50,000 records/minute
Data Freshness: 95% of updates processed within 1 minute
System Availability: 99.95% uptime

Quality Metrics

Data Accuracy: 99.5% accuracy across all fields
Completeness: 98% of required fields populated
Consistency: <0.1% conflicting records
Deduplication: 99.9% duplicate detection rate

Business Impact Metrics

Decision Speed: 60% faster property analysis
Data Coverage: 95% market coverage
Cost Reduction: 40% reduction in manual data entry
Error Reduction: 90% fewer data-related errors

Testing Requirements
pythondef test_data_normalization():
    """Test data normalization across different MLS formats"""
    test_cases = [
        {
            'source': 'mls_a',
            'input': {'ListPrice': '450000', 'SqFt': '2500', 'Type': 'SFR'},
            'expected': {'price': 450000, 'square_feet': 2500, 'property_type': 'single_family'}
        },
        {
            'source': 'mls_b',
            'input': {'Price': '$450,000', 'Area': '2500 sq ft', 'PropertyType': 'Single Family'},
            'expected': {'price': 450000, 'square_feet': 2500, 'property_type': 'single_family'}
        }
    ]
    
    for case in test_cases:
        result = normalize_mls_data(case['input'], case['source'])
        assert result == case['expected']

def test_duplicate_detection():
    """Test duplicate property detection"""
    property1 = {'address': '123 Main St', 'price': 450000, 'sqft': 2500}
    property2 = {'address': '123 Main Street', 'price': 450000, 'sqft': 2500}
    
    hash1 = generate_content_hash(property1)
    hash2 = generate_content_hash(property2)
    
    assert hash1 == hash2  # Should detect as duplicate despite address variation
Implementation Checklist

 Set up Kafka infrastructure for streaming
 Deploy Redis cluster for caching
 Configure Qdrant vector database
 Implement MLS webhook integrations
 Build data normalization layer
 Create deduplication system
 Implement data quality monitoring
 Set up Apache Beam pipelines
 Build enrichment services
 Create reconciliation processes
 Implement error handling and recovery
 Set up monitoring dashboards
 Create data lineage tracking
 Deploy to production with gradual rollout
 Implement backup and disaster recovery