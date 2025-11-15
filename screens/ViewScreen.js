import { useFocusEffect } from '@react-navigation/native'; // 添加这行
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { deleteEvent, getEvents } from '../db/database';
import { convertToLunar } from '../utils/lunarCalculator';

export default function ViewEventsScreen({ navigation, route }) {
  if (!route.params || !route.params.selectedDate) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>错误：未提供日期参数</Text>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => navigation.goBack()}>
          <Text style={styles.primaryButtonText}>返回日历</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const { selectedDate } = route.params;
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

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

   // 使用 useFocusEffect 在屏幕获得焦点时自动刷新
  useFocusEffect(
    useCallback(() => {
      const loadEvents = async () => {
      try {
        setLoading(true);
        const eventsData = await getEvents(selectedDate);
        setEvents(eventsData);
        setLoading(false);
      } catch (error) {
        console.error('加载事件失败:', error);
        Alert.alert('错误', '加载事件失败');
        setLoading(false);
      }
    };
      // 当屏幕获得焦点时加载事件
      loadEvents();

    }, [selectedDate])
  );

  // 删除事件
  const handleDelete = async (id) => {
    try {
      await deleteEvent(id);
      setEvents(events.filter((event) => event.id !== id));
      // Alert.alert('成功', '事件已删除');
    } catch (error) {
      console.error('删除事件失败:', error);
      Alert.alert('错误', '删除事件失败');
    }
  };

  // 渲染事件项
  const renderEventItem = ({ item }) => (
    <View style={styles.eventCard}>
      <View style={styles.eventHeader}>
        <Text style={styles.eventTime}>
          {item.startTime} - {item.endTime}
        </Text>
        <View style={styles.actionGroup}>
          <TouchableOpacity
            onPress={() => navigation.navigate('EditEvent', { event: item })}
            style={styles.iconButton}>
            <Icon name="edit" size={20} color="#2196F3" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleDelete(item.id)}
            style={styles.iconButton}>
            <Icon name="delete" size={20} color="#F44336" />
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.eventTitle}>{item.title}</Text>

      {item.description ? (
        <Text style={styles.eventDescription}>{item.description}</Text>
      ) : null}

      {item.reminder ? (
        <Text style={styles.eventReminder}>⏰ 提前 {item.reminder} 分钟提醒</Text>
      ) : null}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>加载中...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 顶部标题 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{selectedDate} 的日程</Text>
        <Text style={styles.headerSubtitle}>农历: {getLunarDateString(selectedDate)}</Text>
      </View>

      {/* 内容区域 */}
      {events.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="event-busy" size={72} color="#ccc" />
          <Text style={styles.emptyText}>当天没有日程安排</Text>
        </View>
      ) : (
        <FlatList
          data={events}
          renderItem={renderEventItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
        />
      )}

      {/* 悬浮添加按钮 */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddEvent', { selectedDate })}>
        <Icon name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  /** 主体结构 **/
  container: {
    flex: 1,
    backgroundColor: '#F8FAFF',
  },
  header: {
    backgroundColor: '#2196F3',
    paddingVertical: 14,
    paddingHorizontal: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: '#e3f2fd',
    fontSize: 14,
    marginTop: 4,
  },

  /** 列表部分 **/
  listContainer: {
    padding: 16,
  },
  eventCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  eventTime: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1976D2',
  },
  eventTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  eventDescription: {
    fontSize: 15,
    color: '#666',
    marginBottom: 4,
  },
  eventReminder: {
    fontSize: 13,
    color: '#888',
    marginTop: 4,
  },

  /** 操作区 **/
  actionGroup: {
    flexDirection: 'row',
  },
  iconButton: {
    marginLeft: 10,
    padding: 4,
  },

  /** 空页面 **/
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 12,
  },

  /** 加载页 **/
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#666',
    marginTop: 8,
  },

  /** 错误页 **/
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: 'red',
    marginBottom: 20,
    textAlign: 'center',
  },
  primaryButton: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },

  /** 悬浮按钮 **/
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
