import { cn } from "@/utils/cn";
import { View, ViewProps } from "react-native";

type SurfaceCardProps = ViewProps & {
  className?: string;
  variant?: 'light' | 'dark' | 'control';
};

export function SurfaceCard({ className, variant = 'light', style, ...props }: SurfaceCardProps) {
  const useDarkShadow = variant === 'dark';

  return (
    <View
      className={cn(
        'rounded-[24px] border',
        variant === 'light' &&
        'border-slate-200/80 bg-white',
        variant === 'dark' &&
        'border-slate-900 bg-slate-950',
        variant === 'control' &&
        'rounded-[24px] border-slate-200/80 bg-white',
        className
      )}
      style={[
        {
          shadowColor: '#0F172A',
          shadowOffset: { width: 0, height: useDarkShadow ? 8 : 4 },
          shadowOpacity: useDarkShadow ? 0.12 : 0.05,
          shadowRadius: useDarkShadow ? 14 : 10,
          elevation: useDarkShadow ? 4 : 2,
        },
        style,
      ]}
      {...props}
    />
  );
}
