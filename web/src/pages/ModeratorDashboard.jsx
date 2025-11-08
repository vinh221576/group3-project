import React, { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../api"
import "../styles/ModeratorDashboard.css"

export default function ModeratorDashboard() {
  const navigate = useNavigate()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const currentUser = JSON.parse(localStorage.getItem("user"))

//   useEffect(() => {
//     const fetchUsers = async () => {
//       try {
//         const res = await api.get("/users")
//         setUsers(res.data.items || res.data)
//       } catch (err) {
//         setError("Không thể tải danh sách người dùng.")
//       } finally {
//         setLoading(false)
//       }
//     }
//     fetchUsers()
//   }, [])
    useEffect(() => {
    const fetchUsers = async () => {
        try {
        const token = localStorage.getItem("accessToken")
        const res = await api.get("/", {
            headers: { Authorization: `Bearer ${token}` },
        })
        setUsers(res.data.items || res.data)
        } catch (err) {
        console.error("Lỗi tải users:", err)
        setError("Không thể tải danh sách người dùng.")
        } finally {
        setLoading(false)
        }
    }
    fetchUsers()
    }, [])



  const handleLogout = () => {
    localStorage.clear()
    navigate("/login", { replace: true })
  }

  return (
    <div className="moderator-page">
      {/* 🔹 Thanh menu cố định */}
      <nav className="admin-navbar">
        <div className="nav-left"><h2>🛡️ Bảng điều khiển Moderator</h2></div>
        <div className="nav-right">
          <button onClick={() => navigate("/profile")} className="nav-btn">Hồ sơ cá nhân</button>
          <button className="nav-btn active">Danh sách người dùng</button>
          <button onClick={handleLogout} className="nav-btn logout">Đăng xuất</button>
        </div>
      </nav>

      {/* 🔹 Nội dung */}
      <div className="card">
        <div className="header">
          <h1>Danh sách người dùng</h1>
          <p className="muted">Chế độ chỉ đọc – bạn không thể sửa hoặc xóa.</p>
        </div>

        {loading ? (
          <p className="center">Đang tải...</p>
        ) : error ? (
          <p className="error">{error}</p>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Tên</th>
                  <th>Email</th>
                  <th>Vai trò</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr><td colSpan="3" className="center">Không có người dùng</td></tr>
                ) : (
                  users.map((u) => (
                    <tr key={u._id}>
                      <td>{u.name}</td>
                      <td>{u.email}</td>
                      <td>
                        <span className={`badge ${u.role}`}>{u.role}</span>
                      </td>
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
