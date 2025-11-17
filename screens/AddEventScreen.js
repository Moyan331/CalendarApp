// import { Ionicons } from '@expo/vector-icons';
// import DateTimePicker from '@react-native-community/datetimepicker';
// import { Picker } from '@react-native-picker/picker';
// import { LinearGradient } from 'expo-linear-gradient';
// import React, { useState } from 'react';
// import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
// import { addEvent } from '../db/database';
// import { convertToLunar } from '../utils/lunarCalculator';

// export default function AddEventScreen({ navigation, route }) {
//   const selectedDate = route.params?.selectedDate || new Date().toISOString().split('T')[0];
  
//   const [title, setTitle] = useState('');
//   const [description, setDescription] = useState('');
  
//   // 时间状态 - 使用Date对象而不是数字
//   const [startTime, setStartTime] = useState(new Date());
//   const [endTime, setEndTime] = useState(new Date(new Date().setHours(new Date().getHours() + 1)));
//   const [showStartPicker, setShowStartPicker] = useState(false);
//   const [showEndPicker, setShowEndPicker] = useState(false);
  
//   const [reminder, setReminder] = useState('15');
  
//   // 计算显示的时间字符串（用于预览）
//   const startTimeString = startTime.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
//   const endTimeString = endTime.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });

//   // 获取农历日期字符串
//   const getLunarDateString = (dateString) => {
//     try {
//       const lunarInfo = convertToLunar(dateString);
//       if (!lunarInfo) return '无法获取农历信息';
      
//       // 如果是节气，优先显示节气
//       if (lunarInfo.isTerm && lunarInfo.term) {
//         return `${lunarInfo.gzYear}${lunarInfo.animal}年 ${lunarInfo.month}${lunarInfo.day} ${lunarInfo.term}`;
//       }
      
//       // 返回完整的农历日期信息
//       return `${lunarInfo.gzYear}${lunarInfo.animal}年 ${lunarInfo.month}${lunarInfo.day}`;
//     } catch (error) {
//       console.warn('获取农历信息失败:', error);
//       return '无法获取农历信息';
//     }
//   };

//   // 验证开始时间是否早于当前时间
//   const validateStartTime = (dateString, time) => {
//     // 使用传入的 startTime Date 对象，并将其日期部分设置为 selectedDate
//     const eventDateTime = new Date(dateString);
//     eventDateTime.setHours(time.getHours(), time.getMinutes(), time.getSeconds(), time.getMilliseconds());
    
//     const now = new Date();
    
//     if (eventDateTime < now) {
//       return '开始时间不能早于当前时间';
//     }
    
//     return '';
//   };

//   const handleSave = async () => {
//     if (!title.trim()) {
//       Alert.alert('错误', '标题不能为空');
//       return;
//     }
    
//     // 验证开始时间是否早于当前时间
//     const timeValidation = validateStartTime(selectedDate, startTime);
//     if (timeValidation) {
//       Alert.alert('错误', timeValidation);
//       return;
//     }
    
//     // 验证结束时间是否在开始时间之后
//     if (endTime <= startTime) {
//       Alert.alert('错误', '结束时间必须在开始时间之后');
//       return;
//     }
    
//     try {
//       const event = {
//         title,
//         description,
//         date: selectedDate,
//         startTime: startTimeString,
//         endTime: endTimeString,
//         reminder: parseInt(reminder) || 0,
//       };

//       await addEvent(event);
//       navigation.goBack();
//     } catch (error) {
//       console.error('保存事件失败:', error);
//       Alert.alert('错误', `保存事件失败: ${error.message}`);
//     }
//   };

//   const onStartChange = (event, selectedTime) => {
//     setShowStartPicker(false);
//     if (event.type === 'set' && selectedTime) {
//       setStartTime(selectedTime);
//     }
//   };

//   const onEndChange = (event, selectedTime) => {
//     setShowEndPicker(false);
//     if (event.type === 'set' && selectedTime) {
//       setEndTime(selectedTime);
//     }
//   };

