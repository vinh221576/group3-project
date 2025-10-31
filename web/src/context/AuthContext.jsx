import { createContext, useContext, useEffect, useState } from "react";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // Lấy từ localStorage khi F5
    const raw = localStorage.getItem("user");
    if (raw) {
      try { setCurrentUser(JSON.parse(raw)); } catch {}
    }
  }, []);

  const login = (user, accessToken,refreshToken) => {
     console.log("🔐 Login context:", user, accessToken);
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("accessToken", accessToken);
    if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
    // ✅ thêm dòng này
    if (user?.role) localStorage.setItem("role", user.role);
  setCurrentUser(user);
  };

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
     localStorage.removeItem("role"); // ✅ thêm dòng này
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
