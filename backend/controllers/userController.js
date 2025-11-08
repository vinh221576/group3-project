/* The above code is a Node.js backend implementation for user authentication and profile management
functionalities. Here is a summary of what each function does: */
const crypto = require('crypto');
const cloudinary = require('cloudinary').v2;

const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const fs = require('fs');
const sharp = require('sharp'); // Import thư viện sharp để hổ trợ xử lý ảnh

// Thêm vào userController.js
const RefreshToken = require('../models/RefreshToken'); // Import model mới
// Hỗ trợ tạo Refresh Token
const createRefreshToken = async (userId) => {
    const token = crypto.randomBytes(40).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // Ví dụ: 7 ngày

    const refreshToken = new RefreshToken({
        token,
        userId,
        expiresAt,
    });
    await refreshToken.save();
    return token;
};

exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'Người dùng đã tồn tại' });
    user = new User({ name, email, password });
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();
    const payload = { id: user.id, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }); 
    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: 'Server lỗi' });
  }
};

// controllers/userController.js - Sửa exports.login

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body
        const user = await User.findOne({ email })
        if (!user)
            return res.status(400).json({ message: "Thông tin xác thực không hợp lệ" })
        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch)
            return res.status(400).json({ message: "Thông tin xác thực không hợp lệ" })
        
        // Nếu user chưa có role thì mặc định là "user"
        if (!user.role) user.role = "user"
        
        // Access Token
        const payload = { id: user.id, role: user.role }
        const accessToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" })

        // 🟢 KHẮC PHỤC LỖI: Gọi và gán Refresh Token
        const refreshToken = await createRefreshToken(user._id); // Dùng hàm đã định nghĩa ở trên
        
        // Trả lại cả token và thông tin user
        res.json({
            message: "Đăng nhập thành công!",
            accessToken,
            refreshToken, // Biến này giờ đã có giá trị
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        })
    } catch (err) {
        console.error("Lỗi đăng nhập:", err)
        res.status(500).json({ message: "Server lỗi khi đăng nhập" })
    }
}

// // Sửa exports.logout để xóa Refresh Token khỏi DB (Revoke)
// exports.logout = async (req, res) => {
//     // Yêu cầu client gửi Refresh Token trong body/header (tùy cấu hình frontend)
//     const { refreshToken } = req.body; 
    
//     if (refreshToken) {
//         await RefreshToken.deleteOne({ token: refreshToken });
//     }

//     res.json({ message: 'Đăng xuất thành công, token đã bị thu hồi!' });
// };
exports.logout = async (req, res) => {
  try {
    const refreshToken =
      req.body?.refreshToken ||
      req.headers["x-refresh-token"] ||
      req.query?.token ||
      null;

        if (refreshToken) {
        await RefreshToken.deleteOne({ token: refreshToken });
    }

    res.json({ message: "Đăng xuất thành công, token đã bị thu hồi." });

    // 🔹 Nếu không có refreshToken => trả lỗi nhẹ, KHÔNG crash server
    if (!refreshToken) {
      return res.status(400).json({
        message: "Thiếu refresh token khi đăng xuất",
      });
    }

    const tokenDoc = await RefreshToken.findByIdAndDelete({ token: refreshToken });
    if (!tokenDoc) {
      return res.status(404).json({
        message: "Token không tồn tại hoặc đã hết hạn",
      });
    }
    
  } catch (error) {
    console.error("Lỗi BE khi logout:", error.message);
    res.status(500).json({
      message: "Đăng nhập/đăng xuất quá nhiều lần – Server đang tạm khóa xử lý.",
    });
  }
};


exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server lỗi' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, password } = req.body;
    const updates = { name };
    if (password) {
      const salt = await bcrypt.genSalt(10);
      updates.password = await bcrypt.hash(password, salt);
    }
    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true }).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server lỗi' });
  }
};

// Chức năng dành cho admin lấy danh sách và xóa người dùng
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server lỗi' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'Người dùng đã bị xóa!' });
  } catch (err) {
    res.status(500).json({ message: 'Server lỗi' });
  }
};

// Thêm chức năng xóa chính mình cho user(role)
exports.deleteSelf = async (req, res) => {
  try {
    // Sử dụng ID được trích xuất từ JWT token (req.user.id)
    const user = await User.findByIdAndDelete(req.user.id); 

    if (!user) {
        return res.status(404).json({ message: 'Không tìm thấy tài khoản để xóa.' });
    }

    res.json({ message: 'Tài khoản của bạn đã được xóa thành công!' });
  } catch (err) {
    res.status(500).json({ message: 'Server lỗi' });
  }
};

