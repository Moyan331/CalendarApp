import { useEffect, useState } from 'react';
import { Button, TextInput, View } from 'react-native';

export default function EventForm({ selectedDate, onSave, event }) {
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('');
  const [desc, setDesc] = useState('');

  useEffect(() => {
    if (event) {
      setTitle(event.title);
      setTime(event.time);
      setDesc(event.description);
    }
  }, [event]);

  return (
    <View style={{ padding: 10 }}>
      <TextInput placeholder="标题" value={title} onChangeText={setTitle} />
      <TextInput placeholder="时间（可选）" value={time} onChangeText={setTime} />
      <TextInput
        placeholder="备注"
        value={desc}
        onChangeText={setDesc}
        multiline
      />
      <Button title="保存" onPress={() => onSave(title, time, desc)} />
    </View>
  );
}
