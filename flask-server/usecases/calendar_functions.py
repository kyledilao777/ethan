import os
import requests
from dotenv import load_dotenv

load_dotenv()

# Function to get a new access token using the refresh token
def get_access_token():
    refresh_token = os.getenv("REFRESH_TOKEN")
    client_id = os.getenv("CLIENT_ID")
    client_secret = os.getenv("CLIENT_SECRET")
    params = {
        "grant_type": "refresh_token",
        "client_id": client_id,
        "client_secret": client_secret,
        "refresh_token": refresh_token,
    }
    token_url = "https://oauth2.googleapis.com/token"
    response = requests.post(token_url, data=params)
    return response.json().get("access_token")

def get_calendar_events(user_email, calendar_id, start_time, end_time, return_event_ids=False):
    access_token = get_access_token()

    # Create the API endpoint
    endpoint = (
        f"https://www.googleapis.com/calendar/v3/calendars/{calendar_id}/events"
    )

    # Set the parameters
    params = {
        "timeMin": start_time,
        "timeMax": end_time,
    }

    # Set the headers
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Accept": "application/json",
    }

    # Make the request
    response = requests.get(endpoint, headers=headers, params=params)
    events = response.json()

    # List the events
    event_list = []
    for event in events.get("items", []):
        start = event.get("start")
        date_info = start.get("date", start.get("dateTime"))
        
        if return_event_ids:
            event_list.append(
                f"{event.get('summary')}: {date_info} (event ID: {event.get('id')})"
                )
        else:
            event_list.append(f"{event.get('summary')}: {date_info}")

    return event_list

def get_calendar_timezone(user_email, calendar_id):
    access_token = get_access_token()


    # Google Calendar API endpoint to get calendar details
    endpoint = f"https://www.googleapis.com/calendar/v3/calendars/{calendar_id}"

    headers = {
        "Authorization": f"Bearer {access_token}",
        "Accept": "application/json",
    }

    response = requests.get(endpoint, headers=headers)
    calendar_details = response.json()

    # Extract the time zone from the calendar details
    time_zone = calendar_details.get("timeZone")

    return time_zone


def create_event(user_email, calendar_id, event_name, start_datetime, end_datetime, attendee=None, location=None):
    timezone = "Asia/Singapore"
    # get_calendar_timezone(user_email, calendar_id)  # This could be used to dynamically set the timezone
    access_token = get_access_token()

    endpoint = f"https://www.googleapis.com/calendar/v3/calendars/{calendar_id}/events"

    headers = {
        "Authorization": f"Bearer {access_token}",
        "Accept": "application/json",
        "Content-Type": "application/json",
    }

    # Initialize the event data dictionary
    event_data = {
        "summary": event_name + " (created by Ethan)",
        "start": {
            "dateTime": start_datetime,
            "timeZone": timezone,
        },
        "end": {
            "dateTime": end_datetime,
            "timeZone": timezone,
        }
    }

    # Conditionally add 'attendees' to the event data if an attendee is provided
    if attendee:
        event_data["attendees"] = [{"email": attendee}]
        
    if location:
        event_data["location"] = location

    # Make the API request
    response = requests.post(endpoint, headers=headers, json=event_data)
    return response.json()



def delete_event(user_email, calendar_id, event_id):
    access_token = get_access_token()

    endpoint = f"https://www.googleapis.com/calendar/v3/calendars/{calendar_id}/events/{event_id}"

    headers = {
        "Authorization": f"Bearer {access_token}",
        "Accept": "application/json",
    }

    response = requests.delete(endpoint, headers=headers)

    # Response should be 204 if successful
    if response.status_code == 204:
        return {"message": "Event deleted successfully"}

    else:
        return {"error": "Failed to delete event"}