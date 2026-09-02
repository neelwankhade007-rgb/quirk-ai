import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchCharacterById } from "../services/api";
import type { Character } from "../types/character";

function CharacterProfile() {
  const { characterId } = useParams<{ characterId: string }>();

  const [character, setCharacter] = useState<Character | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!characterId) return;

    let isMounted = true;
    async function loadCharacter() {
      try {
        setError("");
        const data = await fetchCharacterById(characterId!);
        if (isMounted) {
          setCharacter(data);
        }
      } catch (err) {
        console.error(err);
        if (isMounted) {
          setError("Failed to load character");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadCharacter();

    return () => {
      isMounted = false;
    };
  }, [characterId]);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>
        Loading character...
      </div>
    );
  }

  if (error || !character) {
    return (
      <div>
        <div className="alert alert-error">{error || "Character not found"}</div>
        <Link to="/characters" className="nav-link" style={{ display: "inline-block" }}>
          &larr; Back to Characters
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "700px", margin: "0 auto" }}>
      <Link
        to="/characters"
        className="nav-link"
        style={{ display: "inline-block", marginBottom: "1.5rem" }}
      >
        &larr; Back to Characters
      </Link>

      <div className="card" style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        <div className="card-header" style={{ textAlign: "left", marginBottom: 0 }}>
          <h1 className="card-title">{character.name}</h1>
          {character.personality && (
            <span className="character-tag" style={{ marginTop: "0.5rem" }}>
              {character.personality}
            </span>
          )}
        </div>

        {character.description && (
          <div>
            <label className="form-label">Description</label>
            <p className="character-desc" style={{ marginTop: "0.25rem" }}>
              {character.description}
            </p>
          </div>
        )}


        {character.backstory && (
          <div>
            <label className="form-label">Backstory</label>
            <p className="character-desc" style={{ marginTop: "0.25rem" }}>
              {character.backstory}
            </p>
          </div>
        )}

        <button className="btn-primary" style={{ marginTop: "1rem" }}>
          Start Chat
        </button>
      </div>
    </div>
  );
}

export default CharacterProfile;
