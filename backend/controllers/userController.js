/* The above code is a Node.js backend implementation for user authentication and profile management
functionalities. Here is a summary of what each function does: */
const crypto = require('crypto');
const cloudinary = require('cloudinary').v2;

const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const fs = require('fs');

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

    const payload = { id: user.id, role: user.role }
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" })

    // ✅ Trả lại cả token và thông tin user
    res.json({
      message: "Đăng nhập thành công!",
      token,
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


// Logout không cần API backend vì xóa token client-side, nhưng có thể thêm nếu cần
exports.logout = (req, res) => {
  res.json({ message: 'Đăng xuất thành công!' });
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



exports.uploadAvatar = async (req, res) => {
  try {
    // Kiểm tra xem file đã được upload bởi multer chưa
    if (!req.file) {
      return res.status(400).json({ message: 'Vui lòng chọn file avatar.' });
    }

    // 1. Upload file lên Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'group3-avatars', // Thư mục lưu trữ trên Cloudinary
        resource_type: 'image'
    });

    // 2. Cập nhật URL avatar vào database
    const user = await User.findById(req.user.id);
    user.avatar = result.secure_url;
    await user.save();

    // 3. Xóa file tạm thời trên server cục bộ
    fs.unlinkSync(req.file.path); 
    
    res.json({ avatar: result.secure_url, message: 'Upload avatar thành công!' });
  } catch (err) {
    // Nếu có lỗi, đảm bảo file tạm thời vẫn bị xóa
    if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ message: 'Lỗi server khi upload avatar' });
  }
};