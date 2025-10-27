"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { api } from "../api.js"
import { Eye, EyeOff, Loader2, CheckCircle, AlertCircle } from "lucide-react"
import "./AuthForm.css"

export default function AuthForm({ mode = "login" }) {
  const [form, setForm] = useState({ name: "", email: "", password: "" })
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState("")
  const [msgType, setMsgType] = useState("") // "success" | "error"
  const navigate = useNavigate()

  const title = mode === "login" ? "Đăng nhập" : "Tạo tài khoản"
  const subtitle =
    mode === "login" ? "Chào mừng bạn trở lại 👋" : "Bắt đầu hành trình mới ✨"
  const buttonText = mode === "login" ? "Đăng nhập" : "Đăng ký"

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMsg("")
    setMsgType("")

    try {
      if (mode === "signup") {
        const res = await api.post("/users/signup", form)
        setMsg("✅ Đăng ký thành công! Vui lòng đăng nhập.")
        setMsgType("success")
        setForm({ name: "", email: "", password: "" })
      } else {
        const res = await api.post("/users/login", {
          email: form.email,
          password: form.password,
        })

        if (!res.data?.token) {
          setMsg("Không nhận được token, vui lòng thử lại.")
          setMsgType("error")
          return
        }

        // ✅ Lưu token và thông tin user
        localStorage.setItem("token", res.data.token)
        localStorage.setItem("user", JSON.stringify(res.data.user))

        setMsg("Đăng nhập thành công! 🎉")
        setMsgType("success")

        // ✅ Điều hướng theo role NGAY LẬP TỨC (không dùng setTimeout)
        if (res.data.user.role === "admin") {
          navigate("/admin/users", { replace: true })
        } else {
          navigate("/profile", { replace: true })
        }
      }
    } catch (err) {
      console.error("Auth error:", err)
      setMsg(
        err.response?.data?.message ||
          "❌ Lỗi máy chủ, vui lòng thử lại sau."
      )
      setMsgType("error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">A</div>
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>

        {msg && (
          <div className={`message ${msgType}`}>
            {msgType === "success" ? (
              <CheckCircle size={16} />
            ) : (
              <AlertCircle size={16} />
            )}
            <span>{msg}</span>
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          {mode === "signup" && (
            <div className="form-group">
              <label>Tên hiển thị</label>
              <input
                type="text"
                name="name"
                placeholder="Nhập tên hiển thị..."
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>
          )}

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              placeholder="Nhập email của bạn..."
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Mật khẩu</label>
            <div className="password-field">
              <input
                type={showPwd ? "text" : "password"}
                name="password"
                placeholder="Nhập mật khẩu..."
                value={form.password}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                className="toggle-eye"
                onClick={() => setShowPwd(!showPwd)}
              >
                {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {mode === "login" && (
            <div className="forgot-link">
              <Link to="/forgot-password" className="link">
                Quên mật khẩu?
              </Link>
            </div>
          )}

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? (
              <>
                <Loader2 size={16} className="spin" /> Đang xử lý...
              </>
            ) : (
              buttonText
            )}
          </button>
        </form>

        <div className="toggle-text">
          {mode === "login" ? (
            <>
              Chưa có tài khoản?{" "}
              <Link to="/signup" className="link">
                Đăng ký ngay
              </Link>
            </>
          ) : (
            <>
              Đã có tài khoản?{" "}
              <Link to="/login" className="link">
                Đăng nhập
              </Link>
            </>
          )}
        </div>

        <footer className="auth-footer">© {new Date().getFullYear()} Group 3</footer>
      </div>
    </div>
  )
}
