// "use client"
import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import api from "../api.js"
import { Eye, EyeOff, Loader2, CheckCircle, AlertCircle } from "lucide-react"
import "../styles/AuthForm.css"
import { useAuth } from "../context/AuthContext.jsx"

export default function AuthForm({ mode = "login" }) {
  const [form, setForm] = useState({ name: "", email: "", password: "" })
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState("")
  const [msgType, setMsgType] = useState("") // "success" | "error" | "lockout"
  const navigate = useNavigate()
  const { login } = useAuth()

  // 🕒 Cooldown state
  const [cooldown, setCooldown] = useState(0)
  const [intervalId, setIntervalId] = useState(null)

  // 🧮 Bộ đếm tạm cho 2 tình huống
  const [loginLogoutCount, setLoginLogoutCount] = useState(0)
  const [wrongPwdCount, setWrongPwdCount] = useState(0)

  const title = mode === "login" ? "Đăng nhập" : "Tạo tài khoản"
  const subtitle =
    mode === "login" ? "Chào mừng bạn trở lại 👋" : "Bắt đầu hành trình mới ✨"
  const buttonText = mode === "login" ? "Đăng nhập" : "Đăng ký"

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  // ⏳ Hàm đếm ngược + tự động về login
  const startCooldown = (seconds) => {
    setCooldown(seconds)
    if (intervalId) clearInterval(intervalId)
    const id = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(id)
          setMsg("")
          setMsgType("")
          setCooldown(0)
          window.location.href = "/login" // ✅ tự động quay lại login
          return 0
        }
        return prev - 1
      })
    }, 1000)
    setIntervalId(id)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMsg("")
    setMsgType("")

    try {
      if (mode === "signup") {
        await api.post("/signup", form)
        setMsg("✅ Đăng ký thành công! Vui lòng đăng nhập.")
        setMsgType("success")
        setForm({ name: "", email: "", password: "" })
      } else {
        const res = await api.post("/login", {
          email: form.email,
          password: form.password,
        })

        if (!res.data?.accessToken || !res.data?.refreshToken) {
          setMsg("Không nhận được token, vui lòng thử lại.")
          setMsgType("error")
          return
        }

        login(res.data.user, res.data.accessToken, res.data.refreshToken)
        setMsg("Đăng nhập thành công! 🎉")
        setMsgType("success")

        // ✅ Reset lại bộ đếm khi đăng nhập thành công
        setWrongPwdCount(0)
        setLoginLogoutCount(0)

        setTimeout(() => {
          if (res.data.user.role === "admin") {
            navigate("/admin/users", { replace: true })
          } else {
            navigate("/profile", { replace: true })
          }
        }, 300)
      }
    } catch (err) {
      console.error("Auth error:", err)
      const message = err.response?.data?.message || "⚠️ Bạn đã đăng nhập/đăng xuất quá nhiều lần. Hãy thử lại sau 1 phút."
      const status = err.response?.status

      // 🔹 Trường hợp 1: Nhập sai mật khẩu nhiều lần
      if (status === 400 && message.toLowerCase().includes("xác thực")) {
        setWrongPwdCount((prev) => prev + 1)
        if (wrongPwdCount + 1 >= 5) {
          setMsg("⚠️ Nhập sai mật khẩu quá nhiều lần. Tài khoản tạm bị khóa 1 phút.")
          setMsgType("lockout")
          startCooldown(60)
          setWrongPwdCount(0)
          return
        }
      }

      // 🔹 Trường hợp 2: Đăng nhập/đăng xuất nhiều vòng (FE phát hiện)
      const lowerMsg = message.toLowerCase()
      if (
        lowerMsg.includes("đăng xuất") ||
        lowerMsg.includes("logout") ||
        lowerMsg.includes("đăng nhập đăng xuất") ||
        lowerMsg.includes("quá nhiều lần") ||
        status === 500
      ) {
        setLoginLogoutCount((prev) => prev + 1)
        if (loginLogoutCount + 1 >= 5) {
          setMsg("⚠️ Bạn đã đăng nhập/đăng xuất quá nhiều lần. Hãy thử lại sau 1 phút.")
          setMsgType("lockout")
          startCooldown(60)
          setLoginLogoutCount(0)
          return
        }
      }

      // 🔹 Lỗi rate limiter thật từ BE
      if (status === 429 || message.includes("Quá nhiều lần")) {
        setMsg(message)
        setMsgType("lockout")
        startCooldown(60)
      } else {
        setMsg(message)
        setMsgType("error")
      }
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

        {/* ✅ Thông báo */}
        {msg && msgType !== "lockout" && (
          <div className={`message ${msgType}`}>
            {msgType === "success" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
            <span>{msg}</span>
          </div>
        )}

        {/* 🔒 Giao diện bị khóa */}
        {msgType === "lockout" && (
          <div className="lockout-card">
            <h2>
              {msg.includes("đăng xuất")
                ? "🚫 Hoạt động đăng nhập/đăng xuất bị tạm khóa"
                : "🚫 Đăng nhập bị tạm khóa"}
            </h2>
            <p>{msg}</p>
            <p>
              Thử lại sau:{" "}
              <b>
                {Math.floor(cooldown / 60)} phút {cooldown % 60} giây
              </b>
            </p>
          </div>
        )}

        {/* 🧾 Form */}
        {msgType !== "lockout" && (
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
        )}

        {/* 🔁 Chuyển form */}
        {msgType !== "lockout" && (
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
        )}

        <footer className="auth-footer">© {new Date().getFullYear()} Group 3</footer>
      </div>
    </div>
  )
}
