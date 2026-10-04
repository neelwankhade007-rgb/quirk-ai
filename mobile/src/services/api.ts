import * as SecureStore from 'expo-secure-store';
import { API_URL } from '../data/avatars';

export const getAuthToken = async () => {
  return await SecureStore.getItemAsync('access_token');
};

export const setAuthToken = async (token: string) => {
  await SecureStore.setItemAsync('access_token', token);
};

export const removeAuthToken = async () => {
  await SecureStore.deleteItemAsync('access_token');
};

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    if (response.status === 401) {
      await removeAuthToken();
      // Throw a specific error to be handled by the UI/auth context
      throw new Error('UNAUTHORIZED');
    }
    
    let errorMessage = `HTTP Error ${response.status}`;
    try {
      const errorData = await response.json();
      if (errorData && errorData.detail) {
        if (typeof errorData.detail === 'string') {
          errorMessage = errorData.detail;
        } else if (Array.isArray(errorData.detail)) {
          errorMessage = errorData.detail
            .map((item: any) => item.msg || JSON.stringify(item))
            .join(', ');
        } else {
          errorMessage = JSON.stringify(errorData.detail);
        }
      } else if (errorData && errorData.message) {
        errorMessage = errorData.message;
      }
    } catch {
      // Ignore JSON parse error
    }
    throw new Error(errorMessage);
  }
  return response.json();
};

const authenticatedFetch = async (endpoint: string, options: RequestInit = {}) => {
  const token = await getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  return handleResponse(response);
};

// ==========================================
// AUTH
// ==========================================

export const registerUser = async (data: any) => {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

export const loginUser = async (data: any) => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

export const getCurrentUser = async () => {
  return authenticatedFetch('/auth/me');
};

// ==========================================
// CHARACTERS
// ==========================================

export const fetchCharacters = async () => {
  return authenticatedFetch('/characters/');
};

export const fetchMyCharacters = async () => {
  return authenticatedFetch('/characters/me');
};

export const fetchCharacterById = async (id: string) => {
  return authenticatedFetch(`/characters/${id}`);
};

export const uploadImage = async (formData: any) => {
  const token = await getAuthToken();
  const response = await fetch(`${API_URL}/characters/upload-image`, {
    method: 'POST',
    body: formData,
    headers: {
      'Authorization': `Bearer ${token}`
      // Don't set Content-Type here, let fetch handle multipart boundary
    },
  });
  return handleResponse(response);
};

export const createCharacter = async (data: any) => {
  return authenticatedFetch('/characters/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const updateCharacter = async (id: string, data: any) => {
  return authenticatedFetch(`/characters/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

export const deleteCharacter = async (id: string) => {
  return authenticatedFetch(`/characters/${id}`, {
    method: 'DELETE',
  });
};

// ==========================================
// CONVERSATIONS
// ==========================================

export const getConversationByCharacterId = async (characterId: string) => {
  return authenticatedFetch(`/conversations/character/${characterId}`);
};

export const getMessages = async (conversationId: string) => {
  return authenticatedFetch(`/conversations/${conversationId}/messages`);
};

export const sendMessage = async (characterId: string, content: string) => {
  return authenticatedFetch('/conversations/messages', {
    method: 'POST',
    body: JSON.stringify({ character_id: characterId, content }),
  });
};
