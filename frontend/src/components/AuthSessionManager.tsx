import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ACCESS_TOKEN_KEY,
  AUTH_EXPIRED_EVENT,
  getTokenExpiration,
} from "../utils/auth";

function AuthSessionManager() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleExpiredSession = () => {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      navigate("/login?session=expired", { replace: true });
    };

    window.addEventListener(AUTH_EXPIRED_EVENT, handleExpiredSession);
    return () => {
      window.removeEventListener(AUTH_EXPIRED_EVENT, handleExpiredSession);
    };
  }, [navigate]);

  useEffect(() => {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);
    if (!token) {
      return;
    }

    const expiration = getTokenExpiration(token);
    const expireSession = () => {
      window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT));
    };

    if (expiration === null || expiration <= Date.now()) {
      expireSession();
      return;
    }

    const timeout = window.setTimeout(expireSession, expiration - Date.now());
    const handleStorage = (event: StorageEvent) => {
      if (event.key === ACCESS_TOKEN_KEY && event.oldValue && !event.newValue) {
        expireSession();
      }
    };
    window.addEventListener("storage", handleStorage);

    return () => {
      window.clearTimeout(timeout);
      window.removeEventListener("storage", handleStorage);
    };
  }, [location.key]);

  return null;
}

export default AuthSessionManager;
