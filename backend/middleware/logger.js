// middleware/logger.js
const Log = require('../models/Log');

const logActivity = (action) => async (req, res, next) => {
    try {
        // Lấy userId từ JWT (authMiddleware phải chạy trước)
        const userId = req.user ? req.user.id : null;

        // Lấy địa chỉ IP (sử dụng req.ip hoặc req.headers['x-forwarded-for'] nếu qua proxy)
        const ipAddress = req.ip || req.connection.remoteAddress;

        // Chỉ log nếu có user (hoặc log các hành động không cần auth như đăng ký)
        // Thường chỉ log các hành động thành công sau khi user đã được xác thực
        if (userId) {
            const newLog = new Log({
                userId: userId,
                action: action,
                ipAddress: ipAddress
            });
            await newLog.save();
        }
        next();
    } catch (error) {
        console.error('Lỗi khi ghi log:', error);
        // Vẫn tiếp tục xử lý request ngay cả khi log thất bại
        next(); 
    }
};

module.exports = { logActivity };