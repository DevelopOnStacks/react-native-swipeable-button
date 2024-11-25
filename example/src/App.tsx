import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SwipeableButton } from 'react-native-swipeable-button';

export default function App() {
  return (
    <View style={styles.container}>
      <SwipeableButton
        text="Swipe to unlock"
        text_unlocked="¡Unlocked!"
        onSuccess={() => console.log('¡Unlocked!')}
        iosHapticFeedback={true}
        windowsAccentColor="#0078D7"
        macOSVibrancyEffect="light"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
});
