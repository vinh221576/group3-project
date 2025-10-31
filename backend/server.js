const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const dotenv = require('dotenv');
dotenv.config();


// ************** BẮT ĐẦU CẤU HÌNH ************

// 1. Thêm thư viện Cloudinary và Multer
const cloudinary = require('cloudinary').v2;
// 2. Cấu hình Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const multer = require('multer');
// 3. Cấu hình Multer (Đã được tạo, giờ chúng ta sẽ EXPORT nó)
const upload = multer({ dest: 'uploads/' });



// Tạo ứng dụng Express (Phải đặt ở đây)
const app = express();

const userRoutes = require('./routes/user'); 
// Dòng này cần thay đổi nếu bạn muốn truyền upload từ đây
// Tốt nhất, hãy giữ cho server.js đơn giản và sửa routes/user.js (Xem dưới đây)

// ************** KẾT THÚC CẤU HÌNH **************

// MIDDLEWARE (PHẢI TRƯỚC ROUTES)
app.use(cors()); // Cho phép frontend gọi API
app.use(express.json()); // Parse body JSON
app.use(express.urlencoded({ extended: true }));

// DÒNG ĐỊNH TUYẾN CHÍNH: Tất cả user routes bắt đầu bằng /users
app.use('/users', userRoutes); 

// server.js – thêm dòng này
const authRoutes = require('./routes/auth');
app.use('/auth', authRoutes);

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ Đã kết nối đến MongoDB Atlas'))
.catch(err => console.error('❌ MongoDB kết nối lỗi:', err));

// DÒNG DƯ THỪA ĐÃ ĐƯỢC XÓA BỎ: app.use('/', userRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server đang chạy trên port ${PORT}`));