//   return (
//     <LinearGradient
//       colors={['#e3f2fd', '#ffffff']}
//       style={styles.gradient}
//     >
//       <ScrollView contentContainerStyle={styles.container}>
//         <View style={styles.headerBox}>
//           <View style={styles.headerContainer}>
//             <TouchableOpacity 
//               style={styles.backButton}
//               onPress={() => navigation.goBack()}
//             >
//               <Ionicons name="arrow-back" size={24} color="#1565c0" />
//             </TouchableOpacity>
//             <Text style={styles.header}>添加新日程</Text>
//             <View style={{ width: 24 }} /> {/* 用于平衡布局 */}
//           </View>
//           <Text style={styles.dateText}>📅 公历: {selectedDate}</Text>
//           <Text style={styles.dateText}>📅 农历: {getLunarDateString(selectedDate)}</Text>
//         </View>

//         <View style={styles.card}>
//           <Text style={styles.label}>标题 *</Text>
//           <TextInput
//             placeholder="请输入日程标题"
//             value={title}
//             onChangeText={setTitle}
//             style={styles.input}
//           />

//           <Text style={styles.label}>描述</Text>
//           <TextInput
//             placeholder="请输入日程描述"
//             value={description}
//             onChangeText={setDescription}
//             style={[styles.input, styles.multilineInput]}
//             multiline
//           />
//         </View>

//         <View style={styles.card}>
//           <Text style={styles.sectionTitle}>🕒 时间设置</Text>
          
//           {/* 开始时间选择器 */}
//           <View style={styles.timePickerContainer}>
//             <Text style={styles.label}>开始时间</Text>
//             <TouchableOpacity 
//               style={styles.timeButton} 
//               onPress={() => setShowStartPicker(true)}
//             >
//               <Text style={styles.timeButtonText}>{startTimeString}</Text>
//             </TouchableOpacity>
//             {showStartPicker && (
//               <DateTimePicker
//                 value={startTime}
//                 mode="time"
//                 display="spinner"
//                 onChange={onStartChange}
//                 locale="zh-CN"
//               />
//             )}
//           </View>
          
//           {/* 结束时间选择器 */}
//           <View style={styles.timePickerContainer}>
//             <Text style={styles.label}>结束时间</Text>
//             <TouchableOpacity 
//               style={styles.timeButton} 
//               onPress={() => setShowEndPicker(true)}
//             >
//               <Text style={styles.timeButtonText}>{endTimeString}</Text>
//             </TouchableOpacity>
//             {showEndPicker && (
//               <DateTimePicker
//                 value={endTime}
//                 mode="time"
//                 display="spinner"
//                 onChange={onEndChange}
//                 locale="zh-CN"
//               />
//             )}
//           </View>
          
//           {/* 时间预览 */}
//           <View style={styles.timePreview}>
//             <Text style={styles.timePreviewText}>
//               开始时间: {startTimeString} | 结束时间: {endTimeString}
//             </Text>
//             <Text style={styles.durationText}>
//               持续时间: {Math.floor((endTime - startTime) / (1000 * 60 * 60))}小时
//               {Math.floor((endTime - startTime) % (1000 * 60 * 60) / (1000 * 60))}分钟
//             </Text>
//           </View>

//           <Text style={styles.label}>提醒时间（分钟）</Text>
//           <View style={styles.reminderContainer}>
//             <Picker
//               selectedValue={reminder}
//               onValueChange={setReminder}
//               style={styles.reminderPicker}
//             >
//               <Picker.Item label="不提醒" value="0" />
//               <Picker.Item label="5分钟前" value="5" />
//               <Picker.Item label="15分钟前" value="15" />
//               <Picker.Item label="30分钟前" value="30" />
//               <Picker.Item label="1小时前" value="60" />
//               <Picker.Item label="2小时前" value="120" />
//               <Picker.Item label="1天前" value="1440" />
//             </Picker>
//           </View>
//         </View>

