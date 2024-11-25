# react-native-swipeable-button

<!-- [![npm downloads](https://img.shields.io/npm/dm/react-swipeable-button.svg?style=flat-square)](https://npm-stat.com/charts.html?package=react-swipeable-button) -->

### A npm pacakge for Swipeable button in react native

Check all the changes in the [Release Notes](https://github.com/DevelopOnStacks/react-native-swipeable-button/releases)

## Installs

```bash
npm install https://github.com/DevelopOnStacks/react-native-swipeable-button
```

or

```bash
yarn add react-native-swipeable-button
```

## Demo

![react-native-swipeable-button](https://github.com/DevelopOnStacks/react-swipeable-button/blob/main/react-swipeable-button-v1.0.7.gif?raw=true)

## Usage

#### General Usage

```jsx
import { SwipeableButton } from 'react-native-swipeable-unlock';

// ...

const App = () => {
  return (
    <SwipeableButton
      onSuccess={() => console.log('Unlocked!')}
      text="SLIDE TO UNLOCK"
      text_unlocked="UNLOCKED!"
      sliderColor="#007AFF"
      backgroundColor="#E5E5EA"
    />
  );
};
```

## Methods

The component exposes two methods through a ref:

- `buttonReset()`: Reset the button to its initial state
- `buttonComplete()`: Programmatically complete the swipe

```javascript
const buttonRef = useRef(null);

// Reset the button
buttonRef.current?.buttonReset();

// Complete the swipe programmatically
buttonRef.current?.buttonComplete();
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| autoWidth | boolean | false | Use full width of container |
| circle | boolean | false | Use circular ends |
| disabled | boolean | false | Disable the button |
| noAnimate | boolean | false | Disable animations |
| width | number | 300 | Button width |
| height | number | 50 | Button height |
| text | string | 'SLIDE' | Text shown before unlock |
| text_unlocked | string | 'UNLOCKED' | Text shown after unlock |
| onSuccess | function | - | Callback when successfully unlocked |
| onFailure | function | - | Callback when swipe is incomplete |
| sliderColor | string | '#16362d' | Color of the slider |
| backgroundColor | string | '#eee' | Background color |
| sliderTextColor | string | '#fff' | Color of text on slider |
| textColor | string | '#000' | Color of background text |
| borderRadius | number | 30 | Border radius when circle prop is true |

## Contribution

Contributing on this project is always welcome! Just fork, update, push to your respective branch and make a pull request after testing. Make sure to open an issue before contribute.

## License

MIT © [Abdur Rahman](https://github.com/abdurrahman720)
MIT © [null](https://github.com/DevelopOnStacks)
