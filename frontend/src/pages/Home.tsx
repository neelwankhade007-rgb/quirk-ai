import { Link } from "react-router-dom";

function Home() {
  const token = localStorage.getItem("access_token");

  return (
    <div className="home-container">
      <div className="home-hero">
        <div className="home-badge">✨ AI-Powered Persona Sandbox</div>
        <h1 className="home-title">
          Create, Customize & Chat with <span className="text-gradient">AI Characters</span>
        </h1>
        <p className="home-subtitle">
          Build unique AI personalities with custom quirks, tones, and backstories. Bring your imagination to life with QuirkAI.
        </p>

        <div className="home-actions">
          {token ? (
            <Link to="/characters" className="btn-primary home-btn">
              Go to Characters →
            </Link>
          ) : (
            <>
              <Link to="/login" className="btn-primary home-btn">
                Sign In
              </Link>
              <Link to="/register" className="btn-secondary home-btn">
                Create Account
              </Link>
            </>
          )}
        </div>
      </div>

      <div className="home-features">
        <div className="feature-card">
          <div className="feature-icon">🎭</div>
          <h3>Unique Personas</h3>
          <p>Design characters with specific quirks, archetypes, and tone adjustments.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">⚡</div>
          <h3>Instant Creation</h3>
          <p>Easily define prompt parameters and jump straight into conversations.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">🔒</div>
          <h3>Secure & Personal</h3>
          <p>Your characters and prompts are safely stored and tied to your account.</p>
        </div>
      </div>
    </div>
  );
}

export default Home;
