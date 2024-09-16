import getpass
import os
from uuid import uuid4

from langchain_openai import OpenAIEmbeddings
from langchain_core.documents import Document
from langchain.tools import BaseTool
from elasticsearch_serverless import Elasticsearch
from langchain_elasticsearch.vectorstores import ElasticsearchStore

openai_api_key = os.getenv("OPENAI_API_KEY")
langsmith_api_key = os.getenv("LANGSMITH_API_KEY")
embeddings = OpenAIEmbeddings(model="text-embedding-3-large")

es = Elasticsearch(
  os.getenv("ES_CLOUD_SERVER_URL"),
  api_key=os.getenv("ES_CLOUD_API_KEY"),
)
# Test your Elasticsearch connection
# info = es.info()
# print(info)  # This should print the Elasticsearch cluster information

# # Initialize the store and tool
# store_user_preference_tool = StoreUserPreferenceTool(store=store)

# # Test storing a preference
# response = store_user_preference_tool._run(
#     user_email="user@example.com",
#     preference_key="afternoon_free",
#     preference_value="I like to keep my afternoons free."
# )

# print(response)  # This should print a confirmation message
