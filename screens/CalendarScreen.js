import { useState } from 'react';
import { Button, StyleSheet, View } from 'react-native';
import { Calendar } from 'react-native-calendars';

export default function CalendarScreen({ navigation }) {
  const [selected, setSelected] = useState('');

  return (
    <View style={styles.container}>
      <Calendar
        onDayPress={(day) => {
          setSelected(day.dateString);
        }}
        markedDates={{
          [selected]: {
            selected: true,
            selectedColor: '#2196F3',
          },
        }}
      />
      
      <View style={styles.buttonContainer}>
       <Button 
       title="添加日程" 
        onPress={() => navigation.navigate('AddEvent', { selectedDate: selected })} 
        style={styles.button}
        />
        <View style={styles.buttonSpacer} /> 
         <Button title="查看日程" onPress={() => navigation.navigate('ViewEvents',{ selectedDate: selected })} style={styles.button} /> 
        </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  button: {
    flex: 1,
  },
  buttonSpacer: {
    width: 50, // 按钮之间的间距
  },
});