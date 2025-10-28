// backend/controllers/authController.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');

const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '15m' } // Access token ngắn
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user._id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );
};

// API: Lấy token mới từ refresh token
exports.refreshToken = async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ message: 'Không có refresh token' });
  }

  try {
    // 1. Kiểm tra refresh token trong DB
    const storedToken = await RefreshToken.findOne({ token: refreshToken, revoked: false });
    if (!storedToken || storedToken.expiresAt < new Date()) {
      return res.status(403).json({ message: 'Refresh token không hợp lệ hoặc đã hết hạn' });
    }

    // 2. Xác thực token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ message: 'Người dùng không tồn tại' });

    // 3. Tạo access token mới
    const newAccessToken = generateAccessToken(user);

    // 4. (Tùy chọn) Tạo refresh token mới (xoay vòng)
    const newRefreshToken = generateRefreshToken(user);
    storedToken.token = newRefreshToken;
    storedToken.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await storedToken.save();

    res.json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    });
  } catch (err) {
    res.status(403).json({ message: 'Refresh token không hợp lệ' });
  }
};

// API: Logout – revoke refresh token
exports.revokeToken = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(400).json({ message: 'Cần refresh token' });

  await RefreshToken.findOneAndUpdate(
    { token: refreshToken },
    { revoked: true }
  );
  res.json({ message: 'Đã đăng xuất thành công' });
};