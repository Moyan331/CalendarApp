// components/TimePicker.js
import { Picker } from '@react-native-picker/picker';
import { StyleSheet, Text, View } from 'react-native';

const TimePicker = ({ 
  label, 
  selectedHour, 
  selectedMinute, 
  onHourChange, 
  onMinuteChange,
  containerStyle 
}) => {
  // 生成小时选项 (0-23)
  const hourItems = Array.from({ length: 24 }, (_, i) => 
    <Picker.Item key={i} label={i.toString().padStart(2, '0')} value={i} />
  );
  
  // 生成分钟选项 (0-59)
  const minuteItems = Array.from({ length: 60 }, (_, i) => 
    <Picker.Item key={i} label={i.toString().padStart(2, '0')} value={i} />
  );

  return (
    <View style={[styles.container, containerStyle]}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.pickerContainer}>
        <View style={styles.pickerWrapper}>
          <Text style={styles.pickerLabel}>时</Text>
          <Picker
            selectedValue={selectedHour}
            onValueChange={onHourChange}
            style={styles.picker}
            itemStyle={styles.pickerItem}
          >
            {hourItems}
          </Picker>
        </View>
        
        <View style={styles.pickerWrapper}>
          <Text style={styles.pickerLabel}>分</Text>
          <Picker
            selectedValue={selectedMinute}
            onValueChange={onMinuteChange}
            style={styles.picker}
            itemStyle={styles.pickerItem}
          >
            {minuteItems}
          </Picker>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  pickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 10,
  },
  pickerWrapper: {
    flex: 1,
    alignItems: 'center',
  },
  pickerLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  picker: {
    width: '100%',
    height: 120,
  },
  pickerItem: {
    fontSize: 18,
  },
});

export default TimePicker;