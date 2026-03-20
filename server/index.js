const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
require('dotenv').config();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// 测试数据库连接
app.get('/api/test', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT 1 + 1 AS result');
    res.json({ message: '数据库连接成功', data: rows });
  } catch (error) {
    res.status(500).json({ message: '数据库连接失败', error: error.message });
  }
});

// 获取表列表
app.get('/api/tables', async (req, res) => {
  try {
    const [rows] = await pool.query('SHOW TABLES');
    res.json({ tables: rows });
  } catch (error) {
    res.status(500).json({ message: '获取表列表失败', error: error.message });
  }
});

// 通用获取表数据
app.get('/api/tables/:tableName', async (req, res) => {
  try {
    const tableName = req.params.tableName;
    const [rows] = await pool.query(`SELECT * FROM ${tableName} LIMIT 100`);
    res.json({ data: rows });
  } catch (error) {
    res.status(500).json({ message: '获取表数据失败', error: error.message });
  }
});

// ==================== 商品接口 ====================
app.post('/api/tables/products', async (req, res) => {
  const { name, price, originalPrice, sales, categoryId, tags, image, amount } = req.body;
  try {
    await pool.query(
      'INSERT INTO products (name, price, originalPrice, sales, categoryId, tags, image, amount) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [name, price, originalPrice, sales, categoryId, tags, image, amount]
    );
    res.json({ success: true, message: '数据添加成功' });
  } catch (error) {
    res.status(500).json({ success: false, message: '添加失败', error: error.message });
  }
});

app.put('/api/tables/products/:id', async (req, res) => {
  const id = req.params.id;
  const { name, price, originalPrice, sales, categoryId, tags, image, amount } = req.body;
  try {
    await pool.query(
      'UPDATE products SET name=?, price=?, originalPrice=?, sales=?, categoryId=?, tags=?, image=?, amount=? WHERE id=?',
      [name, price, originalPrice, sales, categoryId, tags, image, amount, id]
    );
    res.json({ success: true, message: '数据修改成功' });
  } catch (error) {
    res.status(500).json({ success: false, message: '修改失败', error: error.message });
  }
});

app.delete('/api/tables/products/:id', async (req, res) => {
  const id = req.params.id;
  try {
    await pool.query('DELETE FROM products WHERE id=?', [id]);
    res.json({ success: true, message: '数据删除成功' });
  } catch (error) {
    res.status(500).json({ success: false, message: '删除失败', error: error.message });
  }
});

// ==================== 任务接口 ====================
app.post('/api/tables/tasks', async (req, res) => {
  const { "任务名称": name, "起始时间": startTime, "结束时间": endTime, "任务地点": location, "任务状态": status, "任务报酬": reward, "任务详情": detail, "已报名人数": signupCount } = req.body;
  try {
    await pool.query(
      'INSERT INTO tasks (`任务名称`, `起始时间`, `结束时间`, `任务地点`, `任务状态`, `任务报酬`, `任务详情`, `已报名人数`) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [name, startTime, endTime, location, status, reward, detail, signupCount]
    );
    res.json({ success: true, message: '任务添加成功' });
  } catch (error) {
    res.status(500).json({ success: false, message: '添加失败', error: error.message });
  }
});

app.put('/api/tables/tasks/:id', async (req, res) => {
  const id = req.params.id;
  const { "任务名称": name, "起始时间": startTime, "结束时间": endTime, "任务地点": location, "任务状态": status, "任务报酬": reward, "任务详情": detail, "已报名人数": signupCount } = req.body;
  try {
    await pool.query(
      'UPDATE tasks SET `任务名称`=?, `起始时间`=?, `结束时间`=?, `任务地点`=?, `任务状态`=?, `任务报酬`=?, `任务详情`=?, `已报名人数`=? WHERE id=?',
      [name, startTime, endTime, location, status, reward, detail, signupCount, id]
    );
    res.json({ success: true, message: '任务修改成功' });
  } catch (error) {
    res.status(500).json({ success: false, message: '修改失败', error: error.message });
  }
});

