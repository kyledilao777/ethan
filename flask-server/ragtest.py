# test_real_data_workflow.py
import pytest
from agent import start_agent  # Adjust based on your structure
from elasticsearchfile import es  # Import your real Elasticsearch instance
from dotenv import load_dotenv
from datetime import datetime
from flask_cors import CORS
from openai import OpenAI
from unittest.mock import patch, MagicMock

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

from base_tools.calendar_tools import GetCalendarEventsTool, TimeDeltaTool, CreateCalendarEventTool, SpecificTimeTool, DeleteCalendarEventTool, UpdateCalendarEventTool, StoreUserPreferenceTool, RetrieveUserPreferenceTool, DeleteUserPreferenceTool, ModifyUserPreferenceTool, CreateContactTool, ModifyContactTool, DeleteContactTool, RetrieveContactTool
from elasticsearchfile import es
from flask import Flask, jsonify, request, send_from_directory

import spacy
import json
from openai import OpenAI

from openai import OpenAI

OPENAI_API_KEY = os.getenv("OPEN_AI_API_KEY")
OPENAI_MODEL = "gpt-4o"
llm = ChatOpenAI(temperature=0, model=OPENAI_MODEL, api_key=OPENAI_API_KEY)
persistent_memory = ConversationSummaryBufferMemory(llm=llm,memory_key="chat_history", return_messages=True, max_token_limit=2000)

@pytest.fixture(scope='session')
def setup_real_data():
    """
    Fixture to set up any initial data required for testing.
    You can use this to create any documents or setup indices in Elasticsearch before running the tests.
    """
    # Example setup: ensure indices are available and create test data if necessary
    # index_name = "contacts"
    # if not es.indices.exists(index=index_name):
    #     es.indices.create(index=index_name)

    # # Insert sample contact data if needed
    # es.index(index=index_name, id=2, body={"id": 2, "email": "kyle@example.com", "relationship": "close friend"})
    timezone = pytz.timezone("Asia/Singapore")
    
   #For CRUD and Contact Details Operation
    start_agent(
        input_data="Store winston's email as leonardwinston04@gmail.com, he's my flatmate. store mario's email as marioalvaro04@gmail.com, he's my flatmate. store sean's email as cullensean14@gmail.com, he's my flatmate. ",
        user_email="evandarren04@gmail.com",
        calendar_id="evandarren04@gmail.com",
        timezone=timezone,
        memory=persistent_memory  # Use an appropriate memory object if needed
    )
   
    #For User Preference
    start_agent(
        input_data=
        '''
        
        Store my running time at 8 AM every tuesday and wednesday, 
        my working hours is from 9 AM - 6PM, 
        my wake up time is at 8 AM, and my sleep time is at 11 PM
        
        ''',
        user_email="evandarren04@gmail.com",
        calendar_id="evandarren04@gmail.com",
        timezone=timezone,
        memory=persistent_memory  # Use an appropriate memory object if needed
    )
    yield

#Test contact email
def test_contact_info(setup_real_data):
    """
    Test the full workflow using real Elasticsearch data without mocking.
    """

    timezone = pytz.timezone("Asia/Singapore")
    # Act: Run the agent with a real data prompt
    response = start_agent(
        input_data="What's winston's email?",
        user_email="evandarren04@gmail.com",
        calendar_id="evandarren04@gmail.com",
        timezone=timezone,
        memory=persistent_memory  # Use an appropriate memory object if needed
    )

    print(response, "this is response")

    # Assert: Check the response to ensure correct scheduling behavior
    validate = False
    
    if "leonardwinston04@gmail.com" in response['response']:
        validate = True
    
    assert validate
    # Additional checks: Verify data in Elasticsearch if necessary

def test_contact_info(setup_real_data):
    """
    Test the full workflow using real Elasticsearch data without mocking.
    """

    timezone = pytz.timezone("Asia/Singapore")
    # Act: Run the agent with a real data prompt
    response = start_agent(
        input_data="Who are my flatmates?",
        user_email="evandarren04@gmail.com",
        calendar_id="evandarren04@gmail.com",
        timezone=timezone,
        memory=persistent_memory  # Use an appropriate memory object if needed
    )

    print(response, "this is response")

    # Assert: Check the response to ensure correct scheduling behavior
    validate = False
    
    if "Winston" in response['response'] and "Mario" in response['response'] and "Sean" in response['response']:
        validate = True
    
    assert validate
    # Additional checks: Verify data in Elasticsearch if necessary

