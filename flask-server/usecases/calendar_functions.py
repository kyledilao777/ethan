import os
import time
import requests
from dotenv import load_dotenv

load_dotenv()

BACKEND_URL = os.getenv("BACKEND_URI")

def get_tokens(email):
   response = requests.get(f"{BACKEND_URL}/get-tokens?email={email}")
   response.raise_for_status()
   return response.json()


def refresh_access_token(refresh_token):
   token_url = os.getenv("TOKEN_URI")
   client_id = os.getenv("CLIENT_ID")
   client_secret = os.getenv("CLIENT_SECRET")


   print(token_url, client_id, client_secret)
   print("calling refresh token")
  
   params = {
       "grant_type": "refresh_token",
       "client_id": client_id,
       "client_secret": client_secret,
       "refresh_token": refresh_token,
   }
  
   headers = {
       "Content-Type": "application/x-www-form-urlencoded"
   }
  
   try:
       response = requests.post(token_url, data=params, headers=headers)
       response.raise_for_status()
   except requests.exceptions.HTTPError as e:
       print(f"Error: {response.status_code} - {response.text}")
       raise e
  
   return response.json()


def get_valid_access_token(email):
   tokens = get_tokens(email)
   print(tokens)
   access_token = tokens.get("access_token")
   refresh_token = tokens.get("refresh_token")


   # if not access_token:
   #     try:
   #         new_tokens = refresh_access_token(refresh_token)
   #         access_token = new_tokens.get("access_token")


   #         # Update tokens in the backend
   #         update_tokens_in_backend(email, new_tokens)
   #     except requests.exceptions.HTTPError as e:
   #         print("refresh token fails")
   #         # If token refresh fails, re-authentication might be needed
          
   if not access_token:
       new_tokens = refresh_access_token(refresh_token)
       print("BEFORE: ", new_tokens)
       access_token = new_tokens.get("access_token")
       
       if "refresh_token" not in new_tokens:
            new_tokens["refresh_token"] = refresh_token
        
       print("AFTER: ", new_tokens)

       # Optionally update the tokens in the backend
       update_tokens_in_backend(email, new_tokens)
      
   return access_token


def update_tokens_in_backend(email, tokens):
   response = requests.post(f"{BACKEND_URL}/update-tokens", json={"email": email, "tokens": tokens})
   response.raise_for_status()


def get_calendar_events(user_email, calendar_id, start_time, end_time):
   try:
       # Attempt to get a valid access token
       access_token = get_valid_access_token(user_email)
       if not access_token:
           raise Exception("Access token not found")
   except Exception as e:
       return {
           "status": "error",
           "message": "Failed to retrieve access token. Please reauthenticate and try again."
       }


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
  
   #refresh expired tokens
   if response.status_code == 401:
       print(f"email: {user_email}")
      
       # Token expired, refresh it
       tokens = get_tokens(user_email)
       print(f"tokens: {tokens}")
      
       refresh_token = tokens.get("refresh_token")
       print(f"refresh_token: {refresh_token}")
      
       new_tokens = refresh_access_token(refresh_token)
       print("BEFORE: ", new_tokens)
       access_token = new_tokens.get("access_token")
       
       if "refresh_token" not in new_tokens:
            new_tokens["refresh_token"] = refresh_token
        
       print("AFTER: ", new_tokens)

       # Optionally update the tokens in the backend
       update_tokens_in_backend(user_email, new_tokens)
      
       # Retry the request with the new access token
       headers["Authorization"] = f"Bearer {access_token}"
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
   try:
       # Attempt to get a valid access token
       access_token = get_valid_access_token(user_email)
       if not access_token:
           raise Exception("Access token not found")
   except Exception as e:
       return {
           "status": "error",
           "message": "Failed to retrieve access token. Please reauthenticate and try again."
       }


   endpoint = f"https://www.googleapis.com/calendar/v3/calendars/{calendar_id}"
   headers = {
       "Authorization": f"Bearer {access_token}",
       "Accept": "application/json",
   }


   response = requests.get(endpoint, headers=headers)
  
   #refresh expired tokens
   if response.status_code == 401:
       print(f"email: {user_email}")
       # Token expired, refresh it
       tokens = get_tokens(user_email)
       print(f"tokens: {tokens}")
      
       refresh_token = tokens.get("refresh_token")
       print(f"refresh_token: {refresh_token}")
      
       new_tokens = refresh_access_token(refresh_token)
       print("BEFORE: ", new_tokens)
       access_token = new_tokens.get("access_token")
       
       if "refresh_token" not in new_tokens:
            new_tokens["refresh_token"] = refresh_token
        
       print("AFTER: ", new_tokens)

       # Optionally update the tokens in the backend
       update_tokens_in_backend(user_email, new_tokens)
      
       # Retry the request with the new access token
       headers["Authorization"] = f"Bearer {access_token}"
       response = requests.get(endpoint, headers=headers)
      
   response.raise_for_status()  # Ensure any HTTP errors are raised
   calendar_details = response.json()


   time_zone = calendar_details.get("timeZone")
   return time_zone