app.delete('/api/tables/tasks/:id', async (req, res) => {
  const id = req.params.id;
  try {
    await pool.query('DELETE FROM tasks WHERE id=?', [id]);
    res.json({ success: true, message: '任务删除成功' });
  } catch (error) {
    res.status(500).json({ success: false, message: '删除失败', error: error.message });
  }
});

// 接取任务（已报名人数 +1）
app.post('/api/tables/tasks/:id/accept', async (req, res) => {
  const id = req.params.id;
  try {
    const [result] = await pool.query('UPDATE tasks SET `已报名人数` = `已报名人数` + 1 WHERE id=?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: '任务不存在' });
    res.json({ success: true, message: '接取成功' });
  } catch (error) {
    res.status(500).json({ success: false, message: '接取失败', error: error.message });
  }
});

// ==================== 订单接口 ====================
// 新增订单（order_id 自增，不需要传）
app.post('/api/tables/orders', async (req, res) => {
  const { user_id, goods, buyer, seller, order_time, order_amount, order_status } = req.body;
  try {
    await pool.query(
      'INSERT INTO orders (user_id, goods, buyer, seller, order_time, order_amount, order_status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [user_id, goods, buyer, seller, order_time, order_amount, order_status]
    );
    res.json({ success: true, message: '订单创建成功' });
  } catch (error) {
    res.status(500).json({ success: false, message: '创建订单失败', error: error.message });
  }
});

app.put('/api/tables/orders/:id', async (req, res) => {
  const id = req.params.id;
  const { user_id, goods, buyer, seller, order_time, order_amount, order_status } = req.body;
  try {
    await pool.query(
      'UPDATE orders SET user_id=?, goods=?, buyer=?, seller=?, order_time=?, order_amount=?, order_status=? WHERE order_id=?',
      [user_id, goods, buyer, seller, order_time, order_amount, order_status, id]
    );
    res.json({ success: true, message: '订单更新成功' });
  } catch (error) {
    res.status(500).json({ success: false, message: '更新失败', error: error.message });
  }
});

app.delete('/api/tables/orders/:id', async (req, res) => {
  const id = req.params.id;
  try {
    await pool.query('DELETE FROM orders WHERE order_id=?', [id]);
    res.json({ success: true, message: '订单删除成功' });
  } catch (error) {
    res.status(500).json({ success: false, message: '删除失败', error: error.message });
  }
});

// ==================== 用户接口 ====================
app.post('/api/login', async (req, res) => {
  const { userName, passWord } = req.body;
  try {
    const [users] = await pool.query(
      'SELECT id, userName, nickName, tel, local, authority, png FROM user WHERE userName = ? AND passWord = ?',
      [userName, passWord]
    );
    if (users.length === 0) return res.status(401).json({ success: false, message: '用户名或密码错误' });
    res.json({ success: true, message: '登录成功', user: users[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: '登录失败', error: error.message });
  }
});

app.post('/api/register', async (req, res) => {
  const { userName, passWord, nickName, tel, local, authority } = req.body;
  try {
    const [existing] = await pool.query('SELECT id FROM user WHERE userName = ?', [userName]);
    if (existing.length > 0) return res.status(400).json({ success: false, message: '用户名已存在' });
    if (authority !== 0 && authority !== 1 && authority !== 2) return res.status(400).json({ success: false, message: '权限值无效' });
    await pool.query(
      'INSERT INTO user (userName, passWord, nickName, tel, local, authority) VALUES (?, ?, ?, ?, ?, ?)',
      [userName, passWord, nickName, tel, local, authority]
    );
    res.json({ success: true, message: '注册成功' });
  } catch (error) {
    res.status(500).json({ success: false, message: '注册失败', error: error.message });
  }
});

app.get('/api/tables/user', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, userName, passWord, nickName, tel, local, authority, png FROM user LIMIT 100');
    res.json({ data: rows });
  } catch (error) {
    res.status(500).json({ message: '获取用户列表失败', error: error.message });
  }
});

