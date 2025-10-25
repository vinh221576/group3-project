import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Context & guard
import { AuthProvider } from "./context/AuthContext.jsx";
import RequireRole from "./components/RequireRole.jsx";

// Pages
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import Profile from "./pages/Profile.jsx";
import AdminUsersPage from "./pages/AdminUsersPage.jsx";

// Import CSS gốc (để load nền tối toàn trang)
import "./App.css"
import "./index.css"

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/admin/users" element={<AdminUsersPage />} />


          <Route
            path="/admin/users"
            element={
              <RequireRole role="admin">
                <AdminUsersPage />
              </RequireRole>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
