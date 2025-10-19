const mongoose = require('mongoose');
//======================Định nghĩa mô hình người dùng=======================
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true }
});

module.exports = mongoose.model('User', userSchema);