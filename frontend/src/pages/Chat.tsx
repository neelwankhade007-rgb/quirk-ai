import React, { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import {
  fetchCharacterById,
  sendMessage,
  getConversation,
  getMessages,
} from "../services/api";
import MessageContent from "../components/MessageContext";
import CharacterAvatar from "../components/CharacterAvatar";
import type { Character } from "../types/character";
import { ArrowLeft, MoreVertical, Sparkles, Send } from "lucide-react";

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

  useEffect(() => {
    if (!characterId) return;

    const id = characterId;
    let isMounted = true;

    async function loadChat() {
      try {
        setLoading(true);

        const characterData = await fetchCharacterById(id);
        if (!isMounted) return;
        setCharacter(characterData);

        const conversation = await getConversation(id);
        if (!isMounted) return;

        if (conversation) {
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
        if (isMounted) setMessages([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadChat();

    return () => {
      isMounted = false;
    };
  }, [characterId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, sending]);

  const handleActionFormat = () => {
    const input = inputRef.current;
    if (!(input instanceof HTMLTextAreaElement)) return;

    const start = input.selectionStart ?? inputValue.length;
    const end = input.selectionEnd ?? inputValue.length;

    const newValue = inputValue.slice(0, start) + "****" + inputValue.slice(end);
    setInputValue(newValue);

    requestAnimationFrame(() => {
      input.focus();
      input.setSelectionRange(start + 2, start + 2);
    });
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    // Auto-grow logic
    e.target.style.height = "auto";
    e.target.style.height = `${Math.min(e.target.scrollHeight, 160)}px`;
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmed = inputValue.trim();
    if (!trimmed || sending || !characterId) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: trimmed,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    
    // Reset textarea height
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
    }
    
    setSending(true);

    try {
      const data = await sendMessage(characterId, trimmed);

      const characterMsg: Message = {
        id: data.ai_message_id,
        sender: "character",
        text: data.ai_response,
      };

      setMessages((prev) => [...prev, characterMsg]);
    } catch (error) {
      console.error("Failed to send message:", error);
      setMessages((prev) => prev.filter((message) => message.id !== userMsg.id));
      setInputValue(trimmed);
      alert("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const characterName = character?.name || "Loading...";

  if (loading) {
    return (
      <div className="chat-page">
        <div className="loading-state" style={{ height: "100vh" }}>
          <div className="loading-spinner"></div>
          <p className="loading-text">Loading chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-page fade-in">
      <div className="chat-container">
        {/* Top Header */}
        <header className="chat-header">
          <div className="chat-header-left">
            <Link
              to={character ? `/characters/${character.id}` : "/characters"}
              className="chat-back-btn"
              title="Back"
            >
              <ArrowLeft size={18} style={{ marginRight: 8 }} />
              <div className="chat-header-character">
                <CharacterAvatar name={characterName} imageUrl={character?.image_url} size={28} />
                <span className="chat-header-name">{characterName}</span>
              </div>
            </Link>
          </div>

          <div className="chat-header-actions">
            <button
              type="button"
              className="chat-menu-btn"
              title="Options"
              aria-label="More options"
            >
              <MoreVertical size={20} />
            </button>
          </div>
        </header>

        {/* Messages */}
        <div className="chat-messages-area">
          {/* Character Intro */}
          <div className="chat-intro-card">
            <div className="chat-intro-avatar" style={{ marginBottom: "16px" }}>
              <CharacterAvatar name={characterName} imageUrl={character?.image_url} size={80} />
            </div>

            <h2 className="chat-intro-name">{characterName}</h2>

            {character?.personality && (
              <div style={{ marginTop: "8px" }}>
                <span className="character-tag">
                  {character.personality}
                </span>
              </div>
            )}

            {character?.description && (
              <p className="chat-intro-greeting">
                {character.description}
              </p>
            )}
          </div>

          {/* Message List */}
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`chat-message-row ${msg.sender === "user" ? "user" : "character"}`}
            >
              <div className={`chat-bubble ${msg.sender === "user" ? "user" : "character"}`}>
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
              onChange={handleTextareaChange}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  if (!sending && inputValue.trim()) {
                    e.currentTarget.form?.requestSubmit();
                  }
                }
              }}
              placeholder={`Message ${characterName}...`}
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
                <Sparkles size={16} />
              </button>

              <button
                type="submit"
                className="chat-send-btn"
                disabled={!inputValue.trim() || sending}
              >
                {sending ? "..." : <Send size={14} style={{ marginLeft: 2 }} />}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Chat;