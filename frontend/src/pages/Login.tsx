import { useState } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { loginUser } from "../services/api";
import { LogIn } from "lucide-react";
import { ACCESS_TOKEN_KEY } from "../utils/auth";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionExpired = searchParams.get("session") === "expired";

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data = await loginUser({
        username,
        password,
      });

      localStorage.setItem(ACCESS_TOKEN_KEY, data.access_token);
      navigate("/characters");

      setUsername("");
      setPassword("");
    } catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : "Login failed";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper fade-in">
      <div className="auth-card">
        <div className="card-header">
          <h1 className="card-title">Welcome back</h1>
          <p className="card-subtitle">Log in to manage your AI characters</p>
        </div>

        <div className="card">
          {sessionExpired && (
            <div className="alert alert-error">
              Your session has expired. Please log in or register to continue.
            </div>
          )}

          {error && (
            <div className="alert alert-error">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Username</label>
              <input
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              <LogIn size={18} />
              {loading ? "Logging in..." : "Log In"}
            </button>
          </form>
        </div>
        
        <div className="auth-footer">
          Don't have an account? <Link to="/register">Create one</Link>
        </div>
      </div>
    </div>
  );
}

export default Login;