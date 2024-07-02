import os
import jwt
# from jwt import ExpiredSignatureError
import time
import requests
from dotenv import load_dotenv
import copy

load_dotenv()

BACKEND_URL = "http://localhost:3001"

def get_tokens(email):
    response = requests.get(f"{BACKEND_URL}/get-tokens?email={email}")
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
    # except jwt.ExpiredSignatureError:
    #     return True
    except Exception as e:
        print(f"Error checking token expiry: {e}")
        return False

def update_tokens_in_backend(email, tokens):
    response = requests.post(f"{BACKEND_URL}/update-tokens", json={"email": email, "tokens": tokens})
    response.raise_for_status()

def get_calendar_events(user_email, calendar_id, start_time, end_time):
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
        end = event.get("end")
        start_date_info = start.get("date", start.get("dateTime"))
        end_date_info = end.get("date", end.get("dateTime"))
        event_list.append(f"{event.get('summary')}: {start_date_info} to {end_date_info} (event ID: {event.get('id')})")

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

# def create_event(user_email, calendar_id, confirm=False):
#     """
#     Create an event if the user has confirmed the details.
#     """
#     if not confirm:
#         return {"error": "Event creation was not confirmed by the user."}

#     event_details = get_from_session(user_email)
#     if not event_details:
#         return {"error": "No event details found in session."}

#     timezone = "Asia/Singapore"
#     access_token = get_valid_access_token(user_email)

#     endpoint = f"https://www.googleapis.com/calendar/v3/calendars/{calendar_id}/events"
#     headers = {
#         "Authorization": f"Bearer {access_token}",
#         "Accept": "application/json",
#         "Content-Type": "application/json",
#     }

#     # Building the event data from the session
#     event_data = {
#         "summary": event_details['event_name'] + " (created by Ethan)",
#         "start": {
#             "dateTime": event_details['start_datetime'],
#             "timeZone": timezone,
#         },
#         "end": {
#             "dateTime": event_details['end_datetime'],
#             "timeZone": timezone,
#         }
#     }

#     if 'attendee' in event_details and event_details['attendee']:
#         event_data["attendees"] = [{"email": event_details['attendee']}]
#     if 'location' in event_details and event_details['location']:
#         event_data["location"] = event_details['location']

#     response = requests.post(endpoint, headers=headers, json=event_data)
#     response.raise_for_status()  # Ensure any HTTP errors are raised
#     clear_session(user_email)  # Clear session data after creating the event
#     return response.json()

def create_event(user_email, calendar_id, event_name, start_datetime, end_datetime, attendee=None, location=None, description=None, timezone=None):
    # timezone = "Asia/Singapore"
    access_token = get_valid_access_token(user_email)
    if not timezone:
        timezone = get_calendar_timezone(user_email, calendar_id)

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
    if description:
        event_data["description"] = description

    response = requests.post(endpoint, headers=headers, json=event_data)
    response.raise_for_status()  # Ensure any HTTP errors are raised
    return_event = response.json()


    return {
        "event_name": return_event["summary"],
        "start_datetime": return_event["start"]["dateTime"],
        "end_datetime": return_event["end"]["dateTime"],
        "attendee": return_event.get("attendees", [{}])[0].get("email", "None"),

    }

# def confirm_and_create_event(user_email, calendar_id, event_name, start_datetime, end_datetime, attendee=None, location=None):

#     # Confirm with the user
#     confirmation_message = f"Please confirm the details of your event:\n" \
#                            f"Event Name: {event_name}\n" \
#                            f"Start Time: {start_datetime}\n" \
#                            f"End Time: {end_datetime}\n" \
#                            f"{'Attendee: ' + attendee if attendee else ''}\n" \
#                            f"{'Location: ' + location if location else ''}\n" \
#                            f"Do you want to proceed with creating this event? (yes/no): "
    
#     # This is a placeholder for user response, in actual implementation, 
#     # this should be handled by your user interface
#     user_confirmation = input(confirmation_message).lower()

#     # Create event if confirmed
#     if user_confirmation == 'yes':
#         print("Creating event...")
#         return create_event(user_email, calendar_id, event_name, start_datetime, end_datetime, attendee, location)
#     else:
#         print("Event creation cancelled.")
#         return {"error": "Event creation cancelled by user."}


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
    
