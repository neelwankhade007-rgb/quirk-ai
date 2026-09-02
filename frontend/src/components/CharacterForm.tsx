import { useState } from "react";

import { createCharacter } from "../services/api";

interface CharacterFormProps {
    onCharacterCreated: () => void;
}

function CharacterForm({ onCharacterCreated }: CharacterFormProps) {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [personality, setPersonality] = useState("");
    const [greeting, setGreeting] = useState("");
    const [backstory, setBackstory] = useState("");

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        try {
            await createCharacter({
                name,
                description,
                personality,
                greeting,
                backstory,
            });

            onCharacterCreated();

            alert("Character created!");

            setName("");
            setDescription("");
            setPersonality("");
            setGreeting("");
            setBackstory("");
        } catch (error) {
            console.error(error);
            alert("Failed to create character");
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2>Create Character</h2>

            <input
                type="text"
                placeholder="Name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
            />

            <input
                type="text"
                placeholder="Description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                required
            />

            <textarea
                placeholder="Personality"
                value={personality}
                onChange={(event) => setPersonality(event.target.value)}
                required
            />

            <input
                type="text"
                placeholder="Greeting"
                value={greeting}
                onChange={(event) => setGreeting(event.target.value)}
                required
            />

            <textarea
                placeholder="Backstory"
                value={backstory}
                onChange={(event) => setBackstory(event.target.value)}
            />

            <button type="submit">Create Character</button>
        </form>
    );
}

export default CharacterForm;