#Test contact details
def test_contact_details(setup_real_data):
    """
    Test the full workflow using real Elasticsearch data without mocking.
    """

    timezone = pytz.timezone("Asia/Singapore")
    # Act: Run the agent with a real data prompt
    response = start_agent(
        input_data="Who's winston?",
        user_email="evandarren04@gmail.com",
        calendar_id="evandarren04@gmail.com",
        timezone=timezone,
        memory=persistent_memory  # Use an appropriate memory object if needed
    )

    print(response, "this is response")

    # Assert: Check the response to ensure correct scheduling behavior
    validate = False
    
    if "flatmate" in response['response']:
        validate = True
    
    assert validate
    # Additional checks: Verify data in Elasticsearch if necessary

#Test different timezones
def test_different_timezone(setup_real_data):
    """
    Test the full workflow using real Elasticsearch data without mocking.
    """

    timezone = pytz.timezone("Asia/Singapore")
    # Act: Run the agent with a real data prompt
    response = start_agent(
        input_data="schedule me a meeting today called meeting with regional director at 8 pm but in germany time, no need to reconfirm just schedule the event specified directly",
        user_email="evandarren04@gmail.com",
        calendar_id="evandarren04@gmail.com",
        timezone=timezone,
        memory=persistent_memory  # Use an appropriate memory object if needed
    )

    print(response, "this is response")

    # Assert: Check the response to ensure correct scheduling behavior
    validate = False
    
    if "has been scheduled" in response['response'] or "scheduled" in response['response'] or "has been scheduled" in response['response'] or "I've scheduled" in response['response'] or "Germany time" in response['response'] or "Germany Time" in response['response'] or "germany time" in response['response']:
        validate = True
    
    assert validate
    # Additional checks: Verify data in Elasticsearch if necessary

#test user preference
def test_user_preference(setup_real_data):
    """
    Test the full workflow using real Elasticsearch data without mocking.
    """

    timezone = pytz.timezone("Asia/Singapore")
    # Act: Run the agent with a real data prompt
    response = start_agent(
        input_data="what's my typical running time, working hour, do not disturb hours, wake up, and sleep time schedule?",
        user_email="evandarren04@gmail.com",
        calendar_id="evandarren04@gmail.com",
        timezone=timezone,
        memory=persistent_memory  # Use an appropriate memory object if needed
    )

    print(response, "this is response")

    # Assert: Check the response to ensure correct scheduling behavior
    validate = False
    regex = r"(Running Time|Working Hours|Do Not Disturb Hours|Wake Up Time):\s*([0-9]{1,2} ?[APMapm]{2})"
    print(re.search(regex, response['response']))
    
    if "Here's your" in response['response'] or re.search(regex, response['response']):
        validate = True
    assert validate
    # Additional checks: Verify data in Elasticsearch if necessary

def test_many_users(setup_real_data):
    """
    Test the full workflow using real Elasticsearch data without mocking.
    """

    timezone = pytz.timezone("Asia/Singapore")
    # Act: Run the agent with a real data prompt
    response = start_agent(
        input_data="Create a meeting with winston, kyle, sean, and mario tomorrow at 8 PM titled “catchup meeting with fellows”, invite them as attendees",
        user_email="evandarren04@gmail.com",
        calendar_id="evandarren04@gmail.com",
        timezone=timezone,
        memory=persistent_memory  # Use an appropriate memory object if needed
    )

    print(response, "this is response")

    # Assert: Check the response to ensure correct scheduling behavior
    validate = False
    
    if "catchup meeting with fellows" in response['response'] or "Winston" in response['response'] or "Kyle" in response['response'] or "Mario" in response['response'] or "Sean" in response['response']:
        validate = True
    assert validate
    # Additional checks: Verify data in Elasticsearch if necessary

