from openai import OpenAI

import os
from elasticsearchfile import es
from dotenv import load_dotenv

client = OpenAI()

def get_embedding(text):
    text = text.replace("\n", " ")
    response = client.embeddings.create(input= [text],
    model="text-embedding-3-small")
    return response.data[0].embedding

# preference_key = "exercise_preference"
# preference_value = "I enjoy running and swimming"

# embedding = get_embedding(f"{preference_key}: {preference_value}")

# doc = {
#     "preference_key": preference_key,
#     "preference_value": preference_value,
#     "embedding": embedding
# }

# es.index(index="preferences", body=doc)