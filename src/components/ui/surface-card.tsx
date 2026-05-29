import { cn } from '@/utils/cn';
import { View, type ViewProps, type ViewStyle } from 'react-native';

type SurfaceVariant = 'default' | 'wallet' | 'control' | 'danger' | 'night' | 'nightSoft' | 'nightDanger';

type SurfaceCardProps = ViewProps & {
  className?: string;
  variant?: SurfaceVariant;
};

const variantClasses: Record<SurfaceVariant, string> = {
  default: 'border-slate-200/70 bg-white',
  wallet: 'border-emerald-400/20 bg-slate-950',
  control: 'border-slate-200/80 bg-white',
  danger: 'border-rose-200 bg-rose-50',
  night: 'border-white/10 bg-white/[0.04]',
  nightSoft: 'border-white/15 bg-white/[0.06]',
  nightDanger: 'border-rose-400/20 bg-rose-400/10',

};

const shadowByVariant: Record<SurfaceVariant, ViewStyle> = {
  default: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  wallet: {
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 22,
    elevation: 8,
  },
  control: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.035,
    shadowRadius: 8,
    elevation: 1,
  },
  danger: {
    shadowColor: '#E11D48',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 2,
  },
  night: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 3,
  },
  nightSoft: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 2,
  },
  nightDanger: {
    shadowColor: '#FB7185',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 2,
  },
};

export function SurfaceCard({
  className,
  variant = 'default',
  style,
  ...props
}: SurfaceCardProps) {
  return (
    <View
      className={cn(
        'rounded-[24px] border',
        variantClasses[variant],
        className
      )}
      style={[shadowByVariant[variant], style]}
      {...props}
    />
  );
}