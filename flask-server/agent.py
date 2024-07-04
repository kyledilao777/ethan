from dotenv import load_dotenv
import os

from datetime import datetime
from flask_cors import CORS

import pytz

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
import re

import threading
import time

app = Flask(__name__)
CORS(app) 

load_dotenv()

OPENAI_API_KEY = os.getenv("OPEN_AI_API_KEY")
OPENAI_MODEL = "gpt-3.5-turbo-0125"

llm = ChatOpenAI(temperature=0, model=OPENAI_MODEL, api_key=OPENAI_API_KEY)
persistent_memory = ConversationSummaryBufferMemory(llm=llm,memory_key="chat_history", return_messages=True, max_token_limit=500)

@app.route("/agent", methods=["POST"])
def run():
    data = request.get_json()
    user_input = data["user_input"]
    user_email = data["user_email"]
    calendar_id = data["calendar_id"]
    user_timezone = data.get("timezone", "UTC")

    timezone = pytz.timezone(user_timezone)
    response_container = start_agent(user_input, user_email, calendar_id, timezone, persistent_memory)
    
    return jsonify(response_container)

def determine_intent(user_input, response_container):
   
    if "schedule" in user_input.lower():
            return "create"
    elif "delete" in user_input.lower() or "remove" in user_input.lower():            
        return "delete"
    elif "update" in user_input.lower() or "postpone" in user_input.lower():
            return "update"
    elif "today" in  user_input.lower():
        return "today"
    else:
         "none"

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
            ("system", "Your name is Ethan. You are a funny and friendly assistant who can help me schedule my meetings, fetch my calendar events and optimise my task completion. NEVER print event ids to the user. Remember the user's response."),
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

    agent_executor = AgentExecutor.from_agent_and_tools(agent=agent, tools=tools, verbose=True, memory=memory, max_iterations=10)
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
    intent = determine_intent(input_data, response_container)
    run_agent_executor(user_email, input_data, calendar_id, timezone, memory, response_container, intent)

    
    
    # if intent == "create":
    #     parsed_details, static_message = parse_create_event(input_data)
    #     print("create")
    # elif intent == "delete":
    #     parsed_details, static_message = parse_delete_event(input_data)
    #     print("delete")
    # elif intent == "update":
    #     parsed_details, static_message = parse_update_event(input_data)
    #     print("update")
    # else:
    #     parsed_details, static_message = None, "Sorry, I didn't understand your request."

    response_container['intent'] = intent
    time.sleep(2)
    
    # Append the parsed details and static message to the response container
    

def start_agent(input_data, user_email, calendar_id, timezone, memory):
    response_container = {}
    agent_thread = threading.Thread(target=agent_task, args=(input_data, user_email, calendar_id, timezone, memory, response_container))
    agent_thread.start()
    agent_thread.join()

    return response_container

if __name__ == "__main__":
    app.run(debug=True, port=5001)
