from datetime import datetime, timedelta
from typing import Type, Optional
from pydantic import BaseModel, Field
from langchain.tools import BaseTool
from usecases.calendar_functions import get_calendar_events, create_event, delete_event, update_event
import pytz

asia_singapore_timezone = pytz.timezone("Asia/Singapore")

class CalendarEventSearchInput(BaseModel):
    """Inputs for get_calendar_events"""

    user_email: str = Field(description="email of the user")
    calendar_id: str = Field(description="Calendar id of the calendar")
    start_date: str = Field(
        description="Start date of the events to search. Must be an RFC3339 timestamp with mandatory time zone offset, for example, 2011-06-03T10:00:00-07:00, 2011-06-03T10:00:00Z. "
    )
    end_date: str = Field(
        description="End date of the events to search. Must be an RFC3339 timestamp with mandatory time zone offset, for example, 2011-06-03T10:00:00-07:00, 2011-06-03T10:00:00Z."
    )
    include_event_ids: bool = Field(
        description="Whether to return the event ids or not. You only need them if you are going to use them for another function."
    )

class GetCalendarEventsTool(BaseTool):
    name = "get_calendar_events"
    description = """
        Useful when you want to get calendar events in a particular date or time range after you have retrieved the current time.
        """
    args_schema: Type[BaseModel] = CalendarEventSearchInput

    def _run(
        self,
        user_email: str,
        calendar_id: str,
        start_date: str,
        end_date: str,
        include_event_ids: bool,
    ):
        events_response = get_calendar_events(
            user_email, calendar_id, start_date, end_date, include_event_ids
        )
        return events_response

    def _arun(self):
        raise NotImplementedError("get_calendar_events does not support async")

class CurrentTimeInput(BaseModel):
    """Inputs for getting the current time"""
    pass

class CurrentTimeTool(BaseTool):
    name = "get_current_time"
    description = """
    Useful when you want to get the current time in an RFC3339 timestamp with mandatory time zone offset, for example, 2011-06-03T10:00:00-07:00, 2011-06-03T10:00:00Z.
    """
    args_schema: Type[BaseModel] = CurrentTimeInput

    def _run(self):
        # Fetch the timezone for Asia/Singapore

        # Return the current time in a format google calendar api can understand
        return (datetime.now(asia_singapore_timezone).strftime("%Y-%m-%dT%H:%M:%S.%fZ"),)

    def _arun(self):
        raise NotImplementedError("convert_time does not support async")

class TimeDeltaInput(BaseModel):
    """Inputs for getting time deltas"""

    delta_days: Optional[int] = Field(
        description="Number of days to add to the current time. Must be an integer."
    )
    delta_hours: Optional[int] = Field(
        description="Number of hours to add to the current time. Must be an integer."
    )
    delta_minutes: Optional[int] = Field(
        description="Number of minutes to add to the current time. Must be an integer."
    )
    delta_seconds: Optional[int] = Field(
        description="Number of seconds to add to the current time. Must be an integer."
    )

class TimeDeltaTool(BaseTool):
    name = "get_future_time"
    description = """
    Useful when you want to get a future time in an RFC3339 timestamp, given a time delta such as 1 day, 2 hours, 3 minutes, 4 seconds. 
    """
    args_schema: Type[BaseModel] = TimeDeltaInput

    def _run(
        self,
        delta_days: int = 0,
        delta_hours: int = 0,
        delta_minutes: int = 0,
        delta_seconds: int = 0,
    ):
        # Return the current time in a format google calendar api can understand
        return (
            datetime.now(asia_singapore_timezone)
            + timedelta(
                days=delta_days,
                hours=delta_hours,
                minutes=delta_minutes,
                seconds=delta_seconds,
            )
        ).strftime("%Y-%m-%dT%H:%M:%S.%fZ")

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
        return specific_time.strftime("%Y-%m-%dT%H:%M:%S%z")

    def _arun(self):
        raise NotImplementedError("set_specific_time does not support async")
    
class CalendarCreateInput(BaseModel):
    """Inputs for create_calendar_event"""

    user_email: str = Field(description="email of the user")
    calendar_id: str = Field(description="calendar id of the calendar")
    event_name: str = Field(description="name of the event")
    start_datetime: str = Field(
        description="Start datetime of the event to create. Must be an RFC3339 timestamp, no need for timezone for example, 2011-06-03T10:00:00-07:00, 2011-06-03 "
    )
    end_datetime: str = Field(
        description="End datetime of the event to create. Must be an RFC3339 timestamp, no need for timezone for example, 2011-06-03T10:00:00-07:00, 2011-06-03"
    )
    attendee: Optional[str] = Field(
        description="Attendees of a meeting event"
    )
    location: Optional[str] = Field(
        description="Location of event"
    )

class CreateCalendarEventTool(BaseTool):
    name = "create_calendar_event"
    description = """
    Useful when you want to create a calendar event given a calendar id, event name, start time, and end time.
    """
    args_schema: Type[BaseModel] = CalendarCreateInput

    def _run(
        self,
        user_email: str,
        calendar_id: str,
        event_name: str,
        start_datetime: str,
        end_datetime: str,
        attendee: str = "",
        location: str = ""
    ):
        events_response = create_event(
            user_email, calendar_id, event_name, start_datetime, end_datetime, attendee, location
        )
        return events_response

    def _arun(self):
        raise NotImplementedError("create_calendar_event does not support async")


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

class UpdateCalendarEventInput(BaseModel):
    """Inputs for update_calendar_event"""
    user_email: str = Field(description="email of the user")
    calendar_id: str = Field(description="calendar id of the calendar")
    event_id: str = Field(description="id of the event to update")
    event_name: Optional[str] = Field(description="new name of the event")
    start_datetime: Optional[str] = Field(description="new start datetime of the event in RFC3339 format")
    end_datetime: Optional[str] = Field(description="new end datetime of the event in RFC3339 format")
    attendee: Optional[str] = Field(description="new attendee of the event")
    location: Optional[str] = Field(description="new location of the event")
    

class UpdateCalendarEventTool(BaseTool):
    name = "update_calendar_event"
    description = """
    Useful when you want to update a calendar event given a calendar id, event id, and new event details.
    """
    args_schema: Type[BaseModel] = UpdateCalendarEventInput

    def _run(
        self,
        user_email: str,
        calendar_id: str,
        event_id: str,
        event_name: Optional[str] = None,
        start_datetime: Optional[str] = None,
        end_datetime: Optional[str] = None,
        attendee: Optional[str] = None,
        location: Optional[str] = None
    ):
        # Call the update_event function with the provided parameters
        update_response = update_event(
            user_email, calendar_id, event_id, event_name, start_datetime, end_datetime, attendee, location
        )
        return update_response

    def _arun(self):
        raise NotImplementedError("update_calendar_event does not support async")