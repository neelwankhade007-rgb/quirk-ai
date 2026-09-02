import type { Character } from "../types/character";

interface CharacterCardProps {
  character: Character;
}

function CharacterCard({ character }: CharacterCardProps) {
  return (
    <article className="character-card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <h2 className="character-name">{character.name}</h2>
      </div>

      {character.personality && (
        <span className="character-tag">{character.personality}</span>
      )}

      {character.description && (
        <p className="character-desc">{character.description}</p>
      )}

      {character.greeting && (
        <p className="character-greeting">"{character.greeting}"</p>
      )}
    </article>
  );
}

export default CharacterCard;
