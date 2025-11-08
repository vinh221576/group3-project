import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import api from "../api"

// 🧠 Đăng nhập
export const loginUser = createAsyncThunk("auth/loginUser", async (formData, thunkAPI) => {
  try {
    const res = await api.post("/login", formData)
    const { user, accessToken, refreshToken } = res.data
    localStorage.setItem("user", JSON.stringify(user))
    localStorage.setItem("accessToken", accessToken)
    localStorage.setItem("refreshToken", refreshToken)
    localStorage.setItem("role", user.role)
    return { user, accessToken, refreshToken }
  } catch (err) {
    const status = err.response?.status
    const message =
      err.response?.data?.message || err.message || "Đăng nhập thất bại"

    // 🔹 Hợp nhất hành vi: mọi lỗi đều THROW để FE bắt được
    throw { response: { status, data: { message } } }
  }
})

// 🧠 Đăng xuất
export const logoutUser = createAsyncThunk("auth/logoutUser", async (_, thunkAPI) => {
  try {
    const refreshToken = localStorage.getItem("refreshToken")
    await api.post("/logout", { refreshToken })
  } catch {}
  localStorage.clear()
  return true
})

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: JSON.parse(localStorage.getItem("user")) || null,
    accessToken: localStorage.getItem("accessToken") || null,
    refreshToken: localStorage.getItem("refreshToken") || null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user
        state.accessToken = action.payload.accessToken
        state.refreshToken = action.payload.refreshToken
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null
        state.accessToken = null
        state.refreshToken = null
      })
  },
})

export default authSlice.reducer
