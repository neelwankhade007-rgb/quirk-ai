import asyncio
from types import SimpleNamespace
import unittest
from unittest.mock import patch

from app.services.llm import generate_response


def completion(content: str) -> SimpleNamespace:
    return SimpleNamespace(
        choices=[SimpleNamespace(message=SimpleNamespace(content=content))]
    )


class GenerateResponseTests(unittest.TestCase):
    def test_uses_mistral_before_groq(self) -> None:
        with (
            patch("app.services.llm.xkiro_client") as xkiro,
            patch("app.services.llm.groq_client") as groq,
        ):
            xkiro.chat.completions.create.return_value = completion("Mistral reply")

            response = asyncio.run(
                generate_response([{"role": "user", "content": "Hello"}])  # type: ignore[arg-type]
            )

        self.assertEqual(response, "Mistral reply")
        xkiro.chat.completions.create.assert_called_once()
        groq.chat.completions.create.assert_not_called()

    def test_falls_back_to_groq_when_mistral_fails(self) -> None:
        with (
            patch("app.services.llm.xkiro_client") as xkiro,
            patch("app.services.llm.groq_client") as groq,
        ):
            xkiro.chat.completions.create.side_effect = RuntimeError("unavailable")
            groq.chat.completions.create.return_value = completion("Groq reply")

            response = asyncio.run(
                generate_response([{"role": "user", "content": "Hello"}])  # type: ignore[arg-type]
            )

        self.assertEqual(response, "Groq reply")
        xkiro.chat.completions.create.assert_called_once()
        groq.chat.completions.create.assert_called_once()

    def test_returns_local_message_when_both_providers_fail(self) -> None:
        with (
            patch("app.services.llm.xkiro_client") as xkiro,
            patch("app.services.llm.groq_client") as groq,
        ):
            xkiro.chat.completions.create.side_effect = RuntimeError("unavailable")
            groq.chat.completions.create.side_effect = RuntimeError("unavailable")

            response = asyncio.run(
                generate_response([{"role": "user", "content": "Hello"}])  # type: ignore[arg-type]
            )

        self.assertEqual(response, "Something went wrong, please try again.")
