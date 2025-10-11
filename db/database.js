// database.js
import * as SQLite from 'expo-sqlite';

let db = null;

/**
 * 初始化数据库
 * 异步版本
 */
export const initDB = async () => {
  if (db) return db;

  db = await SQLite.openDatabaseAsync('calendar.db');

  // 使用事务创建表
  await db.withTransactionAsync(async () => {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        date TEXT NOT NULL,
        startTime TEXT NOT NULL,
        endTime TEXT NOT NULL,
        reminder INTEGER
      );
    `);
  });

  console.log('数据库初始化成功');
  return db;
};

/**
 * 获取数据库实例
 */
export const getDB = () => {
  if (!db) throw new Error('数据库未初始化，请先调用 initDB()');
  return db;
};

/**
 * 添加事件
 * @param {Object} event
 * @returns {Promise<number>} insertId
 */
export const addEvent = async (event) => {
  const db = getDB();
  const result = await db.runAsync(
    `INSERT INTO events (title, description, date, startTime, endTime, reminder)
     VALUES (?, ?, ?, ?, ?, ?)`,
    event.title,
    event.description || null,
    event.date,
    event.startTime,
    event.endTime,
    event.reminder || null
  );

  return result.insertId;
};

/**
 * 获取某天的事件
 * @param {string} date 'YYYY-MM-DD'
 * @returns {Promise<Array>}
 */
export const getEvents = async (date) => {
  const db = getDB();
  const rows = await db.getAllAsync(
    'SELECT * FROM events WHERE date = ?',
    date
  );
  return rows;
};

/**
 * 更新事件
 * @param {number} id
 * @param {Object} event
 * @returns {Promise<void>}
 */
export const updateEvent = async (id, event) => {
  const db = getDB();
  await db.runAsync(
    `UPDATE events SET 
      title = ?, 
      description = ?, 
      date = ?, 
      startTime = ?, 
      endTime = ?, 
      reminder = ? 
     WHERE id = ?`,
    event.title,
    event.description || null,
    event.date,
    event.startTime,
    event.endTime,
    event.reminder || null,
    id
  );
};

/**
 * 删除事件
 * @param {number} id
 * @returns {Promise<void>}
 */
export const deleteEvent = async (id) => {
  const db = getDB();
  await db.runAsync('DELETE FROM events WHERE id = ?', id);
};

/**
 * 同步版本示例
 * 使用 withTransactionSync / runSync / execSync
 */
export const initDBSync = () => {
  if (db) return db;

  db = SQLite.openDatabaseSync('calendar.db');

  db.withTransactionSync(() => {
    db.execSync(`
      CREATE TABLE IF NOT EXISTS events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        date TEXT NOT NULL,
        startTime TEXT NOT NULL,
        endTime TEXT NOT NULL,
        reminder INTEGER
      );
    `);
  });

  console.log('数据库同步初始化成功');
  return db;
};

export const addEventSync = (event) => {
  const db = getDB();
  const result = db.runSync(
    `INSERT INTO events (title, description, date, startTime, endTime, reminder)
     VALUES (?, ?, ?, ?, ?, ?)`,
    event.title,
    event.description || null,
    event.date,
    event.startTime,
    event.endTime,
    event.reminder || null
  );

  return result.insertId;
};

export const getEventsSync = (date) => {
  const db = getDB();
  return db.getAllSync('SELECT * FROM events WHERE date = ?', date);
};

export const updateEventSync = (id, event) => {
  const db = getDB();
  db.runSync(
    `UPDATE events SET 
      title = ?, 
      description = ?, 
      date = ?, 
      startTime = ?, 
      endTime = ?, 
      reminder = ? 
     WHERE id = ?`,
    event.title,
    event.description || null,
    event.date,
    event.startTime,
    event.endTime,
    event.reminder || null,
    id
  );
};

export const deleteEventSync = (id) => {
  const db = getDB();
  db.runSync('DELETE FROM events WHERE id = ?', id);
};
