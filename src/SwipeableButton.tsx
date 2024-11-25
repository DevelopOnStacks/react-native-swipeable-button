import React, { Component } from 'react';
import {
  View,
  Text,
  PanResponder,
  Animated,
  StyleSheet,
  Platform,
  PanResponderGestureState,
  ViewStyle,
  TextStyle,
  LayoutChangeEvent,
  AccessibilityInfo,
  Vibration,
  NativeModules,
  NativeTouchEvent,
  NativeSyntheticEvent,
} from 'react-native';

// Check for platform-specific modules
let HapticFeedback: any;
let WindowsModule: any;
let MacOSModule: any;

if (Platform.OS === 'ios') {
  HapticFeedback = NativeModules.HapticFeedback;
} else if (Platform.OS === 'windows') {
  WindowsModule = NativeModules.WindowsModule;
} else if (Platform.OS === 'macos') {
  MacOSModule = NativeModules.MacOSModule;
}

export type VibrancyEffect = 
  | 'none' 
  | 'light' 
  | 'dark' 
  | 'titlebar' 
  | 'selection' 
  | 'menu' 
  | 'popover' 
  | 'sidebar' 
  | 'header' 
  | 'sheet' 
  | 'window' 
  | 'hudWindow' 
  | 'fullScreenUI' 
  | 'tooltip' 
  | 'contentBackground' 
  | 'underWindowBackground';

export interface SwipeableButtonProps {
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
  iosHapticFeedback?: boolean;
  windowsAccentColor?: string;
  macOSVibrancyEffect?: VibrancyEffect;
  accessibilityLabel?: string;
  testID?: string;
}

export interface SwipeableButtonState {
  unlocked: boolean;
  dragX: Animated.Value;
  containerWidth: number;
  complete: boolean;
  isRTL: boolean;
  vibrancyView?: any;
}

export interface SwipeableButtonRef {
  buttonReset: () => void;
  buttonComplete: () => void;
}

export default class SwipeableButton extends Component<SwipeableButtonProps, SwipeableButtonState> {
  private maxDragDistance: number = 0;
  private readonly isTV: boolean = Platform.isTV;
  private containerRef: View | null = null;
  private vibrancyViewRef: any = null;
  private animationConfig: any;

  constructor(props: SwipeableButtonProps) {
    super(props);

    this.state = {
      unlocked: false,
      dragX: new Animated.Value(0),
      containerWidth: 0,
      complete: false,
      isRTL: false,
    };

    this.animationConfig = {
      duration: Platform.select({ windows: 200, default: 300 }),
      useNativeDriver: Platform.select({ web: false, default: true }),
    };
  }

  async componentDidMount() {
    await this.initializeComponent();
  }

  private async initializeComponent() {
    // RTL detection
    if (Platform.OS !== 'web') {
      const isRTL = await AccessibilityInfo.isRTL();
      this.setState({ isRTL });
    }

    // Platform specific setup
    await this.setupPlatformSpecifics();

    // Drag listener
    this.state.dragX.addListener(({ value }) => {
      if (value >= this.maxDragDistance * 0.9 && !this.state.complete) {
        this.setState({ complete: true }, this.onSwiped);
      }
    });
  }

  private async setupPlatformSpecifics() {
    const { macOSVibrancyEffect, windowsAccentColor } = this.props;

    if (Platform.OS === 'macos' && macOSVibrancyEffect) {
      try {
        const vibrancyView = await MacOSModule?.createVibrancyView({
          effect: macOSVibrancyEffect,
        });
        this.setState({ vibrancyView });
      } catch (e) {
        console.warn('MacOS vibrancy setup failed:', e);
      }
    } else if (Platform.OS === 'windows' && windowsAccentColor) {
      try {
        await WindowsModule?.setAccentColor(windowsAccentColor);
      } catch (e) {
        console.warn('Windows accent color setup failed:', e);
      }
    }
  }

  componentWillUnmount() {
    this.state.dragX.removeAllListeners();
    if (Platform.OS === 'macos' && this.state.vibrancyView) {
      MacOSModule?.destroyVibrancyView(this.state.vibrancyView);
    }
  }

  private triggerHapticFeedback = () => {
    const { iosHapticFeedback } = this.props;
    
    if (Platform.OS === 'ios' && iosHapticFeedback) {
      try {
        HapticFeedback?.generateFeedback('impactMedium');
      } catch (e) {
        // Fallback to basic vibration
        Vibration.vibrate(10);
      }
    }
  };

