import logging
import os
from collections.abc import Sequence

from dotenv import load_dotenv
from groq import Groq
from groq.types.chat import ChatCompletionMessageParam
from openai import OpenAI

load_dotenv()

logger = logging.getLogger(__name__)

groq_api_key = os.getenv("GROQ_API_KEY")
groq_client = Groq(api_key=groq_api_key) if groq_api_key else None

xkiro_api_key = os.getenv("XKIRO_API_KEY")
xkiro_client = (
    OpenAI(
        api_key=xkiro_api_key,
        base_url="https://api.xkiro.com/v1",
    )
    if xkiro_api_key
    else None
)


async def generate_response(
    messages: Sequence[ChatCompletionMessageParam],
) -> str:
    if xkiro_client is not None:
        try:
            response = xkiro_client.chat.completions.create(
                model="mistralai/mistral-large-2512",
                messages=messages,  # type: ignore[arg-type]
                temperature=0.8,
            )
            content = response.choices[0].message.content
            if content:
                return content
            raise ValueError("Mistral response did not contain message content")
        except Exception as error:
            logger.warning(
                "Mistral request failed (%s); trying Groq.",
                type(error).__name__,
            )
    else:
        logger.warning("Mistral is not configured; trying Groq.")

    if groq_client is not None:
        try:
            response = groq_client.chat.completions.create(
                model="openai/gpt-oss-120b",
                messages=messages,
                temperature=0.8,
            )
            content = response.choices[0].message.content
            if content:
                return content
            raise ValueError("Groq response did not contain message content")
        except Exception as error:
            logger.error(
                "Groq request failed (%s); returning the local fallback.",
                type(error).__name__,
            )
    else:
        logger.error("Groq is not configured; returning the local fallback.")

    return "Something went wrong, please try again."