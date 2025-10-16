// const express = require('express');
// const router = express.Router();

// // Tạo route tạm kiểm tra
// router.get('/', (req, res) => {
//   res.send('User route working!');
// });

// module.exports = router; // ⚠️ Quan trọng: phải có dòng này

//=========================================================
// const express = require('express');
// const router = express.Router();

// // ✅ route test cơ bản
// router.get('/users', (req, res) => {
//   res.json([{ id: 1, name: 'Test User', email: 'test@example.com' }]);
// });

// module.exports = router; // ⚠️ Dòng này bắt buộc phải có
//=========================================================
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// GET /api/users
router.get('/users', userController.getUsers);

// POST /api/users
router.post('/users', userController.createUser);

module.exports = router;

