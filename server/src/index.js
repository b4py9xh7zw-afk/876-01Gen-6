const express = require('express');
const cors = require('cors');
const { initDatabase, saveDatabase } = require('./database');

const authRoutes = require('./routes/auth');
const levelRoutes = require('./routes/levels');
const progressRoutes = require('./routes/progress');
const classRoutes = require('./routes/classes');
const parentRoutes = require('./routes/parent');

async function start() {
  await initDatabase();
  console.log('✅ 数据库初始化完成');

  const app = express();
  const PORT = 4000;

  app.use(cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true
  }));
  app.use(express.json());

  app.use('/api/auth', authRoutes);
  app.use('/api/levels', levelRoutes);
  app.use('/api/progress', progressRoutes);
  app.use('/api/classes', classRoutes);
  app.use('/api/parent', parentRoutes);

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: '少儿编程闯关题库系统运行正常' });
  });

  app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: '服务器内部错误', details: err.message });
  });

  app.listen(PORT, () => {
    console.log(`🚀 少儿编程闯关题库服务器已启动: http://localhost:${PORT}`);
    console.log(`📊 健康检查: http://localhost:${PORT}/api/health`);
  });

  process.on('SIGINT', () => {
    console.log('\n💾 保存数据库...');
    saveDatabase();
    process.exit(0);
  });
}

start().catch(err => {
  console.error('启动失败:', err);
  process.exit(1);
});
