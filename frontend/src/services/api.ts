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


export async function fetchCharacterById(id: string): Promise<Character> {
  const response = await fetch(`${API_URL}/characters/${id}`);

  if (!response.ok) {
    throw new Error("Character not found");
  }

  return response.json();
}


export async function createCharacter(
  character: Omit<Character, "id">
): Promise<{ id: string; message: string }> {
  const token = localStorage.getItem("access_token");

  const response = await fetch(`${API_URL}/characters/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(character),
  });

  if (!response.ok) {
    throw new Error("Failed to create character");
  }

  return response.json();
}


async function parseApiError(response: Response, defaultMessage: string): Promise<string> {
  try {
    const data = await response.json();
    if (data && data.detail) {
      if (typeof data.detail === "string") {
        return data.detail;
      }
      if (Array.isArray(data.detail)) {
        return data.detail
          .map((item: { msg?: string; loc?: string[] }) => item.msg || JSON.stringify(item))
          .join(", ");
      }
    }
    return defaultMessage;
  } catch {
    return defaultMessage;
  }
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

export async function registerUser(user: RegisterData) {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(user),
  });

  if (!response.ok) {
    const errorMessage = await parseApiError(response, "Registration failed");
    console.error("Register error:", response.status, errorMessage);
    throw new Error(errorMessage);
  }

  return response.json();
}

export interface LoginData {
  username: string;
  password: string;
}

export async function loginUser(user: LoginData) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(user),
  });

  if (!response.ok) {
    const errorMessage = await parseApiError(response, "Login failed");
    console.error("Login error:", response.status, errorMessage);
    throw new Error(errorMessage);
  }

  return response.json();
}

export async function createConversation(
  characterId: string
): Promise<{ id: string; message: string }> {
  const token = localStorage.getItem("access_token");

  const response = await fetch(`${API_URL}/conversations/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ character_id: characterId }),
  });

  if (!response.ok) {
    const errorMessage = await parseApiError(response, "Failed to create conversation");
    throw new Error(errorMessage);
  }

  return response.json();
}


export async function sendMessage(
  characterId: string,
  content: string
) {
  const token = localStorage.getItem("access_token");

  const response = await fetch(`${API_URL}/conversations/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      character_id: characterId,
      content,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to send message");
  }

  return response.json();
}


export async function getConversation(characterId: string) {
  const token = localStorage.getItem("access_token");

  const response = await fetch(
    `${API_URL}/conversations/character/${characterId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error("Failed to load conversation");
  }

  return response.json();
}


export async function getMessages(conversationId: string) {
  const token = localStorage.getItem("access_token");

  const response = await fetch(
    `${API_URL}/conversations/${conversationId}/messages`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to load messages");
  }

  return response.json();
}