#test different timezone 
def test_different_timezone_silicon_valley(setup_real_data):
    """
    Test the full workflow using real Elasticsearch data without mocking.
    """

    timezone = pytz.timezone("Asia/Singapore")
    # Act: Run the agent with a real data prompt
    response = start_agent(
        input_data="schedule me a meeting with kyle at 4 PM singapore time today, he's in silicon valley",
        user_email="evandarren04@gmail.com",
        calendar_id="evandarren04@gmail.com",
        timezone=timezone,
        memory=persistent_memory  # Use an appropriate memory object if needed
    )

    print(response, "this is response")

    # Assert: Check the response to ensure correct scheduling behavior
    validate = False
    
    if "has been scheduled" in response['response'] or "scheduled" in response['response'] or "has been scheduled" in response['response'] or "I've scheduled" in response['response'] or "Silicon Valley Time" in response['response'] or "Silicon Valley time" in response['response'] or "silicon valley time" in response['response']:
        validate = True
    
    assert validate
    # Additional checks: Verify data in Elasticsearch if necessary

#Create Operation
def test_full_workflow_with_real_data(setup_real_data):
    """
    Test the full workflow using real Elasticsearch data without mocking.
    """

    timezone = pytz.timezone("Asia/Singapore")
    # Act: Run the agent with a real data prompt
    response = start_agent(
        input_data="schedule me a dinner with winston at 6 - 7 pm today, no need to reconfirm just schedule the event specified directly",
        user_email="evandarren04@gmail.com",
        calendar_id="evandarren04@gmail.com",
        timezone=timezone,
        memory=persistent_memory  # Use an appropriate memory object if needed
    )

    print(response, "this is response")

    # Assert: Check the response to ensure correct scheduling behavior
    validate = False
    
    if "has been scheduled" in response['response'] or "scheduled" in response['response'] or "has been scheduled" in response['response'] or "I've scheduled" in response['response'] or "winston" in response['response']:
        validate = True
    
    assert validate
    # Additional checks: Verify data in Elasticsearch if necessary

#Update Operation
def test_update_event(setup_real_data):
    """
    Test the full workflow using real Elasticsearch data without mocking.
    """

    timezone = pytz.timezone("Asia/Singapore")
    # Act: Run the agent with a real data prompt
    response = start_agent(
        input_data="change dinner with winston to 7 - 8 pm today",
        user_email="evandarren04@gmail.com",
        calendar_id="evandarren04@gmail.com",
        timezone=timezone,
        memory=persistent_memory  # Use an appropriate memory object if needed
    )

    print(response, "this is response")

    # Assert: Check the response to ensure correct scheduling behavior
    validate = False
    
    if "rescheduled" in response['response'] or "changed" in response['response']:
        validate = True
    
    assert validate
    # Additional checks: Verify data in Elasticsearch if necessary

#Retrieve Operation
def test_retrieve_event(setup_real_data):
    """
    Test the full workflow using real Elasticsearch data without mocking.
    """

    timezone = pytz.timezone("Asia/Singapore")
    # Act: Run the agent with a real data prompt
    response = start_agent(
        input_data="What's on my day today",
        user_email="evandarren04@gmail.com",
        calendar_id="evandarren04@gmail.com",
        timezone=timezone,
        memory=persistent_memory  # Use an appropriate memory object if needed
    )

    print(response, "this is response")

    # Assert: Check the response to ensure correct scheduling behavior
    validate = False
    if "your schedule for today" in response['response']:
        validate = True
    
    assert validate
    # Additional checks: Verify data in Elasticsearch if necessary

#Delete Operation
def test_delete_event(setup_real_data):
    """
    Test the full workflow using real Elasticsearch data without mocking.
    """

    timezone = pytz.timezone("Asia/Singapore")
    # Act: Run the agent with a real data prompt
    response = start_agent(
        input_data="delete dinner with winston today",
        user_email="evandarren04@gmail.com",
        calendar_id="evandarren04@gmail.com",
        timezone=timezone,
        memory=persistent_memory  # Use an appropriate memory object if needed
    )

    print(response, "this is response")

    # Assert: Check the response to ensure correct scheduling behavior
    validate = False
    if "deleted" in response['response'] or "winston" in response['response']:
        validate = True
    
    assert validate
    # Additional checks: Verify data in Elasticsearch if necessary