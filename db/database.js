// database.js
import * as SQLite from 'expo-sqlite';
import { cancelNotification, scheduleLocalNotification } from '../utils/notifications';
let db = null;
let globalPushToken = null;

/**
 * 设置全局推送令牌
 */
export const setGlobalPushToken = (token) => {
  globalPushToken = token;
};

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
        endDate TEXT,
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
  
  // 只使用本地通知，不使用远程推送通知
  const notificationId = await scheduleLocalNotification(event);
  
  console.log('通知ID:', notificationId);
  const result = await db.runAsync(
    `INSERT INTO events (title, description, date, endDate, startTime, endTime, reminder, notificationId)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    event.title,
    event.description || null,
    event.date,
    event.endDate || null,
    event.startTime,
    event.endTime,
    event.reminder >= 0 ? event.reminder : null, // 存储实际数值，-1表示不提醒则存为null
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
    `SELECT * FROM events 
     WHERE date = ? 
     OR (date <= ? AND (endDate IS NULL OR endDate >= ?))`,
    date,
    date,
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
    `SELECT * FROM events 
     WHERE date <= ? AND (endDate IS NULL OR endDate >= ?)
     ORDER BY date, startTime`,
    endDate,
    startDate
  );
  return rows;
};

/**
 * 更新事件
 * @param {number} id
 * @param {Object} event
 * @returns {Promise<void>}
 */
export const updateEvent = async (id, eventData) => {
  const db = getDB();
  
  // 先获取旧事件信息以取消旧通知
  const oldEvent = await db.getFirstAsync(
    'SELECT * FROM events WHERE id = ?',
    id
  );
  
  // 取消旧通知
  if (oldEvent && oldEvent.notificationId) {
    await cancelNotification(oldEvent.notificationId);
  }
  
  // 只使用本地通知，不使用远程推送通知
  const notificationId = await scheduleLocalNotification(eventData);
  
  // 更新数据库记录
  await db.runAsync(
    `UPDATE events SET 
      title = ?, 
      description = ?, 
      date = ?, 
      endDate = ?,
      startTime = ?, 
      endTime = ?, 
      reminder = ?,
      notificationId = ?
     WHERE id = ?`,
    eventData.title,
    eventData.description || null,
    eventData.date,
    eventData.endDate || null,
    eventData.startTime,
    eventData.endTime,
    eventData.reminder >= 0 ? eventData.reminder : null, // 存储实际数值，-1表示不提醒则存为null
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
  
  // 先获取事件信息以取消通知
  const event = await db.getFirstAsync(
    'SELECT * FROM events WHERE id = ?',
    id
  );
  
  // 取消通知
  if (event && event.notificationId) {
    await cancelNotification(event.notificationId);
  }
  
  // 删除数据库记录
  await db.runAsync(
    'DELETE FROM events WHERE id = ?',
    id
  );
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