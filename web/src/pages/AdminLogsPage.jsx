import React, { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../api"
import "../styles/AdminLogsPage.css"

export default function AdminLogsPage() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const navigate = useNavigate()

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await api.get("/logs")
        setLogs(res.data)
      } catch (err) {
        setError("Không tải được logs: " + (err.response?.data?.message || "Lỗi server"))
      } finally {
        setLoading(false)
      }
    }
    fetchLogs()
  }, [])

  const handleLogout = () => {
    localStorage.clear()
    navigate("/login", { replace: true })
  }

  return (
    <div className="logs-page">
      {/* 🔹 Thanh menu cố định */}
      <nav className="admin-navbar">
        <div className="nav-left"><h2>👑 Trang quản trị</h2></div>
        <div className="nav-right">
          <button onClick={() => navigate("/admin/users")} className="nav-btn">
            Quản lý người dùng
          </button>
          <button className="nav-btn active">Xem nhật ký</button>
          <button onClick={handleLogout} className="nav-btn logout">
            Đăng xuất
          </button>
        </div>
      </nav>

      {/* 🔹 Nội dung */}
      <div className="logs-card">
        <div className="logs-header">
          <h1>📜 Nhật ký hoạt động</h1>
          <p className="muted">Tổng số bản ghi: {logs.length}</p>
        </div>

        {loading ? (
          <p className="loading">Đang tải logs...</p>
        ) : error ? (
          <p className="error">{error}</p>
        ) : (
          <div className="table-wrap">
            <table className="logs-table">
              <thead>
                <tr>
                  <th>Người dùng</th>
                  <th>Hành động</th>
                  <th>Địa chỉ IP</th>
                  <th>Thời gian</th>
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 ? (
                  <tr><td colSpan="4" className="center">Không có log nào.</td></tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log._id}>
                      <td>{log.userId?.name || "Ẩn danh"}</td>
                      <td>{log.action}</td>
                      <td>{log.ipAddress}</td>
                      <td>{new Date(log.timestamp).toLocaleString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
