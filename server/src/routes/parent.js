const express = require('express');
const db = require('../database');
const { authMiddleware } = require('../auth');

const router = express.Router();

router.get('/children', authMiddleware, require('express').Router().use((req, res, next) => {
  if (req.user.role !== 'parent') {
    return res.status(403).json({ error: '只有家长可以访问' });
  }
  next();
}), (req, res) => {
  const children = db.prepare(
    `SELECT u.id, u.name, u.username,
            (SELECT COUNT(*) FROM progress p WHERE p.student_id = u.id AND p.status = 'completed') as completed_levels,
            (SELECT COUNT(*) FROM levels) as total_levels,
            (SELECT COALESCE(SUM(p.stars), 0) FROM progress p WHERE p.student_id = u.id AND p.status = 'completed') as total_stars
     FROM users u
     WHERE u.parent_id = ? AND u.role = 'child'
     ORDER BY u.name`
  ).all(req.user.id);

  res.json({ children });
});

module.exports = router;
