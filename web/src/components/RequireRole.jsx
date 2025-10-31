import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function RequireRole({ children, allowedRoles = [] }) {
  const [role, setRole] = useState(null);
  const [checked, setChecked] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    setRole(storedRole);
    setChecked(true);
  }, []);

  useEffect(() => {
    if (!checked) return;

    // ✅ Nếu chưa đăng nhập
    if (!role) {
      setError("Vui lòng đăng nhập để tiếp tục.");
      setTimeout(() => navigate("/login", { replace: true }), 1000);
      return;
    }

    // ✅ Nếu route là 404 (ví dụ /users, /abc)
    if (location.pathname === "/users" || location.pathname === "*" || location.pathname === "/404") {
      setError("⚠️ Trang bạn yêu cầu không tồn tại hoặc bạn không có quyền truy cập.");
      setTimeout(() => navigate("/profile", { replace: true }), 2000);
      return;
    }

    // ✅ Nếu không đủ quyền
    if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
      setError("⚠️ Bạn không có quyền truy cập vào trang này.");
      setTimeout(() => navigate("/profile", { replace: true }), 2000);
      return;
    }

    // ✅ Trường hợp hợp lệ
    setError("");
  }, [role, checked, allowedRoles, navigate, location.pathname]);

  if (!checked) {
    return (
      <div
        style={{
          color: "#888",
          textAlign: "center",
          marginTop: "40px",
          fontWeight: "bold",
        }}
      >
        Đang kiểm tra quyền truy cập...
      </div>
    );
  }

  // ✅ Nếu có lỗi, hiển thị cảnh báo tại chỗ
  if (error) {
    return (
      <div
        style={{
          color: "red",
          textAlign: "center",
          marginTop: "40px",
          fontWeight: "bold",
        }}
      >
        {error}
      </div>
    );
  }

  return children;
}
