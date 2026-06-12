const express = require('express');
const db = require('../database');
const { authMiddleware, requireRole } = require('../auth');

const router = express.Router();

router.get('/', authMiddleware, requireRole('teacher'), (req, res) => {
  const classes = db.prepare(
    `SELECT c.*,
            (SELECT COUNT(*) FROM class_students WHERE class_id = c.id) as student_count,
            (SELECT COUNT(*) FROM class_levels WHERE class_id = c.id) as level_count
     FROM classes c
     WHERE c.teacher_id = ?
     ORDER BY c.created_at DESC`
  ).all(req.user.id);

  res.json({ classes });
});

router.post('/', authMiddleware, requireRole('teacher'), (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: '请输入班级名称' });
  }

  const result = db.prepare(
    'INSERT INTO classes (name, teacher_id) VALUES (?, ?)'
  ).run(name, req.user.id);

  res.json({ classId: result.lastInsertRowid });
});

router.get('/:id', authMiddleware, requireRole('teacher'), (req, res) => {
  const classId = parseInt(req.params.id);

  const classInfo = db.prepare(
    'SELECT * FROM classes WHERE id = ? AND teacher_id = ?'
  ).get(classId, req.user.id);

  if (!classInfo) {
    return res.status(404).json({ error: '班级不存在' });
  }

  const students = db.prepare(
    `SELECT u.id, u.name, u.username,
            (SELECT COUNT(*) FROM progress p WHERE p.student_id = u.id AND p.status = 'completed') as completed_levels,
            (SELECT COALESCE(SUM(p.stars), 0) FROM progress p WHERE p.student_id = u.id) as total_stars
     FROM class_students cs
     JOIN users u ON cs.student_id = u.id
     WHERE cs.class_id = ?
     ORDER BY u.name`
  ).all(classId);

  const assignedLevels = db.prepare(
    `SELECT l.*, cl.assigned_at, cl.due_date
     FROM class_levels cl
     JOIN levels l ON cl.level_id = l.id
     WHERE cl.class_id = ?
     ORDER BY cl.assigned_at`
  ).all(classId);

  res.json({ class: classInfo, students, assignedLevels });
});

router.post('/:id/students', authMiddleware, requireRole('teacher'), (req, res) => {
  const classId = parseInt(req.params.id);
  const { studentUsernames } = req.body;

  if (!studentUsernames || !Array.isArray(studentUsernames)) {
    return res.status(400).json({ error: '请提供学生用户名列表' });
  }

  const classInfo = db.prepare('SELECT * FROM classes WHERE id = ? AND teacher_id = ?').get(classId, req.user.id);
  if (!classInfo) {
    return res.status(404).json({ error: '班级不存在' });
  }

  const added = [];
  const errors = [];
  const stmt = db.prepare('INSERT OR IGNORE INTO class_students (class_id, student_id) VALUES (?, ?)');

  for (const username of studentUsernames) {
    const student = db.prepare("SELECT id, name FROM users WHERE username = ? AND role = 'child'").get(username.trim());
    if (student) {
      stmt.run(classId, student.id);
      added.push({ username, name: student.name });
    } else {
      errors.push({ username, error: '学生不存在或不是孩子角色' });
    }
  }

  res.json({ added, errors });
});

router.delete('/:id/students/:studentId', authMiddleware, requireRole('teacher'), (req, res) => {
  const classId = parseInt(req.params.id);
  const studentId = parseInt(req.params.studentId);

  db.prepare(
    `DELETE FROM class_students WHERE class_id = ? AND student_id = ?
     AND class_id IN (SELECT id FROM classes WHERE teacher_id = ?)`
  ).run(classId, studentId, req.user.id);

  res.json({ success: true });
});

router.post('/:id/levels', authMiddleware, requireRole('teacher'), (req, res) => {
  const classId = parseInt(req.params.id);
  const { levelIds, dueDate } = req.body;

  if (!levelIds || !Array.isArray(levelIds)) {
    return res.status(400).json({ error: '请选择要布置的关卡' });
  }

  const classInfo = db.prepare('SELECT * FROM classes WHERE id = ? AND teacher_id = ?').get(classId, req.user.id);
  if (!classInfo) {
    return res.status(404).json({ error: '班级不存在' });
  }

  const stmt = db.prepare(
    'INSERT OR IGNORE INTO class_levels (class_id, level_id, due_date) VALUES (?, ?, ?)'
  );

  const tx = db.transaction((ids) => {
    for (const id of ids) {
      stmt.run(classId, id, dueDate || null);
    }
  });
  tx(levelIds);

  res.json({ success: true, count: levelIds.length });
});

