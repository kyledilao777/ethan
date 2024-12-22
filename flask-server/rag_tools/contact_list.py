# ragmongo.py
from pydantic import BaseModel, Field
from typing import Type, Optional, List, Any, Dict
import json
from langchain.tools import BaseTool

class CreateContactTool(BaseTool):
    name: str = "create_contact"  # Add type annotation here
    description: str = """Creates a new contact in the MongoDB contact list collection.
    Input should be a JSON string with 'name', 'email', and 'relationship' fields.
    """

    db: Any = Field(default=None)
    user_email: str = Field(default="")
    collection_name: str = Field(default="contact_list")

    def __init__(self, db, user_email, collection_name="contact_list"):
            super().__init__()
            self.db = db
            self.user_email = user_email
            self.collection_name = collection_name

    def _run(self, name: str, email: str, relationship: str = "") -> str:
            try:
                # Check if the contact already exists
                existing_contact = self.db[self.collection_name].find_one({"metadata.email": email.lower()})
                
                if existing_contact:
                    return f"Contact with email {email} already exists."

                # Create a new contact document
                contact_document = {
                    "metadata": {
                        "name": name.lower(),
                        "email": email.lower(),
                        "relationship": relationship,
                        "created_by": self.user_email,
                    }
                }

                # Insert the new contact document into MongoDB
                result = self.db[self.collection_name].insert_one(contact_document)
                return f"Contact '{name}' created successfully with ID: {result.inserted_id}"
            except Exception as e:
                return f"Error creating contact: {str(e)}"

    async def _arun(self, *args, **kwargs):
        raise NotImplementedError("create_contact does not support async operations")
    
class ModifyContactTool(BaseTool):
    name: str = "modify_contact"
    description: str = "Modifies an existing contact in the MongoDB contact list collection."

    db: Any = Field(default_factory=lambda: None)
    user_email: str = Field(default_factory=lambda: "")
    collection_name: str = Field(default_factory=lambda: "contact_list")

    def __init__(self, db: Any, user_email: str, collection_name: str = "contact_list"):
        super().__init__(db=db, user_email=user_email, collection_name=collection_name)

    def _run(self, contact_name: str, new_name: str = None, new_email: str = None, new_relationship: str = None) -> str:
        try:
            print(f"Attempting to modify contact. Current name: {contact_name}")
            print(f"User email: {self.user_email}, Collection name: {self.collection_name}")

            # Query for the specific contact
            existing_contact = self.db[self.collection_name].find_one({
                "metadata.created_by": self.user_email,
                "metadata.name": contact_name.lower()
            })

            print(f"Search result: {existing_contact}")

            if not existing_contact:
                return f"Contact '{contact_name}' not found for user {self.user_email}"

            # Prepare the update document
            update_doc = {}
            print(update_doc)
            
            if new_name is not None:
                update_doc["metadata.name"] = new_name.lower()
                print(f"Updating name to: {new_name}")
            if new_email is not None:
                update_doc["metadata.email"] = new_email.lower()
                print(f"Updating email to: {new_email}")
            if new_relationship is not None:
                update_doc["metadata.relationship"] = new_relationship
                print(f"Updating relationship to: {new_relationship}")

            if not update_doc:
                return "No updates provided for the contact."

            # Update the document in MongoDB
            result = self.db[self.collection_name].update_one(
                {"_id": existing_contact["_id"]},
                {"$set": update_doc}
            )
            print(f"Update operation result: {result.modified_count} document(s) modified")

            if result.modified_count > 0:
                updated_name = new_name if new_name else contact_name
                return f"Contact '{updated_name}' updated successfully."
            else:
                return f"Failed to update contact '{contact_name}'. No changes were made."

        except Exception as e:
            print(f"Error occurred: {str(e)}")
            return f"Error modifying contact: {str(e)}"

    async def _arun(self, *args, **kwargs):
        raise NotImplementedError("modify_contact does not support async")

class DeleteContactTool(BaseTool):
    name: str = "delete_contact"
    description: str = "Deletes a contact from the MongoDB contact list collection."

    db: Any = Field(default_factory=lambda: None)
    user_email: str = Field(default_factory=lambda: "")
    collection_name: str = Field(default_factory=lambda: "contact_list")

    def __init__(self, db: Any, user_email: str, collection_name: str = "contact_list"):
        super().__init__(db=db, user_email=user_email, collection_name=collection_name)

    def _run(self, name: str = None, email: str = None) -> str:
        try:
            print(f"Attempting to delete contact. Name: {name}, Email: {email}")
            print(f"User email: {self.user_email}, Collection name: {self.collection_name}")
            
            filter_conditions = {
                "metadata.created_by": self.user_email
            }

            if name:
                filter_conditions["metadata.name"] = name.lower()
                print(f"Adding name condition: {name}")
            
            if email:
                filter_conditions["metadata.email"] = email.lower()
                print(f"Adding email condition: {email}")
                
            if len(filter_conditions) == 1:
                return "No valid contact information provided for deletion."

            print(f"Filter conditions: {filter_conditions}")
            
            result = self.db[self.collection_name].delete_many(filter_conditions)
            print(f"Delete operation result: {result.deleted_count} document(s) deleted")
            
            deleted_count = result.deleted_count

            if deleted_count > 0:
                return f"Successfully deleted {deleted_count} contact(s)."
            else:
                return "No matching contacts found to delete."

        except Exception as e:
            print(f"Error occurred: {str(e)}")
            return f"Error deleting contact: {str(e)}"

    async def _arun(self, *args, **kwargs):
        raise NotImplementedError("delete_contact does not support async operations")

class RetrieveContactTool(BaseTool):
    name: str = "retrieve_contact"
    description: str = "Retrieves contacts from the MongoDB contact list collection."

    db: Any = Field(default_factory=lambda: "rag_database")
    collection_name: str = Field(default_factory=lambda: "contact_list")
    user_email: str = Field(default_factory=lambda: "")

    def __init__(self, db: Any, user_email: str, collection_name: str = "contact_list"):
        super().__init__(db=db, user_email=user_email, collection_name=collection_name)

    def _run(self, query: str = "") -> Dict[str, Any]:
        try:
            # Search for documents where created_by field matches user_email
            search_filter = {"metadata.created_by": self.user_email}
            
            
            contacts = list(self.db[self.collection_name].find(search_filter))
            
            if not contacts:
                return {"error": "No contacts found for this user"}

            if not query:
                # If no specific query, return all contacts
                return self._get_all_contacts(contacts)
            else:
                # If there's a query, search for a specific contact
                return self._get_specific_contact(contacts, query)

        except Exception as e:
            return {"error": f"Error retrieving contacts: {str(e)}"}

    def _get_all_contacts(self, contacts: List[Dict[str, Any]]) -> Dict[str, Any]:
        return {"contacts": [contact.get('metadata', {}) for contact in contacts]}

    def _get_specific_contact(self, contacts: List[Dict[str, Any]], query: str) -> Dict[str, Any]:
        for contact in contacts:
            metadata = contact.get('metadata', {})
            if query.lower() in metadata.get('name', '').lower() or query.lower() in metadata.get('email', '').lower():
                return metadata
        return {"error": f"Contact '{query}' not found"}

    async def _arun(self, *args, **kwargs):
        raise NotImplementedError("retrieve_contact does not support async")