const express = require('express');
const app = express();
app.use(express.json()); // Cần để parse body JSON
const userRoutes = require('./routes/user'); // Import route
app.use('/', userRoutes); // Đăng ký route
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
const cors = require('cors');
app.use(cors()); // Cho phép CORS cho tất cả các route