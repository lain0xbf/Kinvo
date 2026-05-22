import type { ReactNode } from 'react';
import { View } from 'react-native';
import { AppText } from './ui/app-text';
import { SurfaceCard } from './ui/surface-card';

type FormFieldProps = {
  label: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  children: ReactNode;
  contentClassName?: string;
};

export function FormField({ label, leftIcon, rightIcon, children, contentClassName }: FormFieldProps) {
  return (
    <View className="mt-4">
      <AppText variant="fieldLabel" family="inter" className="text-slate-500">
        {label}
      </AppText>

      <SurfaceCard
        variant="control"
        className={`mt-3 h-16 flex-row items-center px-5 ${contentClassName ?? ''}`}
      >
        {leftIcon ? <View className="mr-4">{leftIcon}</View> : null}
        <View className="flex-1">{children}</View>
        {rightIcon ? <View className="ml-3">{rightIcon}</View> : null}
      </SurfaceCard>
    </View>
  );
}