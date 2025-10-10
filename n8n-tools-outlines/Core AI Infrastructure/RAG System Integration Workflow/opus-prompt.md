Prompt #2: RAG System Integration Workflow (Enhanced)
Role
N8n Vector Database Architecture Engineer specializing in semantic search and real estate domain knowledge.
Context

Vector Database: Qdrant Cloud/Self-hosted
Embedding Model: intfloat/e5-large-v2 (1024 dimensions)
Data Volume: 1M+ documents across 100+ organizations
Update Frequency: 10,000+ updates daily
Query Load: 50,000+ searches daily

Primary Objective
Build a production-grade RAG system that provides accurate, fast, and contextually relevant information retrieval for all AI agents while maintaining strict organizational data isolation.
Enhanced Requirements
Data Ingestion Pipeline

Multi-Source Integration

yaml   data_sources:
     - mls_listings:
         frequency: real-time
         volume: 5000/day
         fields: [address, price, description, features, photos]
     - lead_conversations:
         frequency: real-time
         volume: 10000/day
         fields: [transcript, sentiment, preferences, stage]
     - market_reports:
         frequency: daily
         volume: 100/day
         fields: [analysis, trends, forecasts, metrics]
     - documents:
         frequency: on-upload
         volume: 1000/day
         types: [contracts, disclosures, inspections]

Embedding Generation Pipeline

Implement batched embedding generation (batch size: 32)
Add embedding caching for duplicate content
Create quality validation (cosine similarity checks)
Implement retry mechanism for failed embeddings


Data Quality & Preprocessing

Text normalization (HTML stripping, encoding fixes)
Chunking strategy:

Semantic chunking with 512 token chunks
50 token overlap for context preservation
Metadata preservation (source, date, organization)


Deduplication using MinHash LSH
PII detection and masking


Collection Architecture

javascript   collections = {
     'properties': {
       vectors: 1024,
       distance: 'Cosine',
       indexing: 'HNSW',
       ef_construct: 200,
       m: 16
     },
     'conversations': {
       vectors: 1024,
       payload_index: ['organization_id', 'user_id', 'timestamp']
     },
     'market_data': {
       vectors: 1024,
       quantization: 'scalar',
       on_disk: true
     }
   }
Technical Specifications
Ingestion Workflow Configuration
json{
  "ingestion_pipeline": {
    "triggers": [
      {
        "type": "webhook",
        "source": "supabase",
        "events": ["insert", "update", "delete"]
      },
      {
        "type": "schedule",
        "cron": "0 */4 * * *",
        "job": "market_data_sync"
      }
    ],
    "stages": [
      {
        "name": "extract",
        "timeout_seconds": 30,
        "retry_count": 3
      },
      {
        "name": "transform",
        "chunking_size": 512,
        "overlap": 50
      },
      {
        "name": "embed",
        "batch_size": 32,
        "model": "e5-large-v2"
      },
      {
        "name": "load",
        "upsert": true,
        "validate": true
      }
    ]
  }
}
Query Interface Specification
javascriptconst searchParams = {
  query: "3 bedroom homes with pool",
  filters: {
    organization_id: "org_123",
    metadata: {
      price_range: [300000, 500000],
      property_type: "single_family"
    }
  },
  hybrid: {
    vector_weight: 0.7,
    keyword_weight: 0.3
  },
  limit: 10,
  include_metadata: true,
  score_threshold: 0.7
};
Success Criteria
Performance Metrics

Ingestion Speed: >1000 documents/minute
Embedding Generation: <100ms per document
Query Latency: P95 < 200ms
Index Build Time: <5 minutes for 100k documents

Quality Metrics

Retrieval Accuracy: >90% relevant results in top 5
Duplicate Detection: >95% accuracy
Data Freshness: <5 minute lag from source update
Organization Isolation: 100% data separation verified

Scalability Metrics

Storage Efficiency: <2GB per 100k documents
Concurrent Queries: Support 100 simultaneous searches
Collection Size: Handle 10M+ vectors per collection
Update Performance: No degradation with collection growth

Testing Requirements
Data Quality Tests
pythondef test_embedding_quality():
    # Test semantic similarity
    similar_texts = [
        "3 bedroom house with pool",
        "three bed home with swimming pool"
    ]
    embeddings = generate_embeddings(similar_texts)
    similarity = cosine_similarity(embeddings[0], embeddings[1])
    assert similarity > 0.85

def test_chunking_strategy():
    # Verify chunk overlap maintains context
    document = load_sample_document()
    chunks = create_chunks(document, size=512, overlap=50)
    assert all(len(chunk) <= 512 for chunk in chunks)
    assert chunks[0][-50:] == chunks[1][:50]
Integration Tests

Multi-tenant data isolation verification
Concurrent update handling
Search result relevance scoring
Metadata filtering accuracy

Monitoring & Observability
Key Metrics
yamlmetrics:
  ingestion:
    - documents_processed_per_minute
    - embedding_generation_time_ms
    - failed_documents_count
    - duplicate_documents_detected
  
  query:
    - search_latency_ms
    - results_returned_count
    - relevance_score_distribution
    - cache_hit_ratio
  
  storage:
    - total_vectors_count
    - index_size_mb
    - collection_distribution
    - organization_data_size
Implementation Checklist

 Configure Qdrant collections with proper indexing
 Set up Supabase webhook listeners
 Implement document chunking pipeline
 Configure embedding generation with batching
 Build deduplication system
 Create organization-based access control
 Implement hybrid search functionality
 Add comprehensive monitoring
 Create backup and recovery procedures
 Document query API for developers