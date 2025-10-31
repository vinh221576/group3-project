import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import RequireRole from "./components/RequireRole.jsx";

// Pages
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import Profile from "./pages/Profile.jsx";
import AdminUsersPage from "./pages/AdminUsersPage.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";
import AdminLogsPage from "./pages/AdminLogsPage.jsx";

import "./App.css";
import "./index.css";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Trang mặc định */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Auth */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset" element={<ResetPassword />} />

          {/* Profile (cho mọi user đã login) */}
          <Route
            path="/profile"
            element={
              <RequireRole allowedRoles={["user", "admin", "moderator"]}>
                <Profile />
              </RequireRole>
            }
          />

          {/* Admin page */}
          <Route
            path="/admin/users"
            element={
              <RequireRole allowedRoles={["admin"]}>
                <AdminUsersPage />
              </RequireRole>
            }
          />
          <Route
            path="/admin/logs"
            element={
              <RequireRole allowedRoles={["admin"]}>
                <AdminLogsPage />
              </RequireRole>
            }
          />
          {/* ⚠️ Route mặc định — BẮT MỌI URL KHÔNG HỢP LỆ */}
          <Route
            path="*"
            element={
              <RequireRole key={window.location.pathname}  allowedRoles={["user", "admin", "moderator"]}>
                <div
                  style={{
                    color: "red",
                    textAlign: "center",
                    marginTop: "50px",
                    fontWeight: "bold",
                  }}
                >
                  ⚠️ Trang bạn yêu cầu không tồn tại hoặc bạn không có quyền
                  truy cập.
                </div>
              </RequireRole>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
