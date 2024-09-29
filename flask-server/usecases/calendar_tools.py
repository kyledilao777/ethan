from datetime import datetime, timedelta
from typing import Type, Optional, List, Any, Dict
from pydantic import BaseModel, Field, PrivateAttr
from langchain.tools import BaseTool
from langchain_core.documents import Document
from usecases.calendar_functions import get_calendar_events, create_event, delete_event, update_event, save_to_session, get_from_session, clear_session
import pytz
from uuid import uuid4
from textembedding import get_embedding
import numpy as np

class TimeInput(BaseModel):
    timezone: str

class CurrentTimeInput(TimeInput):
    """Inputs for getting the current time"""
    pass

class CurrentTimeTool(BaseTool):
    name: str = "get_current_time"
    description: str = """
    Useful when you want to get the current time in an RFC3339 timestamp, in this format YYYY-MM-DDTHH:MM:SS+HH:MM"
    """
    args_schema: Type[BaseModel] = CurrentTimeInput

    def _run(self, timezone: str):
        user_timezone = pytz.timezone(timezone)
        current_time = datetime.now(user_timezone).strftime("%Y-%m-%dT%H:%M:%S%z")
        return current_time[:-2] + ':' + current_time[-2:]  # Adjust formatting if needed
    
    def _arun(self):
        raise NotImplementedError("convert_time does not support async")

class TimeDeltaInput(BaseModel):
    """Inputs for getting time deltas"""

    timezone: str = Field(description="Timezone of the user")

    delta_days: Optional[int] = Field(
        default=0, description="Number of days from the current day to the specified day in the user timezone. Must be an integer. Tomorrow = 0, later = same day"
    )
    delta_hours: Optional[int] = Field(
        default=0, description="Number of hours from the current hour to the specified hour in the user timezone. Must be an integer."
    )
    delta_minutes: Optional[int] = Field(
        default=0, description="Number of minutes from the current hour to the specified minutes in the user timezone. Must be an integer."
    )
    delta_seconds: Optional[int] = Field(
        default=0, description="Number of seconds from the current seconds to the specified seconds in the user timezone. Must be an integer."
    )

class TimeDeltaTool(BaseTool):
    name: str = "get_future_time"
    description: str = """
    Useful when you want to get a future time in an RFC3339 timestamp in the user timezone, given a time delta such as 1 day, 2 hours, 3 minutes, 4 seconds. 
    Handles terms like 'tomorrow' correctly by adjusting the date and time accurately.
    """
    args_schema: Type[BaseModel] = TimeDeltaInput

    def _run(
        self,
        timezone: str,
        delta_days: int = 0,
        delta_hours: int = 0,
        delta_minutes: int = 0,
        delta_seconds: int = 0,
    ):
        user_timezone = pytz.timezone(timezone)
        formatted_time = (
            datetime.now(user_timezone)
            + timedelta(
                days=delta_days,
                hours=delta_hours,
                minutes=delta_minutes,
                seconds=delta_seconds,
            )
        ).strftime("%Y-%m-%dT%H:%M:%S.%fZ")

        # Return the current time in a format google calendar api can understand
        return formatted_time[:-2] + ':' + formatted_time[-2:]

    def _arun(self):
        raise NotImplementedError("get_future_time does not support async")
    
class SpecificTimeInput(BaseModel):
    """Inputs for setting a specific time"""

    year: int = Field(description="Year of the event")
    month: int = Field(description="Month of the event")
    day: int = Field(description="Day of the event")
    hour: int = Field(description="Hour of the event")
    minute: int = Field(description="Minute of the event")


class SpecificTimeTool(BaseTool):
    name: str = "set_specific_time"
    description: str = "Sets a specific time for an event, for example when you want to create an event at 3pm on June 3rd, 2021."
    args_schema: Type[BaseModel] = SpecificTimeInput

    def _run(self, year: int, month: int, day: int, hour: int, minute: int):
        specific_time = datetime(year, month, day, hour, minute)
        formatted_time = specific_time.strftime("%Y-%m-%dT%H:%M:%S%z")
        return formatted_time[:-2] + ':' + formatted_time[-2:]

    def _arun(self):
        raise NotImplementedError("set_specific_time does not support async")

