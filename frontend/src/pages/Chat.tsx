import React, { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import {
  fetchCharacterById,
  sendMessage,
  getConversation,
  getMessages,
} from "../services/api";
import MessageContent from "../components/MessageContext";
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
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Load character and conversation history
  useEffect(() => {
    if (!characterId) return;

    const id = characterId;
    let isMounted = true;

    async function loadChat() {
      try {
        setLoading(true);

        // Load character
        const characterData = await fetchCharacterById(id);

        if (!isMounted) return;

        setCharacter(characterData);

        // Check whether conversation already exists
        const conversation = await getConversation(id);

        if (!isMounted) return;

        if (conversation) {
          // Conversation exists → load saved messages
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
          // No conversation yet → only show greeting locally
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

  // Scroll to latest message or typing indicator
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, sending]);

  // Add action formatting
  const handleActionFormat = () => {
    const input = inputRef.current;

    if (!(input instanceof HTMLTextAreaElement)) return;

    const start = input.selectionStart ?? inputValue.length;
    const end = input.selectionEnd ?? inputValue.length;

    const newValue =
      inputValue.slice(0, start) +
      "****" +
      inputValue.slice(end);

    setInputValue(newValue);

    requestAnimationFrame(() => {
      input.focus();
      input.setSelectionRange(start + 2, start + 2);
    });
  };

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

      const characterMsg: Message = {
        id: data.ai_message_id,
        sender: "character",
        text: data.ai_response,
      };

      setMessages((prev) => [...prev, characterMsg]);
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
      <div className="chat-page">
        <div
          style={{
            textAlign: "center",
            padding: "3rem",
            color: "var(--text-muted)",
          }}
        >
          Loading chat...
        </div>
      </div>
    );
  }

  return (
    <div className="chat-page">
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
            <p className="chat-intro-greeting">
              "{character.description}"
            </p>
          )}
        </div>

        {/* Message List */}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`chat-message-row ${msg.sender === "user" ? "user" : "character"
              }`}
          >
            <div
              className={`chat-bubble ${msg.sender === "user" ? "user" : "character"
                }`}
            >
              <MessageContent text={msg.text} />
            </div>
          </div>
        ))}

        {/* Typing Indicator */}
        {sending && (
          <div className="chat-message-row character">
            <div className="chat-bubble character chat-typing-indicator">
              <div className="chat-typing-label">
                {characterName} is typing...
              </div>

              <div className="chat-typing-dots">
                <span className="chat-typing-dot" />
                <span className="chat-typing-dot" />
                <span className="chat-typing-dot" />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="chat-input-bar">
        <div className="chat-composer">
          <textarea
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();

                if (!sending && inputValue.trim()) {
                  e.currentTarget.form?.requestSubmit();
                }
              }
            }}
            placeholder="Type a message..."
            autoFocus
            disabled={sending}
            rows={1}
          />

          <div className="chat-composer-actions">
            <button
              type="button"
              className="chat-format-btn"
              onClick={handleActionFormat}
              disabled={sending}
              title="Add action formatting"
            >
              **
            </button>

            <button
              type="submit"
              className="chat-send-btn"
              disabled={!inputValue.trim() || sending}
            >
              {sending ? "..." : "→"}
            </button>
          </div>
        </div>
      </form>
    </div>
    </div>
  );
}

export default Chat;