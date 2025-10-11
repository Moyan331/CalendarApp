import { Button, Text, View } from 'react-native';

export default function HomeScreen({ navigation }) {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>欢迎来到日历首页！</Text>
      <Button
        title="添加日程"
        onPress={() => navigation.navigate('AddEvent')}
      />
    </View>
  );
}
