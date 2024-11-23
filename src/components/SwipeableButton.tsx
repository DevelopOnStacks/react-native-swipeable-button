import React, { useRef, useState } from 'react';
import { 
  Animated, 
  PanResponder, 
  StyleSheet, 
  Text, 
  View, 
  Dimensions 
} from 'react-native';

interface SwipeableButtonProps {
  autoWidth?: boolean;
  circle?: boolean;
  disabled?: boolean;
  noAnimate?: boolean;
  width?: number;
  height?: number;
  text?: string;
  text_unlocked?: string;
  onSuccess?: () => void;
  onFailure?: () => void;
  sliderColor?: string;
  sliderTextColor?: string;
  textColor?: string;
  sliderIconColor?: string;
  backgroundColor?: string;
  borderRadius?: number;
}

const SwipeableButton: React.FC<SwipeableButtonProps> = ({
  autoWidth = false,
  circle = false,
  disabled = false,
  noAnimate = false,
  width = 300,
  height = 50,
  text = "SLIDE",
  text_unlocked = "UNLOCKED",
  onSuccess,
  onFailure,
  sliderColor = "#16362d",
  sliderTextColor = "#fff",
  textColor = "#000",
  sliderIconColor = "#fff",
  backgroundColor = "#eee",
  borderRadius = 30,
}) => {
  const [unlocked, setUnlocked] = useState(false);
  const sliderLeft = useRef(new Animated.Value(0)).current;
  const containerWidth = useRef(width - height).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !disabled && !unlocked,
      onMoveShouldSetPanResponder: () => !disabled && !unlocked,
      onPanResponderMove: (_, gestureState) => {
        if (!unlocked) {
          const newLeft = Math.max(0, Math.min(containerWidth, gestureState.dx));
          sliderLeft.setValue(newLeft);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (!unlocked && gestureState.dx > containerWidth * 0.9) {
          Animated.timing(sliderLeft, {
            toValue: containerWidth,
            duration: noAnimate ? 0 : 200,
            useNativeDriver: false,
          }).start(() => {
            setUnlocked(true);
            onSuccess?.();
          });
        } else {
          Animated.timing(sliderLeft, {
            toValue: 0,
            duration: noAnimate ? 0 : 200,
            useNativeDriver: false,
          }).start(() => onFailure?.());
        }
      },
    })
  ).current;

  const resetButton = () => {
    setUnlocked(false);
    Animated.timing(sliderLeft, {
      toValue: 0,
      duration: noAnimate ? 0 : 200,
      useNativeDriver: false,
    }).start();
  };

  return (
    <View
      style={[
        styles.container,
        {
          width: autoWidth ? "100%" : width,
          height,
          borderRadius: circle ? height / 2 : borderRadius,
          backgroundColor: backgroundColor,
        },
      ]}
    >
      <Animated.View
        {...panResponder.panHandlers}
        style={[
          styles.slider,
          {
            width: height,
            height,
            borderRadius: circle ? height / 2 : borderRadius,
            backgroundColor: sliderColor,
            transform: [{ translateX: sliderLeft }],
          },
        ]}
      >
        <Text style={[styles.sliderText, { color: sliderTextColor }]}>
          {unlocked ? text_unlocked : text}
        </Text>
      </Animated.View>
      {!unlocked && (
        <Text style={[styles.buttonText, { color: textColor }]}>
          {text}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
    justifyContent: "center",
    overflow: "hidden",
  },
  slider: {
    position: "absolute",
    top: 0,
    left: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  sliderText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  buttonText: {
    position: "absolute",
    alignSelf: "center",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default SwipeableButton;

