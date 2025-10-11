import { useState } from 'react';
import { View } from 'react-native';
import { Calendar } from 'react-native-calendars';

export default function CalendarView({ onDayPress }) {
  const [selected, setSelected] = useState('');

  return (
    <View>
      <Calendar
        onDayPress={(day) => {
          setSelected(day.dateString);
          onDayPress(day.dateString);
        }}
        markedDates={{
          [selected]: { selected: true, selectedColor: '#00adf5' }
        }}
      />
    </View>
  );
}
