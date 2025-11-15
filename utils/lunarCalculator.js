import solarLunar from 'solarlunar';

/**
 * 将公历日期转换为农历日期
 * @param {string} date - 公历日期，格式为 'YYYY-MM-DD'
 * @returns {object} 包含农历信息的对象
 */
export const convertToLunar = (date) => {
  try {
    // 检查日期参数是否有效
    if (!date || typeof date !== 'string') {
      console.warn('无效的日期参数:', date);
      return null;
    }
    
    // 检查solarLunar是否成功导入
    if (!solarLunar || typeof solarLunar.solar2lunar !== 'function') {
      console.warn('solarLunar库未正确导入');
      return null;
    }
    
    const [year, month, day] = date.split('-').map(Number);
    const lunarInfo = solarLunar.solar2lunar(year, month, day);
    
    if (!lunarInfo) {
      return null;
    }
    
    // 农历月日表示
    const lunarMonth = lunarInfo.monthCn;
    const lunarDay = lunarInfo.dayCn;
    
    return {
      month: lunarMonth,
      day: lunarDay,
      gzYear: lunarInfo.gzYear,      // 干支年
      gzMonth: lunarInfo.gzMonth,    // 干支月
      gzDay: lunarInfo.gzDay,        // 干支日
      isLeap: lunarInfo.isLeap,      // 是否闰月
      leapMonth: lunarInfo.leapMonth, // 闰月月份（如果不是闰月则为false）
      animal: lunarInfo.animal,      // 生肖
      isTerm: lunarInfo.isTerm,
      term: lunarInfo.term  // 二十四节气，修复大小写问题
    };
  } catch (error) {
    console.error('农历转换错误:', error);
    return null;
  }
};

/**
 * 获取简化的农历日期（只包含月和日）
 * @param {string} date - 公历日期，格式为 'YYYY-MM-DD'
 * @returns {string} 农历月日，如 "五月初五"
 */
export const getSimpleLunarDate = (date) => {
  // 检查日期参数是否有效
  if (!date || typeof date !== 'string') {
    return '';
  }
  
  const lunar = convertToLunar(date);
  if (!lunar) return '';
  
  // 如果是节气，则显示节气
  if (lunar.term) {
    return lunar.term;
  }
  
  // 返回农历月日
  return `${lunar.lMonth}${lunar.lDay}`;
};