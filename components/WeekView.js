// components/WeekView.js
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function WeekView({ selectedDate, onSelectDate, markedDates = {} }) {
  const [currentWeekStart, setCurrentWeekStart] = useState(
    selectedDate ? dayjs(selectedDate).startOf('week') : dayjs().startOf('week')
  );

  // 如果选中的日期变化，自动调整当前周
  useEffect(() => {
    if (selectedDate) {
      const newWeekStart = dayjs(selectedDate).startOf('week');
      setCurrentWeekStart(newWeekStart);
    }
  }, [selectedDate]);

  // 生成当前周的7天
  const days = Array.from({ length: 7 }, (_, i) => currentWeekStart.add(i, 'day'));

  return (
    <View>
      {/* 上一周 / 下一周按钮 */}
      <View style={styles.weekNav}>
        <TouchableOpacity onPress={() => setCurrentWeekStart(currentWeekStart.subtract(1, 'week'))}>
          <Text style={styles.navText}>上周</Text>
        </TouchableOpacity>
        <Text style={styles.weekTitle}>{currentWeekStart.format('YYYY年MM月')}</Text>
        <TouchableOpacity onPress={() => setCurrentWeekStart(currentWeekStart.add(1, 'week'))}>
          <Text style={styles.navText}>下周</Text>
        </TouchableOpacity>
      </View>

      {/* 每天按钮 */}
      <View style={styles.weekRow}>
        {days.map((day) => {
          const dateStr = day.format('YYYY-MM-DD');
          const isSelected = selectedDate === dateStr;
          const hasEvent = markedDates[dateStr]?.marked;

          return (
            <TouchableOpacity
              key={dateStr}
              style={[styles.dayContainer, isSelected && styles.selectedDay]}
              onPress={() => onSelectDate(dateStr)}
            >
              <Text style={[styles.dayText, isSelected && styles.selectedDayText]}>
                {day.format('dd')}
              </Text>
              <Text style={[styles.dateText, isSelected && styles.selectedDayText]}>
                {day.format('D')}
              </Text>
              {hasEvent && <View style={styles.dot} />}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  weekNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginBottom: 10,
    alignItems: 'center',
  },
  navText: { fontSize: 16, color: '#2196F3' },
  weekTitle: { fontSize: 16, fontWeight: 'bold' },
  weekRow: { flexDirection: 'row', justifyContent: 'space-around', marginVertical: 5 },
  dayContainer: { alignItems: 'center', padding: 6, borderRadius: 8 },
  selectedDay: { backgroundColor: '#2196F3' },
  dayText: { fontSize: 14 },
  dateText: { fontSize: 16 },
  selectedDayText: { color: 'white', fontWeight: 'bold' },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#2196F3', marginTop: 2 },
});
