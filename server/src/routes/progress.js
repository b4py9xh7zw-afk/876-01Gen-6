const express = require('express');
const db = require('../database');
const { authMiddleware, requireRole } = require('../auth');

const router = express.Router();

router.get('/my-progress', authMiddleware, requireRole('child'), (req, res) => {
  const progress = db.prepare(
    `SELECT p.*, l.title, l.category, l.difficulty
     FROM progress p
     JOIN levels l ON p.level_id = l.id
     WHERE p.student_id = ?
     ORDER BY p.last_attempt_at DESC NULLS LAST`
  ).all(req.user.id);

  const totalLevels = db.prepare('SELECT COUNT(*) as count FROM levels').get().count;
  const completedLevels = db.prepare(
    'SELECT COUNT(*) as count FROM progress WHERE student_id = ? AND status = ?'
  ).get(req.user.id, 'completed').count;

  const totalStars = db.prepare(
    'SELECT COALESCE(SUM(stars), 0) as total FROM progress WHERE student_id = ? AND status = ?'
  ).get(req.user.id, 'completed').total;

  const byCategory = db.prepare(
    `SELECT l.category,
            COUNT(*) as total,
            SUM(CASE WHEN p.status = 'completed' THEN 1 ELSE 0 END) as completed,
            COALESCE(SUM(p.stars), 0) as stars
     FROM levels l
     LEFT JOIN progress p ON p.level_id = l.id AND p.student_id = ?
     GROUP BY l.category`
  ).all(req.user.id);

  res.json({
    progress,
    stats: {
      totalLevels,
      completedLevels,
      totalStars,
      byCategory
    }
  });
});

router.get('/child/:childId', authMiddleware, (req, res) => {
  const childId = parseInt(req.params.childId);

  if (req.user.role === 'parent' && req.user.id) {
    const child = db.prepare(
      'SELECT id, name FROM users WHERE id = ? AND parent_id = ? AND role = ?'
    ).get(childId, req.user.id, 'child');
    if (!child) {
      return res.status(403).json({ error: '无权查看此孩子的进度' });
    }
  } else if (req.user.role === 'teacher') {
    const inClass = db.prepare(
      `SELECT 1 FROM class_students cs
       JOIN classes c ON cs.class_id = c.id
       WHERE cs.student_id = ? AND c.teacher_id = ?`
    ).get(childId, req.user.id);
    if (!inClass) {
      return res.status(403).json({ error: '该学生不在您的班级中' });
    }
  } else if (req.user.role !== 'teacher' && req.user.role !== 'parent') {
    return res.status(403).json({ error: '没有权限' });
  }

  const childInfo = db.prepare(
    'SELECT id, name, username FROM users WHERE id = ? AND role = ?'
  ).get(childId, 'child');

  const progress = db.prepare(
    `SELECT p.*, l.title, l.category, l.difficulty, l.description
     FROM progress p
     JOIN levels l ON p.level_id = l.id
     WHERE p.student_id = ?
     ORDER BY p.completed_at DESC NULLS LAST, p.last_attempt_at DESC`
  ).all(childId);

  const totalLevels = db.prepare('SELECT COUNT(*) as count FROM levels').get().count;
  const completedLevels = db.prepare(
    'SELECT COUNT(*) as count FROM progress WHERE student_id = ? AND status = ?'
  ).get(childId, 'completed').count;

  const totalStars = db.prepare(
    'SELECT COALESCE(SUM(stars), 0) as total FROM progress WHERE student_id = ? AND status = ?'
  ).get(childId, 'completed').total;

  const byCategory = db.prepare(
    `SELECT l.category,
            COUNT(*) as total,
            SUM(CASE WHEN p.status = 'completed' THEN 1 ELSE 0 END) as completed,
            COALESCE(SUM(p.stars), 0) as stars
     FROM levels l
     LEFT JOIN progress p ON p.level_id = l.id AND p.student_id = ?
     GROUP BY l.category`
  ).all(childId);

  const recentActivity = db.prepare(
    `SELECT a.*, l.title as level_title
     FROM attempts a
     JOIN levels l ON a.level_id = l.id
     WHERE a.student_id = ?
     ORDER BY a.created_at DESC
     LIMIT 10`
  ).all(childId);

  res.json({
    childInfo,
    progress,
    stats: {
      totalLevels,
      completedLevels,
      totalStars,
      byCategory
    },
    recentActivity
  });
});

module.exports = router;
