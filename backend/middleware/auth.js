const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const authHeader = req.header('Authorization');

  // 1. Kiểm tra header và định dạng Bearer
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Không có token thông báo hoặc định dạng không hợp lệ, ủy quyền bị từ chối' });
  }

  // 2. Lấy token
  const token = authHeader.split(' ')[1];

  try {
    // 3. Xác thực token (Sử dụng process.env.JWT_SECRET)
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 4. Gán payload của token vào req.user
    req.user = decoded; // req.user giờ chứa { id: <userId>, iat: ..., exp: ... }
    
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token thông báo không hợp lệ' });
  }
};

const adminMiddleware = (req, res, next) => {
    // Lưu ý: req.user phải chứa thông tin role (được gán trong token lúc đăng nhập)
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Quyền truy cập bị từ chối: Yêu cầu vai trò Admin' });
    }
    next();
};

module.exports = { authMiddleware, adminMiddleware };
