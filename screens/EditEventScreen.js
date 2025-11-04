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

  // 获取当前日期字符串（YYYY-MM-DD格式）
  const getCurrentDate = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // 获取当前时间字符串（HH:MM格式）
  const getCurrentTime = () => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  // 验证时间格式
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

  // 验证开始时间是否早于当前时间（仅对当日事件）
  const validateStartTime = (date, time) => {
    const currentDate = getCurrentDate();
    
    // 只有当事件日期是今天时才验证
    if (date === currentDate) {
      const eventDateTime = new Date(`${date}T${time}:00`);
      const now = new Date();
      
      if (eventDateTime < now) {
        return '今日事件的开始时间不能早于当前时间';
      }
    }
    
    return ''; // 验证通过
  };

  // 检查是否为当日事件
  const isTodayEvent = event.date === getCurrentDate();

  const handleUpdate = async () => {
    if (!title.trim()) {
      Alert.alert('错误', '标题不能为空');
      return;
    }

    // 验证开始时间格式
    const startErr = validateTime(startTime);
    if (startErr) { 
      Alert.alert('错误', `开始时间: ${startErr}`); 
      return; 
    }

    // 验证结束时间格式
    const endErr = validateTime(endTime);
    if (endErr) { 
      Alert.alert('错误', `结束时间: ${endErr}`); 
      return; 
    }

    // 验证开始时间是否早于当前时间（仅对当日事件）
    const timeValidation = validateStartTime(event.date, startTime);
    if (timeValidation) {
      Alert.alert('错误', timeValidation);
      return;
    }

    // 验证结束时间是否在开始时间之后
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
      Alert.alert('成功', '日程已更新');
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
        <View style={styles.dateContainer}>
          <Text style={styles.dateText}>📅 {event.date}</Text>
          {/* {isTodayEvent && (
            <Text style={styles.todayWarning}>
              ⚠️ 今日事件：开始时间不能早于当前时间 ({getCurrentTime()})
            </Text>
          )} */}
        </View>

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
              <Text style={styles.label}>
                开始时间 
              </Text>
              <TextInput
                style={[
                  styles.timeInput,
                  // isTodayEvent && styles.todayInput
                ]}
                placeholder="HH:MM"
                value={startTime}
                onChangeText={setStartTime}
                keyboardType="numbers-and-punctuation"
              />
              {/* {isTodayEvent && (
                <Text style={styles.hintText}>
                  不能早于 {getCurrentTime()}
                </Text>
              )} */}
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
              {/* <Text style={styles.hintText}>必须在开始时间之后</Text> */}
            </View>
          </View>

          <Text style={styles.label}>提前提醒 (分钟)</Text>
          <TextInput
            style={styles.input}
            placeholder="例如: 30 (0表示不提醒)"
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
  container: { 
    flex: 1, 
    backgroundColor: '#F8FAFF' 
  },
  header: {
    backgroundColor: '#2196F3',
    paddingVertical: 14,
    paddingHorizontal: 20,
    elevation: 3,
  },
  headerText: { 
    color: '#fff', 
    fontSize: 20, 
    fontWeight: 'bold' 
  },
  scrollContent: { 
    padding: 20, 
    paddingBottom: 100 
  },
  dateContainer: {
    marginBottom: 16,
  },
  dateText: { 
    fontSize: 16, 
    color: '#1976D2',
    fontWeight: '500',
  },
  todayWarning: {
    fontSize: 14,
    color: '#FF9800',
    marginTop: 4,
    fontWeight: '500',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  label: { 
    fontSize: 14, 
    color: '#444', 
    marginBottom: 6,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: '#fafafa',
  },
  multilineInput: { 
    height: 100, 
    textAlignVertical: 'top' 
  },
  timeContainer: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginBottom: 16 
  },
  timeCard: { 
    flex: 1, 
    marginRight: 10 
  },
  timeInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    backgroundColor: '#fafafa',
  },
  todayInput: {
    borderColor: '#FF9800',
    backgroundColor: '#FFF3E0',
  },
  hintText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    fontStyle: 'italic',
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
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});