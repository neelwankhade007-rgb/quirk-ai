import { Link, useNavigate, useLocation } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("access_token");

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="brand">
          ⚡ <span>QuirkAI</span>
        </Link>

        <div className="nav-links">
          {token ? (
            <>
              <Link
                to="/characters"
                className={`nav-link ${location.pathname === "/characters" ? "active" : ""}`}
              >
                Characters
              </Link>
              <Link
                to="/create-character"
                className={`nav-link ${location.pathname === "/create-character" ? "active" : ""}`}
              >
                + New Character
              </Link>
              <button onClick={handleLogout} className="btn-logout">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className={`nav-link ${location.pathname === "/login" ? "active" : ""}`}
              >
                Login
              </Link>
              <Link
                to="/register"
                className={`nav-link ${location.pathname === "/register" ? "active" : ""}`}
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
