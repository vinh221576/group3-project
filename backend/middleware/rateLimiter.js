// middleware/rateLimiter.js
const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 phút
    max: 5, // Cho phép 5 lần thử trong 15 phút
    message: 
        "Quá nhiều lần thử đăng nhập từ IP này, vui lòng thử lại sau 15 phút.",
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = { loginLimiter };