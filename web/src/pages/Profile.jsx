import React, { useState, useEffect } from "react"
import api from "../api.js"
import { useNavigate } from "react-router-dom"
import "../styles/Profile.css"

export default function Profile() {
  const [user, setUser] = useState(null)
  const [name, setName] = useState("")
  const [password, setPassword] = useState("")
  const [msg, setMsg] = useState({ type: "", text: "" })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [uploading, setUploading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem("accessToken")
    if (!token) return navigate("/login", { replace: true })

    const fetchProfile = async () => {
      try {
        const res = await api.get("/profile", {
          headers: { Authorization: `Bearer ${token}` },
        })
        setUser(res.data)
        setName(res.data.name || ""); //Ní Ngạn bỏ sót cái này r, sai cái display textbox name
      } catch {
        localStorage.removeItem("accessToken")
        navigate("/login", { replace: true })
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [navigate])

  // ✅ Upload avatar
  const handleUploadAvatar = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    setMsg({ type: "", text: "" })
    try {
      const token = localStorage.getItem("accessToken")
      const formData = new FormData()
      formData.append("avatar", file)
      const res = await api.post("/upload-avatar", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      })
      setUser((prev) => ({ ...prev, avatar: res.data.avatar }))
      setMsg({ type: "success", text: res.data.message })
    } catch (err) {
      setMsg({
        type: "error",
        text: "❌ " + (err.response?.data?.message || "Tải ảnh thất bại"),
      })
    } finally {
      setUploading(false)
      setTimeout(() => setMsg({ type: "", text: "" }), 2500)
    }
  }

  // ✅ Cập nhật thông tin cá nhân
  const handleUpdate = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMsg({ type: "", text: "" })

    if (!password && name === user.name) {
      setMsg({ type: "error", text: "⚠️ Bạn chưa thay đổi thông tin nào!" })
      setSaving(false)
      return
    }

    const updateData = {}
    if (name && name !== user.name) updateData.name = name
    if (password && password.trim() !== "") updateData.password = password

    try {
      const token = localStorage.getItem("accessToken")
      const res = await api.put("/profile", updateData, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setUser(res.data)
      setMsg({ type: "success", text: "✅ Cập nhật thành công!" })
      setName(res.data.name || "")
      setPassword("")
    } catch (err) {
      setMsg({
        type: "error",
        text: "❌ Cập nhật thất bại: " + (err.response?.data?.message || ""),
      })
    } finally {
      setSaving(false)
      setTimeout(() => setMsg({ type: "", text: "" }), 2500)
    }
  }

  // ✅ Đăng xuất có đếm số lần
  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken")
      await api.post("/logout", { refreshToken })

      const count = Number(localStorage.getItem("logoutCount") || 0) + 1
      localStorage.setItem("logoutCount", count)

      // Nếu vượt 5 lần → khóa login 1 phút
      if (count >= 5) {
        const lockTime = Date.now() + 60 * 1000
        localStorage.setItem("lockUntil", lockTime)
        localStorage.setItem("logoutCount", 0)
        console.warn("🚫 Tạm khóa đăng nhập 1 phút do đăng nhập/đăng xuất quá nhiều lần.")
      }

      setMsg({ type: "success", text: "✅ Đăng xuất thành công." })
    } catch (err) {
      console.error("Logout API error:", err)
      setMsg({ type: "error", text: "❌ Lỗi khi đăng xuất." })
    } finally {
      // ❗ Không dùng clear() — chỉ xóa token
      const lockUntil = localStorage.getItem("lockUntil")
      const logoutCount = localStorage.getItem("logoutCount")

      localStorage.removeItem("accessToken")
      localStorage.removeItem("refreshToken")
      localStorage.removeItem("user")
      localStorage.removeItem("role")

      if (lockUntil) localStorage.setItem("lockUntil", lockUntil)
      if (logoutCount) localStorage.setItem("logoutCount", logoutCount)

        localStorage.clear()
      navigate("/login", { replace: true })
    }
  }

  // ✅ Xóa tài khoản
  const handleDeleteAccount = async () => {
    if (!window.confirm("⚠️ Bạn chắc chắn muốn xóa tài khoản này?")) return
    setDeleting(true)
    try {
      const token = localStorage.getItem("accessToken")
      await api.delete("/profile", {
        headers: { Authorization: `Bearer ${token}` },
      })
      localStorage.clear()
      setMsg({ type: "success", text: "✅ Tài khoản đã được xóa!" })
      setTimeout(() => navigate("/signup", { replace: true }), 2000)
    } catch {
      setMsg({ type: "error", text: "❌ Xóa thất bại!" })
    } finally {
      setDeleting(false)
    }
  }

  if (loading) return <div className="loading">Đang tải...</div>

  return (
    <div className="profile-page">
      {/* 🔹 Nếu role là moderator thì hiển thị thanh menu */}
      {user?.role === "moderator" && (
        <nav className="admin-navbar">
          <div className="nav-left"><h2>🛡️ Moderator</h2></div>
          <div className="nav-right">
            <button className="nav-btn active">Hồ sơ cá nhân</button>
            <button className="nav-btn" onClick={() => navigate("/moderator")}>
              Danh sách người dùng
            </button>
            <button className="nav-btn logout" onClick={handleLogout}>
              Đăng xuất
            </button>
          </div>
        </nav>
      )}

      <div className="profile-card">
        {/* 🖼️ Banner */}
        <div className="profile-banner">
          <img
            src="https://images.unsplash.com/photo-1503264116251-35a269479413?auto=format&fit=crop&w=1000&q=80"
            alt="banner"
            className="banner-img"
          />
        </div>

        {/* 🧍 Avatar */}
        <div className="avatar-section">
          <div className="avatar-wrapper">
            {user?.avatar ? (
              <img src={user.avatar} alt="avatar" className="avatar-img" />
            ) : (
              <div className="avatar-placeholder">
                {user?.name?.[0]?.toUpperCase() || "U"}
              </div>
            )}
          </div>

          <h2 className="user-name">{user?.name || "Người dùng"}</h2>

          <label htmlFor="avatar-upload" className="upload-btn">
            {uploading ? "Đang tải..." : "📸 Chọn ảnh mới"}
          </label>
          <input
            id="avatar-upload"
            type="file"
            accept="image/*"
            onChange={handleUploadAvatar}
            hidden
          />
        </div>

        <h1 className="profile-title">Hồ sơ cá nhân</h1>
        <p className="profile-sub">Quản lý thông tin và bảo mật tài khoản</p>

        {msg.text && <div className={`message ${msg.type}`}>{msg.text}</div>}

        <form className="profile-form" onSubmit={handleUpdate}>
          <label>Tên hiển thị mới</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nhập tên mới..."
          />

          <label>Mật khẩu mới</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Để trống nếu không đổi"
          />

          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? "Đang cập nhật..." : "Cập nhật"}
          </button>
        </form>

        <div className="button-group">
          <button className="btn-logout" onClick={handleLogout}>
            Đăng xuất
          </button>
          <button
            className="btn-danger"
            onClick={handleDeleteAccount}
            disabled={deleting}
          >
            {deleting ? "Đang xóa..." : "Xóa tài khoản"}
          </button>
        </div>

        <footer className="profile-footer">© {new Date().getFullYear()} Group 3</footer>
      </div>
    </div>
  )
}
