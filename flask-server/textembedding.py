from openai import OpenAI
from dotenv import load_dotenv

client = OpenAI()

def get_embedding(text):
    text = text.replace("\n", " ")
    response = client.embeddings.create(input= [text],
    model="text-embedding-3-small")
    return list(response.data[0].embedding)