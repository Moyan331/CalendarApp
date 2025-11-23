import solarLunar from 'solarlunar';

/**
 * 节假日数据
 * 包含中国主要的传统节日和国际节日
 */

// 国际节日（基于公历）
const internationalHolidays = {
  '01-01': '元旦',
  '02-14': '情人节',
  '03-08': '妇女节',
  '03-12': '植树节',
  '04-01': '愚人节',
  '05-01': '劳动节',
  '05-04': '青年节',
  '06-01': '儿童节',
  '07-01': '建党节',
  '08-01': '建军节',
  '09-10': '教师节',
  '10-01': '国庆节',
  '12-24': '平安夜',
  '12-25': '圣诞节'
};

/**
 * 获取指定日期的国际节日信息
 * @param {string} date - 日期字符串，格式为 YYYY-MM-DD
 * @returns {string|null} 节日名称，如果没有节日则返回null
 */
const getInternationalHoliday = (date) => {
  if (!date) return null;
  
  try {
    // 提取月日信息
    const [, month, day] = date.split('-');
    const monthDay = `${month}-${day}`;
    
    return internationalHolidays[monthDay] || null;
  } catch (error) {
    console.error('获取国际节日信息失败:', error);
    return null;
  }
};

/**
 * 获取指定日期的传统节日信息
 * @param {string} date - 日期字符串，格式为 YYYY-MM-DD
 * @returns {string|null} 节日名称，如果没有节日则返回null
 */
const getTraditionalHoliday = (date) => {
  if (!date) return null;
  
  try {
    // 转换为农历日期
    const [year, month, day] = date.split('-').map(Number);
    const lunarInfo = solarLunar.solar2lunar(year, month, day);
    
    if (!lunarInfo) return null;
    
    // 检查是否为传统节日
    switch (`${lunarInfo.lMonth}-${lunarInfo.lDay}`) {
      case '1-1':
        return '春节';
      case '1-15':
        return '元宵节';
      case '5-5':
        return '端午节';
      case '7-7':
        return '七夕节';
      case '7-15':
        return '中元节';
      case '8-15':
        return '中秋节';
      case '9-9':
        return '重阳节';
      case '12-8':
        return '腊八节';
      case '12-23':
        return '小年';
      default:
        // 特殊处理除夕
        if (lunarInfo.lMonth === 12 && lunarInfo.isLastDay) {
          return '除夕';
        }
        return null;
    }
  } catch (error) {
    console.error('获取传统节日信息失败:', error);
    return null;
  }
};

/**
 * 获取指定日期的节日信息
 * @param {string} date - 日期字符串，格式为 YYYY-MM-DD
 * @returns {string|null} 节日名称，如果没有节日则返回null
 */
export default getHoliday = (date) => {
  if (!date) return null;
  
  // 优先检查国际节日
  const international = getInternationalHoliday(date);
  if (international) return international;
  
  // 检查传统节日
  const traditional = getTraditionalHoliday(date);
  if (traditional) return traditional;
  
  return null;
};

