import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import CharacterForm from "../components/CharacterForm";
import { fetchCharacterById } from "../services/api";
import type { Character } from "../types/character";

function EditCharacter() {
  const { characterId } = useParams<{ characterId: string }>();
  const [character, setCharacter] = useState<Character | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!characterId) return;

    let isMounted = true;
    async function loadCharacter() {
      try {
        setLoading(true);
        const data = await fetchCharacterById(characterId!);
        if (isMounted) {
          setCharacter(data);
        }
      } catch (err) {
        console.error(err);
        if (isMounted) {
          setError("Failed to load character.");
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
    return <div style={{ textAlign: "center", padding: "2rem" }}>Loading character data...</div>;
  }

  if (error || !character) {
    return (
      <div style={{ textAlign: "center", padding: "2rem" }}>
        <div className="alert alert-error">{error || "Character not found"}</div>
        <button className="btn-secondary" onClick={() => navigate("/characters")}>Go Back</button>
      </div>
    );
  }

  return (
    <div>
      <CharacterForm initialData={character} />
    </div>
  );
}

export default EditCharacter;
