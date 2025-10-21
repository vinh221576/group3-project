// const mongoose = require('mongoose');

// const userSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   email: { type: String, required: true, unique: true }
// });

// module.exports = mongoose.model('User', userSchema);


//21/10/2025 - 2:10 PM
// Cập nhật mô hình người dùng với các trường bổ sung
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  avatar: { type: String, default: '' },
  resetToken: String,
  resetTokenExpiration: Date
});

module.exports = mongoose.model('User', userSchema);