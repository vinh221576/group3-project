const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// SỬA DÒNG NÀY: Giờ đã lấy cả authMiddleware và adminMiddleware
const { authMiddleware, adminMiddleware } = require('../middleware/auth'); 

// TÍNH NĂNG REFRESH TOKEN
router.post('/refresh-token', userController.refreshToken); 
// Cần SỬA router.get('/logout', ...) thành router.post('/logout', ...) 
// để có thể gửi Refresh Token trong body (nếu cần)
router.post('/logout', userController.logout); // SỬA NẾU CẦN GỬI BODY

module.exports = router;
