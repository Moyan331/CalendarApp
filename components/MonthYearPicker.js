// components/MonthYearPicker.js
import { Ionicons } from '@expo/vector-icons';
import React, { useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    Modal,
    PanResponder,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const { width, height } = Dimensions.get('window');

const MonthYearPicker = ({
  visible = false,
  onClose,
  onConfirm,
  currentDate = new Date(),
}) => {
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth());
  const slideAnim = useRef(new Animated.Value(height)).current;

  // 月份名称
  const monthNames = [
    '一月', '二月', '三月', '四月', '五月', '六月',
    '七月', '八月', '九月', '十月', '十一月', '十二月'
  ];

  // 年份范围（前后20年）
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 41 }, (_, i) => currentYear - 20 + i);

  // 显示动画
  React.useEffect(() => {
    if (visible) {
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

  // 手势处理 - 向下滑动关闭
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: (_, gestureState) => {
      return gestureState.dy > 5;
    },
    onPanResponderMove: (_, gestureState) => {
      if (gestureState.dy > 0) {
        slideAnim.setValue(gestureState.dy);
      }
    },
    onPanResponderRelease: (_, gestureState) => {
      if (gestureState.dy > 100) {
        handleClose();
      } else {
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      }
    },
  });

  const handleClose = () => {
    Animated.timing(slideAnim, {
      toValue: height,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      onClose && onClose();
    });
  };

  const handleConfirm = () => {
    const selectedDate = new Date(selectedYear, selectedMonth, 1);
    onConfirm && onConfirm(selectedDate);
    handleClose();
  };

  const handleMonthSelect = (monthIndex) => {
    setSelectedMonth(monthIndex);
  };

  const handleYearSelect = (year) => {
    setSelectedYear(year);
  };

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        {/* 半透明背景 */}
        <TouchableOpacity 
          style={styles.background} 
          activeOpacity={1} 
          onPress={handleClose}
        />
        
        {/* 选择器内容 */}
        <Animated.View 
          style={[
            styles.container,
            { transform: [{ translateY: slideAnim }] }
          ]}
          {...panResponder.panHandlers}
        >
          {/* 顶部拖拽指示器 */}
          <View style={styles.dragHandle}>
            <View style={styles.dragBar} />
          </View>
          
          {/* 标题 */}
          <View style={styles.header}>
            <Text style={styles.title}>选择日期</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          
          {/* 年份选择器 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>选择年份</Text>
            <View style={styles.yearContainer}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.yearScrollContent}
              >
                {years.map(year => (
                  <TouchableOpacity
                    key={year}
                    style={[
                      styles.yearItem,
                      selectedYear === year && styles.selectedYearItem
                    ]}
                    onPress={() => handleYearSelect(year)}
                  >
                    <Text style={[
                      styles.yearText,
                      selectedYear === year && styles.selectedYearText
                    ]}>
                      {year}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
          
          {/* 月份选择器 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>选择月份</Text>
            <View style={styles.monthGrid}>
              {monthNames.map((month, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.monthItem,
                    selectedMonth === index && styles.selectedMonthItem
                  ]}
                  onPress={() => handleMonthSelect(index)}
                >
                  <Text style={[
                    styles.monthText,
                    selectedMonth === index && styles.selectedMonthText
                  ]}>
                    {month}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          {/* 底部操作按钮 */}
          <View style={styles.footer}>
            <TouchableOpacity 
              style={styles.cancelButton} 
              onPress={handleClose}
            >
              <Text style={styles.cancelButtonText}>取消</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.confirmButton} 
              onPress={handleConfirm}
            >
              <Text style={styles.confirmButtonText}>确定</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  background: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  container: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: height * 0.8,
    paddingBottom: 34, // 安全区域
  },
  dragHandle: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  dragBar: {
    width: 40,
    height: 4,
    backgroundColor: '#ddd',
    borderRadius: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  yearContainer: {
    height: 50,
  },
  yearScrollContent: {
    paddingHorizontal: 10,
  },
  yearItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
  },
  selectedYearItem: {
    backgroundColor: '#2196F3',
  },
  yearText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  selectedYearText: {
    color: 'white',
    fontWeight: '600',
  },
  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  monthItem: {
    width: (width - 80) / 3, // 3列布局
    paddingVertical: 12,
    marginVertical: 6,
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: '#f5f5f5',
  },
  selectedMonthItem: {
    backgroundColor: '#2196F3',
  },
  monthText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  selectedMonthText: {
    color: 'white',
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    marginRight: 12,
    borderRadius: 10,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#2196F3',
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
});

export default MonthYearPicker;