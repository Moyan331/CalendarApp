import { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { updateEvent } from '../db/database';

export default function EditEventScreen({ navigation, route }) {
  const { event } = route.params;

  const [title, setTitle] = useState(event.title);
  const [description, setDescription] = useState(event.description || '');
  const [startTime, setStartTime] = useState(event.startTime);
  const [endTime, setEndTime] = useState(event.endTime);
  const [reminder, setReminder] = useState(event.reminder ? event.reminder.toString() : '');

  const validateTime = (time) => {
    if (!time) return false;
    if (!/^\d{1,2}:\d{0,2}$/.test(time)) return '格式应为 HH:MM';
    const [hStr, mStr] = time.split(':');
    const h = parseInt(hStr, 10);
    const m = parseInt(mStr || '0', 10);
    if (h < 0 || h > 23) return '小时必须在 0-23';
    if (m < 0 || m > 59) return '分钟必须在 0-59';
    return '';
  };

  const handleUpdate = async () => {
    if (!title.trim()) {
      Alert.alert('错误', '标题不能为空');
      return;
    }

    const startErr = validateTime(startTime);
    if (startErr) { Alert.alert('错误', `开始时间: ${startErr}`); return; }

    const endErr = validateTime(endTime);
    if (endErr) { Alert.alert('错误', `结束时间: ${endErr}`); return; }

    const [sH, sM] = startTime.split(':').map(Number);
    const [eH, eM] = endTime.split(':').map(Number);
    if (eH * 60 + eM <= sH * 60 + sM) {
      Alert.alert('错误', '结束时间必须在开始时间之后');
      return;
    }

    try {
      const updatedEvent = {
        title,
        description,
        date: event.date,
        startTime,
        endTime,
        reminder: reminder ? parseInt(reminder) : null,
      };
      await updateEvent(event.id, updatedEvent);
      navigation.navigate('ViewEvents', { selectedDate: event.date });
    } catch (error) {
      console.error('更新失败:', error);
      Alert.alert('错误', '更新事件失败，请重试');
    }
  };

  return (
    <View style={styles.container}>
      {/* 顶部标题栏 */}
      <View style={styles.header}>
        <Text style={styles.headerText}>编辑日程</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* 日期显示 */}
        <Text style={styles.dateText}>📅 {event.date}</Text>

        {/* 输入卡片 */}
        <View style={styles.card}>
          <Text style={styles.label}>标题 *</Text>
          <TextInput
            style={styles.input}
            placeholder="请输入日程标题"
            value={title}
            onChangeText={setTitle}
          />

          <Text style={styles.label}>描述</Text>
          <TextInput
            style={[styles.input, styles.multilineInput]}
            placeholder="请输入日程描述"
            value={description}
            onChangeText={setDescription}
            multiline
          />

          <View style={styles.timeContainer}>
            <View style={styles.timeCard}>
              <Text style={styles.label}>开始时间</Text>
              <TextInput
                style={styles.timeInput}
                placeholder="HH:MM"
                value={startTime}
                onChangeText={setStartTime}
                keyboardType="numbers-and-punctuation"
              />
            </View>
            <View style={styles.timeCard}>
              <Text style={styles.label}>结束时间</Text>
              <TextInput
                style={styles.timeInput}
                placeholder="HH:MM"
                value={endTime}
                onChangeText={setEndTime}
                keyboardType="numbers-and-punctuation"
              />
            </View>
          </View>

          <Text style={styles.label}>提前提醒 (分钟)</Text>
          <TextInput
            style={styles.input}
            placeholder="例如: 30"
            value={reminder}
            onChangeText={setReminder}
            keyboardType="numeric"
          />
        </View>
      </ScrollView>

      {/* 更新按钮 */}
      <TouchableOpacity style={styles.fab} onPress={handleUpdate}>
        <Icon name="check" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFF' },
  header: {
    backgroundColor: '#2196F3',
    paddingVertical: 14,
    paddingHorizontal: 20,
    elevation: 3,
  },
  headerText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  scrollContent: { padding: 20, paddingBottom: 100 },
  dateText: { fontSize: 16, color: '#1976D2', marginBottom: 12 },

  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
  },
  label: { fontSize: 14, color: '#444', marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: '#fafafa',
  },
  multilineInput: { height: 100, textAlignVertical: 'top' },

  timeContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  timeCard: { flex: 1, marginRight: 10 },
  timeInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    backgroundColor: '#fafafa',
  },

  fab: {
    position: 'absolute',
    bottom: 28,
    right: 28,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});
