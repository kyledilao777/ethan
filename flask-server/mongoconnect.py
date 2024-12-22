# mongoconnect.py
import os
from dotenv import load_dotenv
from pymongo import MongoClient

# Load environment variables
load_dotenv()

# MongoDB URI from environment variables
MONGO_URI = os.getenv("MONGODB_URI")

def connect_to_mongo():
    client = MongoClient(MONGO_URI)
    return client