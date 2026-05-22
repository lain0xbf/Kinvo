import { Text, type TextProps } from 'react-native';
import { cn } from '@/utils/cn';

type TextVariant = 'display' | 'title' | 'subtitle' | 'body' | 'caption' | 'label' | 'subcaption' | 'categoria';
type TextWeight = 'regular' | 'bold';

type AppTextProps = TextProps & {
  variant?: TextVariant;
  weight?: TextWeight;
  className?: string;
};

const variantClasses: Record<TextVariant, string> = {
  display: 'text-[30px] leading-[36px]',
  title: 'text-[24px] leading-[30px]',
  subtitle: 'text-[18px] leading-[24px]',
  body: 'text-[15px] leading-[22px]',
  subcaption: 'text-[13px] leading-[18px]',
  categoria: 'text-[12px] leading-[18px]',
  caption: 'text-[12px] leading-[18px]',
  label: 'text-[11px] uppercase tracking-[1px] leading-[16px]',
};

export function AppText({
  variant = 'body',
  weight = 'regular',
  className,
  style,
  allowFontScaling = true,
  ...props
}: AppTextProps) {
  return (
    <Text
      allowFontScaling={allowFontScaling}
      className={cn(variantClasses[variant], className)}
      style={[{ fontFamily: weight === 'bold' ? 'SofiaProBold' : 'SofiaProRegular' }, style]}
      {...props}
    />
  );
}
