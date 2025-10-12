import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function WeekView({ selected, onDaySelect }) {
  const [currentWeekStart, setCurrentWeekStart] = useState(getStartOfWeek(selected));

  // 当外部选中的日期改变时，自动同步周起点
  useEffect(() => {
    setCurrentWeekStart(getStartOfWeek(selected));
  }, [selected]);

  // 获取一周的日期（周一到周日）
  const getWeekDays = (start) => {
    return Array.from({ length: 7 }, (_, i) => dayjs(start).add(i, 'day'));
  };

  const handlePrevWeek = () => {
    setCurrentWeekStart((prev) => dayjs(prev).subtract(1, 'week'));
  };

  const handleNextWeek = () => {
    setCurrentWeekStart((prev) => dayjs(prev).add(1, 'week'));
  };

  const weekDays = getWeekDays(currentWeekStart);

  return (
    <View style={styles.container}>
      {/* 上一周 / 下一周按钮 */}
      <View style={styles.navContainer}>
        <TouchableOpacity onPress={handlePrevWeek}>
          <Text style={styles.navButton}>{'‹ 上周'}</Text>
        </TouchableOpacity>
        <Text style={styles.weekRange}>
          {dayjs(currentWeekStart).format('MM/DD')} - {dayjs(currentWeekStart).add(6, 'day').format('MM/DD')}
        </Text>
        <TouchableOpacity onPress={handleNextWeek}>
          <Text style={styles.navButton}>{'下周 ›'}</Text>
        </TouchableOpacity>
      </View>

      {/* 一周的日期 */}
      <View style={styles.weekRow}>
        {weekDays.map((date) => {
          const dateStr = date.format('YYYY-MM-DD');
          const isSelected = dateStr === selected;
          return (
            <TouchableOpacity
              key={dateStr}
              style={[styles.dayContainer, isSelected && styles.selectedDay]}
              onPress={() => onDaySelect(dateStr)}
            >
              <Text style={[styles.dayText, isSelected && styles.selectedDayText]}>
                {date.format('dd')} {/* 显示 周一/周二... */}
              </Text>
              <Text style={[styles.dateText, isSelected && styles.selectedDateText]}>
                {date.format('D')}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

// 获取指定日期所在周的周一
function getStartOfWeek(dateString) {
  const date = dayjs(dateString || dayjs());
  const dayOfWeek = date.day() === 0 ? 7 : date.day(); // 把周日当作第7天
  return date.subtract(dayOfWeek - 1, 'day');
}

const styles = StyleSheet.create({
  container: {
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 2,
  },
  navContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  navButton: {
    fontSize: 16,
    color: '#2196F3',
  },
  weekRange: {
    fontSize: 16,
    fontWeight: '600',
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayContainer: {
    alignItems: 'center',
    flex: 1,
    paddingVertical: 6,
    borderRadius: 8,
  },
  dayText: {
    fontSize: 12,
    color: '#666',
  },
  dateText: {
    fontSize: 16,
    color: '#000',
  },
  selectedDay: {
    backgroundColor: '#2196F3',
  },
  selectedDayText: {
    color: '#fff',
  },
  selectedDateText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
