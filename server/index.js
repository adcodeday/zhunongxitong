const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
require('dotenv').config();
const multer = require('multer');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json({ limit: '50mb' })); // 增加限制到50MB
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// 创建数据库连接池
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

// 获取表数据
app.get('/api/tables/:tableName', async (req, res) => {
  try {
    const tableName = req.params.tableName;
    const [rows] = await pool.query(`SELECT * FROM ${tableName} LIMIT 100`);
    res.json({ data: rows });
  } catch (error) {
    res.status(500).json({ message: '获取表数据失败', error: error.message });
  }
});

// 新增数据（示例表名：products，根据实际调整）
app.post('/api/tables/products', async (req, res) => {
  const { name, price, originalPrice, sales, categoryId, tags, image, amount } = req.body;
  const query = `
    INSERT INTO products (name, price, originalPrice, sales, categoryId, tags, image, amount) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;
  try {
    await pool.query(query, [name, price, originalPrice, sales, categoryId, tags, image, amount]);
    res.json({ message: '数据添加成功' });
  } catch (error) {
    res.status(500).json({ message: '添加失败', error: error.message });
  }
});

// 修改数据（根据 id 更新）
app.put('/api/tables/products/:id', async (req, res) => {
  const id = req.params.id;
  const { name, price, originalPrice, sales, categoryId, tags, image, amount } = req.body;
  const query = `
    UPDATE products 
    SET name=?, price=?, originalPrice=?, sales=?, categoryId=?, tags=?, image=?, amount=? 
    WHERE id=?
  `;
  try {
    await pool.query(query, [name, price, originalPrice, sales, categoryId, tags, image, amount, id]);
    res.json({ message: '数据修改成功' });
  } catch (error) {
    res.status(500).json({ message: '修改失败', error: error.message });
  }
});

// 删除数据（根据 id 删除）
app.delete('/api/tables/products/:id', async (req, res) => {
  const id = req.params.id;
  const query = `DELETE FROM products WHERE id=?`;
  try {
    await pool.query(query, [id]);
    res.json({ message: '数据删除成功' });
  } catch (error) {
    res.status(500).json({ message: '删除失败', error: error.message });
  }
});

// 新增任务
app.post('/api/tables/tasks', async (req, res) => {
  const {
    "任务名称": name,
    "起始时间": startTime,
    "结束时间": endTime,
    "任务地点": location,
    "任务状态": status,
    "任务报酬": reward,
    "任务详情": detail,
    "已报名人数": signupCount
  } = req.body;
  const query = `
    INSERT INTO tasks (\`任务名称\`, \`起始时间\`, \`结束时间\`, \`任务地点\`, \`任务状态\`, \`任务报酬\`, \`任务详情\`, \`已报名人数\`)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;
  try {
    await pool.query(query, [name, startTime, endTime, location, status, reward, detail, signupCount]);
    res.json({ message: '任务添加成功' });
  } catch (error) {
    res.status(500).json({ message: '添加失败', error: error.message });
  }
});

// 修改任务
app.put('/api/tables/tasks/:id', async (req, res) => {
  const id = req.params.id;
  const {
    "任务名称": name,
    "起始时间": startTime,
    "结束时间": endTime,
    "任务地点": location,
    "任务状态": status,
    "任务报酬": reward,
    "任务详情": detail,
    "已报名人数": signupCount
  } = req.body;
  const query = `
    UPDATE tasks SET
      \`任务名称\` = ?,
      \`起始时间\` = ?,
      \`结束时间\` = ?,
      \`任务地点\` = ?,
      \`任务状态\` = ?,
      \`任务报酬\` = ?,
      \`任务详情\` = ?,
      \`已报名人数\` = ?
    WHERE id = ?
  `;
  try {
    await pool.query(query, [name, startTime, endTime, location, status, reward, detail, signupCount, id]);
    res.json({ message: '任务修改成功' });
  } catch (error) {
    res.status(500).json({ message: '修改失败', error: error.message });
  }
});

// 删除任务
app.delete('/api/tables/tasks/:id', async (req, res) => {
  const id = req.params.id;
  const query = `DELETE FROM tasks WHERE id = ?`;
  try {
    await pool.query(query, [id]);
    res.json({ message: '任务删除成功' });
  } catch (error) {
    res.status(500).json({ message: '删除失败', error: error.message });
  }
});

// 启动服务器
app.listen(port, () => {
  console.log(`服务器运行在 http://localhost:${port}`);
});



// 用户登录
app.post('/api/login', async (req, res) => {
  const { userName, passWord } = req.body;
  console.log('用户登录:', userName, passWord);
  try {
    const [users] = await pool.query(
      'SELECT id, userName, nickName, tel, local, authority, png FROM user WHERE userName = ? AND passWord = ?', 
      [userName, passWord]
    );
    
    if (users.length === 0) {
      return res.status(401).json({ success: false, message: '用户名或密码错误' });
    }
    
    // 登录成功，返回用户信息（不包含密码）
    const user = users[0];
    res.json({ 
      success: true, 
      message: '登录成功', 
      user
    });
  } catch (error) {
    console.error('登录失败:', error);
    res.status(500).json({ success: false, message: '登录失败', error: error.message });
  }
});

// 用户注册
app.post('/api/register', async (req, res) => {
  const { userName, passWord, nickName, tel, local, authority } = req.body;
  console.log('用户注册:', req.body);
  
  try {
    // 检查用户名是否已存在
    const [existingUsers] = await pool.query(
      'SELECT id FROM user WHERE userName = ?', 
      [userName]
    );
    
    if (existingUsers.length > 0) {
      return res.status(400).json({ success: false, message: '用户名已存在' });
    }
    
    // 验证权限值是否合法（只能是0、1或2）
    if (authority !== 0 && authority !== 1 && authority !== 2) {
      return res.status(400).json({ success: false, message: '权限值无效，只能是0(管理员)、1(农户)或2(客户)' });
    }
    
    // 插入新用户
    const query = `
      INSERT INTO user (userName, passWord, nickName, tel, local, authority) 
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    await pool.query(query, [userName, passWord, nickName, tel, local, authority]);
    
    res.json({ 
      success: true, 
      message: '注册成功' 
    });
  } catch (error) {
    console.error('注册失败:', error);
    res.status(500).json({ success: false, message: '注册失败', error: error.message });
  }
});

// 获取用户列表
app.get('/api/tables/user', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, userName, passWord, nickName, tel, local, authority, png FROM user LIMIT 100');
    res.json({ data: rows });
  } catch (error) {
    res.status(500).json({ message: '获取用户列表失败', error: error.message });
  }
});

// 获取单个用户信息
app.get('/api/tables/user/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const [rows] = await pool.query(
      'SELECT id, userName, passWord, nickName, tel, local, authority, png FROM user WHERE id = ?',
      [id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ message: '用户不存在' });
    }
    
    res.json({ data: rows[0] });
  } catch (error) {
    res.status(500).json({ message: '获取用户信息失败', error: error.message });
  }
});

// 修改用户信息
app.put('/api/tables/user/:id', async (req, res) => {
  const id = req.params.id;
  const { userName, passWord, nickName, tel, local, authority, png } = req.body;
  
  try {
    // 如果要修改用户名，先检查是否已存在
    if (userName) {
      const [existingUsers] = await pool.query(
        'SELECT id FROM user WHERE userName = ? AND id != ?', 
        [userName, id]
      );
      
      if (existingUsers.length > 0) {
        return res.status(400).json({ success: false, message: '用户名已被其他用户使用' });
      }
    }
    
    // 验证权限值是否合法（只能是0、1或2）
    if (authority !== undefined && authority !== 0 && authority !== 1 && authority !== 2) {
      return res.status(400).json({ success: false, message: '权限值无效，只能是0(管理员)、1(农户)或2(客户)' });
    }
    
    // 构建更新查询
    let updateFields = [];
    let queryParams = [];
    
    if (userName) {
      updateFields.push('userName = ?');
      queryParams.push(userName);
    }
    
    if (passWord) {
      updateFields.push('passWord = ?');
      queryParams.push(passWord);
    }
    
    if (nickName) {
      updateFields.push('nickName = ?');
      queryParams.push(nickName);
    }
    
    if (tel) {
      updateFields.push('tel = ?');
      queryParams.push(tel);
    }
    
    if (local) {
      updateFields.push('local = ?');
      queryParams.push(local);
    }
    
    if (authority !== undefined) {
      updateFields.push('authority = ?');
      queryParams.push(authority);
    }
    
    // 如果没有要更新的字段，直接返回成功
    if (updateFields.length === 0) {
      return res.json({ success: true, message: '无更新内容' });
    }
    
    // 添加ID参数
    queryParams.push(id);
    
    const query = `UPDATE user SET ${updateFields.join(', ')} WHERE id = ?`;
    
    await pool.query(query, queryParams);
    res.json({ success: true, message: '用户信息更新成功' });
  } catch (error) {
    console.error('更新失败:', error);
    res.status(500).json({ success: false, message: '更新失败', error: error.message });
  }
});

// 用户注册
app.post('/api/register', async (req, res) => {
  const { userName, passWord, nickName, tel, local, authority } = req.body;
  console.log('用户注册:', req.body);
  
  try {
    // 检查用户名是否已存在
    const [existingUsers] = await pool.query(
      'SELECT id FROM user WHERE userName = ?', 
      [userName]
    );
    
    if (existingUsers.length > 0) {
      return res.status(400).json({ success: false, message: '用户名已存在' });
    }
    
    // 验证权限值是否合法（只能是0、1或2）
    if (authority !== 0 && authority !== 1 && authority !== 2) {
      return res.status(400).json({ success: false, message: '权限值无效，只能是0(管理员)、1(农户)或2(客户)' });
    }
    
    // 插入新用户
    const query = `
      INSERT INTO user (userName, passWord, nickName, tel, local, authority) 
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    await pool.query(query, [userName, passWord, nickName, tel, local, authority]);
    
    res.json({ 
      success: true, 
      message: '注册成功' 
    });
  } catch (error) {
    console.error('注册失败:', error);
    res.status(500).json({ success: false, message: '注册失败', error: error.message });
  }
});

// 修改密码接口
app.post('/api/changePassword', async (req, res) => {
  const { id, oldPassword, newPassword } = req.body;
  
  if (!id || !oldPassword || !newPassword) {
    return res.status(400).json({ success: false, message: '用户ID、旧密码和新密码都必须提供' });
  }
  
  try {
    // 验证旧密码是否正确
    const [users] = await pool.query(
      'SELECT id FROM user WHERE id = ? AND passWord = ?',
      [id, oldPassword]
    );
    
    if (users.length === 0) {
      return res.status(401).json({ success: false, message: '旧密码不正确' });
    }
    
    // 更新密码
    await pool.query(
      'UPDATE user SET passWord = ? WHERE id = ?',
      [newPassword, id]
    );
    
    res.json({ success: true, message: '密码修改成功' });
  } catch (error) {
    console.error('密码修改失败:', error);
    res.status(500).json({ success: false, message: '密码修改失败', error: error.message });
  }
});

// 删除用户
app.delete('/api/tables/user/:id', async (req, res) => {
  const id = req.params.id;
  
  try {
    // 检查用户是否存在
    const [users] = await pool.query('SELECT id FROM user WHERE id = ?', [id]);
    
    if (users.length === 0) {
      return res.status(404).json({ success: false, message: '用户不存在' });
    }
    
    // 删除用户
    await pool.query('DELETE FROM user WHERE id = ?', [id]);
    
    res.json({ success: true, message: '用户删除成功' });
  } catch (error) {
    console.error('删除失败:', error);
    res.status(500).json({ success: false, message: '删除失败', error: error.message });
  }
});


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/avatars/'); // 确保此目录存在
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // 生成唯一文件名
  }
});

