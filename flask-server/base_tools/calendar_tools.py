from datetime import datetime, timedelta
from typing import Type, Optional, List, Any, Dict
from pydantic import BaseModel, Field, PrivateAttr
from langchain.tools import BaseTool
from langchain_core.documents import Document
from base_tools.calendar_functions import get_calendar_events, create_event, delete_event, update_event, save_to_session, get_from_session, clear_session
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