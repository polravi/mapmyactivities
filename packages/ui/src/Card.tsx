import React from 'react';
import { View } from 'react-native';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  testID?: string;
}

export function Card({ children, className = '', testID }: CardProps) {
  return (
    <View
      className={`bg-white rounded-xl p-4 shadow-sm ${className}`}
      testID={testID}
    >
      {children}
    </View>
  );
}
