//======================Định nghĩa tuyến đường người dùng=======================
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
//======================Định nghĩa các tuyến đường người dùng=======================
router.get('/users', userController.getUsers);
router.post('/users', userController.createUser);

// Thêm PUT và DELETE
router.put('/users/:id', userController.updateUser);
router.delete('/users/:id', userController.deleteUser);
module.exports = router;