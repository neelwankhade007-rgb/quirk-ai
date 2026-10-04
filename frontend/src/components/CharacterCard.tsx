import { Link } from "react-router-dom";
import type { Character } from "../types/character";
import CharacterAvatar from "./CharacterAvatar";

interface CharacterCardProps {
  character: Character;
}

function CharacterCard({ character }: CharacterCardProps) {
  return (
    <Link
      to={`/characters/${character.id}`}
      style={{ textDecoration: "none", color: "inherit", display: "block" }}
    >
      <article className="character-card">
        <div style={{ display: "flex", gap: "16px", alignItems: "flex-start", marginBottom: "12px" }}>
          <CharacterAvatar name={character.name} imageUrl={character.image_url} size={48} />
          <h2 className="character-name" style={{ marginTop: "12px" }}>{character.name}</h2>
        </div>

        {character.description && (
          <p className="character-desc">{character.description}</p>
        )}
      </article>
    </Link>
  );
}

export default CharacterCard;

