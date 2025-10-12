import { getEvents } from '@/db/database';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { Button, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Calendar } from 'react-native-calendars';
import WeekView from '../components/WeekView';

export default function CalendarScreen({ navigation }) {
   const [selectedDate, setSelectedDate] = useState('');
   const [viewMode, setViewMode] = useState('month'); // 'month' | 'week' | 'day'
   const [events, setEvents] = useState([]);

  // 每次页面重新聚焦时，刷新选中日期的事件
  useFocusEffect(
    useCallback(() => {
      if (selectedDate) {
        loadEvents(selectedDate);
      }
    }, [selectedDate])
  );

  
  const loadEvents = async (date) => {
    const rows = await getEvents(date);
    setEvents(rows);
  };
  
 // 获取哪些日期有事件
const markedDates = events.reduce((acc, event) => {
  acc[event.date] = {
    marked: true,
    dotColor: '#2196F3',
  };
  return acc;
}, {});

// 始终确保选中的日期被高亮
if (selectedDate) {
  markedDates[selectedDate] = {
    ...(markedDates[selectedDate] || {}), // 保留圆点
    selected: true,
    selectedColor: '#2196F3',
  };
}

  return (
    <View style={styles.container}>
      {/* 视图切换按钮 */}
      <View style={styles.switchContainer}>
        {['month', 'week', 'day'].map((mode) => (
          <TouchableOpacity
            key={mode}
            style={[styles.switchButton, viewMode === mode && styles.switchButtonActive]}
            onPress={() => setViewMode(mode)}
          >
            <Text style={styles.switchText}>{mode === 'month' ? '月' : mode === 'week' ? '周' : '日'}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 月视图 */}
      {viewMode === 'month' && (
        <Calendar
          onDayPress={(day) => setSelectedDate(day.dateString)}
          markedDates={markedDates}
          markingType="dot"
        />
      )}

      {/* 周视图 */}
      {viewMode === 'week' && (
      <WeekView 
        selected={selectedDate} 
        onDaySelect={(day) => setSelectedDate(day.dateString)}
      />
    )}

      {/* 日视图（显示当天的事件） */}
      {viewMode === 'day' && (
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
        />
      )}

      {/* 底部操作按钮 */}
      <View style={styles.buttonContainer}>
        <Button title="添加日程" onPress={() => navigation.navigate('AddEvent', { selectedDate })} />
        <View style={styles.buttonSpacer} />
        <Button title="查看日程" onPress={() => navigation.navigate('ViewEvents', { selectedDate })} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  switchContainer: { flexDirection: 'row', justifyContent: 'space-around', marginVertical: 10 },
  switchButton: { padding: 8, borderRadius: 10, backgroundColor: '#eee' },
  switchButtonActive: { backgroundColor: '#2196F3' },
  switchText: { color: 'black' },
  weekContainer: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 10 },
  weekDay: { fontSize: 16 },
  selectedDay: { color: '#2196F3', fontWeight: 'bold' },
  eventItem: { padding: 10, borderBottomWidth: 1, borderBottomColor: '#ddd' },
  eventTime: { color: '#2196F3', fontWeight: '600' },
  eventTitle: { fontSize: 16 },
  emptyText: { textAlign: 'center', marginTop: 20, color: '#aaa' },
  buttonContainer: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  buttonSpacer: { width: 20 },
});