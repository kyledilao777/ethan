import os
from datetime import datetime
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

import threading
import time

OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")
OPENAI_MODEL = "gpt-3.5-turbo-0613"

asia_singapore_timezone = pytz.timezone("Asia/Singapore")

llm = ChatOpenAI(temperature=0, model=OPENAI_MODEL, api_key=OPENAI_API_KEY)
persistent_memory = ConversationSummaryBufferMemory(llm=llm,memory_key="chat_history", return_messages=True, max_token_limit=500)

def run_agent_executor(user_email: str, user_input: str, calendar_id: str, memory):
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

    return result.get("output")

### running the agent ###
def agent_task(input_data, memory):
    """
    This is where the agent's work based on the user input is executed.
    Replace the print statement with the actual work of your agent.
    """
    print(memory.to_json())

    run_agent_executor("kyledaniel.lao@gmail.com", input_data, "kyledaniel.lao@gmail.com", memory)

    # Simulate some work with a sleep
    time.sleep(2)

def start_agent(input_data, memory):
    """
    Starts the agent task in a new thread based on the given input_data.
    """
    agent_thread = threading.Thread(target=agent_task, args=(input_data, memory))
    agent_thread.start()
    # Wait for the task to complete before returning control to the main loop
    agent_thread.join()

### Main interaction loop ###
while True:
    user_input = input("")
    
    if user_input.lower() == "exit":
        print("Exiting...")
        break
    elif user_input:  # If there's any input other than 'exit', start the agent with that input
        start_agent(user_input, persistent_memory)
    else:
        print("No input detected, please provide input for the agent.")