const upload = multer({ storage: storage });

// 创建上传目录
const fs = require('fs');
const uploadDir = path.join(__dirname, 'uploads/avatars');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 静态文件服务
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 文件上传接口
app.post('/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: '没有文件被上传' });
    }
    
    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({
      success: true,
      message: '文件上传成功',
      url: fileUrl
    });
  } catch (error) {
    res.status(500).json({ success: false, message: '文件上传失败', error: error.message });
  }
});

// 用户头像上传路由
app.post('/api/user/avatar/:userId', upload.single('avatar'), async (req, res) => {
  try {
    const userId = req.params.userId;
    
    if (!req.file) {
      return res.status(400).json({ success: false, message: '没有上传文件' });
    }
    
    // 文件路径
    const avatarPath = '/uploads/avatars/' + req.file.filename;
    
    // 更新用户头像路径到数据库
    const query = 'UPDATE user SET png = ? WHERE id = ?';
    await pool.query(query, [avatarPath, userId]);
    
    res.json({ 
      success: true, 
      message: '头像上传成功',
      avatarPath: avatarPath
    });
  } catch (error) {
    console.error('头像上传失败:', error);
    res.status(500).json({ success: false, message: '头像上传失败', error: error.message });
  }
});

// 添加静态文件服务
app.use('/uploads', express.static('uploads'));
