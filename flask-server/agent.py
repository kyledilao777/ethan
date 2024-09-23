from dotenv import load_dotenv
from datetime import datetime
from flask_cors import CORS
from openai import OpenAI

import os
import pytz
import openai
import spacy
import json
import re
import threading
import time

from flask import Flask, jsonify, request, send_from_directory
from elasticsearch import Elasticsearch
from langchain.agents import AgentExecutor
from langchain.memory import ConversationSummaryBufferMemory
from langchain_openai import ChatOpenAI
from langchain.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain.tools.render import format_tool_to_openai_function

from langchain.agents.format_scratchpad import format_to_openai_function_messages
from langchain.agents.output_parsers import OpenAIFunctionsAgentOutputParser
from langchain_core.utils import function_calling
from usecases.calendar_functions import get_from_session, save_to_session, clear_session

from usecases.calendar_tools import GetCalendarEventsTool, TimeDeltaTool, CreateCalendarEventTool, SpecificTimeTool, DeleteCalendarEventTool, UpdateCalendarEventTool, StoreUserPreferenceTool, RetrieveUserPreferenceTool, DeleteUserPreferenceTool, ModifyUserPreferenceTool, CreateContactTool, ModifyContactTool, DeleteContactTool, RetrieveContactTool
from elasticsearchfile import es
from flask import Flask, jsonify, request, send_from_directory

import spacy
import json
from openai import OpenAI

from openai import OpenAI

client = OpenAI()

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
    print(data)
    

    timezone = pytz.timezone(user_timezone)
    output = start_agent(user_input, user_email, calendar_id, timezone, persistent_memory)

    return jsonify(output)


def run_agent_executor(user_email, user_input, calendar_id, user_timezone, memory, response_container):
    tools = [
        #Standard Tools
        TimeDeltaTool(),
        GetCalendarEventsTool(),
        CreateCalendarEventTool(),
        SpecificTimeTool(),
        DeleteCalendarEventTool(),
        UpdateCalendarEventTool(),

        #RAG Tools
        StoreUserPreferenceTool(es_client=es, index_name="user_preferences"),
        RetrieveUserPreferenceTool(es_client=es, index_name="user_preferences"),
        DeleteUserPreferenceTool(es_client=es, index_name="user_preferences"),
        ModifyUserPreferenceTool(es_client=es, index_name="user_preferences"),
        CreateContactTool(es_client=es, index_name="contacts"),
        ModifyContactTool(es_client=es, index_name="contacts"),
        DeleteContactTool(es_client=es, index_name="contacts"),
        RetrieveContactTool(es_client=es, index_name="contacts"),
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
        response_container['eventDetails'] = session


    for step in result.get("intermediate_steps", []):
        if step["tool"] == "get_calendar_events":
            response_container['events'] = step["output"]
            print(step["output"], "This is step output")

    clear_session(user_email)

    response_container['response'] = result.get("output")


def agent_task(input_data, user_email, calendar_id, timezone, memory, response_container):
    run_agent_executor(user_email, input_data, calendar_id, timezone, memory, response_container)
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