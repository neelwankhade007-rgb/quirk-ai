import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createCharacter } from "../services/api";

interface CharacterFormProps {
  onCharacterCreated?: () => void;
}

function CharacterForm({ onCharacterCreated }: CharacterFormProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [personality, setPersonality] = useState("");
  const [greeting, setGreeting] = useState("");
  const [backstory, setBackstory] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    try {
      await createCharacter({
        name,
        description,
        personality,
        greeting,
        backstory,
      });

      setSuccess(true);
      if (onCharacterCreated) {
        onCharacterCreated();
      }

      setName("");
      setDescription("");
      setPersonality("");
      setGreeting("");
      setBackstory("");

      setTimeout(() => {
        navigate("/characters");
      }, 1000);
    } catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : "Failed to create character";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto" }}>
      <div className="card">
        <div className="card-header" style={{ textAlign: "left", marginBottom: "1.5rem" }}>
          <h1 className="card-title">Create AI Character</h1>
          <p className="card-subtitle">Define the persona, style, and greeting of your character</p>
        </div>

        {error && (
          <div className="alert alert-error">
            <span>⚠️</span> {error}
          </div>
        )}

        {success && (
          <div className="alert alert-success">
            <span>✓</span> Character created successfully! Redirecting...
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Name</label>
            <input
              type="text"
              placeholder="e.g. Athena the Wise"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Short Description</label>
            <input
              type="text"
              placeholder="e.g. A quick-witted ancient scholar"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Personality & Traits</label>
            <textarea
              placeholder="e.g. Calm, analytical, sarcastic when provoked..."
              value={personality}
              onChange={(event) => setPersonality(event.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">First Greeting Message</label>
            <input
              type="text"
              placeholder="e.g. Greetings traveler. What knowledge do you seek?"
              value={greeting}
              onChange={(event) => setGreeting(event.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Backstory (Optional)</label>
            <textarea
              placeholder="Background story, lore, or special rules for this persona..."
              value={backstory}
              onChange={(event) => setBackstory(event.target.value)}
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Creating Character..." : "Create Character"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CharacterForm;