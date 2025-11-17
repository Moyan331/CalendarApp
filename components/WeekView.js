import { getEventsByDateRange } from '@/db/database';
import { useFocusEffect } from '@react-navigation/native';
import dayjs from 'dayjs';
import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function WeekView({ selected, onDaySelect }) {
  const [weekDays, setWeekDays] = useState([]);
  const [events, setEvents] = useState([]);
  const [selectWeekDay, setSelectWeekDay] = useState(selected || dayjs().format('YYYY-MM-DD'));

  /** 🗓️ 生成当前周的日期 */
  useEffect(() => {
    const startOfWeek = dayjs(selectWeekDay).startOf('week');
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = startOfWeek.add(i, 'day');
      return {
        dateString: d.format('YYYY-MM-DD'),
        dayNumber: d.format('D'),
        weekday: d.format('dd'),
      };
    });
    setWeekDays(days);
  }, [selectWeekDay]);

  /** 📅 加载这一周所有事件 */
  const loadWeekEvents = useCallback(async (date) => {
    if (!date) return;
    const start = dayjs(date).startOf('week');
    const end = dayjs(date).endOf('week');
    
    const allEvents = await getEventsByDateRange(
      start.format('YYYY-MM-DD'),
      end.format('YYYY-MM-DD')
    );

    setEvents(allEvents);
  }, []);

  /** 🔄 聚焦刷新 */
  useFocusEffect(
    useCallback(() => {
      if (selectWeekDay) loadWeekEvents(selectWeekDay);
    }, [selectWeekDay, loadWeekEvents])
  );

  /** 🖱️ 点击日期 */
  const handleDaySelect = (date) => {
    setSelectWeekDay(date);
    onDaySelect?.(date);
  };

  // 当周切换时，更新选中的日期
  const handleWeekChange = (newDate) => {
    setSelectWeekDay(newDate);
    // 如果父组件传入了onDaySelect回调，则通知父组件更新选中日期
    onDaySelect?.(newDate);
  };

  return (
    <View style={styles.container}>

     {/* 🔄 周切换控制条 */}
        <View style={styles.headerContainer}>
          <TouchableOpacity
            onPress={() => handleWeekChange(dayjs(selectWeekDay).subtract(1, 'week').format('YYYY-MM-DD'))}
          >
            <Text style={styles.arrowText}>◀</Text>
          </TouchableOpacity>

          <Text style={styles.weekTitle}>
            {dayjs(selectWeekDay).startOf('week').format('MM/DD')} - {dayjs(selectWeekDay).endOf('week').format('MM/DD')}
          </Text>

          <TouchableOpacity
            onPress={() => handleWeekChange(dayjs(selectWeekDay).add(1, 'week').format('YYYY-MM-DD'))}
          >
            <Text style={styles.arrowText}>▶</Text>
          </TouchableOpacity>
        </View>


      {/* 周导航条 */}
      <View style={styles.weekContainer}>
        {weekDays.map((day) => (
          <TouchableOpacity
            key={day.dateString}
            style={[
              styles.dayContainer,
              selectWeekDay === day.dateString && styles.selectedDayContainer,
            ]}
            onPress={() => handleDaySelect(day.dateString)}
          >
            <Text
              style={[
                styles.weekdayText,
                selectWeekDay === day.dateString && styles.selectedDayText,
              ]}
            >
              {day.weekday}
            </Text>
            <Text
              style={[
                styles.dayNumber,
                selectWeekDay === day.dateString && styles.selectedDayText,
              ]}
            >
              {day.dayNumber}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 事件列表 */}
      <FlatList
        data={events}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ flexGrow: 1 }}
        renderItem={({ item }) => (
          <View style={styles.eventItem}>
            <Text style={styles.eventDate}>
              {item.date}
            </Text>
            <Text style={styles.eventDate}>{item.startTime} - {item.endTime}</Text>
            <Text style={styles.eventTitle}>{item.title}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>本周没有事件</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: '#e3f2fd',
    borderRadius: 10,
    marginHorizontal: 10,
    marginBottom: 6,
  },
  headerTitle: { fontWeight: 'bold', fontSize: 16, color: '#1565c0' },
  navButton: { paddingHorizontal: 8 },
  navText: { color: '#1976d2', fontWeight: '600' },
  weekContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
  },
  dayContainer: { alignItems: 'center', padding: 5 },
  selectedDayContainer: {
    backgroundColor: '#2196F3',
    borderRadius: 20,
    padding: 5,
  },
  weekdayText: { fontSize: 14, color: 'black' },
  dayNumber: { fontSize: 16, fontWeight: '600', color: 'black' },
  selectedDayText: { color: 'white', fontWeight: 'bold' },
  eventItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  eventDate: { 
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  eventTitle: { fontSize: 16 },
  emptyText: { textAlign: 'center', marginTop: 20, color: '#aaa' },


headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 10,
},

weekTitle: {
 fontSize: 18, fontWeight: '600', color: '#1976d2' 
},

arrowButton: {
  width: 40,
  height: 40,
  borderRadius: 20,
  backgroundColor: '#42a5f5',       // 蓝色按钮
  justifyContent: 'center',
  alignItems: 'center',
  shadowColor: '#000',
  shadowOpacity: 0.2,
  shadowRadius: 3,
  elevation: 3,
},

arrowText: { fontSize: 20, color: '#42a5f5', fontWeight: 'bold' },


});
