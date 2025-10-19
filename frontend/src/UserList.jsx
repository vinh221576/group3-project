import React from "react";
import axios from "axios";

function UserList({ users, fetchUsers }) {
  const handleDelete = async (id) => {
    await axios.delete(`http://localhost:5000/users/${id}`);
    fetchUsers();
  };

  const handleEdit = async (id) => {
    const newName = prompt("Nhập tên mới:");
    const newEmail = prompt("Nhập email mới:");
    if (!newName || !newEmail) return;

    try {
      await axios.put(`http://localhost:5000/users/${id}`, {
        name: newName,
        email: newEmail,
      });
      alert("✅ Cập nhật thành công!");
      fetchUsers();
    } catch (err) {
      console.error("❌ Lỗi khi cập nhật:", err);
      alert("❌ Không thể cập nhật (kiểm tra id hoặc server)!");
    }
  };

  return (
    <div>
      <ul>
        {users.map((user) => (
          <li key={user._id}>
            {user.name} - {user.email}{" "}
            <button onClick={() => handleEdit(user._id)}>✏️ Sửa</button>
            <button onClick={() => handleDelete(user._id)}>🗑️ Xóa</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default UserList;