//         <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
//           <LinearGradient
//             colors={['#42a5f5', '#1e88e5']}
//             style={styles.saveGradient}
//           >
//             <Ionicons name="save-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
//             <Text style={styles.saveText}>保存日程</Text>
//           </LinearGradient>
//         </TouchableOpacity>
//       </ScrollView>
//     </LinearGradient>
//   );
// }

// const styles = StyleSheet.create({
//   gradient: {
//     flex: 1,
//   },
//   container: {
//     padding: 20,
//     paddingBottom: 40,
//   },
//   headerBox: {
//     marginBottom: 20,
//   },
//   headerContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 10,
//   },
//   backButton: {
//     padding: 5,
//     marginRight: 10,
//   },
//   header: {
//     fontSize: 26,
//     fontWeight: '700',
//     color: '#1565c0',
//     flex: 1,
//   },
//   dateText: {
//     fontSize: 16,
//     color: '#555',
//     marginTop: 6,
//   },
//   card: {
//     backgroundColor: '#fff',
//     borderRadius: 14,
//     padding: 16,
//     marginBottom: 20,
//     shadowColor: '#000',
//     shadowOpacity: 0.1,
//     shadowOffset: { width: 0, height: 3 },
//     shadowRadius: 6,
//     elevation: 4,
//   },
//   sectionTitle: {
//     fontSize: 18,
//     fontWeight: '600',
//     marginBottom: 12,
//     color: '#1976d2',
//   },
//   label: {
//     fontSize: 15,
//     color: '#444',
//     marginBottom: 6,
//     marginTop: 10,
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: '#cfd8dc',
//     borderRadius: 10,
//     paddingHorizontal: 12,
//     paddingVertical: 10,
//     fontSize: 16,
//     backgroundColor: '#fafafa',
//   },
//   multilineInput: {
//     height: 100,
//     textAlignVertical: 'top',
//   },
//   timePickerContainer: {
//     marginBottom: 15,
//   },
//   timeButton: {
//     backgroundColor: '#f1f8ff',
//     padding: 12,
//     borderRadius: 8,
//     borderWidth: 1,
//     borderColor: '#bbdefb',
//   },
//   timeButtonText: {
//     fontSize: 16,
//     color: '#1976d2',
//     textAlign: 'center',
//     fontWeight: '500',
//   },
//   timePreview: {
//     backgroundColor: '#f1f8ff',
//     padding: 12,
//     borderRadius: 8,
//     marginBottom: 15,
//   },
//   timePreviewText: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#1976d2',
//     textAlign: 'center',
//   },
//   durationText: {
//     fontSize: 14,
//     color: '#666',
//     textAlign: 'center',
//     marginTop: 5,
//   },
//   reminderContainer: {
//     borderWidth: 1,
//     borderColor: '#cfd8dc',
//     borderRadius: 10,
//     backgroundColor: '#fafafa',
//     overflow: 'hidden',
//   },
//   reminderPicker: {
//     height: 50,
//   },
//   saveButton: {
//     borderRadius: 14,
//     overflow: 'hidden',
//   },
//   saveGradient: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingVertical: 14,
//     borderRadius: 14,
//   },
//   saveText: {
//     color: '#fff',
//     fontSize: 17,
//     fontWeight: '600',
//   },
// });
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { addEvent } from '../db/database';
import { convertToLunar } from '../utils/lunarCalculator';

