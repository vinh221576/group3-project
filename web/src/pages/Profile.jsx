import React, { useState, useEffect } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import "./Profile.css"

export default function Profile() {
  const [user, setUser] = useState(null)
  const [name, setName] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState({ type: "", text: "" })
  const [deleting, setDeleting] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      navigate("/login", { replace: true })
      return
    }

    const fetchMe = async () => {
      try {
        const res = await axios.get("http://localhost:5000/users/profile", {
          headers: { Authorization: `Bearer ${token}` },
        })
        setUser(res.data || {})
        setName(res.data?.name || "")
        setLoading(false)
      } catch (err) {
        localStorage.removeItem("token")
        navigate("/login", { replace: true })
      }
    }

    fetchMe()
  }, [navigate])

  const handleUpdate = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMsg({ type: "", text: "" })
    try {
      const token = localStorage.getItem("token")
      const res = await axios.put(
        "http://localhost:5000/profile",
        { name, password },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setUser(res.data)
      setMsg({ type: "success", text: "✅ Cập nhật thành công!" })
      setPassword("")
    } catch (err) {
      setMsg({
        type: "error",
        text: "❌ " + (err?.response?.data?.msg || "Cập nhật thất bại."),
      })
    } finally {
      setSaving(false)
      setTimeout(() => setMsg({ type: "", text: "" }), 2500)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    navigate("/login", { replace: true })
  }

  // 🧨 Hàm xóa tài khoản chính mình
  const handleDeleteAccount = async () => {
    if (!window.confirm("⚠️ Bạn có chắc chắn muốn xóa tài khoản này không?\nHành động này không thể hoàn tác.")) return
    setDeleting(true)
    setMsg({ type: "", text: "" })
    try {
      const token = localStorage.getItem("token")
      await axios.delete("http://localhost:5000/users/profile", {
        headers: { Authorization: `Bearer ${token}` },
      })
      setMsg({ type: "success", text: "✅ Tài khoản của bạn đã được xóa!" })
      localStorage.removeItem("token")
      setTimeout(() => navigate("/signup", { replace: true }), 2000)
    } catch (err) {
      setMsg({
        type: "error",
        text: "❌ Xóa thất bại: " + (err?.response?.data?.msg || "Lỗi không xác định."),
      })
    } finally {
      setDeleting(false)
      setTimeout(() => setMsg({ type: "", text: "" }), 3000)
    }
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        <header className="profile-header">
          <div className="avatar">{user?.name?.[0]?.toUpperCase() || "U"}</div>
          <div>
            <h1>Hồ sơ người dùng</h1>
            <p>Quản lý thông tin, bảo mật và tài khoản cá nhân</p>
          </div>
        </header>

        <div className="profile-body">
          <section className="profile-info">
            <h2>Thông tin hiện tại</h2>
            {loading ? (
              <p className="loading">Đang tải...</p>
            ) : (
              <>
                <div className="info-item">
                  <label>Tên</label>
                  <p>{user?.name || "—"}</p>
                </div>
                <div className="info-item">
                  <label>Email</label>
                  <p>{user?.email || "—"}</p>
                </div>
              </>
            )}
          </section>

          <section className="profile-form">
            <h2>Cập nhật thông tin</h2>

            {msg.text && <div className={`message ${msg.type}`}>{msg.text}</div>}

            <form onSubmit={handleUpdate}>
              <div className="form-group">
                <label htmlFor="name">Tên mới</label>
                <input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nhập tên hiển thị mới"
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Mật khẩu mới</label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Để trống nếu không đổi"
                />
                <small>Mật khẩu tối thiểu 6 ký tự.</small>
              </div>

              <div className="button-group">
                <button type="submit" disabled={saving}>
                  {saving ? "Đang cập nhật..." : "Cập nhật"}
                </button>
                <button
                  type="button"
                  className="logout"
                  onClick={handleLogout}
                >
                  Đăng xuất
                </button>
              </div>
            </form>

            <div className="delete-account">
              <button
                type="button"
                className="delete-btn"
                disabled={deleting}
                onClick={handleDeleteAccount}
              >
                {deleting ? "Đang xóa..." : "Xóa tài khoản của tôi"}
              </button>
            </div>
          </section>
        </div>

        <footer className="profile-footer">
          © {new Date().getFullYear()} Group 3
        </footer>
      </div>
    </div>
  )
}
