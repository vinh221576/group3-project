// const express = require('express');
// const cors = require('cors');
// const app = express();

// app.use(cors());
// app.use(express.json());

// // 👉 import router
// const userRoutes = require('./routes/user');

// // 👉 sử dụng router với tiền tố /api
// app.use('/api', userRoutes);

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const userRoutes = require('./routes/user');

dotenv.config();
const app = express();
app.use(express.json());

// 🔹 Kết nối MongoDB Atlas
mongoose.connect("mongodb+srv://tuan220616_db_user:anhtuan@cluster0.z7mczed.mongodb.net/groupDB?retryWrites=true&w=majority&appName=Cluster0", {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ Connected to MongoDB Atlas'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// 🔹 Sử dụng route
app.use('/', userRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));