const bcrypt = require('bcryptjs');
const { initDatabase, saveDatabase } = require('./database');

async function seed() {
  console.log('🌱 开始初始化数据...');

  const db = await initDatabase();

  const hash = (pwd) => bcrypt.hashSync(pwd, 10);

  const users = [
    { username: 'teacher1', password: hash('123456'), name: '李老师', role: 'teacher', parent_id: null },
    { username: 'parent1', password: hash('123456'), name: '小明家长', role: 'parent', parent_id: null },
    { username: 'parent2', password: hash('123456'), name: '小红家长', role: 'parent', parent_id: null },
    { username: 'child1', password: hash('123456'), name: '小明', role: 'child', parent_id: null },
    { username: 'child2', password: hash('123456'), name: '小红', role: 'child', parent_id: null },
    { username: 'child3', password: hash('123456'), name: '小刚', role: 'child', parent_id: null },
    { username: 'child4', password: hash('123456'), name: '小美', role: 'child', parent_id: null },
  ];

  const insertUser = db.prepare(
    'INSERT OR IGNORE INTO users (username, password, name, role, parent_id) VALUES (?, ?, ?, ?, ?)'
  );
  users.forEach(u => insertUser.run(u.username, u.password, u.name, u.role, u.parent_id));

  db.prepare('UPDATE users SET parent_id = 2 WHERE username = ?').run('child1');
  db.prepare('UPDATE users SET parent_id = 2 WHERE username = ?').run('child3');
  db.prepare('UPDATE users SET parent_id = 3 WHERE username = ?').run('child2');
  db.prepare('UPDATE users SET parent_id = 3 WHERE username = ?').run('child4');
  console.log('✅ 用户数据初始化完成');

  const levels = [
    {
      title: '第一关：初识积木',
      description: '学习最基本的顺序执行，把正确的积木按顺序放好！',
      category: 'logic',
      difficulty: 1,
      expected_blocks: ['move_forward', 'move_forward', 'turn_right'],
      goal_description: '让小猫咪向前走2步，然后向右转，到达终点！',
      hints: [
        '先找到"前进"积木',
        '需要两个"前进"积木',
        '最后加上"向右转"积木'
      ],
      blocks_available: [
        { id: 'move_forward', label: '⬆️ 前进', color: '#4ade80' },
        { id: 'turn_right', label: '➡️ 右转', color: '#60a5fa' },
        { id: 'turn_left', label: '⬅️ 左转', color: '#f472b6' },
        { id: 'jump', label: '🦘 跳跃', color: '#fbbf24' }
      ],
      order_matters: 1
    },
    {
      title: '第二关：左右为难',
      description: '练习转向操作，找到正确的方向！',
      category: 'logic',
      difficulty: 1,
      expected_blocks: ['turn_left', 'move_forward', 'turn_right', 'move_forward'],
      goal_description: '小猫咪需要先左转走1步，再右转走1步到达小鱼干！',
      hints: [
        '第一步是向"左转"',
        '每转一次方向后要"前进"',
        '总共需要4块积木'
      ],
      blocks_available: [
        { id: 'move_forward', label: '⬆️ 前进', color: '#4ade80' },
        { id: 'turn_right', label: '➡️ 右转', color: '#60a5fa' },
        { id: 'turn_left', label: '⬅️ 左转', color: '#f472b6' },
        { id: 'jump', label: '🦘 跳跃', color: '#fbbf24' }
      ],
      order_matters: 1
    },
    {
      title: '第三关：跳跃小能手',
      description: '遇到障碍物要跳过去哦！',
      category: 'logic',
      difficulty: 2,
      expected_blocks: ['move_forward', 'jump', 'move_forward', 'jump', 'move_forward'],
      goal_description: '路上有2个水坑，需要跳过去才能到达目的地！',
      hints: [
        '先走到水坑边',
        '遇到水坑就"跳跃"',
        '前进-跳跃-前进-跳跃-前进'
      ],
      blocks_available: [
        { id: 'move_forward', label: '⬆️ 前进', color: '#4ade80' },
        { id: 'turn_right', label: '➡️ 右转', color: '#60a5fa' },
        { id: 'turn_left', label: '⬅️ 左转', color: '#f472b6' },
        { id: 'jump', label: '🦘 跳跃', color: '#fbbf24' },
        { id: 'sit', label: '🧘 坐下', color: '#a78bfa' }
      ],
      order_matters: 1
    },
    {
      title: '第四关：绕个大圈',
      description: '用转向绕一圈回到起点！',
      category: 'logic',
      difficulty: 2,
      expected_blocks: ['move_forward', 'turn_right', 'move_forward', 'turn_right', 'move_forward', 'turn_right', 'move_forward', 'turn_right'],
      goal_description: '走出一个正方形，最后回到起点！',
      hints: [
        '正方形有4条边',
        '每条边后要转一次方向',
        '总共8块积木：前进+右转重复4次'
      ],
      blocks_available: [
        { id: 'move_forward', label: '⬆️ 前进', color: '#4ade80' },
        { id: 'turn_right', label: '➡️ 右转', color: '#60a5fa' },
        { id: 'turn_left', label: '⬅️ 左转', color: '#f472b6' }
      ],
      order_matters: 1
    },
    {
      title: '第五关：循环入门',
      description: '学习使用循环积木，让代码更简洁！',
      category: 'loop',
      difficulty: 2,
      expected_blocks: ['loop_start_3', 'move_forward', 'loop_end'],
      goal_description: '用循环让小猫咪连续前进3步！',
      hints: [
        '先放"重复3次"积木开始循环',
        '在循环里放"前进"积木',
        '最后别忘了"结束循环"积木'
      ],
      blocks_available: [
        { id: 'loop_start_3', label: '🔁 重复3次', color: '#f97316' },
        { id: 'loop_start_5', label: '🔁 重复5次', color: '#f97316' },
        { id: 'loop_end', label: '🔚 结束循环', color: '#fb923c' },
        { id: 'move_forward', label: '⬆️ 前进', color: '#4ade80' },
        { id: 'turn_right', label: '➡️ 右转', color: '#60a5fa' }
      ],
      order_matters: 1
    },
    {
      title: '第六关：画个正方形',
      description: '用循环画正方形，只需几行代码！',
      category: 'loop',
      difficulty: 3,
      expected_blocks: ['loop_start_4', 'move_forward', 'turn_right', 'loop_end'],
      goal_description: '用循环重复4次：前进+右转，画出正方形！',
      hints: [
        '正方形的四条边是相同的',
        '循环里要放"前进"和"右转"',
        '循环开始后放2块，然后结束循环'
      ],
      blocks_available: [
        { id: 'loop_start_3', label: '🔁 重复3次', color: '#f97316' },
        { id: 'loop_start_4', label: '🔁 重复4次', color: '#f97316' },
        { id: 'loop_start_5', label: '🔁 重复5次', color: '#f97316' },
        { id: 'loop_end', label: '🔚 结束循环', color: '#fb923c' },
        { id: 'move_forward', label: '⬆️ 前进', color: '#4ade80' },
        { id: 'turn_right', label: '➡️ 右转', color: '#60a5fa' },
        { id: 'turn_left', label: '⬅️ 左转', color: '#f472b6' }
      ],
      order_matters: 1
    },
    {
      title: '第七关：双层循环',
      description: '循环里面还可以放循环哦！',
      category: 'loop',
      difficulty: 4,
      expected_blocks: ['loop_start_2', 'loop_start_3', 'move_forward', 'loop_end', 'turn_right', 'loop_end'],
      goal_description: '外循环2次，内循环3次前进加1次右转，画出2层图形！',
      hints: [
        '先放外层"重复2次"',
        '里面放"重复3次"和"前进"',
        '内层循环结束后放"右转"'
      ],
      blocks_available: [
        { id: 'loop_start_2', label: '🔁 重复2次', color: '#f97316' },
        { id: 'loop_start_3', label: '🔁 重复3次', color: '#f97316' },
        { id: 'loop_start_4', label: '🔁 重复4次', color: '#f97316' },
        { id: 'loop_end', label: '🔚 结束循环', color: '#fb923c' },
        { id: 'move_forward', label: '⬆️ 前进', color: '#4ade80' },
        { id: 'turn_right', label: '➡️ 右转', color: '#60a5fa' }
      ],
      order_matters: 1
    },
    {
      title: '第八关：条件判断',
      description: '学习如果...就...的逻辑！',
      category: 'condition',
      difficulty: 3,
      expected_blocks: ['if_red', 'turn_right', 'if_blue', 'turn_left', 'move_forward'],
      goal_description: '遇到红色砖块向右转，遇到蓝色砖块向左转，最后前进！',
      hints: [
        '先检查有没有红色',
        '再检查有没有蓝色',
        '最后前进到达终点'
      ],
      blocks_available: [
        { id: 'if_red', label: '🔴 如果是红色', color: '#ef4444' },
        { id: 'if_blue', label: '🔵 如果是蓝色', color: '#3b82f6' },
        { id: 'if_green', label: '🟢 如果是绿色', color: '#22c55e' },
        { id: 'then', label: '👉 执行', color: '#fbbf24' },
        { id: 'move_forward', label: '⬆️ 前进', color: '#4ade80' },
        { id: 'turn_right', label: '➡️ 右转', color: '#60a5fa' },
        { id: 'turn_left', label: '⬅️ 左转', color: '#f472b6' }
      ],
      order_matters: 1
    },
    {
      title: '第九关：红绿灯',
      description: '用条件判断模拟红绿灯！',
      category: 'condition',
      difficulty: 4,
      expected_blocks: ['if_red', 'stop', 'if_yellow', 'slow_down', 'if_green', 'move_forward'],
      goal_description: '红灯停🟡黄灯慢🟢绿灯行！按照交通规则行驶！',
      hints: [
        '红灯要"停止"',
        '黄灯要"减速"',
        '绿灯才可以"前进"'
      ],
      blocks_available: [
        { id: 'if_red', label: '🔴 如果红灯', color: '#ef4444' },
        { id: 'if_yellow', label: '🟡 如果黄灯', color: '#eab308' },
        { id: 'if_green', label: '🟢 如果绿灯', color: '#22c55e' },
        { id: 'then', label: '👉 执行', color: '#fbbf24' },
        { id: 'stop', label: '🛑 停止', color: '#dc2626' },
        { id: 'slow_down', label: '🐢 减速', color: '#ca8a04' },
        { id: 'move_forward', label: '⬆️ 前进', color: '#4ade80' }
      ],
      order_matters: 1
    },
    {
      title: '第十关：寻宝大冒险',
      description: '综合运用：循环+条件，找到隐藏的宝藏！',
      category: 'project',
      difficulty: 4,
      expected_blocks: ['loop_start_5', 'move_forward', 'if_treasure', 'jump', 'if_treasure_end', 'loop_end'],
      goal_description: '走5步，遇到宝藏就跳起来欢呼！找到传说中的钻石！',
      hints: [
        '用循环重复走5步',
        '每走一步检查有没有宝藏',
        '有宝藏的话"跳跃"庆祝！'
      ],
      blocks_available: [
        { id: 'loop_start_3', label: '🔁 重复3次', color: '#f97316' },
        { id: 'loop_start_5', label: '🔁 重复5次', color: '#f97316' },
        { id: 'loop_end', label: '🔚 结束循环', color: '#fb923c' },
        { id: 'if_treasure', label: '💎 如果有宝藏', color: '#8b5cf6' },
        { id: 'if_treasure_end', label: '💎 判断结束', color: '#a78bfa' },
        { id: 'move_forward', label: '⬆️ 前进', color: '#4ade80' },
        { id: 'jump', label: '🦘 跳跃', color: '#fbbf24' },
        { id: 'turn_right', label: '➡️ 右转', color: '#60a5fa' }
      ],
      order_matters: 1
    },
    {
      title: '第十一关：迷宫挑战',
      description: '终极挑战：走出复杂的迷宫！',
      category: 'project',
      difficulty: 5,
      expected_blocks: [
        'move_forward', 'turn_right', 'move_forward', 'move_forward',
        'turn_left', 'move_forward', 'turn_right', 'move_forward',
        'move_forward', 'turn_left', 'move_forward'
      ],
      goal_description: '这是一个复杂的迷宫，需要精确的转向和移动才能到达出口！',
      hints: [
        '先观察迷宫的路线',
        '每一步都要仔细想清楚',
        '共有11块积木，慢慢组合'
      ],
      blocks_available: [
        { id: 'move_forward', label: '⬆️ 前进', color: '#4ade80' },
        { id: 'turn_right', label: '➡️ 右转', color: '#60a5fa' },
        { id: 'turn_left', label: '⬅️ 左转', color: '#f472b6' },
        { id: 'jump', label: '🦘 跳跃', color: '#fbbf24' },
        { id: 'loop_start_3', label: '🔁 重复3次', color: '#f97316' },
        { id: 'loop_end', label: '🔚 结束循环', color: '#fb923c' }
      ],
      order_matters: 1
    },
    {
      title: '第十二关：小小艺术家',
      description: '用代码画出美丽的图案！',
      category: 'project',
      difficulty: 5,
      expected_blocks: [
        'loop_start_6', 'move_forward', 'turn_right', 'move_forward', 'turn_left', 'loop_end'
      ],
      goal_description: '用循环画一个六边形的花朵图案，每边都有花瓣！',
      hints: [
        '六边形有6条边',
        '每条边：前进+右转+前进+左转',
        '用"重复6次"包裹这个组合'
      ],
      blocks_available: [
        { id: 'loop_start_4', label: '🔁 重复4次', color: '#f97316' },
        { id: 'loop_start_5', label: '🔁 重复5次', color: '#f97316' },
        { id: 'loop_start_6', label: '🔁 重复6次', color: '#f97316' },
        { id: 'loop_end', label: '🔚 结束循环', color: '#fb923c' },
        { id: 'move_forward', label: '⬆️ 前进', color: '#4ade80' },
        { id: 'turn_right', label: '➡️ 右转', color: '#60a5fa' },
        { id: 'turn_left', label: '⬅️ 左转', color: '#f472b6' }
      ],
      order_matters: 1
    }
  ];

  const insertLevel = db.prepare(
    `INSERT OR IGNORE INTO levels (title, description, category, difficulty, expected_blocks, goal_description, hints, blocks_available, order_matters)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );

  levels.forEach(l => {
    insertLevel.run(
      l.title,
      l.description,
      l.category,
      l.difficulty,
      JSON.stringify(l.expected_blocks),
      l.goal_description,
      JSON.stringify(l.hints),
      JSON.stringify(l.blocks_available),
      l.order_matters
    );
  });
  console.log(`✅ ${levels.length} 个关卡数据初始化完成`);

  db.prepare('INSERT OR IGNORE INTO classes (name, teacher_id) VALUES (?, ?)').run('编程启蒙班 A班', 1);
  db.prepare('INSERT OR IGNORE INTO classes (name, teacher_id) VALUES (?, ?)').run('编程进阶班 B班', 1);
  console.log('✅ 班级数据初始化完成');

  const addStudent = db.prepare('INSERT OR IGNORE INTO class_students (class_id, student_id) VALUES (?, ?)');
  addStudent.run(1, 4);
  addStudent.run(1, 5);
  addStudent.run(1, 6);
  addStudent.run(1, 7);
  addStudent.run(2, 4);
  addStudent.run(2, 5);
  console.log('✅ 学生分班完成');

  const assignLevel = db.prepare('INSERT OR IGNORE INTO class_levels (class_id, level_id) VALUES (?, ?)');
  for (let i = 1; i <= 8; i++) {
    assignLevel.run(1, i);
  }
  for (let i = 4; i <= 12; i++) {
    assignLevel.run(2, i);
  }
  console.log('✅ 关卡布置完成');

  saveDatabase();

  console.log('\n🎉 数据初始化完成！');
  console.log('\n📝 默认账号：');
  console.log('   👨‍🏫 老师账号: teacher1 / 123456');
  console.log('   👨‍👩‍👧 家长账号: parent1 / 123456');
  console.log('   👨‍👩‍👧 家长账号: parent2 / 123456');
  console.log('   👶 孩子账号: child1 / 123456 (小明, parent1的孩子)');
  console.log('   👶 孩子账号: child2 / 123456 (小红, parent2的孩子)');
  console.log('   👶 孩子账号: child3 / 123456 (小刚, parent1的孩子)');
  console.log('   👶 孩子账号: child4 / 123456 (小美, parent2的孩子)');
}

seed().catch(err => {
  console.error('初始化失败:', err);
  process.exit(1);
});
