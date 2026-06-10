import { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  TextInput,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function HomeScreen() {
  const [minutesInput, setMinutesInput] = useState('0');
  const [secondsInput, setSecondsInput] = useState('5');
  const [timerSeconds, setTimerSeconds] = useState(5);

  const [endTime, setEndTime] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(5);
  const [isRunning, setIsRunning] = useState(false);
  const [hasFinished, setHasFinished] = useState(false);
  const [titleInput, setTitleInput] = useState('タイマー終了！');
  const [bodyInput, setBodyInput] = useState('時間になったよ！');

  useEffect(() => {
    Notifications.requestPermissionsAsync();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && endTime !== null) {
      interval = setInterval(async () => {
        const now = Date.now();
        const remaining = Math.max(0, Math.ceil((endTime - now) / 1000));

        setTimeLeft(remaining);

        if (remaining === 0 && !hasFinished) {
          setIsRunning(false);
          setHasFinished(true);

          await Notifications.cancelAllScheduledNotificationsAsync();
        }
      }, 500);
    }

    return () => clearInterval(interval);
  }, [isRunning, endTime, hasFinished]);

const startTimer = async () => {
  const minutes = Number(minutesInput) || 0;
  const seconds = Number(secondsInput) || 0;
  const totalSeconds = minutes * 60 + seconds;

  if (totalSeconds <= 0) return;

  const finishTime = Date.now() + totalSeconds * 1000;

  await Notifications.cancelAllScheduledNotificationsAsync();

  await Notifications.scheduleNotificationAsync({
    content: {
      title: titleInput,
      body: bodyInput,
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: totalSeconds,
    },
  });

  setTimerSeconds(totalSeconds);
  setEndTime(finishTime);
  setTimeLeft(totalSeconds);
  setIsRunning(true);
  setHasFinished(false);
};

const resetTimer = async () => {
  await Notifications.cancelAllScheduledNotificationsAsync();

  setIsRunning(false);
  setEndTime(null);
  setTimeLeft(timerSeconds);
  setHasFinished(false);
};

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
    <View style={styles.container}>
      <Text style={styles.title}>タイマー</Text>

      <View style={styles.inputRow}>
      <TextInput
        style={styles.input}
        value={minutesInput}
        onChangeText={setMinutesInput}
        keyboardType="number-pad"
        placeholder="分"
      />
      <Text style={styles.inputLabel}>分</Text>

      <TextInput
        style={styles.input}
        value={secondsInput}
        onChangeText={setSecondsInput}
        keyboardType="number-pad"
        placeholder="秒"
      />
      <Text style={styles.inputLabel}>秒</Text>
    </View>

    <TextInput
      style={styles.messageInput}
      value={titleInput}
      onChangeText={setTitleInput}
      placeholder="通知タイトル"
    />

    <TextInput
      style={styles.messageInput}
      value={bodyInput}
      onChangeText={setBodyInput}
      placeholder="通知メッセージ"
    />

    <Text style={styles.timer}>
      {minutes}:{seconds.toString().padStart(2, '0')}
    </Text>

      <Pressable style={styles.button} onPress={startTimer}>
        <Text style={styles.buttonText}>スタート</Text>
      </Pressable>

      <Pressable style={[styles.button, styles.resetButton]} onPress={resetTimer}>
        <Text style={styles.buttonText}>リセット</Text>
      </Pressable>
    </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    marginBottom: 30,
  },
  timer: {
    fontSize: 70,
    fontWeight: 'bold',
    marginBottom: 40,
  },
  button: {
    backgroundColor: '#4f46e5',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 12,
    marginBottom: 20,
  },
  resetButton: {
    backgroundColor: '#ef4444',
  },
  buttonText: {
    color: '#fff',
    fontSize: 22,
  },
  inputRow: {
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: 30,
},

input: {
  width: 70,
  borderWidth: 1,
  borderColor: '#ccc',
  borderRadius: 10,
  padding: 10,
  fontSize: 22,
  textAlign: 'center',
  marginHorizontal: 6,
},

inputLabel: {
  fontSize: 22,
  marginRight: 10,
},

messageInput: {
  width: 250,
  borderWidth: 1,
  borderColor: '#ccc',
  borderRadius: 10,
  padding: 12,
  fontSize: 18,
  marginBottom: 15,
  backgroundColor: '#fff',
},
});