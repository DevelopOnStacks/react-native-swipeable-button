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
}
