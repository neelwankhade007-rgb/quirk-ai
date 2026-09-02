import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";

import {
  fetchCharacterById,
  sendMessage,
  getConversation,
  getMessages,
  createConversation,
} from "../services/api";

import type { Character } from "../types/character";

interface Message {
  id: string;
  sender: "character" | "user";
  text: string;
  timestamp?: string;
}

function Chat() {
  const { characterId } = useParams<{ characterId: string }>();

  const [character, setCharacter] = useState<Character | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load character and conversation history
  useEffect(() => {
    if (!characterId) return;

    let isMounted = true;

    async function loadChat() {
      try {
        setLoading(true);

        // Load character
        const characterData = await fetchCharacterById(characterId);

        if (!isMounted) return;

        setCharacter(characterData);

        // Check whether conversation already exists, or create one to initialize greeting in DB
        let conversation = await getConversation(characterId);
        if (!conversation) {
          try {
            await createConversation(characterId);
            conversation = await getConversation(characterId);
          } catch (e) {
            console.warn("Could not auto-create conversation:", e);
          }
        }

        if (!isMounted) return;

        if (conversation) {
          // Conversation exists → load saved messages (which contains greeting + any user messages)
          const history = await getMessages(conversation.id);

          if (!isMounted) return;

          const formattedMessages: Message[] = history.map(
            (message: {
              id: string;
              sender: "user" | "character";
              content: string;
              created_at?: string;
            }) => ({
              id: message.id,
              sender: message.sender,
              text: message.content,
              timestamp: message.created_at,
            }),
          );

          setMessages(formattedMessages);
        } else {
          // Fallback if not logged in or backend conversation creation fails
          if (characterData.greeting) {
            setMessages([
              {
                id: "greeting",
                sender: "character",
                text: characterData.greeting,
              },
            ]);
          } else {
            setMessages([]);
          }
        }
      } catch (error) {
        console.error("Failed to load chat:", error);

        if (isMounted) {
          setMessages([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadChat();

    return () => {
      isMounted = false;
    };
  }, [characterId]);

  // Scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmed = inputValue.trim();

    if (!trimmed || sending || !characterId) {
      return;
    }

    // Immediately show user's message
    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: trimmed,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setSending(true);

    try {
      // Backend creates the conversation if this is the first message
      const data = await sendMessage(characterId, trimmed);

      console.log("Message sent:", data);
    } catch (error) {
      console.error("Failed to send message:", error);

      // Remove optimistic message if sending failed
      setMessages((prev) =>
        prev.filter((message) => message.id !== userMsg.id),
      );

      setInputValue(trimmed);

      alert("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const characterName = character?.name || "Aria";

  if (loading) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "3rem",
          color: "var(--text-muted)",
        }}
      >
        Loading chat...
      </div>
    );
  }

  return (
    <div className="chat-container">
      {/* Top Header */}
      <header className="chat-header">
        <div className="chat-header-left">
          <Link
            to={character ? `/characters/${character.id}` : "/characters"}
            className="chat-back-btn"
            title="Back"
          >
            ← {characterName}
          </Link>
        </div>

        <div className="chat-header-actions">
          <button
            type="button"
            className="chat-menu-btn"
            title="Options"
            aria-label="More options"
          >
            ⋮
          </button>
        </div>
      </header>

      {/* Messages */}
      <div className="chat-messages-area">
        {/* Character Intro */}
        <div className="chat-intro-card">
          <div className="chat-intro-avatar">
            {characterName.charAt(0).toUpperCase()}
          </div>

          <h2 className="chat-intro-name">{characterName}</h2>

          {character?.personality && (
            <span className="chat-intro-personality">
              {character.personality}
            </span>
          )}

          {character?.description && (
            <p className="chat-intro-greeting">"{character.description}"</p>
          )}
        </div>

        {/* Message List */}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`chat-message-row ${
              msg.sender === "user" ? "user" : "character"
            }`}
          >
            <div
              className={`chat-bubble ${
                msg.sender === "user" ? "user" : "character"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="chat-input-bar">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Type a message..."
          autoFocus
          disabled={sending}
        />

        <button
          type="submit"
          className="chat-send-btn"
          disabled={!inputValue.trim() || sending}
        >
          {sending ? "Sending..." : "Send"}
        </button>
      </form>
    </div>
  );
}

export default Chat;
