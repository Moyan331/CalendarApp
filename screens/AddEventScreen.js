import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import TimePicker from '../components/TimePicker';
import { addEvent } from '../db/database';

export default function AddEventScreen({ navigation, route }) {
  const selectedDate = route.params?.selectedDate || new Date().toISOString().split('T')[0];
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  
  // 时间状态 - 使用数字而不是字符串
  const [startHour, setStartHour] = useState(9);
  const [startMinute, setStartMinute] = useState(0);
  const [endHour, setEndHour] = useState(10);
  const [endMinute, setEndMinute] = useState(0);
  
  const [reminder, setReminder] = useState('15');
  
  // 计算显示的时间字符串（用于预览）
  const startTimeString = `${startHour.toString().padStart(2, '0')}:${startMinute.toString().padStart(2, '0')}`;
  const endTimeString = `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`;

  // 验证开始时间是否早于当前时间
  const validateStartTime = (date, hour, minute) => {
    const eventDateTime = new Date(`${date}T${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:00`);
    const now = new Date();
    
    if (eventDateTime < now) {
      return '开始时间不能早于当前时间';
    }
    
    return '';
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('错误', '标题不能为空');
      return;
    }
    
    // 验证开始时间是否早于当前时间
    const timeValidation = validateStartTime(selectedDate, startHour, startMinute);
    if (timeValidation) {
      Alert.alert('错误', timeValidation);
      return;
    }
    
    // 验证结束时间是否在开始时间之后
    const startTotalMinutes = startHour * 60 + startMinute;
    const endTotalMinutes = endHour * 60 + endMinute;
    
    if (endTotalMinutes <= startTotalMinutes) {
      Alert.alert('错误', '结束时间必须在开始时间之后');
      return;
    }
    
    try {
      const event = {
        title,
        description,
        date: selectedDate,
        startTime: startTimeString,
        endTime: endTimeString,
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
          
          {/* 开始时间选择器 */}
          <TimePicker
            label="开始时间"
            selectedHour={startHour}
            selectedMinute={startMinute}
            onHourChange={setStartHour}
            onMinuteChange={setStartMinute}
          />
          
          {/* 结束时间选择器 */}
          <TimePicker
            label="结束时间"
            selectedHour={endHour}
            selectedMinute={endMinute}
            onHourChange={setEndHour}
            onMinuteChange={setEndMinute}
          />
          
          {/* 时间预览 */}
          <View style={styles.timePreview}>
            <Text style={styles.timePreviewText}>
              开始时间: {startTimeString} | 结束时间: {endTimeString}
            </Text>
            <Text style={styles.durationText}>
              持续时间: {Math.floor((endHour * 60 + endMinute - startHour * 60 - startMinute) / 60)}小时
              {(endHour * 60 + endMinute - startHour * 60 - startMinute) % 60}分钟
            </Text>
          </View>

          <Text style={styles.label}>提醒时间（分钟）</Text>
          <View style={styles.reminderContainer}>
            <Picker
              selectedValue={reminder}
              onValueChange={setReminder}
              style={styles.reminderPicker}
            >
              <Picker.Item label="不提醒" value="0" />
              <Picker.Item label="5分钟前" value="5" />
              <Picker.Item label="15分钟前" value="15" />
              <Picker.Item label="30分钟前" value="30" />
              <Picker.Item label="1小时前" value="60" />
              <Picker.Item label="2小时前" value="120" />
              <Picker.Item label="1天前" value="1440" />
            </Picker>
          </View>
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#1976d2',
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
  timePreview: {
    backgroundColor: '#f1f8ff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
  },
  timePreviewText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1976d2',
    textAlign: 'center',
  },
  durationText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 5,
  },
  reminderContainer: {
    borderWidth: 1,
    borderColor: '#cfd8dc',
    borderRadius: 10,
    backgroundColor: '#fafafa',
    overflow: 'hidden',
  },
  reminderPicker: {
    height: 50,
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
  },
  saveText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
});