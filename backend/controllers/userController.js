const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

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
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Thông tin xác thực không hợp lệ' });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Thông tin xác thực không hợp lệ' });
    const payload = { id: user.id, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }); 
    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: 'Server lỗi' });
  }
};

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

