// database.js
import * as SQLite from 'expo-sqlite';
import { cancelNotification, scheduleNotification } from '../utils/notifications';
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
        reminder INTEGER,
        notificationId TEXT
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
  console.log('准备安排通知，事件信息:', event);
  const notificationId = await scheduleNotification(event);
  console.log('通知ID:', notificationId);
  const result = await db.runAsync(
    `INSERT INTO events (title, description, date, startTime, endTime, reminder, notificationId)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    event.title,
    event.description || null,
    event.date,
    event.startTime,
    event.endTime,
    event.reminder || null,
    notificationId || null
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
 * 根据日期时间段获取事件
 * @param {string} startDate 开始日期 'YYYY-MM-DD'
 * @param {string} endDate 结束日期 'YYYY-MM-DD'
 * @returns {Promise<Array>}
 */
export const getEventsByDateRange = async (startDate, endDate) => {
  const db = getDB();
  const rows = await db.getAllAsync(
    'SELECT * FROM events WHERE date BETWEEN ? AND ? ORDER BY date, startTime',
    startDate,
    endDate
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
  
  // 先取消旧的通知
  const oldEvent = await db.getFirstAsync('SELECT notificationId FROM events WHERE id = ?', id);
  if (oldEvent && oldEvent.notificationId) {
    await cancelNotification(oldEvent.notificationId);
  }
  
  // 安排新的通知
  const notificationId = await scheduleNotification(event);
  
  await db.runAsync(
    `UPDATE events SET 
      title = ?, description = ?, date = ?, startTime = ?, endTime = ?, reminder = ?, notificationId = ?
     WHERE id = ?`,
    event.title,
    event.description || null,
    event.date,
    event.startTime,
    event.endTime,
    event.reminder || null,
    notificationId || null,
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
  
  // 取消通知
  const event = await db.getFirstAsync('SELECT notificationId FROM events WHERE id = ?', id);
  if (event && event.notificationId) {
    await cancelNotification(event.notificationId);
  }
  
  await db.runAsync('DELETE FROM events WHERE id = ?', id);
};

/**
 * 获取所有事件（用于调试）
 * @returns {Promise<Array>}
 */
export const getAllEvents = async () => {
  const db = getDB();
  const rows = await db.getAllAsync('SELECT * FROM events');
  return rows;
};