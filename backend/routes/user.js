const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// SỬA DÒNG NÀY: Giờ đã lấy cả authMiddleware và adminMiddleware
const { authMiddleware, adminMiddleware } = require('../middleware/auth'); 

// 1. TẠO LẠI MULTER TẠI ĐÂY để nó có thể được sử dụng
const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); // Phải khớp với thư mục Multer đã được cấu hình

router.post('/signup', userController.signup);
router.post('/login', userController.login);
router.get('/logout', userController.logout); // Optional

// Them chuc nang lay va cap nhat profile
router.get('/profile', authMiddleware, userController.getProfile);
router.put('/profile', authMiddleware, userController.updateProfile);
//Thêm chức năng xóa chính mình cho user(role)
router.delete('/profile', authMiddleware, userController.deleteSelf); 

// Chcứ năng ấy danh sách và xóa người dùng của Admin routes
router.get('/', authMiddleware, adminMiddleware, userController.getUsers);
router.delete('/:id', authMiddleware, adminMiddleware, userController.deleteUser);

// TÍNH NĂNG FORGOT/RESET PASSWORD (Không cần authMiddleware)
router.post('/forgot-password', userController.forgotPassword);
router.put('/reset/:token', userController.resetPassword);
// TÍNH NĂNG UPLOAD AVATAR (Cần authMiddleware và Multer)
// Multer xử lý file (upload.single('avatar')) trước khi qua authMiddleware
router.post('/upload-avatar', upload.single('avatar'), authMiddleware, userController.uploadAvatar);

module.exports = router;
