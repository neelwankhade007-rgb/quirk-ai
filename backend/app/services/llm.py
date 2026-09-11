import os
from collections.abc import Sequence

from dotenv import load_dotenv
from groq import Groq
from groq.types.chat import ChatCompletionMessageParam
from openai import OpenAI

load_dotenv()

groq_client = Groq(
    api_key=os.getenv("GROQ_API_KEY")
)

xkiro_client = OpenAI(
    api_key=os.getenv("XKIRO_API_KEY"),
    base_url="https://api.xkiro.com/v1",
)


async def generate_response(
    messages: Sequence[ChatCompletionMessageParam],
    provider: str = "groq",
) -> str:

    if provider == "groq":
        response = groq_client.chat.completions.create(
            model="openai/gpt-oss-120b",
            messages=messages,
            temperature=0.8,
        )

    elif provider == "xkiro":
        response = xkiro_client.chat.completions.create(
            model="mistralai/mistral-large-2512",
            messages=messages,  # type: ignore[arg-type]
            temperature=0.8,
        )

    else:
        raise ValueError(f"Unknown LLM provider: {provider}")

    content = response.choices[0].message.content

    if content is None:
        raise ValueError("LLM response did not contain message content")

    return content