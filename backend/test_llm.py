import asyncio

from app.services.llm import generate_response


async def main():
    messages = [
        {
            "role": "user",
            "content": "Say hello to QuirkAI in one sentence."
        }
    ]

    response = await generate_response(messages)  # type: ignore[arg-type]

    print(response)


asyncio.run(main())