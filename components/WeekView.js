// WeekView.js
import { getEvents } from '@/db/database'; // 或者你写的 getEventsInRange
import { useFocusEffect } from '@react-navigation/native';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function WeekView({ selected, onDaySelect }) {
  const [weekDays, setWeekDays] = useState([]);
  const [events, setEvents] = useState([]);
  const [selectWeekDay, setselectWeekDay] = useState(selected || dayjs().format('YYYY-MM-DD'));

  // 生成当前周的日期
  useEffect(() => {
    const startOfWeek = dayjs(selectWeekDay).startOf('week'); // 周日为起点
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = startOfWeek.add(i, 'day');
      days.push({
        dateString: day.format('YYYY-MM-DD'),
        dayNumber: day.format('D'),
        weekday: day.format('dd'), // Mo, Tu...
      });
    }
    setWeekDays(days);
  }, [selectWeekDay]);


    const loadWeekEvents = useCallback (async (selectWeekDay) => {
      const start = dayjs(selectWeekDay).startOf('week').format('YYYY-MM-DD');
      const end = dayjs(selectWeekDay).endOf('week').format('YYYY-MM-DD');
      
      let allEvents = [];
      for (let i = 0; i < 7; i++) {
        const date = dayjs(start).add(i, 'day').format('YYYY-MM-DD');
        const dayEvents = await getEvents(date);
        allEvents = allEvents.concat(dayEvents);
      }
      // 按日期和时间排序
      allEvents.sort((a, b) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        return a.startTime.localeCompare(b.startTime);
      });

      setEvents(allEvents);
    });

 useFocusEffect(
    useCallback(() => {
      if (selectWeekDay) loadWeekEvents(selectWeekDay);
    }, [selectWeekDay, loadWeekEvents])
  );

  // 加载当前周事件
  useEffect(() => {
    loadWeekEvents();
  }, [selectWeekDay]);

  const handleDaySelect = (date) => {
    setselectWeekDay(date);
    if (onDaySelect) onDaySelect( date );
  };

  return (
    <View style={styles.container}>
      {/* 周显示 */}
      <View style={styles.weekContainer}>
        {weekDays.map((day) => (
          <TouchableOpacity
            key={day.dateString}
            style={[styles.dayContainer, selectWeekDay === day.dateString && styles.selectedDayContainer]}
            onPress={() => handleDaySelect(day.dateString)}
          >
            <Text style={[styles.weekdayText, selectWeekDay === day.dateString && styles.selectedDayText]}>
              {day.weekday}
            </Text>
            <Text style={[styles.dayNumber, selectWeekDay === day.dateString && styles.selectedDayText]}>
              {day.dayNumber}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 事件列表 */}
      <FlatList
        style={styles.eventsList}
        data={events}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.eventItem}>
            <Text style={styles.eventDate}>{item.date} {item.startTime}-{item.endTime}</Text>
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
  weekContainer: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 10 },
  dayContainer: { alignItems: 'center', padding: 5 },
  selectedDayContainer: { backgroundColor: '#2196F3', borderRadius: 20, padding: 5 },
  weekdayText: { fontSize: 14, color: 'black' },
  dayNumber: { fontSize: 16, fontWeight: '600', color: 'black' },
  selectedDayText: { color: 'white', fontWeight: 'bold' },
  eventsList: { flex: 1, marginTop: 10 },
  eventItem: { padding: 10, borderBottomWidth: 1, borderBottomColor: '#ddd' },
  eventDate: { color: '#2196F3', fontWeight: '600' },
  eventTitle: { fontSize: 16 },
  emptyText: { textAlign: 'center', marginTop: 20, color: '#aaa' },
});