  private panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => !this.state.unlocked && !this.props.disabled && !this.isTV,
    onMoveShouldSetPanResponder: () => !this.state.unlocked && !this.props.disabled && !this.isTV,
    onPanResponderGrant: () => {
      this.triggerHapticFeedback();
    },
    onPanResponderMove: (_, gestureState: PanResponderGestureState) => {
      const newValue = Math.min(
        Math.max(0, this.state.isRTL ? -gestureState.dx : gestureState.dx),
        this.maxDragDistance
      );
      this.state.dragX.setValue(newValue);
    },
    onPanResponderRelease: (_, gestureState: PanResponderGestureState) => {
      const dx = this.state.isRTL ? -gestureState.dx : gestureState.dx;
      
      if (dx < this.maxDragDistance * 0.9) {
        Animated.spring(this.state.dragX, {
          toValue: 0,
          ...this.animationConfig,
        }).start(() => {
          if (this.props.onFailure) {
            this.props.onFailure();
          }
        });
      } else {
        Animated.spring(this.state.dragX, {
          toValue: this.maxDragDistance,
          ...this.animationConfig,
        }).start();
        this.triggerHapticFeedback();
      }
    },
  });

  private onLayout = (event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    this.maxDragDistance = width - (this.props.height || 50);
    this.setState({ containerWidth: width });
  };

  private onSwiped = () => {
    if (this.props.onSuccess) {
      this.props.onSuccess();
    }
    this.setState({ unlocked: true });
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
        ...this.animationConfig,
      }).start();
    });
  };

  public buttonComplete = () => {
    if (this.state.unlocked) return;
    Animated.spring(this.state.dragX, {
      toValue: this.maxDragDistance,
      ...this.animationConfig,
    }).start(() => {
      this.setState({ complete: true }, this.onSwiped);
    });
  };

  private getPlatformStyles = (): ViewStyle => {
    const { windowsAccentColor, macOSVibrancyEffect } = this.props;

    return Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
      windows: {
        borderWidth: 1,
        borderColor: windowsAccentColor || '#0078D7',
      },
      macos: macOSVibrancyEffect ? {
        backgroundColor: 'transparent',
      } : {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
      },
      default: {},
    }) as ViewStyle;
  };

  private renderSlider() {
    const {
      sliderColor = '#16362d',
      sliderTextColor = '#fff',
      sliderIconColor = '#fff',
      circle = false,
      borderRadius = 30,
      height = 50,
    } = this.props;

    return (
      <Animated.View
        {...(this.isTV ? {} : this.panResponder.panHandlers)}
        style={[
          styles.slider,
          {
            backgroundColor: sliderColor,
            borderRadius: circle ? borderRadius : 0,
            transform: [{
              translateX: this.state.dragX.interpolate({
                inputRange: [0, this.maxDragDistance],
                outputRange: this.state.isRTL
                  ? [this.state.containerWidth - height, 0]
                  : [-this.state.containerWidth + height, 0],
              }),
            }],
          },
        ]}
      >
        <View style={styles.sliderContent}>
          <Text style={[styles.sliderText, { color: sliderTextColor }]}>
            {this.getText()}
          </Text>
          <View
            style={[
              styles.sliderArrow,
              {
                borderColor: sliderIconColor,
                right: this.state.isRTL ? undefined : 22,
                left: this.state.isRTL ? 22 : undefined,
                transform: [{ rotate: this.state.isRTL ? '225deg' : '45deg' }],
              },
            ]}
          />
          <View
            style={[
              styles.sliderCircle,
              {
                backgroundColor: sliderColor,
                width: height,
                right: this.state.isRTL ? undefined : 0,
                left: this.state.isRTL ? 0 : undefined,
              },
            ]}
          />
        </View>
      </Animated.View>
    );
  }

  render() {
    const {
      width = 300,
      height = 50,
      circle = false,
      disabled = false,
      autoWidth = false,
      backgroundColor = '#eee',
      textColor = '#000',
      accessibilityLabel,
      testID,
      macOSVibrancyEffect,
    } = this.props;

    const containerStyle: ViewStyle = {
      width: autoWidth ? '100%' : width,
      height: height,
      backgroundColor: macOSVibrancyEffect ? 'transparent' : backgroundColor,
      borderRadius: circle ? height / 2 : 5,
      overflow: 'hidden',
      opacity: disabled ? 0.6 : 1,
      ...this.getPlatformStyles(),
    };

    // macOS Render
    if (Platform.OS === 'macos' && macOSVibrancyEffect && this.state.vibrancyView) {
      const MacOSVibrancyView = require('react-native-macos').VibrancyView;
      
      return (
        <View style={containerStyle}>
          <MacOSVibrancyView
            ref={ref => (this.vibrancyViewRef = ref)}
            effect={macOSVibrancyEffect}
            style={StyleSheet.absoluteFill}
          >
            {this.renderContent(textColor)}
          </MacOSVibrancyView>
        </View>
      );
    }

    return (
      <View
        style={[styles.container, containerStyle]}
        onLayout={this.onLayout}
        ref={ref => (this.containerRef = ref)}
        accessible={true}
        accessibilityLabel={accessibilityLabel || 'Swipeable unlock button'}
        accessibilityRole="button"
        accessibilityState={{ disabled }}
        testID={testID}
      >
        {this.renderContent(textColor)}
      </View>
    );
  }

  private renderContent(textColor: string) {
    return (
      <>
        <Text style={[styles.text, { color: textColor }]}>{this.getText()}</Text>
        {this.renderSlider()}
      </>
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
    fontFamily: Platform.select({
      ios: 'System',
      android: 'Roboto',
      windows: 'Segoe UI',
      macos: '.AppleSystemUIFont',
      default: 'System',
    }),
    letterSpacing: 1,
    fontSize: 14,
  },
  slider: {
    position: 'absolute',
    width: '100%',
    height: '100%',
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
    fontFamily: Platform.select({
      ios: 'System',
      android: 'Roboto',
      windows: 'Segoe UI',
      macos: '.AppleSystemUIFont',
      default: 'System',
    }),
    letterSpacing: 1,
    fontSize: 14,
  },
  sliderArrow: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderTopWidth: 2,
    borderRightWidth: 2,
    top: '50%',
    marginTop: -4,
  },
  sliderCircle: {
    position: 'absolute',
    height: '100%',
    borderRadius: 100,
  },
});