#Read
class CalendarEventSearchInput(BaseModel):
    """Inputs for get_calendar_events"""

    user_email: str = Field(description="email of the user")
    calendar_id: str = Field(description="Calendar id of the calendar")
    start_date: str = Field(
        description="Start date of the events to search. Must be an RFC3339 timestamp, in this format YYYY-MM-DDTHH:MM:SS+HH:MM"
    )
    end_date: str = Field(
        description="End date of the events to search. Must be an RFC3339 timestamp, in this format YYYY-MM-DDTHH:MM:SS+HH:MM"
    )

class GetCalendarEventsTool(BaseTool):
    name: str = "get_calendar_events"
    description: str = """
        Useful for retrieving calendar events in a particular date or time range.
        This tool should also be triggered whenever the user wants to update or reschedule an existing event to fetch the necessary event details.
        """
    args_schema: Type[BaseModel] = CalendarEventSearchInput

    def _run(
        self,
        user_email: str,
        calendar_id: str,
        start_date: str,
        end_date: str,
        
    ):
        events_response = get_calendar_events(
            user_email, calendar_id, start_date, end_date
        )

        save_to_session(user_email, events_response)

        return events_response

    def _arun(self):
        raise NotImplementedError("get_calendar_events does not support async")
    def _arun(self):
        raise NotImplementedError("get_calendar_events does not support async")
    
#Create
class CreateCalendarEventInput(BaseModel):
    """Inputs for create_event"""
    user_email: str = Field(description="email of the user")
    calendar_id: str = Field(description="calendar id of the calendar")
    event_name: str = Field(description="name of the event")
    start_datetime: str = Field(
        description="Start datetime of the event to create in the user timezone. Must be an RFC3339 timestamp, in this format YYYY-MM-DDTHH:MM:SS+HH:MM and NOT YYYY-MM-DDTHH:MM:SS+HHMM."
    )
    end_datetime: str = Field(
        description="End datetime of the event to create in the user timezone. Must be an RFC3339 timestamp, in this format YYYY-MM-DDTHH:MM:SS+HH:MM and NOT YYYY-MM-DDTHH:MM:SS+HHMM."
    )
    attendees: Optional[List[str]] = Field(
        default=[],
        description="List of email addresses for attendees of the meeting"
    )
    location: Optional[str] = Field(
        default=None, description="Location of event"
    )
    description: Optional[str] = Field(
        default=None, description="Description of the event."
    )

class CreateCalendarEventTool(BaseTool):
    name: str = "create_event"
    description: str = """
    Create a calendar event when the user wants to schedule a meeting
    """
    args_schema: Type[BaseModel] = CreateCalendarEventInput

    def _run(self, user_email, calendar_id, event_name, start_datetime, end_datetime, attendees=None, location=None, description=None):
        
        events_response = create_event(user_email, calendar_id, event_name, start_datetime, end_datetime, attendees, location, description)
        
        save_to_session(user_email, events_response)

        return events_response
        
    def _arun(self):
        raise NotImplementedError("create_event does not support async")

#Delete
class CalendarDeleteInput(BaseModel):
    """Inputs for delete_calendar_event"""

    user_email: str = Field(description="email of the user")
    calendar_id: str = Field(description="calendar id of the calendar")
    event_id: str = Field(
        description="id of the event retrieved from the user's calendar by searching it. must be the FULL event id."
    )


class DeleteCalendarEventTool(BaseTool):
    name: str = "delete_calendar_event"
    description: str = """
    Useful for when you want to delete an event given a calendar id and an event id. Make sure to pass the FULL event id.
    """
    args_schema: Type[BaseModel] = CalendarDeleteInput

    def _run(self, user_email: str, calendar_id: str, event_id: str):
        events_response = delete_event(user_email, calendar_id, event_id)
        return events_response

    def _arun(self):
        raise NotImplementedError("delete_calendar_event does not support async")

