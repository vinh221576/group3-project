import axios from "axios"

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/users",
})

// 🔹 Gắn accessToken vào header
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken")
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// 🔹 Xử lý refresh token khi token hết hạn
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config
    if (err.response?.status === 403 && !original._retry) {
      original._retry = true
      try {
        const refreshToken = localStorage.getItem("refreshToken")
        if (!refreshToken) throw new Error("Không có refresh token")

        const { data } = await axios.post(
          `${import.meta.env.VITE_API_URL || "http://localhost:5000/users"}/refresh-token`,
          { refreshToken }
        )

        localStorage.setItem("accessToken", data.accessToken)
        api.defaults.headers.common["Authorization"] = `Bearer ${data.accessToken}`

        return api(original)
      } catch {
        console.warn("❌ Refresh token hết hạn, cần đăng nhập lại.")
        localStorage.clear()
        window.location.href = "/login"
      }
    }
    return Promise.reject(err)
  }
)

export default api
