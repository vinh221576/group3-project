//======================Cấu hình server Express=======================
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const userRoutes = require('./routes/user');
//======================Cấu hình biến môi trường=======================
dotenv.config();
const app = express();
app.use(cors()); // Cho phép frontend gọi API
app.use(express.json()); // Parse body JSON
//======================Kết nối MongoDB Atlas=======================
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ Connected to MongoDB Atlas'))
.catch(err => console.error('❌ MongoDB connection error:', err));

app.use('/', userRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));