#Update
class UpdateCalendarEventInput(BaseModel):
    """Inputs for update_calendar_event"""
    user_email: str = Field(description="email of the user")
    calendar_id: str = Field(description="calendar id of the calendar")
    event_id: str = Field(description="event_id of the event to update, NOT the name of the event")
    event_name: Optional[str] = Field(default=None, description="new name of the event, if not get the original name from event_id")
    start_datetime: Optional[str] = Field(default=None, description="new start datetime of the event that the user wants to change to, the time is specific to minutes, in RFC3339 format")
    end_datetime: Optional[str] = Field(default=None, description="new end datetime of the event that the user wants to change to, the time is specific to minutes, in RFC3339 format")
    attendees: Optional[List[str]] = Field(default=None, description="additional attendees of the event in addition to existing attendees")
    location: Optional[str] = Field(default=None, description="new location of the event")
    description: Optional[str] = Field(default=None, description="Description of the event.")

class UpdateCalendarEventTool(BaseTool):
    name: str = "update_calendar_event"
    description: str = """
    Useful when you want to update a calendar event given new event details. Trigger whenever the user wants to update an event, the number of changes DOES NOT matter
    """
    # given a calendar id, event id, and new event details.
    args_schema: Type[BaseModel] = UpdateCalendarEventInput

    def _run(
        self,
        user_email: str,
        calendar_id: str,
        event_id: str,
        event_name: Optional[str] = None,
        start_datetime: Optional[str] = None,
        end_datetime: Optional[str] = None,
        attendees: Optional[List[str]] = None,
        location: Optional[str] = None,
        description: Optional[str] = None
    ):
        print("From Update Calendar Tool")
        print(f"start_datetime: {start_datetime}")
        print(f"end_datetime: {end_datetime}")
        # Call the update_event function with the provided parameters
        update_response = update_event(
            user_email, calendar_id, event_id, event_name, start_datetime, end_datetime, attendees, location, description
        )

        save_to_session(user_email, update_response)

        return update_response

    def _arun(self):
        raise NotImplementedError("update_calendar_event does not support async")
    
# RAG tools
#user preferences
class StoreUserPreferenceTool(BaseTool):
    name: str = "store_user_preference"
    description: str = "Stores a user preference in Elasticsearch using embeddings."

    es_client: Any = Field(default_factory=lambda: None)
    user_email: str = Field(default_factory=lambda: "")
    index_name: str = Field(default_factory=lambda: "user_preferences")

    def __init__(self, es_client: Any, user_email:str, index_name: str):
        super().__init__(es_client=es_client, user_email=user_email, index_name=index_name)

    def _run(self, user_email: str, preference_key: str, preference_value: str) -> str:
        try:
            # Generate embedding for the preference value
            embedding = get_embedding(preference_value)

            document = Document(
                page_content=preference_value,
                metadata={"user_email": user_email, "preference_key": preference_key, "embedding": embedding}
            )

            document_id = str(uuid4())
            self.es_client.index(index=self.index_name, id=document_id, body=document.dict())

            return f"Preference '{preference_key}' stored successfully for {user_email}."
        except Exception as e:
            return f"Error storing preference: {str(e)}"

    async def _arun(self, *args, **kwargs):
        raise NotImplementedError("store_user_preference does not support async")
    
