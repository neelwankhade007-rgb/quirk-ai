import { Link, useNavigate, useLocation } from "react-router-dom";
import { Users, MessageSquare, PlusCircle, LogOut, LogIn, UserPlus } from "lucide-react";
import { ACCESS_TOKEN_KEY } from "../utils/auth";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem(ACCESS_TOKEN_KEY);

  const handleLogout = () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="brand">
          <img src="/quirk_ai_logo.png" alt="" className="brand-logo" />
          <span>QuirkAI</span>
        </Link>

        <div className="nav-links">
          {token ? (
            <>
              <Link
                to="/characters"
                className={`nav-link ${location.pathname === "/characters" ? "active" : ""}`}
              >
                <Users size={16} />
                <span className="nav-label">Characters</span>
              </Link>
              <Link
                to="/chats"
                className={`nav-link ${location.pathname === "/chats" ? "active" : ""}`}
              >
                <MessageSquare size={16} />
                <span className="nav-label">Chats</span>
              </Link>
              <Link
                to="/create-character"
                className={`nav-link ${location.pathname === "/create-character" ? "active" : ""}`}
              >
                <PlusCircle size={16} />
                <span className="nav-label">Create</span>
              </Link>
              <div className="nav-separator"></div>
              <button onClick={handleLogout} className="btn-logout" title="Logout">
                <LogOut size={16} />
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className={`nav-link ${location.pathname === "/login" ? "active" : ""}`}
              >
                <LogIn size={16} />
                <span className="nav-label">Login</span>
              </Link>
              <Link
                to="/register"
                className="btn-primary"
                style={{ padding: "8px 16px", marginLeft: "8px" }}
              >
                <UserPlus size={16} />
                <span>Register</span>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
