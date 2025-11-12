// components/EnhancedMonthYearPicker.js
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Modal,
  PanResponder,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const { width, height } = Dimensions.get('window');

const EnhancedMonthYearPicker = ({
  visible = false,
  onClose,
  onConfirm,
  currentDate = new Date(),
}) => {
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth());
  const slideAnim = useRef(new Animated.Value(height)).current;
  const yearScrollViewRef = useRef(null);

  const monthNames = [
    '一月', '二月', '三月', '四月', '五月', '六月',
    '七月', '八月', '九月', '十月', '十一月', '十二月'
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 41 }, (_, i) => currentYear - 20 + i);

  // 自动滚动到当前选中的年份
  useEffect(() => {
    if (visible && yearScrollViewRef.current) {
      const index = years.findIndex(year => year === selectedYear);
      if (index !== -1) {
        setTimeout(() => {
          yearScrollViewRef.current.scrollTo({
            x: Math.max(0, index * 80 - width / 2 + 40),
            animated: true,
          });
        }, 100);
      }
    }
  }, [visible, selectedYear]);

  useEffect(() => {
    if (visible) {
      setSelectedYear(currentDate.getFullYear());
      setSelectedMonth(currentDate.getMonth());
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: height,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: (_, gestureState) => gestureState.dy > 5,
    onPanResponderMove: (_, gestureState) => {
      if (gestureState.dy > 0) slideAnim.setValue(gestureState.dy);
    },
    onPanResponderRelease: (_, gestureState) => {
      if (gestureState.dy > 100) handleClose();
      else Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true }).start();
    },
  });

  const handleClose = () => {
    Animated.timing(slideAnim, {
      toValue: height,
      duration: 300,
      useNativeDriver: true,
    }).start(onClose);
  };

  const handleConfirm = () => {
    const selectedDate = new Date(selectedYear, selectedMonth, 1);
    onConfirm(selectedDate);
    handleClose();
  };

  const handleToday = () => {
    const today = new Date();
    setSelectedYear(today.getFullYear());
    setSelectedMonth(today.getMonth());
  };

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.background} activeOpacity={1} onPress={handleClose} />
        
        <Animated.View 
          style={[styles.container, { transform: [{ translateY: slideAnim }] }]}
          {...panResponder.panHandlers}
        >
          <View style={styles.dragHandle}>
            <View style={styles.dragBar} />
          </View>
          
          <View style={styles.header}>
            <Text style={styles.title}>选择日期</Text>
            <TouchableOpacity onPress={handleClose}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          
          {/* 年份选择 - 水平滚动 */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>年份</Text>
              <TouchableOpacity onPress={handleToday} style={styles.todayButton}>
                <Text style={styles.todayButtonText}>今天</Text>
              </TouchableOpacity>
            </View>
            <ScrollView
              ref={yearScrollViewRef}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.yearScrollContent}
              snapToAlignment="center"
              decelerationRate="fast"
            >
              {years.map(year => (
                <TouchableOpacity
                  key={year}
                  style={[
                    styles.yearItem,
                    selectedYear === year && styles.selectedYearItem,
                    year === currentYear && styles.currentYearItem,
                  ]}
                  onPress={() => setSelectedYear(year)}
                >
                  <Text style={[
                    styles.yearText,
                    selectedYear === year && styles.selectedYearText,
                    year === currentYear && styles.currentYearText,
                  ]}>
                    {year}
                    {year === currentYear && '年'}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          
          {/* 月份选择 - 网格布局 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>月份</Text>
            <View style={styles.monthGrid}>
              {monthNames.map((month, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.monthItem,
                    selectedMonth === index && styles.selectedMonthItem,
                    index === new Date().getMonth() && selectedYear === currentYear && styles.currentMonthItem,
                  ]}
                  onPress={() => setSelectedMonth(index)}
                >
                  <Text style={[
                    styles.monthText,
                    selectedMonth === index && styles.selectedMonthText,
                  ]}>
                    {month}
                  </Text>
                  {index === new Date().getMonth() && selectedYear === currentYear && (
                    <View style={styles.currentDot} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          {/* 预览选中的日期 */}
          <View style={styles.preview}>
            <Text style={styles.previewText}>
              选中: {selectedYear}年{monthNames[selectedMonth]}
            </Text>
          </View>
          
          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
              <Text style={styles.cancelButtonText}>取消</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
              <Text style={styles.confirmButtonText}>确认选择</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  background: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0, 0, 0, 0.5)' },
  container: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: height * 0.8,
    paddingBottom: 34,
  },
  dragHandle: { alignItems: 'center', paddingVertical: 8 },
  dragBar: { width: 40, height: 4, backgroundColor: '#ddd', borderRadius: 2 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: { fontSize: 18, fontWeight: '600', color: '#333' },
  section: { paddingHorizontal: 20, paddingVertical: 16 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#333' },
  todayButton: { paddingHorizontal: 12, paddingVertical: 6 },
  todayButtonText: { color: '#2196F3', fontSize: 14, fontWeight: '500' },
  yearScrollContent: { paddingHorizontal: 10 },
  yearItem: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginHorizontal: 6,
    borderRadius: 25,
    backgroundColor: '#f8f9fa',
    minWidth: 80,
    alignItems: 'center',
  },
  selectedYearItem: { backgroundColor: '#2196F3' },
  currentYearItem: { borderWidth: 2, borderColor: '#2196F3' },
  yearText: { fontSize: 16, color: '#666', fontWeight: '500' },
  selectedYearText: { color: 'white', fontWeight: '600' },
  currentYearText: { color: '#2196F3', fontWeight: '600' },
  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  monthItem: {
    width: (width - 80) / 3,
    paddingVertical: 16,
    marginVertical: 8,
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
    position: 'relative',
  },
  selectedMonthItem: { backgroundColor: '#2196F3' },
  currentMonthItem: { borderWidth: 2, borderColor: '#4CAF50' },
  monthText: { fontSize: 16, color: '#666', fontWeight: '500' },
  selectedMonthText: { color: 'white', fontWeight: '600' },
  currentDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4CAF50',
  },
  preview: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#f0f8ff',
    marginHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  previewText: { fontSize: 16, color: '#2196F3', fontWeight: '600' },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    marginRight: 12,
    borderRadius: 10,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
  },
  cancelButtonText: { fontSize: 16, color: '#666', fontWeight: '600' },
  confirmButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: '#2196F3',
    alignItems: 'center',
  },
  confirmButtonText: { fontSize: 16, color: 'white', fontWeight: '600' },
});

export default EnhancedMonthYearPicker;