"use client"

import { useState } from "react"
import { Link } from "react-router-dom"

import { api } from "../api.js"
import { Eye, EyeOff, Loader2, CheckCircle, AlertCircle } from "lucide-react"

export default function AuthForm({ mode = "login" }) {
  const [form, setForm] = useState({ name: "", email: "", password: "" })
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState("")
  const [msgType, setMsgType] = useState("") // "success" or "error"

  const title = mode === "login" ? "Đăng nhập" : "Tạo tài khoản"
  const subtitle = mode === "login" ? "Chào mừng bạn trở lại 👋" : "Bắt đầu hành trình mới ✨"
  const buttonText = mode === "login" ? "Đăng nhập" : "Đăng ký"
  const toggleText = mode === "login" ? "Chưa có tài khoản?" : "Đã có tài khoản?"
  const toggleLink = mode === "login" ? "/signup" : "/login"
  const toggleLinkText = mode === "login" ? "Đăng ký ngay" : "Đăng nhập"

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMsg("")
    setMsgType("")

    try {
      const endpoint = mode === "login" ? "/login" : "/signup"
      const payload = mode === "login" ? { email: form.email, password: form.password } : form

      const { data } = await api.post(endpoint, payload)
      localStorage.setItem("token", data?.token || "")
      setMsg(mode === "login" ? "Đăng nhập thành công! 🎉" : "Đăng ký thành công! 🎉")
      setMsgType("success")

      // Reset form
      setTimeout(() => {
        setForm({ name: "", email: "", password: "" })
      }, 1500)
    } catch (err) {
      const errorMsg = err?.response?.data?.msg || "Có lỗi xảy ra, vui lòng thử lại!"
      setMsg(errorMsg)
      setMsgType("error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 mb-4">
            <span className="text-white font-bold text-lg">A</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">{title}</h1>
          <p className="text-slate-400">{subtitle}</p>
        </div>

        {/* Form Card */}
        <div className="relative group mb-6">
          {/* Gradient border effect */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-500 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-300" />

          <form
            onSubmit={submit}
            className="relative bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 space-y-5"
          >
            {/* Name field - only for signup */}
            {mode === "signup" && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300">Tên hiển thị</label>
                <input
                  type="text"
                  placeholder="Nguyễn Văn A"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  className="w-full px-4 py-3 rounded-lg bg-slate-700/50 border border-slate-600/50 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>
            )}

            {/* Email field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                className="w-full px-4 py-3 rounded-lg bg-slate-700/50 border border-slate-600/50 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>

            {/* Password field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">Mật khẩu</label>
              <div className="flex gap-2">
                <input
                  type={showPwd ? "text" : "password"}
                  placeholder="Tối thiểu 6 ký tự"
                  minLength={6}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  className="flex-1 px-4 py-3 rounded-lg bg-slate-700/50 border border-slate-600/50 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="px-4 py-3 rounded-lg bg-slate-700/50 border border-slate-600/50 text-slate-400 hover:text-slate-300 hover:bg-slate-700 transition"
                  title={showPwd ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  {showPwd ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 px-4 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold hover:from-blue-600 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                buttonText
              )}
            </button>
          </form>
        </div>

        {/* Message feedback */}
        {msg && (
          <div
            className={`flex items-center gap-3 px-4 py-3 rounded-lg border backdrop-blur-sm animate-in fade-in slide-in-from-top-2 duration-300 ${
              msgType === "success"
                ? "bg-green-500/10 border-green-500/30 text-green-300"
                : "bg-red-500/10 border-red-500/30 text-red-300"
            }`}
          >
            {msgType === "success" ? (
              <CheckCircle size={18} className="flex-shrink-0" />
            ) : (
              <AlertCircle size={18} className="flex-shrink-0" />
            )}
            <p className="text-sm">{msg}</p>
          </div>
        )}

        {/* Toggle link */}
        <div className="text-center mt-6">
          <p className="text-slate-400 text-sm">
            {toggleText}{" "}
            <Link to={toggleLink} className="text-blue-400 hover:text-blue-300 font-semibold transition">
              {toggleLinkText}
            </Link>
          </p>
        </div>

        {/* Footer info */}
        <div className="mt-8 pt-6 border-t border-slate-700/50 text-center">
          <p className="text-xs text-slate-500">Dữ liệu của bạn được bảo vệ bằng mã hóa end-to-end</p>
        </div>
      </div>
    </main>
  )
}
