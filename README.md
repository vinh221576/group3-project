# Group 3 Project 
## Mô tả
Ứng dụng quản lý người dùng với các tính năng: đăng ký, đăng nhập, refresh token, upload avatar, reset password, phân quyền (user, moderator, admin), và xem logs.

## Yêu cầu
- Node.js (v16+)
- Git

## Cài đặt
1. Clone repo:
   ```bash
   git clone https://github.com/vinh221576/group3-project.git
   cd group3-project
2. Cài đặt backend:
    cd backend
    npm install
    npm start (Chạy ứng dụng)
3. Cài đặt frontend:
    cd web
    npm install
    npm run dev (Chạy ứng dụng)
4. Chạy ứng dụng:
   Forntend: copy 'http://localhost:5173', past vào trình duyệt.

## Tính năng
Đăng ký (/signup)
Đăng nhập (/login)
Hồ sơ cá nhân (/profile) - Protected Route
Quản lý người dùng (/admin/users) - Chỉ admin
Xem logs (/admin/logs) - Chỉ admin
Upload avatar, reset password

## Hướng dẫn test
Tạo tài khoản: /signup
Đăng nhập: /login
Kiểm tra phân quyền: Thử /admin/users với user, moderator, admin.

## Thành viên nhóm
SV1: Đinh Trung Vĩnh
SV2: Nguyễn Hữu Ngạn
SV3: Trương Anh Tuấn