def create_event(user_email, calendar_id, event_name, start_datetime, end_datetime, attendees, location=None, description=None, timezone=None):
  
   try:
       # Attempt to get a valid access token
       access_token = get_valid_access_token(user_email)
       if not access_token:
           raise Exception("Access token not found")
   except Exception as e:
       return {
           "status": "error",
           "message": "Failed to retrieve access token. Please reauthenticate and try again."
       }


   if not timezone:
       timezone = get_calendar_timezone(user_email, calendar_id)


   endpoint = f"https://www.googleapis.com/calendar/v3/calendars/{calendar_id}/events"
   headers = {
       "Authorization": f"Bearer {access_token}",
       "Accept": "application/json",
       "Content-Type": "application/json",
   }


   event_data = {
       "summary": event_name,
       "start": {
           "dateTime": start_datetime,
           "timeZone": timezone,
       },
       "end": {
           "dateTime": end_datetime,
           "timeZone": timezone,
       },
   }


   if attendees:
       event_data["attendees"] = [{"email": email} for email in attendees]
   if location:
       event_data["location"] = location
   if description:
       event_data["description"] = description + "\n" + "\n" + "Created by Ethan"
   else:
       event_data["description"] = "Created by Ethan"


   response = requests.post(endpoint, headers=headers, json=event_data)
  
   #refresh expired tokens
   if response.status_code == 401:
       print(f"email: {user_email}")
      
       # Token expired, refresh it
       tokens = get_tokens(user_email)
       print(f"tokens: {tokens}")
      
       refresh_token = tokens.get("refresh_token")
       print(f"refresh_token: {refresh_token}")
      
       new_tokens = refresh_access_token(refresh_token)
       print("BEFORE: ", new_tokens)
       access_token = new_tokens.get("access_token")
       
       if "refresh_token" not in new_tokens:
            new_tokens["refresh_token"] = refresh_token
        
       print("AFTER: ", new_tokens)

       # Optionally update the tokens in the backend
       update_tokens_in_backend(user_email, new_tokens)
      
       # Retry the request with the new access token
       headers["Authorization"] = f"Bearer {access_token}"
       response = requests.post(endpoint, headers=headers, json=event_data)
  
  
   response.raise_for_status()  # Ensure any HTTP errors are raised
   return_event = response.json()




   return {
       "event_name": return_event["summary"],
       "start_datetime": return_event["start"]["dateTime"],
       "end_datetime": return_event["end"]["dateTime"],
       "attendee": return_event.get("attendees", [{}])[0].get("email", "None"),
   }


