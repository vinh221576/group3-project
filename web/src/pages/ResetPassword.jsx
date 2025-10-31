import React, { useState, useEffect } from "react"
import axios from "axios"
import { useLocation, Link } from "react-router-dom"
import "../styles/ResetPassword.css"

export default function ResetPassword() {
  const [token, setToken] = useState("")
  const [password, setPassword] = useState("")
  const [msg, setMsg] = useState("")
  const [loading, setLoading] = useState(false)

  // 🔹 Lấy token tự động từ URL (VD: ?token=abc123)
  const location = useLocation()
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const tokenFromUrl = params.get("token")
    if (tokenFromUrl) setToken(tokenFromUrl)
  }, [location])

  const handleSubmit = async (e) => {
  e.preventDefault()
  setLoading(true)
  setMsg("")

  try {
    const res = await axios.put(
      `http://localhost:5000/users/reset/${token}`, // ✅ token trong URL
      { password } // ✅ chỉ gửi password trong body
    )
    setMsg("✅ " + res.data.message)
  } catch (err) {
    setMsg("❌ " + (err.response?.data?.message || "Lỗi không xác định"))
  } finally {
    setLoading(false)
  }
}


  return (
    <div className="reset-page">
      <div className="reset-card">
        <h1>Đặt lại mật khẩu</h1>
        <p>Nhập mật khẩu mới cho tài khoản của bạn</p>

        <form onSubmit={handleSubmit}>
          {/* Ẩn ô token nếu đã tự động lấy từ URL */}
          {!token && (
            <input
              type="text"
              placeholder="Nhập token từ email..."
              value={token}
              onChange={(e) => setToken(e.target.value)}
              required
            />
          )}
          <input
            type="password"
            placeholder="Nhập mật khẩu mới..."
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? "Đang xử lý..." : "Đổi mật khẩu"}
          </button>
        </form>

        {msg && <div className="msg">{msg}</div>}

        <div className="back-login">
          <Link to="/login" className="link">
            ← Quay lại đăng nhập
          </Link>
        </div>
      </div>
    </div>
  )
}
