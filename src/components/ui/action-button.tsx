import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, View, type PressableProps } from 'react-native';
import { AppText } from '@/components/ui/app-text';
import { cn } from '@/utils/cn';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';

type ActionButtonProps = Omit<PressableProps, 'children'> & {
  label: string;
  icon?: ReactNode;
  loading?: boolean;
  variant?: ButtonVariant;
  className?: string;
  textClassName?: string;
};

const variantMap: Record<ButtonVariant, { wrapper: string; text: string; spinner: string }> = {
  primary: {
    wrapper: 'bg-slate-950 border border-slate-950',
    text: 'text-white',
    spinner: '#FFFFFF',
  },
  secondary: {
    wrapper: 'bg-white border border-slate-300',
    text: 'text-slate-900',
    spinner: '#0F172A',
  },
  ghost: {
    wrapper: 'bg-transparent border border-transparent',
    text: 'text-slate-600',
    spinner: '#475569',
  },
};

export function ActionButton({
  label,
  icon,
  loading,
  disabled,
  variant = 'primary',
  className,
  textClassName,
  ...props
}: ActionButtonProps) {
  const tokens = variantMap[variant];

  return (
    <Pressable
      disabled={disabled || loading}
      className={cn(
        'min-h-[48px] flex-row items-center justify-center rounded-2xl px-4 active:opacity-80',
        tokens.wrapper,
        (disabled || loading) && 'opacity-80',
        className
      )}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={tokens.spinner} />
      ) : (
        <View className="flex-row items-center justify-center">
          {icon}
          <AppText variant="body" weight="bold" className={cn('text-[14px]', tokens.text, textClassName)}>
            {label}
          </AppText>
        </View>
      )}
    </Pressable>
  );
}
