import React, { useEffect, useState } from "react";
import { api } from "./api";
import UserList from "./UserList";
import AddUser from "./AddUser";

function App() {
  const [users, setUsers] = useState([]);

  const fetchUsers = async () => {
    const res = await api.get("/users");
    setUsers(res.data);
  };

  useEffect(() => { fetchUsers(); }, []);
  // Thêm dấu gạch chéo đóng ngoặc ở đây
  return (
    <div>
      <h2>Danh sách người dùng</h2>
      <UserList users={users} fetchUsers={fetchUsers} />
      <AddUser fetchUsers={fetchUsers} />
    </div>
  );
}

export default App;
