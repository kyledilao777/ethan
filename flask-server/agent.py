from dotenv import load_dotenv
import os

from datetime import datetime
from flask_cors import CORS

import pytz
import openai

from langchain.agents import AgentExecutor
from langchain.memory import ConversationSummaryBufferMemory
from langchain_openai import ChatOpenAI
from langchain.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain.tools.render import format_tool_to_openai_function
from langchain.agents.format_scratchpad import format_to_openai_function_messages
from langchain.agents.output_parsers import OpenAIFunctionsAgentOutputParser
from langchain_core.utils import function_calling
from usecases.calendar_functions import get_from_session, save_to_session, clear_session

from usecases.calendar_tools import GetCalendarEventsTool, TimeDeltaTool, CreateCalendarEventTool, SpecificTimeTool, DeleteCalendarEventTool, UpdateCalendarEventTool

from flask import Flask, jsonify, request, send_from_directory

import spacy
import json
from openai import OpenAI

from openai import OpenAI

openai.api_key = os.getenv("OPEN_AI_API_KEY")
client = OpenAI()
import re

import threading
import time

app = Flask(__name__)
CORS(app) 

load_dotenv()

OPENAI_API_KEY = os.getenv("OPEN_AI_API_KEY")
OPENAI_MODEL = "gpt-4o"

llm = ChatOpenAI(temperature=0, model=OPENAI_MODEL, api_key=OPENAI_API_KEY)
persistent_memory = ConversationSummaryBufferMemory(llm=llm,memory_key="chat_history", return_messages=True, max_token_limit=2000)

@app.route("/agent", methods=["POST"])
def run():
    data = request.get_json()
    user_input = data["user_input"]
    user_email = data["user_email"]
    calendar_id = data["calendar_id"]
    user_timezone = data.get("timezone", "UTC")

    timezone = pytz.timezone(user_timezone)
    output = start_agent(user_input, user_email, calendar_id, timezone, persistent_memory)

    return jsonify(output)

def pre_processing(user_input, response_container):
    # Prepare the prompt for the GPT-3.5-turbo model
    prompt = f"""
    The user has input the following text: "{user_input}". 
    Based on this input, identify the user's intent and extract corresponding details.
    The possible intentions are: read, update, delete, create.
    Respond with a JSON object containing the intent and details.
    
    For reading an event, extract start time, end time, date, item title, location, description and attendees. If not provided, the field should be empty.
    For creating an event, extract item title, start time, end time, date, location, description and attendees. If not provided, the field should be empty.
    For updating an event, extract start time, end time, date, item title, location, description and attendees. If not provided, the field should be empty.
    For deleting an event, extract item title, start time, end time and date. If not provided, the field should be empty. If not provided, the field should be empty.
    
    Sample Input:
    "Hi Ethan, create a "catch up" with John (john@example.com) at jewel changi airport on 15 july from 10-11 am."
    
    Sample output:
    {{
        "intent": "create",
        "details": {{
            "title": "catch up",
            "start time": "10:00 AM",
            "end time": "11:00 AM",
            "location": "jewel changi airport",
            "date": "2024-07-15",
            "attendees": {{"John": "john@example.com"}},
        }}
    }}
    
    """

    # Call the OpenAI API
    response = client.chat.completions.create(model="gpt-3.5-turbo-0125",
    messages=[
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": prompt}
    ])

    # Extract the intent from the response
    response_text = response.choices[0].message.content.strip().lower()

    try:
        response_json = json.loads(response_text)
        intent = response_json.get("intent", "none").lower()
        details = response_json.get("details", {})
    except json.JSONDecodeError:
        intent = "none"
        details = {}

    # Validate the intent to ensure it matches one of the expected values
    valid_intents = ["read", "update", "delete", "create"]
    if intent not in valid_intents:
        intent = "none"

    return {"intent": intent, "details": details}

