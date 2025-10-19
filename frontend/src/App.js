import React, { useState, useEffect } from "react";
import axios from "axios";
import UserList from "./UserList";
import AddUser from "./AddUser";

function App() {
  const [users, setUsers] = useState([]);

  // Hàm tải danh sách user từ backend
  const fetchUsers = async () => {
    try {
      const res = await axios.get("http://localhost:5000/users");
      console.log("✅ Dữ liệu user từ server:", res.data);
      setUsers(res.data);
    } catch (err) {
      console.error("❌ Lỗi khi tải users:", err.message);
    }
  };

  // Gọi API khi load trang
  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div>
      <h2>Danh sách người dùng</h2>
      <UserList users={users} />
      <AddUser fetchUsers={fetchUsers} />
    </div>
  );
}

export default App;
