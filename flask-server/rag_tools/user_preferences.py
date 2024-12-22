from pydantic import BaseModel, Field
from typing import Any, Dict
from datetime import datetime
import numpy as np
# from scipy.spatial.distance import cosine
from uuid import uuid4
from langchain.tools import BaseTool
from textembedding import get_embedding

from pymongo import MongoClient
from bson.son import SON

from mongoconnect import connect_to_mongo

connect_to_mongo()

class ModifyUserPreferenceTool(BaseTool):
    name: str = "modify_user_preference"
    description: str = "Modifies user preferences in MongoDB by finding the closest matching embedding and updating the content."

    db: Any = Field(default=None)
    user_id: str = Field(default_factory=lambda: "")
    collection_name: str = Field(default_factory=lambda: "user_preferences")

    def __init__(self, db: Any, user_id: str, collection_name: str = "user_preferences"):
        super().__init__(db=db, user_id=user_id, collection_name=collection_name)

    def _run(self, preference_title: str = None, new_content: str = None) -> str:
        try:
            # Step 1: Generate embedding for the preference title
            title_embedding = get_embedding(preference_title)

            # Step 2: Query MongoDB to find the most similar preference
            results = self.query_user_preference(title_embedding)

            # Step 3: Update the most similar preference (if any)
            if results:
                best_match = results[0]
                return self.update_user_preference(best_match, new_content)
            else:
                return f"No matching preference found for title '{preference_title}'."

        except Exception as e:
            return f"Error processing request: {str(e)}"

    def query_user_preference(self, query_embedding: list, top_n: int = 1) -> list:
        """
        Query MongoDB collection for user preferences using the given query embedding.
        Returns the top N most similar preferences based on cosine similarity.
        """
        try:
            results = list(self.db[self.collection_name].aggregate([
                {
                    "$vectorSearch": {
                        "index": "vector_index",
                        "path": "embedding",
                        "queryVector": query_embedding,
                        "numCandidates": 100,
                        "limit": top_n
                    }
                },
                {
                    "$match": {
                        "user_id": self.user_id
                    }
                },
                {
                    "$project": {
                        "preference_title": 1,
                        "preference_content": 1,
                        "score": {
                            "$meta": "vectorSearchScore"
                        }
                    }
                }
            ]))

            preferences = []
            for result in results:
                preferences.append({
                    "_id": result["_id"],
                    "preference_title": result["preference_title"],
                    "preference_content": result["preference_content"],
                    "similarity_score": result["score"]
                })
            return preferences

        except Exception as e:
            print(f"Error querying user preferences: {str(e)}")
            raise RuntimeError(f"Failed to query user preferences: {str(e)}")

    def update_user_preference(self, best_match: dict, new_content: str) -> str:
        """
        Update the content of a user preference in the MongoDB collection.
        """
        try:
            update_data = {
                "$set": {
                    "preference_content": new_content,
                    "embedding": get_embedding(new_content)  # Recalculate embedding for new content
                }
            }

            result = self.db[self.collection_name].update_one(
                {"_id": best_match["_id"]},
                update_data
            )

            if result.modified_count > 0:
                return f"Successfully modified preference '{best_match['preference_title']}' (similarity: {best_match['similarity_score']:.4f})."
            else:
                return f"Failed to modify preference '{best_match['preference_title']}' despite finding a match."

        except Exception as e:
            print(f"Error occurred: {str(e)}")
            return f"Error modifying preference: {str(e)}"

    async def _arun(self, *args, **kwargs):
        raise NotImplementedError("ModifyUserPreferenceTool does not support async operations")

class StoreUserPreferenceTool(BaseTool):
    name: str = "store_user_preference"
    description: str = "Stores a new user preference in MongoDB with title, content, and an embedding vector."

    db: Any = Field(default=None)
    user_id: str = Field(default_factory=lambda: "")
    collection_name: str = Field(default_factory=lambda: "user_preferences")

    def __init__(self, db: Any, user_id: str, collection_name: str = "user_preferences"):
        super().__init__()
        self.db = db
        self.user_id = user_id
        self.collection_name = collection_name

    def _run(self, preference_title: str, preference_content: str) -> str:
        try:
            # Step 1: Generate an embedding for the preference content
            embedding = get_embedding(preference_content)

            # Step 2: Create the preference document
            preference_document = {
                "user_id": self.user_id,
                "preference_title": preference_title,
                "preference_content": preference_content,
                "embedding": embedding,  # Store as list for JSON compatibility
                "createdAt": datetime.now(),
            }

            # Step 3: Insert the preference document into MongoDB
            result = self.db[self.collection_name].insert_one(preference_document)
            return f"Preference '{preference_title}' stored successfully with ID: {result.inserted_id}."

        except Exception as e:
            return f"Error storing preference: {str(e)}"

