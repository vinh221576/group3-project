import React, { useState } from "react";
import axios from "axios";

function AddUser({ fetchUsers }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Gửi dữ liệu tới backend
      const response = await axios.post("http://localhost:5000/users", { name, email });

      // Nếu thêm thành công (status = 201)
      if (response.status === 201) {
        console.log("✅ User added successfully:", response.data);
        setName("");
        setEmail("");

        // Gọi lại hàm load danh sách user
        await fetchUsers();
      }
    } catch (err) {
      console.error("❌ Error adding user:", err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>Thêm người dùng</h3>
      <input
        type="text"
        placeholder="Tên"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <button type="submit">Thêm</button>
    </form>
  );
}

export default AddUser;
