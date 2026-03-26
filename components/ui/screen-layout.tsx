import type { ReactNode } from 'react';
import { View, type ViewProps } from 'react-native';
import { twMerge } from 'tailwind-merge';

/**
 * Styling policy (NativeWind-first):
 * - Use `className` + these primitives for layout width/gutters.
 * - Keep `StyleSheet.create` only for animated values, hairlines, or dynamic numbers
 *   (see e.g. StateBillsPage pill thumb).
 */

/** Horizontal padding aligned with shell header and main column (web + native). */
export const screenGutterClass = 'px-4 sm:px-6 md:px-8';

type ScreenLayoutProps = ViewProps & {
  children: ReactNode;
  className?: string;
};

/** Centered column capped at `max-w-screen-lg` (no horizontal padding). */
export function MaxWidth({ children, className, ...rest }: ScreenLayoutProps) {
  return (
    <View className={twMerge('w-full max-w-screen-lg self-center', className)} {...rest}>
      {children}
    </View>
  );
}

/** Max-width + standard gutters; use inside ScrollView when `contentContainerClassName` supplies `pb-`. */
export function ScreenContent({ children, className, ...rest }: ScreenLayoutProps) {
  return (
    <View
      className={twMerge('w-full max-w-screen-lg self-center', screenGutterClass, className)}
      {...rest}>
      {children}
    </View>
  );
}

/** Max-width + gutters + bottom padding for scroll pages where the scroll view has no bottom padding. */
export function ScreenScrollBody({ children, className, ...rest }: ScreenLayoutProps) {
  return (
    <View
      className={twMerge('w-full max-w-screen-lg self-center pb-10', screenGutterClass, className)}
      {...rest}>
      {children}
    </View>
  );
}
