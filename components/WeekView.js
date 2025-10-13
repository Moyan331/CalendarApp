import { getEvents } from '@/db/database';
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
    let allEvents = [];

    for (let i = 0; i < 7; i++) {
      const day = start.add(i, 'day').format('YYYY-MM-DD');
      const dayEvents = await getEvents(day);
      allEvents = allEvents.concat(dayEvents);
    }

    allEvents.sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return a.startTime.localeCompare(b.startTime);
    });

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

  /** ⏪ 上一周 / ⏩ 下一周 */
  const handleChangeWeek = (direction) => {
    const newDate = dayjs(selectWeekDay).add(direction * 7, 'day').format('YYYY-MM-DD');
    setSelectWeekDay(newDate);
    onDaySelect?.(newDate);
  };

  return (
    <View style={styles.container}>
      {/* ⬅️➡️ 周切换控制区
      <View style={styles.header}>
        <TouchableOpacity style={styles.navButton} onPress={() => handleChangeWeek(-1)}>
          <Text style={styles.navText}>⬅️ 上一周</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          {dayjs(selectWeekDay).startOf('week').format('MM月DD日')} -{' '}
          {dayjs(selectWeekDay).endOf('week').format('MM月DD日')}
        </Text>

        <TouchableOpacity style={styles.navButton} onPress={() => handleChangeWeek(1)}>
          <Text style={styles.navText}>下一周 ➡️</Text>
        </TouchableOpacity>
      </View> */}
      {/* 🔄 周切换控制条 */}
      <View style={styles.headerContainer}>
        <TouchableOpacity style={styles.arrowButton} onPress={() => setSelectWeekDay(dayjs(selectWeekDay).subtract(1, 'week').format('YYYY-MM-DD'))}>
          <Text style={styles.arrowText}>‹</Text>
        </TouchableOpacity>

        <Text style={styles.weekTitle}>
          {dayjs(selectWeekDay).startOf('week').format('MM/DD')} - {dayjs(selectWeekDay).endOf('week').format('MM/DD')}
        </Text>

        <TouchableOpacity style={styles.arrowButton} onPress={() => setSelectWeekDay(dayjs(selectWeekDay).add(1, 'week').format('YYYY-MM-DD'))}>
          <Text style={styles.arrowText}>›</Text>
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
              {item.date} {item.startTime} - {item.endTime}
            </Text>
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
  eventDate: { color: '#2196F3', fontWeight: '600' },
  eventTitle: { fontSize: 16 },
  emptyText: { textAlign: 'center', marginTop: 20, color: '#aaa' },

  headerContainer: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingHorizontal: 16,
  paddingVertical: 8,
  backgroundColor: '#fff',
  borderBottomWidth: 1,
  borderBottomColor: '#eee',
  shadowColor: '#000',
  shadowOpacity: 0.05,
  shadowRadius: 3,
  elevation: 2,
},

weekTitle: {
  fontSize: 16,
  fontWeight: '600',
  color: '#333',
},

arrowButton: {
  width: 36,
  height: 36,
  borderRadius: 18,
  backgroundColor: '#2196F3',
  justifyContent: 'center',
  alignItems: 'center',
  shadowColor: '#000',
  shadowOpacity: 0.2,
  shadowRadius: 3,
  elevation: 3,
},

arrowText: {
  color: '#fff',
  fontSize: 20,
  fontWeight: 'bold',
},

});
