import React, { useEffect, useState } from "react";
import { api } from "./api";
import UserList from "./UserList";
import AddUser from "./AddUser";
import "./App.css";

function App() {
  const [users, setUsers] = useState([]);
  const [toast, setToast] = useState(null);

  const fetchUsers = async () => {
    try {
      const res = await api.get("/users");
      setUsers(res.data);
    } catch (err) {
      console.error("❌ Lỗi khi tải dữ liệu:", err.message);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);


  // Hiển thị thông báo

  // Backend làm hoạt động 9

  const showToast = (msg, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 2500);
  };

  return (
    <div className="container">
      <h1 className="h1">👥 Quản lý người dùng</h1>

      <div className="card">
        <AddUser fetchUsers={fetchUsers} showToast={showToast} />
      </div>

      <div className="card" style={{ marginTop: "20px" }}>
        <UserList users={users} fetchUsers={fetchUsers} showToast={showToast} />
      </div>

      {toast && (
        <div className={`toast ${toast.ok ? "ok" : "err"}`}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}

export default App;