class FetchUserPreferenceTool(BaseTool):
    name: str = "fetch_user_preference"
    description: str = "Fetches a user preference from MongoDB by finding the closest matching embedding."

    db: Any = Field(default="rag_database")
    user_id: str = Field(default_factory=lambda: "")
    collection_name: str = Field(default_factory=lambda: "user_preferences")

    def __init__(self, db: Any, user_id: str, collection_name: str = "user_preferences"):
        super().__init__(db=db, user_id=user_id, collection_name=collection_name)

    def _run(self, query: str) -> str:
        try:
            # Step 1: Check if any preferences exist for the user
            if not self.has_preferences():
                return "No preferences found for the user."

            # Step 2: Generate an embedding for the user query
            query_embedding = get_embedding(query)

            # Step 3: Query MongoDB using the generated embedding
            results = self.query_user_preference(query_embedding)

            # Step 4: Return the top result (if any)
            if results:
                top_result = results[0]
                return f"Found preference: '{top_result['preference_title']}' - {top_result['preference_content']} (similarity: {top_result['similarity_score']:.4f})"
            else:
                return "No matching preference found."

        except Exception as e:
            return f"Error fetching preference: {str(e)}"

    def has_preferences(self) -> bool:
        """
        Checks if there are any preferences for the user in the database.
        Returns True if preferences exist, otherwise False.
        """
        try:
            preference_count = self.db[self.collection_name].count_documents({"user_id": self.user_id})
            print(f"Preference count for user '{self.user_id}': {preference_count}")
            return preference_count > 0
        except Exception as e:
            print(f"Error checking user preferences: {str(e)}")
            raise RuntimeError(f"Failed to check user preferences: {str(e)}")

    def query_user_preference(self, query_embedding: list, top_n: int = 5) -> list:
        """
        Query MongoDB collection for user preferences using the given query embedding.
        Returns the top N most similar preferences based on cosine similarity.
        """
        try:
            # Perform the search using the `$search` aggregation stage
            results = list(self.db[self.collection_name].aggregate([
                {
                    "$vectorSearch": {
                        "index": "vector_index",
                        "path": "embedding",
                        "queryVector": query_embedding,
                        "numCandidates": 5,
                        "limit": top_n
                    }
                },
                {
                    "$match": {
                        "user_id": self.user_id
                    }
                },
                {
                    "$project": {
                        "preference_title": 1, 
                        "preference_content": 1, 
                        "score": {
                            "$meta": "vectorSearchScore"
                        }
                    }
                }
            ]))
            
            # Parse and return the results
            preferences = []
            for result in results:
                preferences.append({
                    "preference_title": result["preference_title"],
                    "preference_content": result["preference_content"],
                    "similarity_score": result["score"]
                })
            return preferences

        except Exception as e:
            print(f"Error querying user preferences: {str(e)}")
            raise RuntimeError(f"Failed to query user preferences: {str(e)}")
        
class DeleteUserPreferenceTool(BaseTool):
    name: str = "delete_user_preference"
    description: str = "Deletes user preferences from MongoDB. Supports both exact and semantic search."

    db: Any = Field(default="rag_database")
    user_id: str = Field(default_factory=lambda: "")
    collection_name: str = Field(default_factory=lambda: "user_preferences")

    def __init__(self, db: Any, user_id: str, collection_name: str = "user_preferences"):
        super().__init__(db=db, user_id=user_id, collection_name=collection_name)

    def _run(self, preference_title: str = None) -> str:
        try:
            # Step 1: Check if any preferences exist for the user
            if not self.has_preferences():
                return "No preferences found for the user to delete."

            # Step 2: Otherwise, proceed with semantic deletion
            return self.delete_semantic_preference(preference_title)

        except Exception as e:
            return f"Error processing request: {str(e)}"

    def has_preferences(self) -> bool:
        """
        Checks if there are any preferences for the user in the database.
        Returns True if preferences exist, otherwise False.
        """
        try:
            preference_count = self.db[self.collection_name].count_documents({"user_id": self.user_id})
            print(f"Preference count for user '{self.user_id}': {preference_count}")
            return preference_count > 0
        except Exception as e:
            print(f"Error checking user preferences: {str(e)}")
            raise RuntimeError(f"Failed to check user preferences: {str(e)}")


    def delete_semantic_preference(self, query: str) -> str:
        """
        Deletes a user preference based on semantic similarity search.
        """
        try:
            # Step 1: Generate an embedding for the user query
            query_embedding = get_embedding(query)
            
            # Step 2: Search for the most similar preference using `$vectorSearch`
            results = list(self.db[self.collection_name].aggregate([
                {
                    "$vectorSearch": {
                        "index": "vector_index",
                        "path": "embedding",
                        "queryVector": query_embedding,
                        "numCandidates": 5,
                        "limit": 1
                    }
                },
                {
                    "$match": {
                        "user_id": self.user_id
                    }
                },
                {
                    "$project": {
                        "preference_title": 1, 
                        "preference_content": 1, 
                        "score": {
                            "$meta": "vectorSearchScore"
                        }
                    }
                }
            ]))
            
            if not results:
                return "No preferences found matching the query."

            # Step 3: Delete the top result
            top_result = results[0]
            print(f"Top result for deletion: {top_result}")
            
            filter_conditions = {
                "user_id": self.user_id,
                "preference_title": top_result["preference_title"]
            }

            result = self.db[self.collection_name].delete_one(filter_conditions)
            if result.deleted_count > 0:
                return f"Successfully deleted preference: '{top_result['preference_title']}' - {top_result['preference_content']}."
            else:
                return "Failed to delete the matched preference."
        except Exception as e:
            print(f"Error during semantic deletion: {str(e)}")
            return f"Error deleting preference: {str(e)}"

    async def _arun(self, *args, **kwargs):
        raise NotImplementedError("DeleteUserPreferenceTool does not support async operations")
