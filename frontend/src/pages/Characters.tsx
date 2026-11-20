import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchCharacters } from "../services/api";
import type { Character } from "../types/character";
import CharacterCard from "../components/CharacterCard";
import { UserPlus, Ghost } from "lucide-react";

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
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Characters</h1>
          <p className="page-subtitle">Explore and chat with created AI personas</p>
        </div>
        <Link
          to="/create-character"
          className="btn-primary"
        >
          <UserPlus size={16} />
          Create Character
        </Link>
      </div>

      {loading && (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p className="loading-text">Loading characters...</p>
        </div>
      )}

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      {!loading && !error && characters.length === 0 && (
        <div className="empty-state">
          <Ghost className="empty-state-icon" />
          <p>No characters created yet.</p>
          <Link
            to="/create-character"
            className="btn-primary"
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