import { useEffect, useState } from "react";

import CharacterForm from "./components/CharacterForm";
import Characters from "./pages/Characters";
import { fetchCharacters } from "./services/api";
import type { Character } from "./types/character";

function App() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadCharacters = async () => {
    try {
      setError("");

      const data = await fetchCharacters();

      setCharacters(data);
    } catch (error) {
      console.error(error);
      setError("Failed to load characters");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCharacters();
  }, []);

  return (
    <>
      <CharacterForm onCharacterCreated={loadCharacters} />

      <Characters
        characters={characters}
        loading={loading}
        error={error}
      />
    </>
  );
}

export default App;