# def update_event(user_email, calendar_id, event_id, event_name=None, start_datetime=None, end_datetime=None, attendee=None, location=None, description=None):
#     access_token = get_valid_access_token(user_email)
#     endpoint = f"https://www.googleapis.com/calendar/v3/calendars/{calendar_id}/events/{event_id}"
#     headers = {"Authorization": f"Bearer {access_token}", "Accept": "application/json", "Content-Type": "application/json"}

#     # Fetch the current event to retain the existing data
#     response = requests.get(endpoint, headers=headers)
#     response.raise_for_status()
#     existing_event = response.json()

#     # Prepare the update data
#     event_data = {
#         "summary": event_name if event_name else existing_event.get("summary"),
#         "start": existing_event.get("start"),
#         "end": existing_event.get("end"),
#         "attendees": [{"email": attendee}] if attendee else existing_event.get("attendees"),
#         "location": location if location else existing_event.get("location"),
#         "description": description if description else existing_event.get("description"),
#     }

#     # Update date/time only if provided
#     if start_datetime:
#         event_data["start"]["dateTime"] = start_datetime
#         event_data["start"]["timeZone"] = existing_event.get("start").get("timeZone")
#     if end_datetime:
#         event_data["end"]["dateTime"] = end_datetime
#         event_data["end"]["timeZone"] = existing_event.get("end").get("timeZone")

#     # Send the updated event data
#     response = requests.put(endpoint, headers=headers, json=event_data)
#     response.raise_for_status()
#     return response.json()

# def update_event(user_email, calendar_id, event_id, event_name=None, start_datetime=None, end_datetime=None, attendee=None, location=None, description=None):
#     access_token = get_valid_access_token(user_email)

#     endpoint = f"https://www.googleapis.com/calendar/v3/calendars/{calendar_id}/events/{event_id}"
#     headers = {
#         "Authorization": f"Bearer {access_token}",
#         "Accept": "application/json",
#         "Content-Type": "application/json",
#     }

#     # Fetch the existing event details
#     existing_event_response = requests.get(endpoint, headers=headers)
#     existing_event_response.raise_for_status()  # Ensure any HTTP errors are raised
#     existing_event = existing_event_response.json()
#     timezone = existing_event.get("start").get("timeZone")

#     # Store the original event details
#     original_event_data = copy.deepcopy({
#         "summary": existing_event.get("summary"),
#         "start": existing_event.get("start"),
#         "end": existing_event.get("end"),
#         "attendees": existing_event.get("attendees", []),
#         "location": existing_event.get("location", ""),
#         "description": existing_event.get("description", "")
#     })

#     title = original_event_data["summary"]
#     start = original_event_data["start"]
#     end = original_event_data["end"]

#     print(start, "this is start")
#     print("Original Event Data:", original_event_data)  # Debug statement

#     # Prepare the updated event details
#     event_data = {
#         "id": event_id,
#         "summary": existing_event.get("summary"),
#         "start": existing_event.get("start"),
#         "end": existing_event.get("end"),
#     }


#     if event_name:
#         event_data["summary"] = event_name
#     if start_datetime:
#         event_data["start"]["dateTime"] = start_datetime
#         event_data["start"]["timeZone"] = timezone
#     if end_datetime:
#         event_data["end"]["dateTime"] = end_datetime
#         event_data["end"]["timeZone"] = timezone
#     if attendee:
#         event_data["attendees"] = [{"email": attendee}]
#     if location:
#         event_data["location"] = location
#     if description:
#         event_data["description"] = description

#     print(start, "this is start")
#     print("Updated Event Data:", event_data)  # Debug statement

#     # Update the event on Google Calendar
#     response = requests.put(endpoint, headers=headers, json=event_data)
#     response.raise_for_status()  # Ensure any HTTP errors are raised
#     print(start, "this is start")

#     updated_event = response.json()
#     print(start, "this is start")

#     print("Updated Event Response:", updated_event)  # Debug statement

#     # Return both the original and updated event details
#     return {
#         "current_event": {
#             "title": title,
#             "start": start,
#             "end": end

