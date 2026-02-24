import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  testID?: string;
}

const variantStyles = {
  primary: 'bg-blue-600 active:bg-blue-700',
  secondary: 'bg-gray-200 active:bg-gray-300',
  danger: 'bg-red-600 active:bg-red-700',
  ghost: 'bg-transparent active:bg-gray-100',
};

const variantTextStyles = {
  primary: 'text-white',
  secondary: 'text-gray-900',
  danger: 'text-white',
  ghost: 'text-blue-600',
};

const sizeStyles = {
  sm: 'px-3 py-1.5',
  md: 'px-4 py-2.5',
  lg: 'px-6 py-3.5',
};

const sizeTextStyles = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
};

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  testID,
}: ButtonProps) {
  return (
    <TouchableOpacity
      className={`rounded-lg items-center justify-center flex-row ${variantStyles[variant]} ${sizeStyles[size]} ${disabled ? 'opacity-50' : ''}`}
      onPress={onPress}
      disabled={disabled || loading}
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: disabled || loading }}
    >
      {loading && (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' || variant === 'danger' ? '#fff' : '#374151'}
          className="mr-2"
        />
      )}
      <Text
        className={`font-semibold ${variantTextStyles[variant]} ${sizeTextStyles[size]}`}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
}
