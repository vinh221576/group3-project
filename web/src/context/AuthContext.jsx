import { createContext, useContext, useEffect, useState } from "react";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // Lấy từ localStorage khi F5  ////
    const raw = localStorage.getItem("currentUser");
    if (raw) {
      try { setCurrentUser(JSON.parse(raw)); } catch {}
    }
  }, []);

  const login = (user, token) => {
    localStorage.setItem("currentUser", JSON.stringify(user));
    localStorage.setItem("accessToken", token);
    setCurrentUser(user);
  };

  const logout = () => {
    localStorage.removeItem("currentUser");
    localStorage.removeItem("accessToken");
    setCurrentUser(null);
    window.location.href = "/login";
  };

  return (
    <AuthCtx.Provider value={{ currentUser, setCurrentUser, login, logout }}>
      {children}
    </AuthCtx.Provider>
  );
}

export function useAuth() {
  return useContext(AuthCtx);
}
