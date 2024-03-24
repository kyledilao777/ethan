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

from usecases.calendar_tools import GetCalendarEventsTool, TimeDeltaTool, CreateCalendarEventTool, SpecificTimeTool, DeleteCalendarEventTool

from flask import Flask, jsonify, request, send_from_directory


import threading
import time

app = Flask(__name__, static_folder="client/build")
CORS(app) 

OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")
OPENAI_MODEL = "gpt-3.5-turbo-0613"

asia_singapore_timezone = pytz.timezone("Asia/Singapore")

llm = ChatOpenAI(temperature=0, model=OPENAI_MODEL, api_key=OPENAI_API_KEY)
persistent_memory = ConversationSummaryBufferMemory(llm=llm,memory_key="chat_history", return_messages=True, max_token_limit=500)

@app.route("/agent", methods=["POST"])
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path != "" and os.path.exists(app.static_folder + '/' + path):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')
### Main interaction loop ###
def run(): 
    data = request.get_json()
    user_input = data["user_input"]
    output = start_agent(user_input, persistent_memory)
    return jsonify(output)
        
def run_agent_executor(user_email: str, user_input: str, calendar_id: str, memory, response_container):
    # Options
    tools = [
        TimeDeltaTool(),
        GetCalendarEventsTool(),
        CreateCalendarEventTool(),
        SpecificTimeTool(),
        DeleteCalendarEventTool(),
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
        }
        | prompt
        | llm_with_tools
        | OpenAIFunctionsAgentOutputParser()
    )

    agent_executor = AgentExecutor.from_agent_and_tools(agent=agent, tools=tools, verbose=True, memory=memory)
    result = agent_executor.invoke({"input": input})
    
    response_container["response"] = result.get("output")

### running the agent ###
def agent_task(input_data, memory, response_container):
    """
    This is where the agent's work based on the user input is executed.
    Replace the print statement with the actual work of your agent.
    """

    run_agent_executor("kyledaniel.lao@gmail.com", input_data, "kyledaniel.lao@gmail.com", memory, response_container)

    # Simulate some work with a sleep
    time.sleep(2)

def start_agent(input_data, memory):
    """
    Starts the agent task in a new thread based on the given input_data.
    """
    response_container = {}
    agent_thread = threading.Thread(target=agent_task, args=(input_data, memory, response_container))
    agent_thread.start()
    agent_thread.join()
    
    return response_container
    
if __name__ == "__main__":
    app.run(debug=True, port=int(os.environ.get("PORT", 5001)))