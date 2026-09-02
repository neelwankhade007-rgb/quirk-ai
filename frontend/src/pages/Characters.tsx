import type { Character } from "../types/character";

interface CharactersProps {
  characters: Character[];
  loading: boolean;
  error: string;
}

function Characters({
  characters,
  loading,
  error,
}: CharactersProps) {
  if (loading) {
    return <p>Loading characters...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <main>
      <h1>Characters</h1>

      {characters.length === 0 ? (
        <p>No characters yet.</p>
      ) : (
        characters.map((character) => (
          <article key={character.id}>
            <h2>{character.name}</h2>
            <p>{character.description}</p>
            <p>{character.personality}</p>
          </article>
        ))
      )}
    </main>
  );
}

export default Characters;