import { useEffect, useState } from "react";
import { fetchCharacters } from "../services/api";
import type { Character } from "../types/character";

function Characters() {
    const [characters, setCharacters] = useState<Character[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function loadCharacters() {
            try {
                const data = await fetchCharacters();
                setCharacters(data);
            } catch (error) {
                console.error(error);
                setError(
                    error instanceof Error
                        ? error.message
                        : "Failed to load characters"
                );
            } finally {
                setLoading(false);
            }
        }

        loadCharacters();
    }, []);

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