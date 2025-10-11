import { Text, TouchableOpacity, View } from 'react-native';

export default function EventList({ events, onEdit, onDelete }) {
  return (
    <View>
      {events.length === 0 ? (
        <Text style={{ textAlign: 'center', marginTop: 20 }}>没有日程</Text>
      ) : (
        events.map((event) => (
          <View key={event.id} style={{ padding: 10, borderBottomWidth: 1 }}>
            <Text style={{ fontWeight: 'bold' }}>{event.title}</Text>
            <Text>{event.time}</Text>
            <Text>{event.description}</Text>
            <View style={{ flexDirection: 'row', marginTop: 5 }}>
              <TouchableOpacity onPress={() => onEdit(event)}>
                <Text style={{ color: 'blue', marginRight: 20 }}>编辑</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => onDelete(event.id)}>
                <Text style={{ color: 'red' }}>删除</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}
    </View>
  );
}