def run_agent_executor(user_email, user_input, calendar_id, user_timezone, memory, response_container, intent):
    tools = [
        TimeDeltaTool(),
        GetCalendarEventsTool(),
        CreateCalendarEventTool(),
        SpecificTimeTool(),
        DeleteCalendarEventTool(),
        UpdateCalendarEventTool(),
    ]

    input = f"""
    calendar_id: {calendar_id}
    user_email: {user_email}
    current datetime: {datetime.now(user_timezone).strftime("%Y-%m-%dT%H:%M:%S%z")}
    current weekday: {datetime.now(user_timezone).strftime("%A")}
    user input: {user_input}
    """

    prompt = ChatPromptTemplate.from_messages(
        [
            (
            "system", 
            """
            Context:
            Your name is Ethan. You are funny and friendly assistant on Earth and you like to use emojis. You are tasked to help me manage my calendar and arrange for meetings, even across timezones.
            
            Note:
            If there is no email specified for attendees, keep attendees as an empty dictionary.
            When the user provides insufficient details about an event, do not ask for confirmation. Instead, use the context and any available information to find the best timing for the event. Ensure the proposed timing fits within the user's typical schedule and avoids conflicts with existing appointments.
            If there is a conflict with existing appointments, ask the user for confirmation before proceeding. Only execute the scheduling if confirmation is given.
            If you encounter any errors, such as incomplete information,
            invalid date/time formats, scheduling conflicts,
            incorrect email or calendar ID, network issues,
            or insufficient permissions, please still provide a response.
            Do not display any technical error messages, like 403 errors. Instead,
            respond with a helpful message indicating what went wrong and any possible actions or
            suggestions to resolve the issue.
            When a user attempts to schedule an event at a specific time, you must first check the user's Google Calendar to verify if that time slot is already occupied. If the time is occupied, you should prompt the user
            to reconfirm their scheduling decision. If the user responds
            with a request to 'change' the event, you will proceed
            to reschedule the event to a new time. If the user decides not to change
            the event or doesn't provide clear instructions to change, you should
            leave the event at the originally requested time.


            NEVER EVER include the event ID.
            """

            ),
            MessagesPlaceholder(variable_name="chat_history"),
            ("user", "{input}"),
            MessagesPlaceholder(variable_name="agent_scratchpad"),
        ]
    )

    functions = [function_calling.convert_to_openai_function(t) for t in tools]

    llm_with_tools = llm.bind(functions=functions)

    agent = (
        {
            "input": lambda x: x["input"],
            "agent_scratchpad": lambda x: format_to_openai_function_messages(x["intermediate_steps"]),
            "chat_history": lambda x: x["chat_history"],
        }
        | prompt
        | llm_with_tools
        | OpenAIFunctionsAgentOutputParser()
    )

    agent_executor = AgentExecutor.from_agent_and_tools(agent=agent, tools=tools, verbose=True, memory=memory, max_iterations=15)
    result = agent_executor.invoke({"input": input})

    if (result):
        session = get_from_session(user_email)
        print(session, "Session from agent.py")

        if (intent != "none"):
             response_container["isEvent"] = True
        else:
             response_container["isEvent"] = False

        response_container['eventDetails'] = session


    for step in result.get("intermediate_steps", []):
        if step["tool"] == "get_calendar_events":
            response_container['events'] = step["output"]
            print(step["output"], "This is step output")

    clear_session(user_email)

    response_container['response'] = result.get("output")


def agent_task(input_data, user_email, calendar_id, timezone, memory, response_container):
    intent = pre_processing(input_data, response_container)["intent"]
    # details = pre_processing(input_data, response_container)["details"]
    
    print(intent, "This is the intent")
    run_agent_executor(user_email, input_data, calendar_id, timezone, memory, response_container, intent)

    response_container['intent'] = intent
    time.sleep(2)

    # Append the parsed details and static message to the response container


def start_agent(input_data, user_email, calendar_id, timezone, memory):
    response_container = {}
    agent_thread = threading.Thread(target=agent_task, args=(input_data, user_email, calendar_id, timezone, memory, response_container))
    agent_thread.start()
    agent_thread.join()

    return response_container

# if __name__ == "__main__":
#     app.run(debug=True, port=5001)
