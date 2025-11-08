import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "../redux/authSlice";
import { Eye, EyeOff, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import "../styles/AuthForm.css";
import api from "../api";

export default function AuthForm({ mode = "login" }) {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [showPwd, setShowPwd] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { loading } = useSelector((s) => s.auth);

  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState(""); // success | error | lockout
  const [cooldown, setCooldown] = useState(0);
  const [intervalId, setIntervalId] = useState(null);

  const title = mode === "login" ? "Đăng nhập" : "Tạo tài khoản";
  const subtitle = mode === "login" ? "Chào mừng bạn trở lại 👋" : "Bắt đầu hành trình mới ✨";
  const buttonText = mode === "login" ? "Đăng nhập" : "Đăng ký";

  // 🕒 Đếm ngược cooldown
  const startCooldown = (seconds) => {
    setCooldown(seconds);
    if (intervalId) clearInterval(intervalId);
    const id = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(id);
          localStorage.removeItem("lockUntil");
          setMsg("");
          setMsgType("");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    setIntervalId(id);
  };

  // 🔍 Kiểm tra nếu bị khóa và reset form khi tải trang
  useEffect(() => {
    setForm({ name: "", email: "", password: "" }); // Reset form khi tải trang
    const lockUntil = localStorage.getItem("lockUntil");
    const logoutCount = Number(localStorage.getItem("logoutCount") || 0);

    if (lockUntil && Date.now() < Number(lockUntil)) {
      const remaining = Math.ceil((Number(lockUntil) - Date.now()) / 1000);
      setMsg(`🚫 Tài khoản đang bị tạm khóa. Thử lại sau ${remaining}s.`);
      setMsgType("lockout");
      startCooldown(remaining);
      return;
    }

    if (logoutCount >= 5) {
      const lockTime = Date.now() + 60 * 1000;
      localStorage.setItem("lockUntil", lockTime);
      localStorage.setItem("logoutCount", 0);
      setMsg("⚠️ Đăng nhập / đăng xuất quá nhiều lần. Tạm khóa 1 phút.");
      setMsgType("lockout");
      startCooldown(60);
    }
  }, [location.pathname]); // Reset khi thay đổi pathname

  // ===========================================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    setMsgType("");

    const lockUntil = localStorage.getItem("lockUntil");
    if (lockUntil && Date.now() < Number(lockUntil)) {
      const remaining = Math.ceil((Number(lockUntil) - Date.now()) / 1000);
      setMsg(`⚠️ Bạn đang bị tạm khóa. Thử lại sau ${remaining}s.`);
      setMsgType("lockout");
      startCooldown(remaining);
      return;
    }

    // ---------------- Đăng ký ----------------
    if (mode === "signup") {
      try {
        await api.post("/signup", form);
        setMsg("✅ Đăng ký thành công! Vui lòng đăng nhập.");
        setMsgType("success");
        setForm({ name: "", email: "", password: "" }); // Reset form sau thành công
      } catch (err) {
        setMsg(err.response?.data?.message || "Đăng ký thất bại.");
        setMsgType("error");
      }
      return;
    }

    // ---------------- Đăng nhập ----------------
    try {
      const result = await dispatch(loginUser(form));
      const payload = result.payload;
      const status =
        result.error?.status ||
        result.payload?.status ||
        result?.meta?.status ||
        result?.error?.response?.status ||
        200;
      const message =
        payload?.message?.toLowerCase?.() ||
        result.error?.message?.toLowerCase?.() ||
        "";

      // 🟢 Đăng nhập thành công
      if (result.meta.requestStatus === "fulfilled") {
        localStorage.removeItem("lockUntil");
        localStorage.removeItem("failCount");

        setMsg("🎉 Đăng nhập thành công!");
        setMsgType("success");

        setTimeout(() => {
          const role = payload.user.role;
          if (role === "admin") navigate("/admin/users");
          else if (role === "moderator") navigate("/moderator");
          else navigate("/profile");
        }, 500);
        return;
      }

      // ❌ Nếu backend báo lỗi (400 / 429)
      if (status === 400 || status === 429 || message.includes("too many")) {
        const count = Number(localStorage.getItem("failCount") || 0) + 1;
        localStorage.setItem("failCount", count);

        if (count >= 5) {
          const lockTime = Date.now() + 60 * 1000;
          localStorage.setItem("lockUntil", lockTime);
          localStorage.setItem("failCount", 0);
          setMsg("⚠️ Nhập sai mật khẩu quá nhiều lần. Tạm khóa 1 phút.");
          setMsgType("lockout");
          startCooldown(60);
          return;
        }

        setMsg("❌ Mật khẩu hoặc email không đúng. Thử lại.");
        setMsgType("error");
        return;
      }

      throw new Error("Đăng nhập thất bại.");
    } catch (err) {
      const status =
        err?.response?.status ||
        err?.error?.response?.status ||
        err?.status ||
        err?.error?.status ||
        400;
      const message =
        err?.response?.data?.message ||
        err?.error?.response?.data?.message ||
        err?.message ||
        "Đăng nhập thất bại";

      console.warn("Auth error:", message, "| status:", status);

      // ⚠️ Sai mật khẩu
      if (status === 400 || message.toLowerCase().includes("xác thực")) {
        const failCount = Number(localStorage.getItem("failCount") || 0) + 1;
        localStorage.setItem("failCount", failCount);
        if (failCount >= 5) {
          const lockTime = Date.now() + 60 * 1000;
          localStorage.setItem("lockUntil", lockTime);
          localStorage.setItem("failCount", 0);
          setMsg("⚠️ Nhập sai mật khẩu quá nhiều lần. Tạm khóa 1 phút.");
          setMsgType("lockout");
          startCooldown(60);
          return;
        }
        setMsg("❌ Mật khẩu không đúng. Thử lại.");
        setMsgType("error");
        return;
      }

      setMsg("❌ Đăng nhập thất bại. Thử lại sau ít phút.");
      setMsgType("error");
    } finally {
      setForm({ name: "", email: "", password: "" }); // Reset form sau khi submit
    }
  };

  // ===========================================================
  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">A</div>
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>

        {msg && msgType !== "lockout" && (
          <div className={`message ${msgType}`}>
            {msgType === "success" ? (
              <CheckCircle size={16} />
            ) : (
              <AlertCircle size={16} />
            )}
            <span>{msg}</span>
          </div>
        )}

        {msgType === "lockout" ? (
          <div className="lockout-card">
            <h2>🚫 Tạm khóa đăng nhập</h2>
            <p>{msg}</p>
            <p>
              Thử lại sau <b>{cooldown}s</b>
            </p>
          </div>
        ) : (
          <form className="auth-form" onSubmit={handleSubmit}>
            {mode === "signup" && (
              <div className="form-group">
                <label>Tên hiển thị</label>
                <input
                  type="text"
                  name="name"
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
                name="email"
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
                  name="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                />
                <button
                  type="button"
                  className="toggle-eye"
                  onClick={() => setShowPwd(!showPwd)}
                >
                  {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {mode === "login" && (
              <div className="forgot-link">
                <Link to="/forgot-password" className="link">
                  Quên mật khẩu?
                </Link>
              </div>
            )}

            <button
              type="submit"
              className="submit-btn"
              disabled={loading || cooldown > 0}
            >
              {loading ? (
                <Loader2 className="spin" />
              ) : cooldown > 0 ? (
                `Thử lại sau ${cooldown}s`
              ) : (
                buttonText
              )}
            </button>
          </form>
        )}

        {msgType !== "lockout" && (
          <div className="toggle-text">
            {mode === "login" ? (
              <>
                Chưa có tài khoản?{" "}
                <Link to="/signup" className="link">
                  Đăng ký
                </Link>
              </>
            ) : (
              <>
                Đã có tài khoản?{" "}
                <Link to="/login" className="link">
                  Đăng nhập
                </Link>
              </>
            )}
          </div>
        )}

        <footer className="auth-footer">
          © {new Date().getFullYear()} Group 3
        </footer>
      </div>
    </div>
  );
}