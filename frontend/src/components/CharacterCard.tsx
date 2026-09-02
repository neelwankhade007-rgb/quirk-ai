import { Link } from "react-router-dom";
import type { Character } from "../types/character";

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
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <h2 className="character-name">{character.name}</h2>
        </div>

        {character.description && (
          <p className="character-desc">{character.description}</p>
        )}
      </article>
    </Link>
  );
}

export default CharacterCard;

