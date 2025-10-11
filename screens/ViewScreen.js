import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Button, FlatList, StyleSheet, Text, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { deleteEvent, getEvents } from '../db/database';

export default function ViewEventsScreen({ navigation, route }) {
  // 检查参数是否存在
  if (!route.params || !route.params.selectedDate) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>错误：未提供日期参数</Text>
        <Button
          title="返回日历"
          onPress={() => navigation.goBack()}
          color="#2196F3"
        />
      </View>
    );
  }
  
  const { selectedDate } = route.params;
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // 加载事件
  useEffect(() => {
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
    
    loadEvents();
  }, [selectedDate]);
  
  // 删除事件
  const handleDelete = async (id) => {
    try {
      await deleteEvent(id);
      // 更新事件列表
      setEvents(events.filter(event => event.id !== id));
      Alert.alert('成功', '事件已删除');
    } catch (error) {
      console.error('删除事件失败:', error);
      Alert.alert('错误', '删除事件失败');
    }
  };
  
  // 渲染事件项
  const renderEventItem = ({ item }) => (
    <View style={styles.eventItem}>
      <View style={styles.eventHeader}>
        <Text style={styles.eventTime}>{item.startTime} - {item.endTime}</Text>
        <View style={styles.eventActions}>
          <Icon 
            name="edit" 
            size={24} 
            color="#2196F3" 
            onPress={() => navigation.navigate('EditEvent', { event: item })}
            style={styles.actionIcon}
          />
          <Icon 
            name="delete" 
            size={24} 
            color="#F44336" 
            onPress={() => handleDelete(item.id)}
            style={styles.actionIcon}
          />
        </View>
      </View>
      <Text style={styles.eventTitle}>{item.title}</Text>
      {item.description && (
        <Text style={styles.eventDescription}>{item.description}</Text>
      )}
      {item.reminder && (
        <Text style={styles.eventReminder}>提前 {item.reminder} 分钟提醒</Text>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text>加载中...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{selectedDate} 的日程</Text>
      
      {events.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="event-busy" size={64} color="#ccc" />
          <Text style={styles.emptyText}>当天没有日程安排</Text>
        </View>
      ) : (
        <FlatList
          data={events}
          renderItem={renderEventItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContainer}
        />
      )}
      
      <Button
        title="添加新日程"
        onPress={() => navigation.navigate('AddEvent', { selectedDate })}
        color="#2196F3"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  listContainer: {
    paddingBottom: 20,
  },
  eventItem: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  eventTime: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#555',
  },
  eventActions: {
    flexDirection: 'row',
  },
  actionIcon: {
    marginLeft: 12,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  eventDescription: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  eventReminder: {
    fontSize: 14,
    color: '#888',
    fontStyle: 'italic',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#999',
    marginTop: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
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
});