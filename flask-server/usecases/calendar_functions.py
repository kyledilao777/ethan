import os
import jwt
import time
import requests
from dotenv import load_dotenv

load_dotenv()

def get_tokens(email):
    response = requests.get(f"{os.getenv('BACKEND_URI')}/get-tokens?email={email}")
    response.raise_for_status()
    return response.json()

def refresh_access_token(refresh_token):
    token_url = os.getenv("TOKEN_URI")
    client_id = os.getenv("GOOGLE_CLIENT_ID")
    client_secret = os.getenv("GOOGLE_CLIENT_SECRET")
    params = {
        "grant_type": "refresh_token",
        "client_id": client_id,
        "client_secret": client_secret,
        "refresh_token": refresh_token,
    }
    response = requests.post(token_url, data=params)
    response.raise_for_status()
    return response.json()

def get_valid_access_token(email):
    tokens = get_tokens(email)
    access_token = tokens.get("access_token")
    refresh_token = tokens.get("refresh_token")

    if not access_token or is_token_expired(access_token):
        new_tokens = refresh_access_token(refresh_token)
        access_token = new_tokens.get("access_token")

        # Optionally update the tokens in the backend
        update_tokens_in_backend(email, new_tokens)
        
    return access_token

def is_token_expired(token):
    try:
        decoded_token = jwt.decode(token, options={"verify_signature": False})
        exp = decoded_token.get("exp")
        if exp:
            return exp < time.time()
        return False
    except jwt.ExpiredSignatureError:
        return True
    except Exception as e:
        print(f"Error checking token expiry: {e}")
        return False

def update_tokens_in_backend(email, tokens):
    response = requests.post(f"{os.getenv('BACKEND_URI')}/update-tokens", json={"email": email, "tokens": tokens})
    response.raise_for_status()

def get_calendar_events(user_email, calendar_id, start_time, end_time, return_event_ids=False):
    access_token = get_valid_access_token(user_email)

    endpoint = f"https://www.googleapis.com/calendar/v3/calendars/{calendar_id}/events"
    params = {
        "timeMin": start_time,
        "timeMax": end_time,
    }
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Accept": "application/json",
    }

    response = requests.get(endpoint, headers=headers, params=params)
    response.raise_for_status()  # Ensure any HTTP errors are raised
    events = response.json()

    event_list = []
    for event in events.get("items", []):
        start = event.get("start")
        date_info = start.get("date", start.get("dateTime"))

        if return_event_ids:
            event_list.append(f"{event.get('summary')}: {date_info} (event ID: {event.get('id')})")
        else:
            event_list.append(f"{event.get('summary')}: {date_info}")

    return event_list

def get_calendar_timezone(user_email, calendar_id):
    access_token = get_valid_access_token(user_email)

    endpoint = f"https://www.googleapis.com/calendar/v3/calendars/{calendar_id}"
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Accept": "application/json",
    }

    response = requests.get(endpoint, headers=headers)
    response.raise_for_status()  # Ensure any HTTP errors are raised
    calendar_details = response.json()

    time_zone = calendar_details.get("timeZone")
    return time_zone

def create_event(user_email, calendar_id, event_name, start_datetime, end_datetime, attendee=None, location=None):
    timezone = "Asia/Singapore"
    access_token = get_valid_access_token(user_email)

    endpoint = f"https://www.googleapis.com/calendar/v3/calendars/{calendar_id}/events"
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Accept": "application/json",
        "Content-Type": "application/json",
    }

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

    if attendee:
        event_data["attendees"] = [{"email": attendee}]
    if location:
        event_data["location"] = location

    response = requests.post(endpoint, headers=headers, json=event_data)
    response.raise_for_status()  # Ensure any HTTP errors are raised
    return response.json()

def delete_event(user_email, calendar_id, event_id):
    access_token = get_valid_access_token(user_email)

    endpoint = f"https://www.googleapis.com/calendar/v3/calendars/{calendar_id}/events/{event_id}"
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Accept": "application/json",
    }

    response = requests.delete(endpoint, headers=headers)
    response.raise_for_status()  # Ensure any HTTP errors are raised

    if response.status_code == 204:
        return {"message": "Event deleted successfully"}
    else:
        return {"error": "Failed to delete event"}

def update_event(user_email, calendar_id, event_id, event_name=None, start_datetime=None, end_datetime=None, attendee=None, location=None):
    access_token = get_valid_access_token(user_email)

    endpoint = f"https://www.googleapis.com/calendar/v3/calendars/{calendar_id}/events/{event_id}"
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Accept": "application/json",
        "Content-Type": "application/json",
    }

    existing_event_response = requests.get(endpoint, headers=headers)
    existing_event_response.raise_for_status()  # Ensure any HTTP errors are raised
    existing_event = existing_event_response.json()
    timezone = existing_event.get("start").get("timeZone")

    event_data = {
        "id": event_id,
        "summary": existing_event.get("summary"),
        "start": existing_event.get("start"),
        "end": existing_event.get("end"),
    }

    if event_name:
        event_data["summary"] = event_name
    if start_datetime:
        event_data["start"]["dateTime"] = start_datetime
        event_data["start"]["timeZone"] = timezone
    if end_datetime:
        event_data["end"]["dateTime"] = end_datetime
        event_data["end"]["timeZone"] = timezone
    if attendee:
        event_data["attendees"] = [{"email": attendee}]
    if location:
        event_data["location"] = location

    response = requests.put(endpoint, headers=headers, json=event_data)
    response.raise_for_status()  # Ensure any HTTP errors are raised
    return response.json()
