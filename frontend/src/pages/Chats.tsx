import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchConversations } from "../services/api";
import type { ConversationSummary } from "../services/api";

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
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Chats</h1>
          <p className="card-subtitle">Continue a conversation with your characters</p>
        </div>
      </div>

      {loading && (
        <div className="empty-state">
          <p>Loading chats...</p>
        </div>
      )}

      {error && <div className="alert alert-error">{error}</div>}

      {!loading && !error && conversations.length === 0 && (
        <div className="empty-state">
          <p>You have not started any chats yet.</p>
          <Link
            to="/characters"
            className="btn-primary"
            style={{ textDecoration: "none", display: "inline-block", width: "auto", padding: "0.65rem 1.5rem" }}
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
                {character.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="character-name">{character.name}</h2>
                {character.description && (
                  <p className="character-desc">{character.description}</p>
                )}
              </div>
              <span className="chat-list-arrow">→</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default Chats;
