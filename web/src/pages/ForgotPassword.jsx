import React, { useState } from "react"
import axios from "axios"
import { Link } from "react-router-dom"
import "../styles/ForgotPassword.css"

export default function ForgotPassword() {
  const [email, setEmail] = useState("")
  const [msg, setMsg] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMsg("")
    try {
      const res = await axios.post("http://localhost:5000/users/forgot-password", { email })
      setMsg(`✅ ${res.data.message}\nToken: ${res.data.resetToken || "(Kiểm tra email)"}`)
    } catch (err) {
      setMsg("❌ " + (err.response?.data?.message || "Lỗi không xác định"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="forgot-page">
      <div className="forgot-card">
        <h1>Quên mật khẩu</h1>
        <p>Nhập email để nhận token đặt lại mật khẩu</p>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Nhập email của bạn..."
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? "Đang gửi..." : "Gửi token"}
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
