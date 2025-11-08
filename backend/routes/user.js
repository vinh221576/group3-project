const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// SỬA DÒNG NÀY: Giờ đã lấy cả authMiddleware và adminMiddleware
// const { authMiddleware, adminMiddleware } = require('../middleware/auth'); 
const { authMiddleware, checkRole } = require('../middleware/auth');
const Log = require("../models/Log");
const { logActivity} = require('../middleware/logger');
const { loginLimiter } = require('../middleware/rateLimiter');

// 1. TẠO LẠI MULTER TẠI ĐÂY để nó có thể được sử dụng
const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); // Phải khớp với thư mục Multer đã được cấu hình
router.post('/upload-avatar', upload.single('avatar'), authMiddleware, userController.uploadAvatar);

router.post('/signup', userController.signup);
// router.post('/login', userController.login);
//router.get('/logout', userController.logout); // Optional

// Them chuc nang lay va cap nhat profile
router.get('/profile', authMiddleware, userController.getProfile);
//router.put('/profile', authMiddleware, userController.updateProfile);

//Thêm chức năng xóa chính mình cho user(role)
router.delete('/profile', authMiddleware, userController.deleteSelf); 

// Chcứ năng ấy danh sách và xóa người dùng của Admin routes
// router.get('/', authMiddleware, adminMiddleware, userController.getUsers);
// router.delete('/:id', authMiddleware, adminMiddleware, userController.deleteUser);

// Chức năng lấy danh sách và xóa người dùng của Admin routes
// Chỉ Admin được xem danh sách users
//Mới thêm moderator 12:6 1/1/2025
router.get('/', authMiddleware, checkRole(['admin', 'moderator']), userController.getUsers); 
// Chỉ Admin được xóa users
// router.delete('/:id', authMiddleware, checkRole('admin'), userController.deleteUser);
// THÊM: API Cập nhật vai trò (Chỉ Admin được làm)

// SV1 THÊM API này vào controller
router.put('/update-role/:id', authMiddleware, checkRole('admin'), userController.updateUserRole);

// TÍNH NĂNG FORGOT/RESET PASSWORD (Không cần authMiddleware)
router.post('/forgot-password', userController.forgotPassword);
router.put('/reset/:token', userController.resetPassword);

// TÍNH NĂNG REFRESH TOKEN
router.post('/refresh-token', userController.refreshToken); 
// Cần SỬA router.get('/logout', ...) thành router.post('/logout', ...) 
// để có thể gửi Refresh Token trong body (nếu cần)
router.post('/logout', userController.logout); // SỬA NẾU CẦN GỬI BODY

// Ghi log khi update profile thành công
router.put('/profile', authMiddleware, logActivity('UPDATE_PROFILE'), userController.updateProfile);
// Ghi log khi Admin xóa user
router.delete('/:id', authMiddleware, checkRole('admin'), logActivity('DELETE_USER'), userController.deleteUser);

router.post('/login', loginLimiter, userController.login); // Áp dụng rate limiter cho login

module.exports = router;

router.get("/logs", authMiddleware, async (req, res) => {
  try {
    // 🔹 Chỉ admin được phép xem
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Không có quyền truy cập logs" });
    }

    // 🔹 Lấy tất cả logs, join với User
    const logs = await Log.find()
      .populate("userId", "name email")
      .sort({ timestamp: -1 })
      .limit(100);

    res.json(logs);
  } catch (error) {
    console.error("Lỗi khi lấy logs:", error.message);
    res.status(500).json({ message: "Lỗi server khi tải logs" });
  }
});