app.get('/api/tables/user/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const [rows] = await pool.query(
      'SELECT id, userName, passWord, nickName, tel, local, authority, png FROM user WHERE id = ?', [id]
    );
    if (rows.length === 0) return res.status(404).json({ message: '用户不存在' });
    res.json({ data: rows[0] });
  } catch (error) {
    res.status(500).json({ message: '获取用户信息失败', error: error.message });
  }
});

app.put('/api/tables/user/:id', async (req, res) => {
  const id = req.params.id;
  const { userName, passWord, nickName, tel, local, authority, png } = req.body;
  try {
    if (userName) {
      const [existing] = await pool.query('SELECT id FROM user WHERE userName = ? AND id != ?', [userName, id]);
      if (existing.length > 0) return res.status(400).json({ success: false, message: '用户名已被使用' });
    }
    if (authority !== undefined && authority !== 0 && authority !== 1 && authority !== 2) {
      return res.status(400).json({ success: false, message: '权限值无效' });
    }
    let updateFields = [], queryParams = [];
    if (userName) { updateFields.push('userName = ?'); queryParams.push(userName); }
    if (passWord) { updateFields.push('passWord = ?'); queryParams.push(passWord); }
    if (nickName) { updateFields.push('nickName = ?'); queryParams.push(nickName); }
    if (tel) { updateFields.push('tel = ?'); queryParams.push(tel); }
    if (local) { updateFields.push('local = ?'); queryParams.push(local); }
    if (authority !== undefined) { updateFields.push('authority = ?'); queryParams.push(authority); }
    if (png !== undefined) { updateFields.push('png = ?'); queryParams.push(png); }
    if (updateFields.length === 0) return res.json({ success: true, message: '无更新内容' });
    queryParams.push(id);
    await pool.query(`UPDATE user SET ${updateFields.join(', ')} WHERE id = ?`, queryParams);
    res.json({ success: true, message: '用户信息更新成功' });
  } catch (error) {
    res.status(500).json({ success: false, message: '更新失败', error: error.message });
  }
});

app.delete('/api/tables/user/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const [users] = await pool.query('SELECT id FROM user WHERE id = ?', [id]);
    if (users.length === 0) return res.status(404).json({ success: false, message: '用户不存在' });
    await pool.query('DELETE FROM user WHERE id = ?', [id]);
    res.json({ success: true, message: '用户删除成功' });
  } catch (error) {
    res.status(500).json({ success: false, message: '删除失败', error: error.message });
  }
});

app.post('/api/changePassword', async (req, res) => {
  const { id, oldPassword, newPassword } = req.body;
  if (!id || !oldPassword || !newPassword) return res.status(400).json({ success: false, message: '参数缺失' });
  try {
    const [users] = await pool.query('SELECT id FROM user WHERE id = ? AND passWord = ?', [id, oldPassword]);
    if (users.length === 0) return res.status(401).json({ success: false, message: '旧密码不正确' });
    await pool.query('UPDATE user SET passWord = ? WHERE id = ?', [newPassword, id]);
    res.json({ success: true, message: '密码修改成功' });
  } catch (error) {
    res.status(500).json({ success: false, message: '密码修改失败', error: error.message });
  }
});

// ==================== 文件上传 ====================
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/avatars/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

const uploadDir = path.join(__dirname, 'uploads/avatars');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.post('/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: '没有文件被上传' });
    res.json({ success: true, message: '文件上传成功', url: `/uploads/${req.file.filename}` });
  } catch (error) {
    res.status(500).json({ success: false, message: '文件上传失败', error: error.message });
  }
});

app.post('/api/user/avatar/:userId', upload.single('avatar'), async (req, res) => {
  try {
    const userId = req.params.userId;
    if (!req.file) return res.status(400).json({ success: false, message: '没有上传文件' });
    const avatarPath = '/uploads/avatars/' + req.file.filename;
    await pool.query('UPDATE user SET png = ? WHERE id = ?', [avatarPath, userId]);
    res.json({ success: true, message: '头像上传成功', avatarPath });
  } catch (error) {
    res.status(500).json({ success: false, message: '头像上传失败', error: error.message });
  }
});

app.listen(port, () => {
  console.log(`服务器运行在 http://localhost:${port}`);
});