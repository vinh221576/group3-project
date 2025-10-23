# Group 3 Project: Quản lý users

# Mô tả
Đây là ứng dụng quản lý người dùng sử dụng Node.js (backend), React (frontend), và MongoDB (database). Ứng dụng hỗ trợ CRUD đầy đủ cho users (GET, POST, PUT, DELETE).

## Công nghệ sử dụng
- Backend: Node.js, Express, Mongoose
- Frontend: React, Axios
- Database: MongoDB Atlas
- Tools: Git, GitHub, Postman

## Hướng dẫn chạy
1. Clone repo: git clone https://github.com/vinh221576/group3-project.git
2. Backend: cd backend > npm install > nodemon server.js (cần .env với MONGO_URI hoặc có thể gọi trực tiếp tại file)
3. Frontend: cd frontend > npm install > npm start
4. Test API: Sử dụng Postman với http://localhost:5000/users

## Đóng góp từng thành viên
- Vĩnh (Sinh viên 1): Backend (Node.js + Express), API CRUD.
    Vai trò: Phát triển backend.
    Công việc: Thiết lập server Express, xây dựng API CRUD, tích hợp MongoDB sau khi nhận schema từ Tuấn. Gặp khó khăn với CORS và xung đột merge, đã debug và resolve bằng cách điều chỉnh code và sử dụng Git.

- Ngạn (Sinh viên 2): Frontend (React), kết nối API, validation.
    Vai trò: Phát triển frontend.
    Công việc: Thiết kế giao diện React, kết nối API qua Axios, thêm validation (như kiểm tra email). Đối mặt với vấn đề đồng bộ dữ liệu, đã sử dụng Postman và điều chỉnh state trong React.

- Tuấn (Sinh viên 3): Database (MongoDB), model và tích hợp.
    Vai trò: Quản lý database.
    Công việc: Cấu hình MongoDB Atlas, tạo schema User, tích hợp với backend. Gặp lỗi khi merge nhánh database (xóa nhầm file), đã phối hợp với Vĩnh để khôi phục và resolve xung đột.

## Vấn đề và Giải quyết
- Vấn đề 1: Kết nối MongoDB. Lỗi kết nối do sai MONGO_URI hoặc thiếu package Mongoose.
    -> Giải pháp: Kiểm tra .env, cài lại dependencies (npm install mongoose), và debug qua console.log.

- Vấn đề 2: Đồng bộ Frontend-Backend. Dữ liệu không cập nhật ngay lập tức trên frontend.
    -> Giải pháp: Thêm reload state trong React và kiểm tra API qua Postman.
