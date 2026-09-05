import os
from collections.abc import Sequence
from dotenv import load_dotenv

from groq import Groq
from groq.types.chat import ChatCompletionMessageParam

load_dotenv()

client = Groq(
    api_key=os.getenv("GROQ_API_KEY")
)


async def generate_response(messages: Sequence[ChatCompletionMessageParam]) -> str:
    response = client.chat.completions.create(
        model="openai/gpt-oss-120b",
        messages=messages,
        temperature=0.8,
    )

    content = response.choices[0].message.content
    if content is None:
        raise ValueError("LLM response did not contain message content")
    return content