class RetrieveUserPreferenceTool(BaseTool):
    name: str = "retrieve_user_preference"
    description: str = "Retrieves a user preference using semantic search."

    es_client: Any = Field(default_factory=lambda: None)
    user_email: str = Field(default_factory=lambda: "")
    index_name: str = Field(default_factory=lambda: "user_preferences")

    def __init__(self, es_client: Any, user_email:str, index_name: str):
        super().__init__(es_client=es_client, user_email=user_email, index_name=index_name)

    def cosine_similarity(self, a: List[float], b: List[float]) -> float:
        return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))

    def _run(self, user_email: str, preference_query: str) -> str:
        try:
            # Generate embedding for the query
            query_embedding = get_embedding(preference_query)

            # Fetch all preferences for the user without filtering by preference_key
            search_query = {
                "query": {
                    "match": {"metadata.user_email": user_email}
                },
                "size": 100  # Adjust based on expected maximum preferences per user
            }

            result = self.es_client.search(index=self.index_name, body=search_query)

            if not result['hits']['hits']:
                return f"No preferences found for user: {user_email}"

            # Calculate cosine similarity for each preference
            similarities = []
            for hit in result['hits']['hits']:
                preference_embedding = hit['_source']['metadata'].get('embedding')
                if preference_embedding:
                    similarity = self.cosine_similarity(query_embedding, preference_embedding)
                    similarities.append((similarity, hit))

            # Sort by similarity and get the most similar preference
            if similarities:
                similarities.sort(key=lambda x: x[0], reverse=True)
                top_hit = similarities[0][1]
                score = similarities[0][0]
                preference_key = top_hit['_source']['metadata'].get('preference_key', 'unknown')
                preference_value = top_hit['_source'].get('page_content', 'unknown')
                return f"Found preference: {preference_key} = {preference_value} (similarity score: {score:.2f})"
            else:
                return f"No relevant preference found for the query: {preference_query}"

        except Exception as e:
            print(e)
            return f"Error retrieving preference: {str(e)}"

class DeleteUserPreferenceTool(BaseTool):
    name: str = "delete_user_preference"
    description: str = "Deletes a specific user preference from Elasticsearch using semantic search."

    es_client: Any = Field(default_factory=lambda: None)
    user_email: str = Field(default_factory=lambda: "")
    index_name: str = Field(default_factory=lambda: "")

    def __init__(self, es_client: Any, user_email: str, index_name: str):
        super().__init__(es_client=es_client, user_email=user_email, index_name=index_name)

    def _run(self, user_email: str, preference_key: str) -> str:
        try:
            # Generate embedding for the query
            query_embedding = get_embedding(preference_key)

            # First, find the most relevant preference
            search_query = {
                "query": {
                    "script_score": {
                        "query": {
                            "bool": {
                                "must": [
                                    {"match": {"metadata.user_email": user_email}}
                                ]
                            }
                        },
                        "script": {
                            "source": "cosineSimilarity(params.query_vector, 'metadata.embedding') + 1.0",
                            "params": {"query_vector": query_embedding}
                        }
                    }
                }
            }

            result = self.es_client.search(index=self.index_name, body=search_query)

            if result['hits']['hits']:
                top_hit = result['hits']['hits'][0]
                document_id = top_hit['_id']
                preference_key = top_hit['_source']['metadata']['preference_key']

                # Delete the found document
                self.es_client.delete(index=self.index_name, id=document_id)

                return f"Preference '{preference_key}' for user {user_email} deleted successfully."
            else:
                return f"No relevant preference found for the query: {preference_key}"
        except Exception as e:
            return f"Error deleting user preference: {str(e)}"

    async def _arun(self, *args, **kwargs):
        raise NotImplementedError("delete_user_preference does not support async")

class ModifyUserPreferenceTool(BaseTool):
    name: str = "modify_user_preference"
    description: str = "Modifies an existing user preference in Elasticsearch using semantic search."
    
    es_client: Any = Field(default_factory=lambda: None)
    user_email: str = Field(default_factory=lambda: "")
    index_name: str = Field(default_factory=lambda: "")

    def __init__(self, es_client: Any, user_email: str, index_name: str):
        super().__init__(es_client=es_client, user_email=user_email, index_name=index_name)

    def _run(self, user_email: str, preference_key: str, new_preference_value: str) -> str:
        try:
            # Generate embedding for the query
            query_embedding = get_embedding(preference_key)

            # First, find the most relevant preference
            search_query = {
                "query": {
                    "script_score": {
                        "query": {
                            "bool": {
                                "must": [
                                    {"match": {"metadata.user_email": user_email}}
                                ]
                            }
                        },
                        "script": {
                            "source": "cosineSimilarity(params.query_vector, 'metadata.embedding') + 1.0",
                            "params": {"query_vector": query_embedding}
                        }
                    }
                }
            }
            
            result = self.es_client.search(index=self.index_name, body=search_query)
            
            if result['hits']['hits']:
                top_hit = result['hits']['hits'][0]
                document_id = top_hit['_id']
                preference_key = top_hit['_source']['metadata']['preference_key']
                
                # Generate new embedding for the updated preference value
                new_embedding = get_embedding(new_preference_value)

                # Update the document
                updated_document = Document(
                    page_content=new_preference_value,
                    metadata={
                        "user_email": user_email,
                        "preference_key": preference_key,
                        "embedding": new_embedding
                    }
                )
                
                self.es_client.update(
                    index=self.index_name,
                    id=document_id,
                    body={"doc": updated_document.dict()}
                )

                return f"Preference '{preference_key}' updated successfully for {user_email}."
            else:
                return f"No relevant preference found for the query: {preference_key}. Use store_user_preference to create a new preference."
        except Exception as e:
            return f"Error modifying preference: {str(e)}"

    async def _arun(self, *args, **kwargs):
        raise NotImplementedError("modify_user_preference does not support async")
    
