// let users = [];
// let nextId = 1;

// exports.getUsers = (req, res) => res.json(users);

// exports.createUser = (req, res) => {
//   const { name, email } = req.body;
//   if (!name || !email) return res.status(400).json({ message: 'Thiếu name hoặc email' });
//   const newUser = { id: nextId++, name, email };
//   users.push(newUser);
//   res.status(201).json(newUser);
// };
let users = []; // Mảng lưu trữ người dùng tạm thời
let nextId = 1; // ID cho người dùng mới

// GET tất cả người dùng
exports.getUsers = (req, res) => {
  res.json(users); // Trả về toàn bộ danh sách users
};

// POST thêm người dùng mới
exports.createUser = (req, res) => {
  const { name, email } = req.body; // Lấy dữ liệu từ body của POST request
  if (!name || !email) {
    return res.status(400).json({ message: 'Thiếu name hoặc email' });
  }

  const newUser = { id: nextId++, name, email };
  users.push(newUser); // Thêm người dùng vào mảng
  res.status(201).json(newUser); // Trả về thông tin người dùng vừa tạo
};
