import type { ReactNode } from 'react';
import { View } from 'react-native';
import { twMerge } from 'tailwind-merge';

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <View
      className={twMerge('rounded-xl border border-zinc-200/90 bg-white p-6 shadow-sm', className)}>
      {children}
    </View>
  );
}
