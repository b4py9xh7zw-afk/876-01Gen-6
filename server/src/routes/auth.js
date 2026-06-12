const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../database');
const { generateToken, authMiddleware } = require('../auth');

const router = express.Router();

router.post('/register', (req, res) => {
  const { username, password, name, role, parentCode } = req.body;

  if (!username || !password || !name || !role) {
    return res.status(400).json({ error: '请填写所有必填项' });
  }

  if (!['child', 'parent', 'teacher'].includes(role)) {
    return res.status(400).json({ error: '无效的角色' });
  }

  const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
  if (existing) {
    return res.status(400).json({ error: '用户名已存在' });
  }

  let parent_id = null;
  if (role === 'child' && parentCode) {
    const parent = db.prepare('SELECT id FROM users WHERE username = ? AND role = ?').get(parentCode, 'parent');
    if (parent) {
      parent_id = parent.id;
    }
  }

  const hashedPassword = bcrypt.hashSync(password, 10);
  const result = db.prepare(
    'INSERT INTO users (username, password, name, role, parent_id) VALUES (?, ?, ?, ?, ?)'
  ).run(username, hashedPassword, name, role, parent_id);

  const user = {
    id: result.lastInsertRowid,
    username,
    name,
    role,
    parent_id
  };

  const token = generateToken(user);
  res.json({ token, user });
});

router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: '请输入用户名和密码' });
  }

  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  if (!user) {
    return res.status(400).json({ error: '用户名或密码错误' });
  }

  if (!bcrypt.compareSync(password, user.password)) {
    return res.status(400).json({ error: '用户名或密码错误' });
  }

  const token = generateToken(user);
  const safeUser = {
    id: user.id,
    username: user.username,
    name: user.name,
    role: user.role,
    parent_id: user.parent_id
  };

  res.json({ token, user: safeUser });
});

router.get('/me', authMiddleware, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
