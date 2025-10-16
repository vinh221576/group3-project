const express = require('express');
const router = express.Router();

// Tạo route tạm kiểm tra
router.get('/', (req, res) => {
  res.send('User route working!');
});

module.exports = router; // ⚠️ Quan trọng: phải có dòng này