#Contact List
class CreateContactTool(BaseTool):
    name: str = "create_contact"
    description: str = "Creates a new contact in the contact list index."

    es_client: Any = Field(default_factory=lambda: None)
    user_email: str = Field(default_factory=lambda: "")
    index_name: str = Field(default_factory=lambda: "contacts")

    def __init__(self, es_client: Any, user_email: str, index_name: str):
        super().__init__(es_client=es_client, user_email=user_email, index_name=index_name)

    def _run(self, name: str, email: str, relationship: str = "") -> str:
        try:
            document = Document(
                id=self.user_email,
                metadata={"name": name.lower(),"email": email.lower(), "relationship": relationship},
                page_content=""
            )

            document_id = str(uuid4())
            
            self.es_client.index(index=self.index_name, id=document_id, body=document.dict())

            return f"Contact '{name}' created successfully with ID: {document_id}"
        except Exception as e:
            return f"Error creating contact: {str(e)}"

    async def _arun(self, *args, **kwargs):
        raise NotImplementedError("create_contact does not support async")

class RetrieveContactTool(BaseTool):
    name: str = "retrieve_contact"
    description: str = "Retrieves contacts from the contact list index."

    es_client: Any = Field(default_factory=lambda: None)
    user_email: str = Field(default_factory=lambda: "")
    index_name: str = Field(default_factory=lambda: "contacts")

    def __init__(self, es_client: Any, user_email: str, index_name: str):
        super().__init__(es_client=es_client, user_email=user_email, index_name=index_name)

    def _run(self, query: str = "") -> Dict[str, Any]:
        try:
            # Search for documents where id field matches user_email
            search_body = {
                "query": {
                    "match": {"id": self.user_email}
                }
            }
            
            response = self.es_client.search(index=self.index_name, body=search_body)

            if response['hits']['total']['value'] == 0:
                return {"error": "No contacts found for this user"}

            contacts = []
            for hit in response['hits']['hits']:
                user_doc = hit['_source']
                if user_doc.get('id') == self.user_email:
                    contacts.append(user_doc.get('metadata', {}))

            if not query:
                # If no specific query, return all contacts
                return self._get_all_contacts(contacts)
            else:
                # If there's a query, search for a specific contact
                return self._get_specific_contact(contacts, query)

        except Exception as e:
            return {"error": f"Error retrieving contacts: {str(e)}"}

    def _get_all_contacts(self, contacts: List[Dict[str, Any]]) -> Dict[str, Any]:
        return {"contacts": contacts}

    def _get_specific_contact(self, contacts: List[Dict[str, Any]], query: str) -> Dict[str, Any]:
        for contact in contacts:
            if query.lower() in contact.get('name', '').lower():
                return contact
        return {"error": f"Contact '{query}' not found"}

    async def _arun(self, *args, **kwargs):
        raise NotImplementedError("retrieve_contact does not support async")

