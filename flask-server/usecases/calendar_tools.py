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
    name = "get_current_time"
    description = """
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
    name = "get_future_time"
    description = """
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
    name = "set_specific_time"
    description = "Sets a specific time for an event, for example when you want to create an event at 3pm on June 3rd, 2021."
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
    name = "get_calendar_events"
    description = """
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
    name = "create_event"
    description = """
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
    name = "delete_calendar_event"
    description = """
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
    name = "update_calendar_event"
    description = """
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
    index_name: str = Field(default_factory=lambda: "user_preferences")

    def __init__(self, es_client: Any, index_name: str):
        super().__init__(es_client=es_client, index_name=index_name)

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
    index_name: str = Field(default_factory=lambda: "user_preferences")

    def __init__(self, es_client: Any, index_name: str):
        super().__init__(es_client=es_client, index_name=index_name)

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
    index_name: str = Field(default_factory=lambda: "")

    def __init__(self, es_client: Any, index_name: str):
        super().__init__(es_client=es_client, index_name=index_name)

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
    index_name: str = Field(default_factory=lambda: "")

    def __init__(self, es_client: Any, index_name: str):
        super().__init__(es_client=es_client, index_name=index_name)

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
    index_name: str = Field(default_factory=lambda: "")

    def __init__(self, es_client: Any, index_name: str):
        super().__init__(es_client=es_client, index_name=index_name)

    def _run(self, name: str, email: str, relationship: str = "") -> str:
        try:
            document = Document(
                page_content=name,
                metadata={"email": email, "relationship": relationship}
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
    description: str = "Retrieves contact information from the contact list index."

    es_client: Any = Field(default_factory=lambda: None)
    index_name: str = Field(default_factory=lambda: "")

    def __init__(self, es_client: Any, index_name: str):
        super().__init__(es_client=es_client, index_name=index_name)

    def _run(self, search_field: str, search_value: str) -> Dict[str, Any]:
        try:
            # Adjust the query to search in both metadata and page_content
            if search_field == "name":
                query = {
                    "query": {
                        "match": {"page_content": search_value}
                    }
                }
            else:
                query = {
                    "query": {
                        "match": {f"metadata.{search_field}": search_value}
                    }
                }
            
            result = self.es_client.search(index=self.index_name, body=query)
            
            if result['hits']['hits']:
                contact = result['hits']['hits'][0]['_source']
                return {
                    "id": result['hits']['hits'][0]['_id'],
                    "name": contact.get('page_content', ''),
                    "email": contact['metadata'].get('email', ''),
                    "relationship": contact['metadata'].get('relationship', '')
                }
            else:
                return {"error": f"No contact found with {search_field}: {search_value}."}
        except Exception as e:
            return {"error": f"Error retrieving contact: {str(e)}"}

    async def _arun(self, *args, **kwargs):
        raise NotImplementedError("retrieve_contact does not support async")
    
class ModifyContactTool(BaseTool):
    name: str = "modify_contact"
    description: str = "Modifies an existing contact in the contact list index."

    es_client: Any = Field(default_factory=lambda: None)
    index_name: str = Field(default_factory=lambda: "")

    def __init__(self, es_client: Any, index_name: str):
        super().__init__(es_client=es_client, index_name=index_name)

    def _run(self, contact_id: str, name: str = None, email: str = None, relationship: str = None) -> str:
        try:
            update_doc = {}
            if name is not None:
                update_doc["page_content"] = name
            if email is not None or relationship is not None:
                update_doc["metadata"] = {}
                if email is not None:
                    update_doc["metadata"]["email"] = email
                if relationship is not None:
                    update_doc["metadata"]["relationship"] = relationship

            if not update_doc:
                return "No updates provided for the contact."

            self.es_client.update(index=self.index_name, id=contact_id, body={"doc": update_doc})

            return f"Contact with ID {contact_id} updated successfully."
        except Exception as e:
            return f"Error modifying contact: {str(e)}"

    async def _arun(self, *args, **kwargs):
        raise NotImplementedError("modify_contact does not support async")
    
class DeleteContactTool(BaseTool):
    name: str = "delete_contact"
    description: str = "Deletes a contact from the contact list index."

    es_client: Any = Field(default_factory=lambda: None)
    index_name: str = Field(default_factory=lambda: "")

    def __init__(self, es_client: Any, index_name: str):
        super().__init__(es_client=es_client, index_name=index_name)

    def _run(self, contact_id: str) -> str:
        try:
            self.es_client.delete(index=self.index_name, id=contact_id)
            return f"Contact with ID {contact_id} deleted successfully."
        except Exception as e:
            return f"Error deleting contact: {str(e)}"

    async def _arun(self, *args, **kwargs):
        raise NotImplementedError("delete_contact does not support async")