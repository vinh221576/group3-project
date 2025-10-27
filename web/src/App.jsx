import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider } from "./context/AuthContext.jsx"
import RequireRole from "./components/RequireRole.jsx"

// Pages
import Login from "./pages/Login.jsx"
import Signup from "./pages/Signup.jsx"
import Profile from "./pages/Profile.jsx"
import AdminUsersPage from "./pages/AdminUsersPage.jsx"
import ForgotPassword from "./pages/ForgotPassword.jsx"
import ResetPassword from "./pages/ResetPassword.jsx"

import "./App.css"
import "./index.css"

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

          {/* Profile cho user thường */}
          <Route path="/profile" element={<Profile />} />

          {/* Admin page (bảo vệ bằng RequireRole) */}
          <Route
            path="/admin/users"
            element={
              <RequireRole role="admin">
                <AdminUsersPage />
              </RequireRole>
            }
          />

          {/* Tránh route trùng */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
