const express = require('express');
const db = require('../database');
const { authMiddleware, requireRole } = require('../auth');

const router = express.Router();

function verifyAnswer(level, submittedBlocks) {
  const expected = JSON.parse(level.expected_blocks);
  const submitted = Array.isArray(submittedBlocks) ? submittedBlocks : [];

  if (submitted.length === 0) {
    return { correct: false, errors: ['请先拖拽一些积木到工作区'] };
  }

  if (level.order_matters) {
    if (expected.length !== submitted.length) {
      return {
        correct: false,
        errors: [`积木数量不对哦，需要 ${expected.length} 块，你用了 ${submitted.length} 块`]
      };
    }

    for (let i = 0; i < expected.length; i++) {
      if (expected[i] !== submitted[i]) {
        return {
          correct: false,
          errors: [`第 ${i + 1} 块积木不对哦，再想想看`]
        };
      }
    }
    return { correct: true, errors: [] };
  } else {
    const expectedSet = [...expected].sort();
    const submittedSet = [...submitted].sort();

    if (expectedSet.length !== submittedSet.length) {
      return {
        correct: false,
        errors: [`积木数量不对哦，需要 ${expected.length} 块，你用了 ${submitted.length} 块`]
      };
    }

    for (let i = 0; i < expectedSet.length; i++) {
      if (expectedSet[i] !== submittedSet[i]) {
        return {
          correct: false,
          errors: [`缺少了一些积木，或者有些积木用错了`]
        };
      }
    }
    return { correct: true, errors: [] };
  }
}

function calculateStars(attempts, timeSpent) {
  if (attempts <= 1) return 3;
  if (attempts <= 3) return 2;
  return 1;
}

router.get('/', authMiddleware, (req, res) => {
  const { category } = req.query;
  let sql = 'SELECT * FROM levels';
  const params = [];

  if (category) {
    sql += ' WHERE category = ?';
    params.push(category);
  }
  sql += ' ORDER BY difficulty ASC, id ASC';

  const levels = db.prepare(sql).all(...params);

  let levelsWithProgress = levels;
  if (req.user.role === 'child') {
    levelsWithProgress = levels.map(level => {
      const progress = db.prepare(
        'SELECT status, stars, attempts FROM progress WHERE student_id = ? AND level_id = ?'
      ).get(req.user.id, level.id);
      return { ...level, progress: progress || { status: 'not_started', stars: 0, attempts: 0 } };
    });
  }

  res.json({ levels: levelsWithProgress });
});

router.get('/:id', authMiddleware, (req, res) => {
  const level = db.prepare('SELECT * FROM levels WHERE id = ?').get(req.params.id);
  if (!level) {
    return res.status(404).json({ error: '关卡不存在' });
  }

  const levelData = {
    ...level,
    expected_blocks: undefined,
    blocks_available: JSON.parse(level.blocks_available),
    hints: level.hints ? JSON.parse(level.hints) : []
  };

  if (req.user.role === 'child') {
    const progress = db.prepare(
      'SELECT status, stars, attempts, blocks_used FROM progress WHERE student_id = ? AND level_id = ?'
    ).get(req.user.id, level.id);
    levelData.progress = progress || { status: 'not_started', stars: 0, attempts: 0 };
  }

  if (req.user.role === 'teacher') {
    levelData.expected_blocks = JSON.parse(level.expected_blocks);
  }

  res.json({ level: levelData });
});

router.post('/:id/submit', authMiddleware, requireRole('child'), (req, res) => {
  const { blocks } = req.body;
  const levelId = parseInt(req.params.id);

  const level = db.prepare('SELECT * FROM levels WHERE id = ?').get(levelId);
  if (!level) {
    return res.status(404).json({ error: '关卡不存在' });
  }

  const result = verifyAnswer(level, blocks);

  db.prepare(
    'INSERT INTO attempts (student_id, level_id, blocks_submitted, is_correct, errors) VALUES (?, ?, ?, ?, ?)'
  ).run(
    req.user.id,
    levelId,
    JSON.stringify(blocks),
    result.correct ? 1 : 0,
    result.errors ? JSON.stringify(result.errors) : null
  );

  const existingProgress = db.prepare(
    'SELECT * FROM progress WHERE student_id = ? AND level_id = ?'
  ).get(req.user.id, levelId);

  const stars = result.correct ? calculateStars(
    (existingProgress?.attempts || 0) + 1,
    existingProgress?.time_spent || 0
  ) : 0;

  if (existingProgress) {
    const newAttempts = existingProgress.attempts + 1;
    const newStars = result.correct
      ? Math.max(existingProgress.stars || 0, stars)
      : existingProgress.stars;

    db.prepare(
      `UPDATE progress SET
        status = ?,
        stars = ?,
        attempts = ?,
        blocks_used = ?,
        last_attempt_at = CURRENT_TIMESTAMP,
        completed_at = CASE WHEN ? = 1 THEN COALESCE(completed_at, CURRENT_TIMESTAMP) ELSE completed_at END
      WHERE id = ?`
    ).run(
      result.correct ? 'completed' : 'in_progress',
      newStars,
      newAttempts,
      JSON.stringify(blocks),
      result.correct ? 1 : 0,
      existingProgress.id
    );
  } else {
    db.prepare(
      `INSERT INTO progress (student_id, level_id, status, stars, attempts, blocks_used, last_attempt_at, completed_at)
       VALUES (?, ?, ?, ?, 1, ?, CURRENT_TIMESTAMP, CASE WHEN ? = 1 THEN CURRENT_TIMESTAMP ELSE NULL END)`
    ).run(
      req.user.id,
      levelId,
      result.correct ? 'completed' : 'in_progress',
      stars,
      JSON.stringify(blocks),
      result.correct ? 1 : 0
    );
  }

  const encouragements = [
    '太棒了！你真是编程小天才！',
    '做得好！继续保持！',
    '完美！你解决了这个挑战！',
    '真厉害！你离程序员又近了一步！',
    '聪明的小朋友！恭喜你过关啦！'
  ];

  const tryAgainMessages = [
    '差一点啦，再试试看！',
    '没关系，失败是成功之母！',
    '再想想看，你一定可以的！',
    '别着急，慢慢来，再试一次！',
    '加油哦，仔细看看提示吧！'
  ];

  res.json({
    correct: result.correct,
    errors: result.errors,
    stars: result.correct ? stars : 0,
    message: result.correct
      ? encouragements[Math.floor(Math.random() * encouragements.length)]
      : tryAgainMessages[Math.floor(Math.random() * tryAgainMessages.length)]
  });
});

router.post('/', authMiddleware, requireRole('teacher'), (req, res) => {
  const {
    title,
    description,
    category,
    difficulty,
    expected_blocks,
    goal_description,
    hints,
    blocks_available,
    order_matters = true
  } = req.body;

  if (!title || !description || !category || !difficulty || !expected_blocks || !goal_description || !blocks_available) {
    return res.status(400).json({ error: '请填写所有必填项' });
  }

  const result = db.prepare(
    `INSERT INTO levels (title, description, category, difficulty, expected_blocks, goal_description, hints, blocks_available, order_matters)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    title,
    description,
    category,
    difficulty,
    JSON.stringify(expected_blocks),
    goal_description,
    hints ? JSON.stringify(hints) : null,
    JSON.stringify(blocks_available),
    order_matters ? 1 : 0
  );

  res.json({ levelId: result.lastInsertRowid });
});

module.exports = router;
