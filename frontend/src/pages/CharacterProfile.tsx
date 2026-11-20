import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchCharacterById } from "../services/api";
import type { Character } from "../types/character";
import CharacterAvatar from "../components/CharacterAvatar";
import { MessageSquare, Settings, ArrowLeft } from "lucide-react";

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
      <div className="loading-state">
        <div className="loading-spinner"></div>
        <p className="loading-text">Loading character profile...</p>
      </div>
    );
  }

  if (error || !character) {
    return (
      <div className="profile-page fade-in">
        <div className="alert alert-error">{error || "Character not found"}</div>
        <Link to="/characters" className="profile-back">
          <ArrowLeft size={16} /> Back to Characters
        </Link>
      </div>
    );
  }

  return (
    <div className="profile-page fade-in">
      <Link to="/characters" className="profile-back">
        <ArrowLeft size={16} /> Back to Characters
      </Link>

      <div className="profile-hero">
        <div className="profile-avatar-wrapper">
          <CharacterAvatar 
            name={character.name} 
            imageUrl={character.image_url} 
            size={120} 
          />
        </div>
        
        <div className="profile-info">
          <h1 className="profile-name">{character.name}</h1>
          
          {character.personality && (
            <div style={{ marginBottom: "1.5rem" }}>
              <span className="character-tag">
                {character.personality}
              </span>
            </div>
          )}

          {character.description && (
            <div className="profile-section">
              <div className="profile-section-label">Identity</div>
              <p className="profile-section-text">{character.description}</p>
            </div>
          )}

          {character.backstory && (
            <div className="profile-section">
              <div className="profile-section-label">Backstory</div>
              <p className="profile-section-text">{character.backstory}</p>
            </div>
          )}

          {character.greeting && (
            <div className="profile-section">
              <div className="profile-section-label">Greeting</div>
              <p className="profile-section-text" style={{ fontStyle: "italic" }}>
                "{character.greeting}"
              </p>
            </div>
          )}
          
          <div className="profile-actions">
            <Link
              to={`/characters/${character.id}/chat`}
              className="btn-primary"
            >
              <MessageSquare size={18} />
              Start Chat
            </Link>
            
            <Link
              to={`/characters/${character.id}/edit`}
              className="btn-secondary"
            >
              <Settings size={18} />
              Edit Character
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CharacterProfile;