#         },
#         "updated_event": event_data
#     }
def update_event(user_email, calendar_id, event_id, event_name=None, start_datetime=None, end_datetime=None, new_attendees=None, location=None, description=None):
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

    existing_attendees = existing_event.get("attendees", [])
    timezone = existing_event.get("start", {}).get("timeZone", 'UTC')

    # Extract the original timings
    title = existing_event.get("summary")
    original_start = existing_event["start"]["dateTime"]
    original_end = existing_event["end"]["dateTime"]
    timezone = existing_event["start"]["timeZone"]

    print(f"Original start: {original_start}")
    print(f"Original end: {original_end}")

    event_data = {
        "summary": event_name if event_name else existing_event.get("summary"),
        "start": {
            "dateTime": start_datetime if start_datetime else existing_event.get("start", {}).get("dateTime"),
            "timeZone": existing_event.get("start", {}).get("timeZone", timezone)
        },
        "end": {
            "dateTime": end_datetime if end_datetime else existing_event.get("end", {}).get("dateTime"),
            "timeZone": existing_event.get("end", {}).get("timeZone", timezone)
        },
        "attendees": existing_attendees,  # Start with existing attendees
        "location": location if location else existing_event.get("location"),
        "description": description if description else existing_event.get("description"),
    }

    print(f"Event data before update: {event_data}")

    if new_attendees:
        new_attendee_list = [{"email": email} for email in new_attendees if email not in [a['email'] for a in existing_attendees]]
        event_data["attendees"].extend(new_attendee_list)

    # Update the event
    response = requests.put(endpoint, headers=headers, json=event_data)
    response.raise_for_status()
    updated_event = response.json()

    # Extract the updated timings
    updated_start = updated_event["start"]["dateTime"]
    updated_end = updated_event["end"]["dateTime"]

    print(f"Updated start: {updated_start}")
    print(f"Updated end: {updated_end}")

    result = {
        "title": title,
        "original_start": original_start,
        "original_end": original_end,
        "updated_start": updated_start,
        "updated_end": updated_end,
        "updated_event": updated_event
    }
    return result

# def update_event(user_email, calendar_id, event_id, event_name=None, start_datetime=None, end_datetime=None, attendee=None, location=None, description=None):
#     access_token = get_valid_access_token(user_email)

#     endpoint = f"https://www.googleapis.com/calendar/v3/calendars/{calendar_id}/events/{event_id}"
#     headers = {
#         "Authorization": f"Bearer {access_token}",
#         "Accept": "application/json",
#         "Content-Type": "application/json",
#     }

#     existing_event_response = requests.get(endpoint, headers=headers)
#     existing_event_response.raise_for_status()  # Ensure any HTTP errors are raised
#     existing_event = existing_event_response.json()
#     timezone = existing_event.get("start").get("timeZone")

#     event_data = {
#         "id": event_id,
#         "summary": existing_event.get("summary"),
#         "start": existing_event.get("start"),
#         "end": existing_event.get("end"),
#     }

#     if event_name:
#         event_data["summary"] = event_name
#     if start_datetime:
#         event_data["start"]["dateTime"] = start_datetime
#         event_data["start"]["timeZone"] = timezone
#     if end_datetime:
#         event_data["end"]["dateTime"] = end_datetime
#         event_data["end"]["timeZone"] = timezone
#     if attendee:
#         event_data["attendees"] = [{"email": attendee}]
#     if location:
#         event_data["location"] = location
#     if description:
#         event_data["description"] = description

#     response = requests.put(endpoint, headers=headers, json=event_data)
#     response.raise_for_status()  # Ensure any HTTP errors are raised
#     return response.json()

# Assuming a global dictionary to hold session data
session_storage = {}

def save_to_session(user_email, event_details):
    """
    Save event details to the session storage.
    :param user_email: Email of the user as the key for the session data.
    :param event_details: A dictionary containing all the details of the event.
    """
    session_storage[user_email] = event_details
    print(f"Session saved for {user_email}: {event_details}")

def get_from_session(user_email):
    """
    Retrieve event details from the session storage.
    :param user_email: Email of the user to fetch the details for.
    :return: Event details or None if no details are found.
    """
    return session_storage.get(user_email, None)

def clear_session(user_email):
    """
    Clear the session data for a given user.
    :param user_email: Email of the user whose session data is to be cleared.
    """
    if user_email in session_storage:
        del session_storage[user_email]
        print(f"Session cleared for {user_email}")

