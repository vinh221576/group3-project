import React, { useState } from "react";
import axios from "axios";

function AddUser({ fetchUsers, showToast }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation nâng cao
    if (!name.trim()) {
      showToast("⚠️ Tên không được để trống", false);
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      showToast("⚠️ Email không hợp lệ", false);
      return;
    }

    try {
      setLoading(true);
      await axios.post("http://localhost:5000/users", { name, email });
      setName("");
      setEmail("");
      fetchUsers();
      showToast("✅ Thêm người dùng thành công!");
    } catch (err) {
      showToast("❌ Lỗi khi thêm người dùng", false);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="row">
        <div>
          <div className="label">Tên người dùng</div>
          <input
            className="input"
            type="text"
            placeholder="Nhập tên..."
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div>
          <div className="label">Email</div>
          <input
            className="input"
            type="email"
            placeholder="Nhập email..."
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div style={{ marginTop: "26px" }}>
          <button className="btn" type="submit" disabled={loading}>
            {loading ? "Đang thêm..." : "➕ Thêm"}
          </button>
        </div>
      </div>
    </form>
  );
}

export default AddUser;