class ModifyContactTool(BaseTool):
    name: str = "modify_contact"
    description: str = "Modifies an existing contact in the contact list index."

    es_client: Any = Field(default_factory=lambda: None)
    user_email: str = Field(default_factory=lambda: "")
    index_name: str = Field(default_factory=lambda: "contacts")

    def __init__(self, es_client: Any, user_email: str, index_name: str):
        super().__init__(es_client=es_client, user_email=user_email, index_name=index_name)

    def _run(self, contact_name: str, new_name: str = None, new_email: str = None, new_relationship: str = None) -> str:
        try:
            print(f"Attempting to modify contact. Current name: {contact_name}")
            print(f"User email: {self.user_email}, Index name: {self.index_name}")

            # Query for the specific contact
            search_body = {
                "query": {
                    "bool": {
                        "must": [
                            {"match": {"id": self.user_email}},
                            {"term": {"metadata.name.keyword": contact_name.lower()}}
                        ]
                    }
                }
            }

            response = self.es_client.search(index=self.index_name, body=search_body)
            print(f"Search response: {response}")

            if response['hits']['total']['value'] == 0:
                return f"Contact '{contact_name}' not found for user {self.user_email}"

            # Get the contact document
            contact_doc = response['hits']['hits'][0]
            
            # Prepare the update body
            update_body = {"doc": {"metadata": {}}}
            
            if new_name is not None:
                update_body["doc"]["metadata"]["name"] = new_name
                print(f"Updating name to: {new_name}")
            if new_email is not None:
                update_body["doc"]["metadata"]["email"] = new_email
                print(f"Updating email to: {new_email}")
            if new_relationship is not None:
                update_body["doc"]["metadata"]["relationship"] = new_relationship
                print(f"Updating relationship to: {new_relationship}")

            if not update_body["doc"]["metadata"]:
                return "No updates provided for the contact."

            # Update the document in Elasticsearch
            result = self.es_client.update(index=self.index_name, id=contact_doc['_id'], body=update_body)
            print(f"Update operation result: {result}")

            if result['result'] == 'updated':
                updated_name = new_name if new_name else contact_name
                return f"Contact '{updated_name}' updated successfully."
            else:
                return f"Failed to update contact '{contact_name}'. Elasticsearch response: {result['result']}"

        except Exception as e:
            print(f"Error occurred: {str(e)}")
            return f"Error modifying contact: {str(e)}"

    async def _arun(self, *args, **kwargs):
        raise NotImplementedError("modify_contact does not support async")

    
class DeleteContactTool(BaseTool):
    name: str = "delete_contact"
    description: str = "Deletes a contact from the contact list index."

    es_client: Any = Field(default_factory=lambda: None)
    user_email: str = Field(default_factory=lambda: "")
    index_name: str = Field(default_factory=lambda: "contacts")

    def __init__(self, es_client: Any, user_email: str, index_name: str):
        super().__init__(es_client=es_client, user_email=user_email, index_name=index_name)

    def _run(self, name: str = None, email: str = None) -> str:
        try:
            print(f"Attempting to delete contact. Name: {name}, Email: {email}")
            print(f"User email: {self.user_email}, Index name: {self.index_name}")
            
            must_conditions = [
                {"match": {"id": self.user_email}}
            ]

            if name:
                must_conditions.append({"term": {"metadata.name.keyword": name}})
                print(f"Adding name condition: {name}")
            
            if email:
                must_conditions.append({"term": {"metadata.email.keyword": email}})
                print(f"Adding email condition: {email}")
                
            if len(must_conditions) == 1:
                return "No valid contact information provided for deletion."

            search_body = {
                "query": {
                    "bool": {
                        "must": must_conditions
                    }
                }
            }
            
            print(f"Search body: {search_body}")
            
            result = self.es_client.delete_by_query(index=self.index_name, body=search_body)
            print(f"Delete operation result: {result}")
            
            deleted_count = result.get('deleted', 0)

            if deleted_count > 0:
                return f"Successfully deleted {deleted_count} contact(s)."
            else:
                return "No matching contacts found to delete."

        except Exception as e:
            print(f"Error occurred: {str(e)}")
            return f"Error deleting contact: {str(e)}"