def delete_event(user_email, calendar_id, event_id):
   try:
       # Attempt to get a valid access token
       access_token = get_valid_access_token(user_email)
       if not access_token:
           raise Exception("Access token not found")
   except Exception as e:
       return {
           "status": "error",
           "message": "Failed to retrieve access token. Please reauthenticate and try again."
       }


   endpoint = f"https://www.googleapis.com/calendar/v3/calendars/{calendar_id}/events/{event_id}"
   headers = {
       "Authorization": f"Bearer {access_token}",
       "Accept": "application/json",
   }


   response = requests.delete(endpoint, headers=headers)
  
   #refresh expired tokens
   if response.status_code == 401:
       print(f"email: {user_email}")
      
       # Token expired, refresh it
       tokens = get_tokens(user_email)
       print(f"tokens: {tokens}")
      
       refresh_token = tokens.get("refresh_token")
       print(f"refresh_token: {refresh_token}")
      
       new_tokens = refresh_access_token(refresh_token)
       print("BEFORE: ", new_tokens)
       access_token = new_tokens.get("access_token")
       
       if "refresh_token" not in new_tokens:
            new_tokens["refresh_token"] = refresh_token
        
       print("AFTER: ", new_tokens)

       # Optionally update the tokens in the backend
       update_tokens_in_backend(user_email, new_tokens)
      
       # Retry the request with the new access token
       headers["Authorization"] = f"Bearer {access_token}"
       response = requests.delete(endpoint, headers=headers)
  
   response.raise_for_status()  # Ensure any HTTP errors are raised


   if response.status_code == 204:
       return {"message": "Event deleted successfully"}
   else:
       return {"error": "Failed to delete event"}
  
def update_event(user_email, calendar_id, event_id, event_name=None, start_datetime=None, end_datetime=None, new_attendees=None, location=None, description=None):
   try:
       # Attempt to get a valid access token
       access_token = get_valid_access_token(user_email)
       if not access_token:
           raise Exception("Access token not found")
   except Exception as e:
       return {
           "status": "error",
           "message": "Failed to retrieve access token. Please reauthenticate and try again."
       }
    

   endpoint = f"https://www.googleapis.com/calendar/v3/calendars/{calendar_id}/events/{event_id}"
   headers = {
       "Authorization": f"Bearer {access_token}",
       "Accept": "application/json",
       "Content-Type": "application/json",
   }


   existing_event_response = requests.get(endpoint, headers=headers)
  
   #refresh expired tokens
   if existing_event_response.status_code == 401:
       print(f"email: {user_email}")
      
       # Token expired, refresh it
       tokens = get_tokens(user_email)
       print(f"tokens: {tokens}")
      
       refresh_token = tokens.get("refresh_token")
       print(f"refresh_token: {refresh_token}")
      
       new_tokens = refresh_access_token(refresh_token)
       print("BEFORE: ", new_tokens)
       access_token = new_tokens.get("access_token")
       
       if "refresh_token" not in new_tokens:
            new_tokens["refresh_token"] = refresh_token
        
       print("AFTER: ", new_tokens)

       # Optionally update the tokens in the backend
       update_tokens_in_backend(user_email, new_tokens)
      
       # Retry the request with the new access token
       headers["Authorization"] = f"Bearer {access_token}"
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
  
   #refresh expired tokens
   if response.status_code == 401:
       print(f"email: {user_email}")
      
       # Token expired, refresh it
       tokens = get_tokens(user_email)
       print(f"tokens: {tokens}")
      
       refresh_token = tokens.get("refresh_token")
       print(f"refresh_token: {refresh_token}")
      
       new_tokens = refresh_access_token(refresh_token)
       print("BEFORE: ", new_tokens)
       access_token = new_tokens.get("access_token")
       
       if "refresh_token" not in new_tokens:
            new_tokens["refresh_token"] = refresh_token
        
       print("AFTER: ", new_tokens)

       # Optionally update the tokens in the backend
       update_tokens_in_backend(user_email, new_tokens)
      
       # Retry the request with the new access token
       headers["Authorization"] = f"Bearer {access_token}"
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