//Thêm chức năng quên mật khẩu, đặt lại mật khẩu và upload avatar
exports.forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(404).json({ message: 'Không tìm thấy người dùng!' });

    // Tạo token reset
    const token = crypto.randomBytes(20).toString('hex');
    user.resetToken = token;
    user.resetTokenExpiration = Date.now() + 3600000; // 1 giờ
    await user.save();

    const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, 
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
});
    // KẾT THÚC CẤU HÌNH NODEMAILER MỚI

    // Gửi email
    const mailOptions = {
        to: user.email,
        subject: 'Yêu cầu Đặt lại Mật khẩu',
        text: `Bạn nhận được email này vì bạn (hoặc người khác) đã yêu cầu đặt lại mật khẩu cho tài khoản của bạn.\n\n` +
              `Vui lòng nhấp vào liên kết sau hoặc dán nó vào trình duyệt của bạn để hoàn tất quá trình:\n\n` +
              `http://localhost:5173/reset?token=${token}\n\n` +
              `Nếu bạn không yêu cầu điều này, vui lòng bỏ qua email này và mật khẩu của bạn sẽ không thay đổi.`
    };
    
    await transporter.sendMail(mailOptions);
    res.json({ message: 'Email đặt lại mật khẩu đã được gửi' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server khi gửi email' });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { password } = req.body;
    const token = req.params.token;

    const user = await User.findOne({ resetToken: token });
    if (!user) return res.status(400).json({ message: "Không tìm thấy user với token này." });

    if (user.resetTokenExpiration < Date.now())
      return res.status(400).json({ message: "Token đã hết hạn." });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    user.resetToken = undefined;
    user.resetTokenExpiration = undefined;
    await user.save();

    res.json({ message: "Đặt lại mật khẩu thành công!" });
  } catch (err) {
    console.error("Lỗi reset password:", err);
    res.status(500).json({ message: "Lỗi server khi đặt lại mật khẩu" });
  }
};

// Sửa exports.uploadAvatar
exports.uploadAvatar = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Vui lòng chọn file avatar.' });
        }

        const filePath = req.file.path;

        // 1. Dùng Sharp để resize ảnh
        const resizedImagePath = filePath + '_resized.jpg';
        await sharp(filePath)
            .resize(200, 200) // Resize thành 200x200
            .toFormat('jpeg')
            .jpeg({ quality: 90 })
            .toFile(resizedImagePath);

        // 2. Upload file ĐÃ RESIZE lên Cloudinary
        const result = await cloudinary.uploader.upload(resizedImagePath, {
            folder: 'group3-avatars', 
            resource_type: 'image'
        });

        // 3. Cập nhật URL avatar và Xóa file tạm thời
        const user = await User.findById(req.user.id);
        user.avatar = result.secure_url;
        await user.save();
        
        fs.unlinkSync(filePath); // Xóa file gốc
        fs.unlinkSync(resizedImagePath); // Xóa file đã resize

        res.json({ avatar: result.secure_url, message: 'Upload avatar thành công!' });
    } catch (err) {
    // Nếu có lỗi, đảm bảo file tạm thời vẫn bị xóa
    if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ message: 'Lỗi server khi upload avatar' });
  }
};

// controllers/userController.js - THÊM
exports.refreshToken = async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(401).json({ message: "Refresh Token bị thiếu" });
    }

    try {
        // 1. Tìm token trong DB
        const storedToken = await RefreshToken.findOne({ token: refreshToken });

        if (!storedToken || storedToken.expiresAt < Date.now()) {
            // Nếu token không tồn tại hoặc hết hạn, xóa token lỗi (nếu có)
            if (storedToken) await storedToken.deleteOne();
            return res.status(401).json({ message: "Refresh Token không hợp lệ hoặc hết hạn" });
        }

        // 2. Tái tạo Access Token MỚI
        const user = await User.findById(storedToken.userId);
        if (!user) return res.status(404).json({ message: "Không tìm thấy người dùng" });

        const payload = { id: user.id, role: user.role };
        const newAccessToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });

        // 3. Xóa token cũ và tạo token mới để tăng bảo mật (Rotating Refresh Tokens)
        await storedToken.deleteOne();
        const newRefreshToken = await createRefreshToken(user._id);

        res.json({
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
        });

    } catch (err) {
        res.status(500).json({ message: "Server lỗi khi Refresh Token" });
    }
};

// controllers/userController.js - THMÊ CHỨC NNĂG UPDATE VAI TRÒ NGƯỜI DÙNG

exports.updateUserRole = async (req, res) => {
    try {
        const { role } = req.body;
        const userId = req.params.id;

        // Đảm bảo vai trò được gửi lên hợp lệ (Optional: Thêm kiểm tra enum ở đây)
        if (!['user', 'admin', 'moderator'].includes(role)) {
            return res.status(400).json({ message: 'Vai trò không hợp lệ.' });
        }

        // Không cho Admin tự hạ cấp chính mình (ngăn ngừa lock-out)
        if (req.user.id === userId && role !== 'admin') {
             return res.status(403).json({ message: 'Không được tự thay đổi vai trò Admin của chính mình.' });
        }

        const user = await User.findByIdAndUpdate(
            userId, 
            { role: role }, 
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng.' });
        }

        res.json({ message: `Cập nhật vai trò thành ${role} thành công.`, user: user });

    } catch (err) {
        console.error("Lỗi cập nhật vai trò:", err);
        res.status(500).json({ message: 'Server lỗi khi cập nhật vai trò.' });
    }
};