// utils/dateTimeUtils.js
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn'; // 导入中文本地化

// 格式化日期为 YYYY-MM-DD
export const formatDate = (date) => {
  if (!date) return '';
  return dayjs(date).format('YYYY-MM-DD');
};

// 格式化时间为 HH:mm
export const formatTime = (date) => {
  if (!date) return '';
  return dayjs(date).format('HH:mm');
};

// 获取指定日期的开始时间
export const getStartOfDay = (dateString) => {
  if (!dateString) return new Date();
  // 确保我们正确地构造日期对象
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day, 0, 0, 0, 0);
};

// 获取指定日期的结束时间
export const getEndOfDay = (dateString) => {
  if (!dateString) return new Date();
  // 确保我们正确地构造日期对象
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day, 23, 59, 59, 999);
};

// 获取指定日期所在周的开始日期
export const getStartOfWeek = (dateString) => {
  if (!dateString) return new Date();
  const date = dayjs(dateString);
  return date.startOf('week').format('YYYY-MM-DD');
};

// 获取指定日期所在周的结束日期
export const getEndOfWeek = (dateString) => {
  if (!dateString) return new Date();
  const date = dayjs(dateString);
  return date.endOf('week').format('YYYY-MM-DD');
};

// 获取指定日期所在月的开始日期
export const getStartOfMonth = (dateString) => {
  if (!dateString) return new Date();
  const date = dayjs(dateString);
  return date.startOf('month').format('YYYY-MM-DD');
};

// 获取指定日期所在月的结束日期
export const getEndOfMonth = (dateString) => {
  if (!dateString) return new Date();
  const date = dayjs(dateString);
  return date.endOf('month').format('YYYY-MM-DD');
};

// 检查两个日期是否为同一天
export const isSameDay = (date1, date2) => {
  if (!date1 || !date2) return false;
  return dayjs(date1).format('YYYY-MM-DD') === dayjs(date2).format('YYYY-MM-DD');
};

// 获取日期的中文表示
export const getChineseDate = (dateString) => {
  if (!dateString) return '';
  const date = dayjs(dateString);
  return date.locale('zh-cn').format('YYYY年M月D日 dddd');
};

/**
 * 合并日期和时间
 */
export const combineDateTime = (date, time) => {
  if (!date || !time) return new Date();
  
  const dateObj = new Date(date);
  const timeObj = new Date(time);
  
  dateObj.setHours(timeObj.getHours());
  dateObj.setMinutes(timeObj.getMinutes());
  dateObj.setSeconds(0);
  dateObj.setMilliseconds(0);
  
  return dateObj;
};

/**
 * 验证日期时间是否有效
 */
export const isValidDateTime = (dateTime) => {
  return dateTime instanceof Date && !isNaN(dateTime.getTime());
};

/**
 * 计算两个时间的持续时间
 */
export const calculateDuration = (startTime, endTime) => {
  if (!startTime || !endTime) return { hours: 0, minutes: 0 };
  
  const start = new Date(startTime);
  const end = new Date(endTime);
  const durationMs = end - start;
  
  if (durationMs <= 0) return { hours: 0, minutes: 0 };
  
  const hours = Math.floor(durationMs / (1000 * 60 * 60));
  const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
  
  return { hours, minutes };
};

/**
 * 获取持续时间显示文本
 */
export const getDurationText = (startTime, endTime) => {
  const { hours, minutes } = calculateDuration(startTime, endTime);
  
  if (hours > 0) {
    return `${hours}小时${minutes > 0 ? `${minutes}分钟` : ''}`;
  } else {
    return `${minutes}分钟`;
  }
};

/**
 * 验证开始时间是否早于当前时间
 */
export const validateStartTime = (date, time) => {
  const today = new Date().toISOString().split('T')[0];
  const eventDate = formatDate(date);
  
  if (eventDate === today) {
    const eventDateTime = combineDateTime(date, time);
    const now = new Date();
    
    if (eventDateTime < now) {
      return '今日事件的开始时间不能早于当前时间';
    }
  }
  
  return '';
};