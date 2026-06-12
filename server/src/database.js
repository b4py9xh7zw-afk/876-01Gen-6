const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'database.sqlite');

let db;
let SQL;

function toParamsArray(args) {
  if (args.length === 0) return [];
  if (args.length === 1 && Array.isArray(args[0])) return args[0];
  return Array.from(args);
}

function prepareStatement(sql) {
  return {
    run(...params) {
      const stmt = db.prepare(sql);
      try {
        if (params.length > 0) stmt.bind(toParamsArray(params));
        stmt.step();
        return {
          lastInsertRowid: db.exec('SELECT last_insert_rowid() AS id')[0]?.values[0]?.[0],
          changes: db.exec('SELECT changes() AS c')[0]?.values[0]?.[0] || 0,
        };
      } finally {
        stmt.free();
      }
    },
    get(...params) {
      const stmt = db.prepare(sql);
      try {
        if (params.length > 0) stmt.bind(toParamsArray(params));
        if (stmt.step()) {
          return stmt.getAsObject();
        }
        return undefined;
      } finally {
        stmt.free();
      }
    },
    all(...params) {
      const stmt = db.prepare(sql);
      try {
        if (params.length > 0) stmt.bind(toParamsArray(params));
        const results = [];
        while (stmt.step()) {
          results.push(stmt.getAsObject());
        }
        return results;
      } finally {
        stmt.free();
      }
    },
  };
}

const dbProxy = {
  exec(sql) {
    return db.exec(sql);
  },
  prepare(sql) {
    return prepareStatement(sql);
  },
  pragma(str) {
    if (str.includes('=')) {
      db.exec(`PRAGMA ${str}`);
    }
  },
  transaction(fn) {
    return function(...args) {
      db.exec('BEGIN');
      try {
        const result = fn(...args);
        db.exec('COMMIT');
        return result;
      } catch (e) {
        db.exec('ROLLBACK');
        throw e;
      }
    };
  },
  close() {
    db.close();
  },
  export() {
    return db.export();
  },
};

async function initDatabase() {
  SQL = await initSqlJs({
    locateFile: file => {
      try {
        return require.resolve(`sql.js/dist/${file}`);
      } catch (e) {
        return path.join(__dirname, '..', 'node_modules', 'sql.js', 'dist', file);
      }
    }
  });

  if (fs.existsSync(dbPath)) {
    const data = fs.readFileSync(dbPath);
    db = new SQL.Database(data);
  } else {
    db = new SQL.Database();
  }

  const createTables = `
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('child', 'parent', 'teacher')),
      parent_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (parent_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS classes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      teacher_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (teacher_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS class_students (
      class_id INTEGER NOT NULL,
      student_id INTEGER NOT NULL,
      joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (class_id, student_id),
      FOREIGN KEY (class_id) REFERENCES classes(id),
      FOREIGN KEY (student_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS levels (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL CHECK(category IN ('logic', 'loop', 'condition', 'project')),
      difficulty INTEGER NOT NULL CHECK(difficulty BETWEEN 1 AND 5),
      expected_blocks TEXT NOT NULL,
      goal_description TEXT NOT NULL,
      hints TEXT,
      blocks_available TEXT NOT NULL,
      order_matters INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS class_levels (
      class_id INTEGER NOT NULL,
      level_id INTEGER NOT NULL,
      assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      due_date DATETIME,
      PRIMARY KEY (class_id, level_id),
      FOREIGN KEY (class_id) REFERENCES classes(id),
      FOREIGN KEY (level_id) REFERENCES levels(id)
    );

    CREATE TABLE IF NOT EXISTS progress (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL,
      level_id INTEGER NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('not_started', 'in_progress', 'completed')),
      stars INTEGER CHECK(stars BETWEEN 0 AND 3),
      attempts INTEGER DEFAULT 0,
      blocks_used TEXT,
      time_spent INTEGER DEFAULT 0,
      completed_at DATETIME,
      last_attempt_at DATETIME,
      FOREIGN KEY (student_id) REFERENCES users(id),
      FOREIGN KEY (level_id) REFERENCES levels(id),
      UNIQUE(student_id, level_id)
    );

    CREATE TABLE IF NOT EXISTS attempts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL,
      level_id INTEGER NOT NULL,
      blocks_submitted TEXT NOT NULL,
      is_correct INTEGER NOT NULL,
      errors TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES users(id),
      FOREIGN KEY (level_id) REFERENCES levels(id)
    );
  `;

  const statements = createTables.split(';').map(s => s.trim()).filter(s => s.length > 0);
  for (const stmt of statements) {
    try {
      db.exec(stmt + ';');
    } catch (e) {
      console.warn('跳过SQL错误:', e.message);
    }
  }

  saveDatabase();
  return dbProxy;
}

function saveDatabase() {
  try {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbPath, buffer);
  } catch (e) {
    console.error('保存数据库失败:', e.message);
  }
}

const originalExec = dbProxy.exec.bind(dbProxy);
const originalPrepare = dbProxy.prepare.bind(dbProxy);
let saveTimeout;

function scheduleSave() {
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(saveDatabase, 200);
}

dbProxy.exec = function(sql) {
  const result = originalExec(sql);
  scheduleSave();
  return result;
};

dbProxy.prepare = function(sql) {
  const wrapped = originalPrepare(sql);
  const originalRun = wrapped.run.bind(wrapped);
  wrapped.run = function(...params) {
    const result = originalRun(...params);
    scheduleSave();
    return result;
  };
  return wrapped;
};

module.exports = dbProxy;
module.exports.initDatabase = initDatabase;
module.exports.saveDatabase = saveDatabase;
