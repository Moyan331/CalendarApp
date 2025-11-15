const solarLunar = require('solarlunar');

console.log('库导入结果:', solarLunar);
console.log('default属性:', solarLunar.default);
console.log('库的所有属性:', Object.keys(solarLunar));

if (solarLunar.default && typeof solarLunar.default.solar2lunar === 'function') {
  console.log('使用default调用结果:', solarLunar.default.solar2lunar(2023, 2, 19));
} else if (typeof solarLunar.solar2lunar === 'function') {
  console.log('直接调用结果:', solarLunar.solar2lunar(2025, 11, 22));
} else {
  console.log('没有找到solar2lunar方法');
}