import { useSelector } from "react-redux"
import { Navigate } from "react-router-dom"

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, accessToken } = useSelector((state) => state.auth)

  if (!accessToken || !user) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div
        style={{
          color: "red",
          textAlign: "center",
          marginTop: "40px",
          fontWeight: "bold",
        }}
      >
        ⚠️ Bạn không có quyền truy cập vào trang này.
      </div>
    )
  }

  return children
}
