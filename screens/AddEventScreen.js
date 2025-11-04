import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { addEvent } from '../db/database';

export default function AddEventScreen({ navigation, route }) {
  const selectedDate = route.params?.selectedDate || new Date().toISOString().split('T')[0];
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [reminder, setReminder] = useState('15');
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
  const validateStartTime = (date, time) => {
  // 创建事件开始时间
  const eventDateTime = new Date(`${date}T${time}:00`);
  
  // 获取当前时间
  const now = new Date();
  
  // 比较时间
  if (eventDateTime < now) {
    return '开始时间不能早于当前时间';
  }
  
  return ''; // 验证通过
};
  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('错误', '标题不能为空');
      return;
    }
    const startErr = validateTime(startTime);
    if (startErr) { Alert.alert('错误', `开始时间: ${startErr}`); return; }
    // 验证开始时间是否早于当前时间
    const timeValidation = validateStartTime(selectedDate, startTime);
    if (timeValidation) {
      Alert.alert('错误', timeValidation);
      return;
    }

    const endErr = validateTime(endTime);
    if (endErr) { Alert.alert('错误', `结束时间: ${endErr}`); return; }

    const [sH, sM] = startTime.split(':').map(Number);
    const [eH, eM] = endTime.split(':').map(Number);
    if (eH * 60 + eM <= sH * 60 + sM) {
      Alert.alert('错误', '结束时间必须在开始时间之后');
      return;
    }
    try {
      const event = {
        title,
        description,
        date: selectedDate,
        startTime,
        endTime,
        reminder: parseInt(reminder) || 0,
      };

      await addEvent(event);
      Alert.alert('成功', '日程已保存');
      navigation.goBack();
    } catch (error) {
      console.error('保存事件失败:', error);
      Alert.alert('错误', `保存事件失败: ${error.message}`);
    }
  };

  return (
    <LinearGradient
      colors={['#e3f2fd', '#ffffff']}
      style={styles.gradient}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headerBox}>
          <Text style={styles.header}>添加新日程</Text>
          <Text style={styles.dateText}>📅 日期: {selectedDate}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>标题 *</Text>
          <TextInput
            placeholder="请输入日程标题"
            value={title}
            onChangeText={setTitle}
            style={styles.input}
          />

          <Text style={styles.label}>描述</Text>
          <TextInput
            placeholder="请输入日程描述"
            value={description}
            onChangeText={setDescription}
            style={[styles.input, styles.multilineInput]}
            multiline
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>🕒 时间设置</Text>
          <View style={styles.timeRow}>
            <View style={styles.timeInputContainer}>
              <Text style={styles.label}>开始时间</Text>
              <TextInput
                placeholder="HH:MM"
                value={startTime}
                onChangeText={setStartTime}
                style={styles.input}
                keyboardType="numbers-and-punctuation"
              />
            </View>

            <View style={styles.timeInputContainer}>
              <Text style={styles.label}>结束时间</Text>
              <TextInput
                placeholder="HH:MM"
                value={endTime}
                onChangeText={setEndTime}
                style={styles.input}
                keyboardType="numbers-and-punctuation"
              />
            </View>
          </View>

          <Text style={styles.label}>提醒时间（分钟）</Text>
          <TextInput
            placeholder="提前多少分钟提醒"
            value={reminder}
            onChangeText={setReminder}
            style={styles.input}
            keyboardType="numeric"
          />
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <LinearGradient
            colors={['#42a5f5', '#1e88e5']}
            style={styles.saveGradient}
          >
            <Ionicons name="save-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.saveText}>保存日程</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  headerBox: {
    marginBottom: 20,
  },
  header: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1565c0',
  },
  dateText: {
    fontSize: 16,
    color: '#555',
    marginTop: 6,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#1976d2',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 4,
  },
  label: {
    fontSize: 15,
    color: '#444',
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#cfd8dc',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#fafafa',
  },
  multilineInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeInputContainer: {
    flex: 1,
    marginRight: 10,
  },
  saveButton: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  saveGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    shadowColor: '#42a5f5',
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
  },
  saveText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
});
