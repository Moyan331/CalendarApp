// utils/dateTimeUtils.js

/**
 * 格式化日期为 YYYY-MM-DD
 */
export const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * 格式化时间为 HH:MM
 */
export const formatTime = (time) => {
  if (!time) return '';
  const t = new Date(time);
  const hours = String(t.getHours()).padStart(2, '0');
  const minutes = String(t.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
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