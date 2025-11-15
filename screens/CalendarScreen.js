// CalendarScreen.js
import { getEvents } from '@/db/database';
import { useFocusEffect } from '@react-navigation/native';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import WeekView from '../components/WeekView';
import { convertToLunar } from '../utils/lunarCalculator';

// 配置中文月份
LocaleConfig.locales['zh'] = {
  monthNames: ['一月','二月','三月','四月','五月','六月','七月','八月','九月','十月','十一月','十二月'],
  monthNamesShort: ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'],
  dayNames: ['星期日','星期一','星期二','星期三','星期四','星期五','星期六'],
  dayNamesShort: ['日','一','二','三','四','五','六'],
  today: '今天'
};
LocaleConfig.defaultLocale = 'zh';

export default function CalendarScreen({ navigation }) {
  const [selectedDate, setSelectedDate] = useState('');
  const [viewMode, setViewMode] = useState('month');
  const [events, setEvents] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(dayjs().format('YYYY-MM-DD'));
 // const [currentMonth, setCurrentMonth] = useState(new Date());
  const today = new Date().toISOString().split('T')[0];
  // 初始化：选中当天日期
  useEffect(() => {
    // 设置默认选中当天
    setSelectedDate(today);
    // 加载当天的事件
    loadEvents(today);
  }, []);
  const loadEvents = useCallback(async (date) => {
    if (!date) return;
    const rows = await getEvents(date);
    setEvents(rows);
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (selectedDate) loadEvents(selectedDate);
    }, [selectedDate, loadEvents])
  );

  const markedDates = events.reduce((acc, event) => {
    acc[event.date] = { marked: true, dotColor: '#42a5f5' };
    return acc;
  }, {});
  if (selectedDate) {
    markedDates[selectedDate] = {
      ...(markedDates[selectedDate] || {}),
      selected: true,
      selectedColor: '#42a5f5',
    };
  }

  // 月份切换
  const handlePrevMonth = () => {
    setCurrentMonth(dayjs(currentMonth).subtract(1, 'month').format('YYYY-MM-DD'));
  };
  const handleNextMonth = () => {
    setCurrentMonth(dayjs(currentMonth).add(1, 'month').format('YYYY-MM-DD'));
  };


  // 自定义日期组件，显示农历
  const renderDay = (day) => {
    try {
      // 检查 day 对象是否存在
      if (!day) {
        return (
          <View style={styles.dayContainer}>
            <Text style={styles.dayText}></Text>
          </View>
        );
      }

      // 从 day 中提取日期信息
      const dateInfo = day.date;
      
      // 检查 dateInfo 是否存在
      if (!dateInfo || !dateInfo.dateString) {
        return (
          <TouchableOpacity 
            style={styles.dayContainer} 
            onPress={() => setSelectedDate(dateInfo.dateString)}>
            <Text style={styles.dayText}>{day.children || day.day || ''}</Text>
          </TouchableOpacity>
        );
      }

      // 计算农历日期
      const lunarInfo = convertToLunar(dateInfo.dateString);
      const isToday = dateInfo.dateString === today;
      const isSelected = dateInfo.dateString === selectedDate;
      
      // 根据是否选中使用不同的样式
      const dayContainerStyle = isSelected 
        ? styles.selectedDayContainer 
        : styles.dayContainer;
      
      const dayTextStyle = [
        styles.dayText,
        isToday && styles.todayText,
        isSelected && styles.selectedDayText
      ];
      
      const lunarTextStyle = [
        styles.lunarText,
        isSelected && styles.selectedLunarText
      ];
      
      return (
        <TouchableOpacity 
          style={dayContainerStyle} 
          onPress={() => setSelectedDate(dateInfo.dateString)}>
          <Text style={dayTextStyle}>
            {dateInfo.day}
          </Text>
          {lunarInfo && (
            <Text style={lunarTextStyle} numberOfLines={1}>
              {lunarInfo.isTerm ? `${lunarInfo.term}` : `${lunarInfo.month}${lunarInfo.day}`}
            </Text>
          )}
        </TouchableOpacity>
      );
    } catch (error) {
      // 出现任何错误时，至少显示公历日期
      console.warn('渲染农历日期时出错:', error);
      return (
        <TouchableOpacity 
          style={styles.dayContainer} 
          onPress={() => setSelectedDate(dateInfo.dateString)}>
          <Text style={styles.dayText}>
            {day && day.children || day && day.date && day.date.day || ''}
          </Text>
        </TouchableOpacity>
      );
    }
  };


  return (
    <LinearGradient colors={['#e3f2fd', '#ffffff']} style={{ flex: 1 }}>
      <View style={styles.container}>
        <Text style={styles.header}>📆 我的日程</Text>

        {/* 切换视图按钮 */}
        <View style={styles.switchContainer}>
          {['month', 'week', 'day'].map((mode) => (
            <TouchableOpacity
              key={mode}
              style={[
                styles.switchButton,
                viewMode === mode && styles.switchButtonActive,
              ]}
              onPress={() => setViewMode(mode)}
            >
              <Text style={{
                color: viewMode === mode ? '#fff' : '#1565c0',
                fontWeight: viewMode === mode ? 'bold' : 'normal'
              }}>
                {mode === 'month' ? '月' : mode === 'week' ? '周' : '日'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 月视图 */}
        {viewMode === 'month' && (
          <View style={styles.card}>
            {/* 自定义月份控制条 */}
            <View style={styles.monthControl}>
              <TouchableOpacity onPress={handlePrevMonth}>
                <Text style={styles.arrow}>◀</Text>
              </TouchableOpacity>
              <Text style={styles.monthText}>
                {dayjs(currentMonth).locale('zh-cn').format('YYYY年MM月')}
              </Text>
              <TouchableOpacity onPress={handleNextMonth}>
                <Text style={styles.arrow}>▶</Text>
              </TouchableOpacity>
            </View>

            <Calendar
              key={currentMonth}          
              current={currentMonth}
              onDayPress={(day) => setSelectedDate(day.dateString)}
              markedDates={markedDates}
              markingType="dot"
              theme={{
                arrowColor: '#42a5f5',
                textMonthFontWeight: 'bold',
                textMonthFontSize: 16,
                monthTextColor: '#1565c0',
                dayTextColor: '#333',
                todayTextColor: '#42a5f5',
              }}
              renderArrow={() => null} // 隐藏默认箭头
              renderHeader={() => null} // 隐藏默认月份标题
              dayComponent={renderDay} // 使用自定义日期组件
            />
          </View>
        )}

        {/* 周视图 */}
        {viewMode === 'week' && (
          <View style={[styles.card, { flex: 1 }]}>
            <WeekView
              selected={selectedDate}
              onDaySelect={(date) => setSelectedDate(date)}
            />
          </View>
        )}

        {/* 日视图 */}
        {viewMode === 'day' && (
          <View style={[styles.card, { flex: 1 }]}>
            <Text style={styles.sectionTitle}>{selectedDate || '请选择日期'}</Text>
            <FlatList
              data={events}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <View style={styles.eventItem}>
                  <Text style={styles.eventTime}>{item.startTime} - {item.endTime}</Text>
                  <Text style={styles.eventTitle}>{item.title}</Text>
                </View>
              )}
              ListEmptyComponent={<Text style={styles.emptyText}>这天还没有事件~</Text>}
              contentContainerStyle={{ paddingBottom: 40 }}
            />
          </View>
        )}

        {/* 底部按钮 */}
        <View style={styles.bottomButtons}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('AddEvent', { selectedDate })}
          >
            <Text style={styles.buttonText}>➕ 添加日程</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('ViewEvents', { selectedDate })}
          >
            <Text style={styles.buttonText}>📋 查看事件</Text>
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: { fontSize: 26, fontWeight: '700', color: '#1565c0', marginBottom: 12 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 20 },
  switchContainer: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 15 },
  switchButton: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, backgroundColor: '#e3f2fd' },
  switchButtonActive: { backgroundColor: '#42a5f5' },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#1976d2', marginBottom: 10 },
  eventItem: { padding: 10, marginBottom: 10, borderRadius: 10, backgroundColor: '#e3f2fd' },
  eventTime: { color: '#1565c0', fontWeight: '600' },
  eventTitle: { fontSize: 16, color: '#333' },
  emptyText: { textAlign: 'center', color: '#aaa', marginTop: 20 },

  bottomButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    backgroundColor: '#f9f9f9',
    borderTopWidth: 1,
    borderColor: '#ddd',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 10,
    backgroundColor: '#42a5f5',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  buttonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },

  monthControl: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  arrow: { fontSize: 20, color: '#42a5f5', fontWeight: 'bold' },
  monthText: { fontSize: 18, fontWeight: '600', color: '#1976d2' },
  
  // 农历日期样式
  dayContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  dayText: {
    fontSize: 14,
    color: '#333',
    fontWeight: 'normal',
  },
  todayText: {
    color: '#42a5f5',
    fontWeight: 'bold',
  },
  lunarText: {
    fontSize: 9,
    color: '#999',
    marginTop: 2,
  },
  selectedDayContainer: {
    backgroundColor: '#42a5f5',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 6,
    alignSelf: 'stretch',
  },
  selectedDayText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  selectedLunarText: {
    color: '#e3f2fd',
  }
});