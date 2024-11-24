import React, { Component } from 'react';
import {
  View,
  Text,
  PanResponder,
  Animated,
  StyleSheet,
  Dimensions,
  PanResponderGestureState,
  ViewStyle,
  TextStyle,
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

interface SwipeableButtonState {
  unlocked: boolean;
  dragX: Animated.Value;
  containerWidth: number;
  complete: boolean;
}

export default class SwipeableButton extends Component<SwipeableButtonProps, SwipeableButtonState> {
  private containerRef: View | null = null;
  private maxDragDistance: number = 0;

  constructor(props: SwipeableButtonProps) {
    super(props);
    this.state = {
      unlocked: false,
      dragX: new Animated.Value(0),
      containerWidth: 0,
      complete: false,
    };
  }

  componentDidMount() {
    this.state.dragX.addListener(({ value }) => {
      if (value >= this.maxDragDistance * 0.9 && !this.state.complete) {
        this.setState({ complete: true }, this.onSwiped);
      }
    });
  }

  componentWillUnmount() {
    this.state.dragX.removeAllListeners();
  }

  private panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => !this.state.unlocked && !this.props.disabled,
    onMoveShouldSetPanResponder: () => !this.state.unlocked && !this.props.disabled,
    onPanResponderGrant: () => {},
    onPanResponderMove: (_, gestureState: PanResponderGestureState) => {
      const newValue = Math.min(Math.max(0, gestureState.dx), this.maxDragDistance);
      this.state.dragX.setValue(newValue);
    },
    onPanResponderRelease: (_, gestureState: PanResponderGestureState) => {
      if (gestureState.dx < this.maxDragDistance * 0.9) {
        Animated.spring(this.state.dragX, {
          toValue: 0,
          useNativeDriver: true,
        }).start(() => {
          if (this.props.onFailure) {
            this.props.onFailure();
          }
        });
      } else {
        Animated.spring(this.state.dragX, {
          toValue: this.maxDragDistance,
          useNativeDriver: true,
        }).start();
      }
    },
  });

  private onSwiped = () => {
    if (this.props.onSuccess) {
      this.props.onSuccess();
    }
    this.setState({ unlocked: true });
  };

  private onLayout = (event: any) => {
    const { width } = event.nativeEvent.layout;
    this.maxDragDistance = width - (this.props.height || 50);
    this.setState({ containerWidth: width });
  };

  private getText = () => {
    return this.state.unlocked
      ? this.props.text_unlocked || 'UNLOCKED'
      : this.props.text || 'SLIDE';
  };

  public buttonReset = () => {
    if (!this.state.unlocked) return;
    this.setState({ unlocked: false, complete: false }, () => {
      Animated.spring(this.state.dragX, {
        toValue: 0,
        useNativeDriver: true,
      }).start();
    });
  };

  public buttonComplete = () => {
    if (this.state.unlocked) return;
    Animated.spring(this.state.dragX, {
      toValue: this.maxDragDistance,
      useNativeDriver: true,
    }).start(() => {
      this.setState({ complete: true }, this.onSwiped);
    });
  };

  render() {
    const {
      width = 300,
      height = 50,
      circle = false,
      disabled = false,
      autoWidth = false,
      sliderColor = '#16362d',
      backgroundColor = '#eee',
      borderRadius = 30,
      sliderTextColor = '#fff',
      sliderIconColor = '#fff',
      textColor = '#000',
    } = this.props;

    const containerStyle: ViewStyle = {
      width: autoWidth ? '100%' : width,
      height: height,
      backgroundColor: backgroundColor,
      borderRadius: circle ? height / 2 : 5,
      overflow: 'hidden',
      opacity: disabled ? 0.6 : 1,
    };

    const sliderStyle: ViewStyle = {
      position: 'absolute',
      width: '100%',
      height: '100%',
      backgroundColor: sliderColor,
      borderRadius: circle ? borderRadius : 0,
    };

    const arrowStyle: ViewStyle = {
      position: 'absolute',
      right: 22,
      width: 8,
      height: 8,
      borderTopWidth: 2,
      borderRightWidth: 2,
      borderColor: sliderIconColor,
      transform: [{ rotate: '45deg' }],
    };

    return (
      <View
        style={[styles.container, containerStyle]}
        onLayout={this.onLayout}
        ref={ref => (this.containerRef = ref)}
      >
        <Text style={[styles.text, { color: textColor }]}>{this.getText()}</Text>
        <Animated.View
          {...this.panResponder.panHandlers}
          style={[
            sliderStyle,
            {
              transform: [
                {
                  translateX: this.state.dragX.interpolate({
                    inputRange: [0, this.maxDragDistance],
                    outputRange: [-this.state.containerWidth + height, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.sliderContent}>
            <Text style={[styles.sliderText, { color: sliderTextColor }]}>
              {this.getText()}
            </Text>
            <View style={arrowStyle} />
            <View
              style={[
                styles.sliderCircle,
                { backgroundColor: sliderColor, width: height },
              ]}
            />
          </View>
        </Animated.View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  text: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    textAlign: 'center',
    textAlignVertical: 'center',
    fontFamily: 'System',
    letterSpacing: 1,
    fontSize: 14,
  },
  sliderContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sliderText: {
    position: 'absolute',
    width: '100%',
    textAlign: 'center',
    textAlignVertical: 'center',
    fontFamily: 'System',
    letterSpacing: 1,
    fontSize: 14,
  },
  sliderCircle: {
    position: 'absolute',
    right: 0,
    height: '100%',
    borderRadius: 100,
  },
});
