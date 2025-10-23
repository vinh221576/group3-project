const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const dotenv = require('dotenv');
dotenv.config();

const userRoutes = require('./routes/user');
const app = express();

// MIDDLEWARE (PHẢI TRƯỚC ROUTES)
app.use(cors()); // Cho phép frontend gọi API
app.use(express.json()); // Parse body JSON

// DÒNG ĐỊNH TUYẾN CHÍNH: Tất cả user routes bắt đầu bằng /users
app.use('/users', userRoutes); 

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ Connected to MongoDB Atlas'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// DÒNG DƯ THỪA ĐÃ ĐƯỢC XÓA BỎ: app.use('/', userRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));