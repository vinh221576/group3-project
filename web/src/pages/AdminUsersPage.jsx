// web/src/pages/AdminUsersPage.jsx
import React, { useEffect, useMemo, useState } from "react"
import { api } from "../api"
import "./AdminUsersPage.css"

export default function AdminUsersPage() {
  const [q, setQ] = useState({ search: "", page: 1, limit: 10, sort: "createdAt:-1" })
  const [data, setData] = useState({ items: [], page: 1, pages: 1, total: 0 })
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState("")
  const [msg, setMsg] = useState({ text: "", type: "" }) // thông báo

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
        const res = await api.get(`/users?${queryStr}`)
        const body = Array.isArray(res.data)
          ? { items: res.data, total: res.data.length, page: 1, pages: 1 }
          : res.data
        if (!ignore) setData(body)
      } catch (e) {
        if (!ignore)
          setErr(e.response?.data?.message || "Không tải được danh sách")
      } finally {
        if (!ignore) setLoading(false)
      }
    })()
    return () => {
      ignore = true
    }
  }, [queryStr])

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa người dùng này?")) return
    try {
      await api.delete(`/users/${id}`)
      setData((prev) => ({
        ...prev,
        items: prev.items.filter((u) => u._id !== id),
        total: prev.total - 1,
      }))
      setMsg({ text: "✅ Đã xóa người dùng thành công", type: "success" })
      setTimeout(() => setMsg({ text: "", type: "" }), 2500)
    } catch (e) {
      setMsg({
        text:
          "❌ Xóa thất bại: " +
          (e.response?.data?.message || "Lỗi không xác định"),
        type: "error",
      })
      setTimeout(() => setMsg({ text: "", type: "" }), 3000)
    }
  }

  return (
    <div className="admin-page">
      <div className="card">
        {msg.text && (
          <div className={`msg ${msg.type}`}>{msg.text}</div>
        )}

        <div className="admin-header">
          <h1>Quản lý người dùng</h1>
          <span className="muted small">Tổng: {data.total || 0}</span>
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
            onChange={(e) =>
              setQ({ ...q, limit: Number(e.target.value), page: 1 })
            }
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
                <tr>
                  <td colSpan={4} className="cell-center">
                    Đang tải…
                  </td>
                </tr>
              ) : err ? (
                <tr>
                  <td colSpan={4} className="cell-error">
                    {err}
                  </td>
                </tr>
              ) : data.items.length === 0 ? (
                <tr>
                  <td colSpan={4} className="cell-center">
                    Trống
                  </td>
                </tr>
              ) : (
                data.items.map((u) => (
                  <tr key={u._id}>
                    <td className="name">{u.name}</td>
                    <td>{u.email}</td>
                    <td>
                      <span
                        className={`badge ${
                          u.role === "admin" ? "badge-admin" : "badge-user"
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="right">
                      <button
                        className="btn-danger"
                        onClick={() => handleDelete(u._id)}
                      >
                        Xóa
                      </button>
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
