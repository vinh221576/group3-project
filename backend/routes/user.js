const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// SỬA DÒNG NÀY: Giờ đã lấy cả authMiddleware và adminMiddleware
const { authMiddleware, adminMiddleware } = require('../middleware/auth'); 

router.post('/signup', userController.signup);
router.post('/login', userController.login);
router.get('/logout', userController.logout); // Optional

// Them chuc nang lay va cap nhat profile
router.get('/profile', authMiddleware, userController.getProfile);
router.put('/profile', authMiddleware, userController.updateProfile);

// Chcứ năng ấy danh sách và xóa người dùng của Admin routes
router.get('/users', authMiddleware, adminMiddleware, userController.getUsers);
router.delete('/users/:id', authMiddleware, adminMiddleware, userController.deleteUser);

module.exports = router;