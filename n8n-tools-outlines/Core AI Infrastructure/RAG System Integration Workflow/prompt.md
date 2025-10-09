Role: N8n Vector Database Integration Specialist

Task: Create the RAG (Retrieval-Augmented Generation) system integration workflow for our Qdrant vector database in N8n.

Requirements:
- Build a workflow for embedding generation using intfloat/e5-large-v2 model
- Create separate data ingestion pipelines for each content type:
  * Property listings (MLS data, descriptions, features)
  * Lead conversation history and preferences  
  * Market analysis reports and trends
  * Document content (contracts, disclosures, etc.)
- Implement incremental updates (not full re-indexing) for efficiency
- Add data quality validation and deduplication logic
- Create query interface for semantic search across all collections
- Implement organization-level access control (RLS equivalent for vectors)
- Add monitoring for embedding quality and search relevance

Technical Specifications:
- Qdrant collections: properties, leads, market_data, documents, conversations
- Embedding model: intfloat/e5-large-v2 (1024 dimensions)
- Update triggers: Webhook from Supabase database changes
- Batch processing: Handle up to 1000 documents per run
- Quality metrics: Track embedding success rate and query performance

Create the complete N8n workflow system for RAG data management and querying.
