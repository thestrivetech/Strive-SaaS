"""Initialize Qdrant collections for Strive real estate database"""

import json
import os
from pathlib import Path
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, OptimizersConfigDiff

# Qdrant connection settings
QDRANT_HOST = os.getenv("QDRANT_HOST", "localhost")
QDRANT_PORT = int(os.getenv("QDRANT_PORT", "6333"))

# Map distance names to Qdrant Distance enum
DISTANCE_MAP = {
    "Cosine": Distance.COSINE,
    "Euclidean": Distance.EUCLID,
    "Dot": Distance.DOT
}

def load_collections_config():
    """Load collections configuration from JSON file"""
    config_path = Path(__file__).parent / "collections.config.json"
    with open(config_path, 'r') as f:
        return json.load(f)

def create_collection(client: QdrantClient, collection_config: dict):
    """Create a single Qdrant collection"""
    name = collection_config["name"]

    # Check if collection already exists
    existing_collections = client.get_collections().collections
    if any(col.name == name for col in existing_collections):
        print(f"Collection '{name}' already exists. Skipping...")
        return

    # Extract vector configuration
    vector_config = collection_config["vector_config"]
    vector_size = vector_config["size"]
    distance_metric = DISTANCE_MAP[vector_config["distance"]]

    # Extract optimizer configuration
    optimizers_config = collection_config.get("optimizers_config", {})
    indexing_threshold = optimizers_config.get("indexing_threshold", 20000)

    # Create the collection
    client.create_collection(
        collection_name=name,
        vectors_config=VectorParams(
            size=vector_size,
            distance=distance_metric
        ),
        optimizers_config=OptimizersConfigDiff(
            indexing_threshold=indexing_threshold
        )
    )

    print(f"✓ Created collection '{name}'")
    print(f"  - Vector size: {vector_size}")
    print(f"  - Distance: {vector_config['distance']}")
    print(f"  - Indexing threshold: {indexing_threshold}")

    # Create payload indexes for efficient filtering
    payload_schema = collection_config.get("payload_schema", {})
    for field_name, field_type in payload_schema.items():
        try:
            if field_type in ["keyword", "text"]:
                client.create_payload_index(
                    collection_name=name,
                    field_name=field_name,
                    field_schema="keyword" if field_type == "keyword" else "text"
                )
                print(f"  - Created index for '{field_name}' ({field_type})")
        except Exception as e:
            print(f"  - Warning: Could not create index for '{field_name}': {e}")

def main():
    """Initialize all Qdrant collections"""
    print("=" * 70)
    print("QDRANT COLLECTIONS INITIALIZATION")
    print("=" * 70)
    print()

    # Connect to Qdrant
    print(f"Connecting to Qdrant at {QDRANT_HOST}:{QDRANT_PORT}...")
    try:
        client = QdrantClient(host=QDRANT_HOST, port=QDRANT_PORT)
        print("✓ Connected successfully")
        print()
    except Exception as e:
        print(f"✗ Failed to connect to Qdrant: {e}")
        print("\nMake sure Qdrant is running:")
        print("  docker-compose -f docker-compose.qdrant.yml up -d")
        return

    # Load configuration
    print("Loading collections configuration...")
    config = load_collections_config()
    collections = config["collections"]
    print(f"✓ Found {len(collections)} collections to create")
    print()

    # Create each collection
    for collection_config in collections:
        print(f"Creating collection: {collection_config['name']}")
        print(f"Description: {collection_config['description']}")
        try:
            create_collection(client, collection_config)
            print()
        except Exception as e:
            print(f"✗ Error creating collection '{collection_config['name']}': {e}")
            print()

    # List all collections
    print("=" * 70)
    print("CURRENT COLLECTIONS:")
    print("=" * 70)
    collections_list = client.get_collections().collections
    for col in collections_list:
        info = client.get_collection(col.name)
        print(f"\n{col.name}:")
        print(f"  - Vectors count: {info.vectors_count}")
        print(f"  - Points count: {info.points_count}")
        print(f"  - Status: {info.status}")

    print("\n" + "=" * 70)
    print("✓ Initialization complete!")
    print("=" * 70)

if __name__ == "__main__":
    main()
