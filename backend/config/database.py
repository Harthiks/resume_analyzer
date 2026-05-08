"""
Database configuration — async Motor client for MongoDB Atlas.
Uses tlsAllowInvalidCertificates for Python 3.14 SSL compatibility.
"""
from motor.motor_asyncio import AsyncIOMotorClient
from config.settings import settings


class Database:
    client: AsyncIOMotorClient = None
    db = None


db_instance = Database()


async def connect_db():
    """Create async MongoDB connection."""
    db_instance.client = AsyncIOMotorClient(
        settings.MONGODB_URL,
        serverSelectionTimeoutMS=15000,
        connectTimeoutMS=15000,
        tlsAllowInvalidCertificates=True,   # Python 3.14 SSL workaround
        tlsAllowInvalidHostnames=True,
    )
    db_instance.db = db_instance.client[settings.DATABASE_NAME]
    try:
        await db_instance.client.admin.command("ping")
        print("[DB] Connected to MongoDB Atlas -", settings.DATABASE_NAME)
    except Exception as e:
        print("[DB] WARNING: Could not ping MongoDB:", str(e)[:100])
        print("[DB] TIP: Go to MongoDB Atlas > Network Access > Add 0.0.0.0/0")
        print("[DB] TIP: Or use Python 3.11 / 3.12 for full TLS support")


async def close_db():
    if db_instance.client:
        db_instance.client.close()
        print("[DB] Connection closed")


def get_db():
    return db_instance.db


def get_collection(name: str):
    return db_instance.db[name]
