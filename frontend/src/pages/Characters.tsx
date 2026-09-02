import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchCharacters } from "../services/api";
import type { Character } from "../types/character";
import CharacterCard from "../components/CharacterCard";

function Characters() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadCharacters() {
      try {
        setError("");
        const data = await fetchCharacters();
        if (isMounted) {
          setCharacters(data);
        }
      } catch (err) {
        console.error(err);
        if (isMounted) {
          setError("Failed to load characters from server");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadCharacters();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Characters</h1>
          <p className="card-subtitle">Explore and chat with created AI personas</p>
        </div>
        <Link
          to="/create-character"
          className="btn-primary"
          style={{ textDecoration: "none", width: "auto", padding: "0.6rem 1.2rem", marginTop: 0 }}
        >
          + Create Character
        </Link>
      </div>

      {loading && (
        <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>
          Loading characters...
        </div>
      )}

      {error && (
        <div className="alert alert-error">
          <span>⚠️</span> {error}
        </div>
      )}

      {!loading && !error && characters.length === 0 && (
        <div className="empty-state">
          <p>No characters created yet.</p>
          <Link
            to="/create-character"
            className="btn-primary"
            style={{ textDecoration: "none", display: "inline-block", width: "auto", padding: "0.65rem 1.5rem" }}
          >
            Create Your First Character
          </Link>
        </div>
      )}

      {!loading && !error && characters.length > 0 && (
        <div className="character-grid">
          {characters.map((character) => (
            <CharacterCard key={character.id} character={character} />
          ))}
        </div>
      )}
    </div>
  );
}

export default Characters;