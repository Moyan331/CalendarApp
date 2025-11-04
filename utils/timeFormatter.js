// utils/timeFormatter.js

/**
 * 格式化时间为 HH:MM 格式
 * @param {string} time - 用户输入的时间字符串
 * @returns {string} 格式化后的时间 (HH:MM)
 */
export const formatTimeInput = (time) => {
  if (!time) return '';
  
  // 移除所有非数字字符，只保留数字
  const digits = time.replace(/[^\d]/g, '');
  
  if (digits.length === 0) return '';
  
  // 限制最大长度为4位数字
  const limitedDigits = digits.substring(0, 4);
  
  // 根据数字长度进行格式化
  if (limitedDigits.length <= 2) {
    // 只有小时部分
    return limitedDigits;
  } else {
    // 有小时和分钟部分
    const hours = limitedDigits.substring(0, 2);
    const minutes = limitedDigits.substring(2);
    
    // 自动添加冒号分隔符
    return `${hours}:${minutes}`;
  }
};

/**
 * 标准化时间为 HH:MM 格式
 * @param {string} time - 用户输入的时间
 * @returns {string} 标准化时间 (HH:MM)
 */
export const normalizeTime = (time) => {
  if (!time) return '';
  
  // 移除所有非数字字符
  const digits = time.replace(/[^\d]/g, '');
  
  if (digits.length === 0) return '';
  
  let hours = '00';
  let minutes = '00';
  
  if (digits.length === 1) {
    // 单数字：如 "3" -> "03:00"
    hours = `0${digits}`;
  } else if (digits.length === 2) {
    // 双数字：如 "12" -> "12:00"
    hours = digits;
  } else if (digits.length === 3) {
    // 三数字：如 "317" -> "03:17"
    hours = `0${digits.charAt(0)}`;
    minutes = digits.substring(1);
  } else {
    // 四数字：如 "0317" -> "03:17"
    hours = digits.substring(0, 2);
    minutes = digits.substring(2);
  }
  
  // 确保小时在 00-23 范围内
  let hourNum = parseInt(hours, 10);
  if (hourNum > 23) {
    hours = '23';
  } else if (hourNum < 0) {
    hours = '00';
  } else {
    hours = hours.padStart(2, '0');
  }
  
  // 确保分钟在 00-59 范围内
  let minuteNum = parseInt(minutes, 10);
  if (minuteNum > 59) {
    minutes = '59';
  } else if (minuteNum < 0) {
    minutes = '00';
  } else {
    minutes = minutes.padStart(2, '0');
  }
  
  return `${hours}:${minutes}`;
};

/**
 * 验证时间格式并返回标准化时间
 * @param {string} time - 输入时间
 * @returns {Object} { isValid: boolean, formattedTime: string, error: string }
 */
export const validateAndFormatTime = (time) => {
  if (!time) {
    return { isValid: false, formattedTime: '', error: '时间不能为空' };
  }
  
  const formattedTime = normalizeTime(time);
  
  // 验证小时和分钟范围
  const [hours, minutes] = formattedTime.split(':').map(Number);
  
  if (hours < 0 || hours > 23) {
    return { isValid: false, formattedTime, error: '小时必须在 0-23 之间' };
  }
  
  if (minutes < 0 || minutes > 59) {
    return { isValid: false, formattedTime, error: '分钟必须在 0-59 之间' };
  }
  
  return { isValid: true, formattedTime, error: '' };
};