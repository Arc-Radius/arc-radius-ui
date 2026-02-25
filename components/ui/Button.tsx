import { Pressable, Text } from 'react-native';

interface ButtonProps {
  label: string;
  variant?: 'filled' | 'outline';
  disabled?: boolean;
  onPress?: () => void;
  className?: string;
}

const variantStyles = {
  filled: {
    container: 'bg-stone-800 rounded-lg px-5 py-2.5',
    text: 'text-center text-white text-sm font-sans-semibold tracking-tight',
  },
  outline: {
    container: 'rounded-lg border border-stone-300 px-5 py-2',
    text: 'text-center text-stone-700 text-sm font-sans-medium',
  },
};

export function Button({
  label,
  variant = 'filled',
  disabled = false,
  onPress,
  className = '',
}: ButtonProps) {
  const styles = variantStyles[variant];

  return (
    <Pressable
      className={`flex-row items-center justify-center ${styles.container} ${className} ${disabled ? 'opacity-40' : 'active:opacity-80'}`}
      onPress={onPress}
      disabled={disabled}>
      <Text className={styles.text}>{label}</Text>
    </Pressable>
  );
}
