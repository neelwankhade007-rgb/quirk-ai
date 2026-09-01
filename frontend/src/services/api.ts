import type { Character } from "../types/character";

const API_URL = "http://127.0.0.1:8000";

export async function fetchCharacters(): Promise<Character[]> {
  const response = await fetch(`${API_URL}/characters/`);

  if (!response.ok) {
    throw new Error(
        `Failed to fetch characters: ${response.status} ${response.statusText}`
    );
  }

  return response.json();
}

export async function createCharacter(
  character: Omit<Character, "id">
): Promise<{ id: string; message: string }> {
  const response = await fetch(`${API_URL}/characters/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(character),
  });

  if (!response.ok) {
    throw new Error("Failed to create character");
  }

  return response.json();
}