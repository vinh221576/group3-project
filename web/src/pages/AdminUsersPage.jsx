import React, { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../api"
import "../styles/AdminUsersPage.css"

export default function AdminUsersPage() {
  const [q, setQ] = useState({ search: "", page: 1, limit: 10, sort: "createdAt:-1" })
  const [data, setData] = useState({ items: [], page: 1, pages: 1, total: 0 })
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState("")
  const [msg, setMsg] = useState({ text: "", type: "" })
  const navigate = useNavigate()
  const currentUser = JSON.parse(localStorage.getItem("user"))

  const queryStr = useMemo(() => {
    const p = new URLSearchParams()
    if (q.search) p.set("search", q.search)
    p.set("page", q.page)
    p.set("limit", q.limit)
    p.set("sort", q.sort)
    return p.toString()
  }, [q])

  useEffect(() => {
    let ignore = false
    ;(async () => {
      setLoading(true)
      setErr("")
      try {
        const res = await api.get(`/?${queryStr}`)
        const body = Array.isArray(res.data)
          ? { items: res.data, total: res.data.length, page: 1, pages: 1 }
          : res.data
        if (!ignore) setData(body)
      } catch (e) {
        if (!ignore) setErr(e.response?.data?.message || "Không tải được danh sách")
      } finally {
        if (!ignore) setLoading(false)
      }
    })()
    return () => {
      ignore = true
    }
  }, [queryStr])

  // 🔹 Đăng xuất
  const handleLogout = () => {
    localStorage.clear()
    navigate("/login", { replace: true })
  }

  const handleViewLogs = () => navigate("/admin/logs")
  const handleManageUsers = () => navigate("/admin/users")

  // 🔹 Xóa user
  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa người dùng này?")) return
    try {
      await api.delete(`/${id}`)
      setData((prev) => ({
        ...prev,
        items: prev.items.filter((u) => u._id !== id),
        total: prev.total - 1,
      }))
      setMsg({ text: "✅ Đã xóa người dùng thành công", type: "success" })
    } catch (e) {
      setMsg({
        text: "❌ Xóa thất bại: " + (e.response?.data?.message || "Lỗi không xác định"),
        type: "error",
      })
    } finally {
      setTimeout(() => setMsg({ text: "", type: "" }), 3000)
    }
  }

  // 🔹 Cập nhật Role
  const handleChangeRole = async (userId, newRole) => {
    if (!window.confirm(`Bạn có chắc muốn đổi quyền người dùng này thành "${newRole}"?`)) return
    try {
      await api.put(`/update-role/${userId}`, { role: newRole })
      setData((prev) => ({
        ...prev,
        items: prev.items.map((u) =>
          u._id === userId ? { ...u, role: newRole } : u
        ),
      }))
      setMsg({ text: `✅ Đã cập nhật vai trò thành ${newRole}`, type: "success" })
    } catch (e) {
      setMsg({
        text: "❌ Cập nhật thất bại: " + (e.response?.data?.message || "Lỗi không xác định"),
        type: "error",
      })
    } finally {
      setTimeout(() => setMsg({ text: "", type: "" }), 3000)
    }
  }

  return (
    <div className="admin-page">
      {/* 🔹 Thanh menu trên cùng */}
      <nav className="admin-navbar">
        <div className="nav-left">
          <h2>👑 Trang quản trị</h2>
        </div>
        <div className="nav-right">
          <button onClick={handleManageUsers} className="nav-btn active">
            Quản lý người dùng
          </button>
          <button onClick={handleViewLogs} className="nav-btn">
            Xem nhật ký
          </button>
          <button onClick={handleLogout} className="nav-btn logout">
            Đăng xuất
          </button>
        </div>
      </nav>

      <div className="card">
        {msg.text && <div className={`msg ${msg.type}`}>{msg.text}</div>}

        <div className="admin-header">
          <div className="header-left">
            <h1>Quản lý người dùng</h1>
            <span className="muted">Tổng: {data.total || 0}</span>
          </div>
        </div>

        <div className="toolbar">
          <input
            className="input"
            placeholder="Tìm theo tên hoặc email..."
            value={q.search}
            onChange={(e) => setQ({ ...q, search: e.target.value, page: 1 })}
          />
          <select
            className="select"
            value={q.limit}
            onChange={(e) => setQ({ ...q, limit: Number(e.target.value), page: 1 })}
          >
            {[5, 10, 20, 50].map((n) => (
              <option key={n} value={n}>
                {n}/trang
              </option>
            ))}
          </select>
        </div>

        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Tên</th>
                <th>Email</th>
                <th>Role</th>
                <th className="right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} className="cell-center">Đang tải…</td></tr>
              ) : err ? (
                <tr><td colSpan={4} className="cell-error">{err}</td></tr>
              ) : data.items.length === 0 ? (
                <tr><td colSpan={4} className="cell-center">Trống</td></tr>
              ) : (
                data.items.map((u) => (
                  <tr key={u._id}>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td>
                      {currentUser?.id === u._id ? (
                        <span className={`badge badge-${u.role}`}>
                          {u.role} (Bạn)
                        </span>
                      ) : (
                        <div className="role-edit">
                          <select
                            className={`role-select role-${u.role}`}
                            value={u.role}
                            onChange={(e) => handleChangeRole(u._id, e.target.value)}
                          >
                            <option value="user">User</option>
                            <option value="moderator">Moderator</option>
                            <option value="admin">Admin</option>
                          </select>
                        </div>
                      )}
                    </td>
                    <td className="right">
                      {currentUser?.role === "admin" && u.role !== "admin" && (
                        <button className="btn-danger" onClick={() => handleDelete(u._id)}>
                          Xóa
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="footer">
          <div>
            Trang <b>{data.page || 1}</b>/<b>{data.pages || 1}</b>
          </div>
          <div>{data.total || 0} người dùng</div>
        </div>
      </div>
    </div>
  )
}
