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

from usecases.calendar_tools import GetCalendarEventsTool, TimeDeltaTool, CreateCalendarEventTool, SpecificTimeTool, DeleteCalendarEventTool, UpdateCalendarEventTool

from flask import Flask, jsonify, request, send_from_directory

import threading
import time

app = Flask(__name__)
CORS(app) 

load_dotenv()

OPENAI_API_KEY = os.getenv("OPEN_AI_API_KEY")
OPENAI_MODEL = "gpt-3.5-turbo-0613"

asia_singapore_timezone = pytz.timezone("Asia/Singapore")

llm = ChatOpenAI(temperature=0, model=OPENAI_MODEL, api_key=OPENAI_API_KEY)
persistent_memory = ConversationSummaryBufferMemory(llm=llm,memory_key="chat_history", return_messages=True, max_token_limit=500)

@app.route("/agent", methods=["POST"])

### Main interaction loop ###
def run():
    data = request.get_json()
    user_input = data.get("user_input")
    user_email = data.get("user_email")
    calendar_id = data.get("calendar_id")

    try:
        output = start_agent(user_input, user_email, calendar_id, persistent_memory)
        return jsonify(output)
    except Exception as e:
        print(f"Error occurred: {e}")
        error_message = ("My apologies, I couldn't process your request at the moment. "
                         "Please try again later or ask me something different. "
                         "If you believe this is an error, feel free to contact support at "
                         "kyle.untangled@gmail.com. Thank you for your understanding!")
        return jsonify({"error": error_message}), 500

        
def run_agent_executor(user_email: str, user_input: str, calendar_id: str, memory, response_container):
     # Options
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
    current datetime: {datetime.now(asia_singapore_timezone).strftime("%Y-%m-%dT%H:%M:%S%z")}
    current weekday: {datetime.now(asia_singapore_timezone).strftime("%A")}
    user input: {user_input}
    """

    prompt = ChatPromptTemplate.from_messages(
        [
            (
                "system",
                "Your name is Ethan. You are a funny and friendly assistant who can help me schedule my meetings, fetch my calendar events and optimise my task completion. NEVER print event ids to the user. Remember the user's response.",
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
            "agent_scratchpad": lambda x: format_to_openai_function_messages(
                x["intermediate_steps"]
            ),
            "chat_history": lambda x: x["chat_history"],
        }
        | prompt
        | llm_with_tools
        | OpenAIFunctionsAgentOutputParser()
    )

    agent_executor = AgentExecutor.from_agent_and_tools(agent=agent, tools=tools, verbose=True, memory=memory, max_iterations=10)
    result = agent_executor.invoke({"input": input})
    
    response_container["response"] = result.get("output")

### running the agent ###
def agent_task(input_data, user_email, calendar_id, memory, response_container):
    """
    This is where the agent's work based on the user input  is executed.
    Replace the print statement with the actual work of your agent.
    """

    run_agent_executor(user_email, input_data, calendar_id, memory, response_container)

    # Simulate some work with a sleep
    time.sleep(2)
def start_agent(input_data, user_email, calendar_id, memory):
    """
    Starts the agent task in a new thread based on the given input_data.
    """
    response_container = {}
    agent_thread = threading.Thread(target=agent_task, args=(input_data, user_email, calendar_id, memory, response_container))
    agent_thread.start()
    agent_thread.join()
    
    return response_container
    
if __name__ == "__main__":
    app.run(debug=True, port=5001)
