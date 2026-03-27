"""
Shared database utilities for MongoDB connection.
"""

import os
from motor.motor_asyncio import AsyncIOMotorClient

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")

_client = None


async def get_mongo_client() -> AsyncIOMotorClient:
    """Get or create MongoDB client (singleton)."""
    global _client
    if _client is None:
        _client = AsyncIOMotorClient(MONGO_URI)
    return _client


async def get_database(db_name: str):
    """Get a MongoDB database by name."""
    client = await get_mongo_client()
    return client[db_name]


async def close_mongo_client():
    """Close the MongoDB client."""
    global _client
    if _client:
        _client.close()
        _client = None
