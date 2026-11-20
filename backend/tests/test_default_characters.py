import unittest
from types import SimpleNamespace
from unittest.mock import Mock, patch

from bson import ObjectId

from app.services.default_characters import (
    DEFAULT_CHARACTERS,
    ensure_default_characters,
)


class EnsureDefaultCharactersTests(unittest.TestCase):
    def test_seeds_three_defaults_once_per_account(self) -> None:
        user_id = "507f1f77bcf86cd799439011"
        users = SimpleNamespace(
            find_one=Mock(return_value={"_id": ObjectId(user_id)}),
            update_one=Mock(),
        )
        characters = SimpleNamespace(
            create_index=Mock(),
            update_one=Mock(),
            find_one=Mock(),
        )
        with patch(
            "app.services.default_characters.db",
            SimpleNamespace(users=users, characters=characters),
        ):
            ensure_default_characters(user_id)

        self.assertEqual(len(DEFAULT_CHARACTERS), 3)
        self.assertEqual(characters.update_one.call_count, 3)
        self.assertTrue(
            all(call.kwargs["upsert"] for call in characters.update_one.call_args_list)
        )
        self.assertTrue(
            all(
                call.args[1]["$setOnInsert"]["created_by"] == user_id
                for call in characters.update_one.call_args_list
            )
        )
        users.update_one.assert_called_once_with(
            {"_id": ObjectId(user_id)},
            {"$set": {"default_characters_seeded": True}},
        )

    def test_does_not_reseed_after_user_has_initialized_defaults(self) -> None:
        user_id = "507f1f77bcf86cd799439011"
        users = SimpleNamespace(
            find_one=Mock(return_value={"default_characters_seeded": True}),
            update_one=Mock(),
        )
        characters = SimpleNamespace(
            create_index=Mock(),
            update_one=Mock(),
            find_one=Mock(),
        )
        with patch(
            "app.services.default_characters.db",
            SimpleNamespace(users=users, characters=characters),
        ):
            ensure_default_characters(user_id)

        users.update_one.assert_not_called()
        characters.create_index.assert_not_called()
        characters.update_one.assert_not_called()