router.delete('/:id/levels/:levelId', authMiddleware, requireRole('teacher'), (req, res) => {
  const classId = parseInt(req.params.id);
  const levelId = parseInt(req.params.levelId);

  db.prepare(
    `DELETE FROM class_levels WHERE class_id = ? AND level_id = ?
     AND class_id IN (SELECT id FROM classes WHERE teacher_id = ?)`
  ).run(classId, levelId, req.user.id);

  res.json({ success: true });
});

router.get('/:id/analytics', authMiddleware, requireRole('teacher'), (req, res) => {
  const classId = parseInt(req.params.id);

  const classInfo = db.prepare('SELECT * FROM classes WHERE id = ? AND teacher_id = ?').get(classId, req.user.id);
  if (!classInfo) {
    return res.status(404).json({ error: '班级不存在' });
  }

  const levelCompletion = db.prepare(
    `SELECT l.id, l.title, l.category, l.difficulty,
            COUNT(DISTINCT cs.student_id) as total_students,
            COUNT(DISTINCT CASE WHEN p.status = 'completed' THEN p.student_id END) as completed_count,
            ROUND(AVG(CASE WHEN p.stars IS NOT NULL THEN p.stars END), 1) as avg_stars,
            COALESCE(SUM(a.attempt_count), 0) as total_attempts
     FROM levels l
     JOIN class_levels cl ON cl.level_id = l.id
     JOIN class_students cs ON cs.class_id = cl.class_id
     LEFT JOIN progress p ON p.level_id = l.id AND p.student_id = cs.student_id
     LEFT JOIN (
       SELECT level_id, student_id, COUNT(*) as attempt_count
       FROM attempts
       GROUP BY level_id, student_id
     ) a ON a.level_id = l.id AND a.student_id = cs.student_id
     WHERE cl.class_id = ?
     GROUP BY l.id
     ORDER BY l.difficulty, l.id`
  ).all(classId);

  const studentProgress = db.prepare(
    `SELECT u.id, u.name,
            COUNT(DISTINCT CASE WHEN p.status = 'completed' THEN p.level_id END) as completed,
            COALESCE(SUM(p.stars), 0) as stars,
            COALESCE(COUNT(a.id), 0) as total_attempts
     FROM users u
     JOIN class_students cs ON cs.student_id = u.id
     LEFT JOIN progress p ON p.student_id = u.id AND p.level_id IN (SELECT level_id FROM class_levels WHERE class_id = ?)
     LEFT JOIN attempts a ON a.student_id = u.id AND a.level_id IN (SELECT level_id FROM class_levels WHERE class_id = ?)
     WHERE cs.class_id = ?
     GROUP BY u.id
     ORDER BY stars DESC, completed DESC`
  ).all(classId, classId);

  const difficultConcepts = db.prepare(
    `SELECT l.category, l.id, l.title,
            COUNT(DISTINCT a.student_id) as students_tried,
            COUNT(DISTINCT CASE WHEN a.is_correct = 0 THEN a.student_id END) as students_failed,
            AVG(CASE WHEN a.is_correct = 0 THEN 1 ELSE 0 END) as fail_rate
     FROM attempts a
     JOIN levels l ON l.id = a.level_id
     JOIN class_students cs ON cs.student_id = a.student_id
     WHERE cs.class_id = ?
     GROUP BY l.id
     HAVING fail_rate > 0.3
     ORDER BY fail_rate DESC
     LIMIT 10`
  ).all(classId);

  const commonErrors = db.prepare(
    `SELECT a.errors, l.title as level_title, COUNT(*) as count
     FROM attempts a
     JOIN levels l ON l.id = a.level_id
     JOIN class_students cs ON cs.student_id = a.student_id
     WHERE cs.class_id = ? AND a.is_correct = 0 AND a.errors IS NOT NULL
     GROUP BY a.level_id
     ORDER BY count DESC
     LIMIT 10`
  ).all(classId);

  res.json({
    levelCompletion,
    studentProgress,
    difficultConcepts,
    commonErrors
  });
});

module.exports = router;
