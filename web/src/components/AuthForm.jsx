"use client";

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api.js";
import { Eye, EyeOff, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import "./AuthForm.css";

export default function AuthForm({ mode = "login" }) {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState("");
  const navigate = useNavigate();

  const title = mode === "login" ? "Đăng nhập" : "Tạo tài khoản";
  const subtitle = mode === "login" ? "Chào mừng bạn trở lại 👋" : "Bắt đầu hành trình mới ✨";
  const buttonText = mode === "login" ? "Đăng nhập" : "Đăng ký";
  const toggleText = mode === "login" ? "Chưa có tài khoản?" : "Đã có tài khoản?";
  const toggleLink = mode === "login" ? "/signup" : "/login";
  const toggleLinkText = mode === "login" ? "Đăng ký ngay" : "Đăng nhập";

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    setMsgType("");

    try {
      // ✅ GỌI ĐÚNG ĐẦU MỐI BACKEND: /users/*
      const endpoint = mode === "login" ? "/users/login" : "/users/signup";
      const payload =
        mode === "login" ? { email: form.email, password: form.password } : form;

      const { data } = await api.post(endpoint, payload);
      // BE trả { token } (xem userController.js) ✅
      // 
      if (mode === "login") {
        if (!data?.token) {
          setMsg("Không nhận được token, vui lòng thử lại!");
          setMsgType("error");
          return;
        }
        // Lưu token
        localStorage.setItem("token", data.token);

        // ✅ LẤY HỒ SƠ để biết role (admin hay user)
        const me = await api.get("/users/profile", {
          headers: { Authorization: `Bearer ${data.token}` },
        });
        localStorage.setItem("currentUser", JSON.stringify(me.data));

        setMsg("Đăng nhập thành công! 🎉");
        setMsgType("success");

        // ✅ Điều hướng theo role
        if (me.data.role === "admin") {
          navigate("/admin/users");
        } else {
          navigate("/profile");
        }
      } else {
        setMsg("Đăng ký thành công! 🎉");
        setMsgType("success");
        setForm({ name: "", email: "", password: "" });
      }
    } catch (err) {
      console.error("Login error:", err);
      setMsg(
        err?.response?.data?.message ||
        err?.response?.data?.msg ||
        "Có lỗi xảy ra, vui lòng thử lại!"
      );
      setMsgType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">A</div>
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>

        <form className="auth-form" onSubmit={submit}>
          {mode === "signup" && (
            <div className="form-group">
              <label>Tên hiển thị</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
          )}

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Mật khẩu</label>
            <div className="password-field">
              <input
                type={showPwd ? "text" : "password"}
                placeholder="Tối thiểu 6 ký tự"
                minLength={6}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
              <button
                type="button"
                className="toggle-eye"
                onClick={() => setShowPwd(!showPwd)}
                title={showPwd ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              >
                {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {msg && (
            <div className={`message ${msgType}`}>
              {msgType === "success" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
              <span>{msg}</span>
            </div>
          )}

          <button className="submit-btn" type="submit" disabled={loading}>
            {loading ? (<><Loader2 size={16} className="spin" /> Đang xử lý...</>) : buttonText}
          </button>

          <p className="toggle-text">
            {toggleText} <Link to={toggleLink} className="link">{toggleLinkText}</Link>
          </p>
        </form>

        <footer className="auth-footer">
          <p>© {new Date().getFullYear()} Group 3</p>
        </footer>
      </div>
    </div>
  );
}
