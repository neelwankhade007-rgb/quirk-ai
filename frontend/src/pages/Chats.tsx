import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchConversations } from "../services/api";
import type { ConversationSummary } from "../services/api";
import CharacterAvatar from "../components/CharacterAvatar";
import { MessageSquare, ArrowRight } from "lucide-react";

function Chats() {
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadConversations() {
      try {
        setError("");
        const data = await fetchConversations();
        if (isMounted) {
          setConversations(data);
        }
      } catch (err) {
        console.error(err);
        if (isMounted) {
          setError("Failed to load your chats");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadConversations();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Chats</h1>
          <p className="page-subtitle">Continue a conversation with your characters</p>
        </div>
      </div>

      {loading && (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p className="loading-text">Loading chats...</p>
        </div>
      )}

      {error && <div className="alert alert-error">{error}</div>}

      {!loading && !error && conversations.length === 0 && (
        <div className="empty-state">
          <MessageSquare className="empty-state-icon" />
          <p>You have not started any chats yet.</p>
          <Link
            to="/characters"
            className="btn-primary"
          >
            Browse Characters
          </Link>
        </div>
      )}

      {!loading && !error && conversations.length > 0 && (
        <div className="chats-list">
          {conversations.map(({ id, character }) => (
            <Link
              key={id}
              to={`/characters/${character.id}/chat`}
              className="chat-list-card"
            >
              <div className="chat-list-avatar">
                <CharacterAvatar name={character.name} imageUrl={character.image_url} size={40} />
              </div>
              <div className="chat-list-info">
                <h2 className="character-name">{character.name}</h2>
                {character.description && (
                  <p className="character-desc">{character.description}</p>
                )}
              </div>
              <ArrowRight className="chat-list-arrow" size={18} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default Chats;