export default function AddEventScreen({ navigation, route }) {
  const selectedDate = route.params?.selectedDate || new Date().toISOString().split('T')[0];
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  
  // 时间状态 - 使用Date对象而不是数字
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date(new Date().setHours(new Date().getHours() + 1)));
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  
  const [reminder, setReminder] = useState('15');
  
  // 计算显示的时间字符串（用于预览）
  const startTimeString = startTime.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  const endTimeString = endTime.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });

  // 获取农历日期字符串
  const getLunarDateString = (date) => {
    try {
      const lunarInfo = convertToLunar(date);
      if (!lunarInfo) return '无法获取农历信息';
      
      // 如果是节气，优先显示节气
      if (lunarInfo.isTerm && lunarInfo.term) {
        return `${lunarInfo.gzYear}${lunarInfo.animal}年 ${lunarInfo.month}${lunarInfo.day} ${lunarInfo.term}`;
      }
      
      // 返回完整的农历日期信息
      return `${lunarInfo.gzYear}${lunarInfo.animal}年 ${lunarInfo.month}${lunarInfo.day}`;
    } catch (error) {
      console.warn('获取农历信息失败:', error);
      return '无法获取农历信息';
    }
  };

  // 验证开始时间是否早于当前时间
  const validateStartTime = (date, time) => {
    const eventDateTime = new Date(date + 'T' + time.toLocaleTimeString('sv-SE'));
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
    const timeValidation = validateStartTime(selectedDate, startTime);
    if (timeValidation) {
      Alert.alert('错误', timeValidation);
      return;
    }
    
    // 验证结束时间是否在开始时间之后
    if (endTime <= startTime) {
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

  const onStartChange = (event, selectedTime) => {
    setShowStartPicker(false);
    if (event.type === 'set' && selectedTime) {
      setStartTime(selectedTime);
    }
  };

  const onEndChange = (event, selectedTime) => {
    setShowEndPicker(false);
    if (event.type === 'set' && selectedTime) {
      setEndTime(selectedTime);
    }
  };

  return (
    <LinearGradient
      colors={['#e3f2fd', '#ffffff']}
      style={styles.gradient}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headerBox}>
          <View style={styles.headerTitle}>
          <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="#1565c0" />
            </TouchableOpacity>
            <Text style={styles.header}>添加新日程</Text>
          </View>
          <View style={styles.headerTextContainer}>
            <Text style={styles.dateText}>📅 公历: {selectedDate}</Text>
            <Text style={styles.dateText}>📅 农历: {getLunarDateString(selectedDate)}</Text>
          </View>
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
          <View style={styles.timePickerContainer}>
            <Text style={styles.label}>开始时间</Text>
            <TouchableOpacity 
              style={styles.timeButton} 
              onPress={() => setShowStartPicker(true)}
            >
              <Text style={styles.timeButtonText}>{startTimeString}</Text>
            </TouchableOpacity>
            {showStartPicker && (
              <DateTimePicker
                value={startTime}
                mode="time"
                display="spinner"
                onChange={onStartChange}
                locale="zh-CN"
              />
            )}
          </View>
          
          {/* 结束时间选择器 */}
          <View style={styles.timePickerContainer}>
            <Text style={styles.label}>结束时间</Text>
            <TouchableOpacity 
              style={styles.timeButton} 
              onPress={() => setShowEndPicker(true)}
            >
              <Text style={styles.timeButtonText}>{endTimeString}</Text>
            </TouchableOpacity>
            {showEndPicker && (
              <DateTimePicker
                value={endTime}
                mode="time"
                display="spinner"
                onChange={onEndChange}
                locale="zh-CN"
              />
            )}
          </View>
          
          {/* 时间预览 */}
          <View style={styles.timePreview}>
            <Text style={styles.timePreviewText}>
              开始时间: {startTimeString} | 结束时间: {endTimeString}
            </Text>
            <Text style={styles.durationText}>
              持续时间: {Math.floor((endTime - startTime) / (1000 * 60 * 60))}小时
              {Math.floor((endTime - startTime) % (1000 * 60 * 60) / (1000 * 60))}分钟
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
  headerTitle: { 
    flexDirection: 'row',
    alignItems: 'center',
  },
  header: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1565c0',
  },
  headerTextContainer:{
    flex: 1,
  },
  backButton: {
    padding: 5,
    marginRight: 10,
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
  timePickerContainer: {
    marginBottom: 15,
  },
  timeButton: {
    backgroundColor: '#f1f8ff',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#bbdefb',
  },
  timeButtonText: {
    fontSize: 16,
    color: '#1976d2',
    textAlign: 'center',
    fontWeight: '500',
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