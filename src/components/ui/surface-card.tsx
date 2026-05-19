import { cn } from "@/utils/cn";
import { View, ViewProps } from "react-native";

type SurfaceCardProps = ViewProps & {
  className?: string;
  variant?: 'light' | 'dark';
};

export function SurfaceCard({ className, variant = 'light', ...props }: SurfaceCardProps) {
  return (
    <View
      className={cn(
        'rounded-[24px] border px-4 py-4 shadow-sm',
        variant === 'light' &&
        'border-slate-200/80 bg-white shadow-slate-900/5',
        variant === 'dark' &&
        'border-slate-900 bg-slate-950 shadow-slate-900/10',
        className
      )}
      {...props}
    />
  );
}