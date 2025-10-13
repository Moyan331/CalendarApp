// CalendarScreen.js (核心部分已改为 View，不再用 ScrollView)
import { getEvents } from '@/db/database';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Calendar } from 'react-native-calendars';
import WeekView from '../components/WeekView';

export default function CalendarScreen({ navigation }) {
  const [selectedDate, setSelectedDate] = useState('');
  const [viewMode, setViewMode] = useState('month');
  const [events, setEvents] = useState([]);

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

  return (
    <LinearGradient colors={['#e3f2fd', '#ffffff']} style={{ flex: 1 }}>
      {/* 将 ScrollView 换成 View，保证外层不是同向滚动容器 */}
      <View style={styles.container}>
        <Text style={styles.header}>📆 我的日程</Text>

        {/* 切换等 UI 保持不变 */}
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
              <Text style={{ color: viewMode === mode ? '#fff' : '#1565c0', fontWeight: viewMode === mode ? 'bold' : 'normal' }}>
                {mode === 'month' ? '月' : mode === 'week' ? '周' : '日'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {viewMode === 'month' && (
          <View style={styles.card}>
            <Calendar
              onDayPress={(day) => setSelectedDate(day.dateString)}
              markedDates={markedDates}
              markingType="dot"
              theme={{ /* 你的主题 */ }}
            />
          </View>
        )}

        {viewMode === 'week' && (
          <View style={[styles.card, { flex: 1 }]}>
            {/* WeekView 内部含 FlatList，自身滚动 */}
            <WeekView
              selected={selectedDate}
              onDaySelect={(date) => setSelectedDate(date)}
            />
          </View>
        )}

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

        <View style={styles.bottomButtons}>
  {/* 添加日程按钮 */}
  <TouchableOpacity
    style={styles.actionButton}
    onPress={() => navigation.navigate('AddEvent', { selectedDate })}
  >
    <Text style={styles.buttonText}>➕ 添加日程</Text>
  </TouchableOpacity>

  {/* 查看所有事件按钮 */}
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
  container: { flex: 1, padding: 16 }, // 注意这里有 flex:1
  header: { fontSize: 26, fontWeight: '700', color: '#1565c0', marginBottom: 12 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 20, /* ... */ },
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
  // 让按钮区域固定在底部
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

buttonText: {
  color: 'white',
  fontWeight: 'bold',
  fontSize: 16,
},

});
