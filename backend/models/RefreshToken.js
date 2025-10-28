// models/RefreshToken.js
const mongoose = require('mongoose');

const RefreshTokenSchema = new mongoose.Schema({
  token: { 
    type: String, 
    required: true, 
    unique: true 
  },
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  expiresAt: { 
    type: Date, 
    required: true 
  }
}, { timestamps: true });

module.exports = mongoose.model('RefreshToken', RefreshTokenSchema);