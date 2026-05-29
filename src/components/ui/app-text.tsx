import { Text, type TextProps } from 'react-native';
import { cn } from '@/utils/cn';

type TextVariant = 'display' | 'title' | 'subtitle' | 'subLogin' | 'body' | 'caption' | 'modalValor' | 'modalLabel' | 'label' | 'subcaption' | 'cta' | 'categoria' | 'titleCardES' | 'screenTitle' | 'screenSubtitle' | 'fieldLabel' | 'amount' | 'inputValue';
type TextWeight = 'regular' | 'bold';
type TextFamily = 'sofia' | 'inter';

type AppTextProps = TextProps & {
  variant?: TextVariant;
  weight?: TextWeight;
  family?: TextFamily;
  className?: string;
};

const variantClasses: Record<TextVariant, string> = {
  modalLabel: 'text-[12px] leading-[16px]',
  modalValor: 'text-[32px] leading-[34px]',
  display: 'text-[30px] leading-[36px]',
  title: 'text-[24px] leading-[30px]',
  subtitle: 'text-[18px] leading-[24px]',
  titleCardES: 'text-[16px] leading-[22px]',
  subLogin: 'text-[16px] leading-[24px]',
  cta: 'text-[17px] leading-[24px]',
  body: 'text-[15px] leading-[22px]',
  subcaption: 'text-[13px] leading-[18px]',
  categoria: 'text-[12px] leading-[16px]',
  caption: 'text-[12px] leading-[18px]',
  label: 'text-[11px] uppercase tracking-[1px] leading-[16px]',
  screenTitle: 'text-[22px] leading-[28px]',
  screenSubtitle: 'text-[13px] leading-[18px]',
  fieldLabel: 'text-[14px] leading-[20px]',
  amount: 'text-[22px] leading-[28px]',
  inputValue: 'text-[26px] leading-[30px]',
};

const fontByFamilyAndWeight: Record<TextFamily, Record<TextWeight, string>> = {
  sofia: {
    regular: 'InterRegular',
    bold: 'InterBold',
  },
  inter: {
    regular: 'InterRegular',
    bold: 'InterBold',
  },
};
export function AppText({
  variant = 'body',
  weight = 'regular',
  family = 'sofia',
  className,
  style,
  allowFontScaling = false,
  ...props
}: AppTextProps) {
  return (
    <Text
      allowFontScaling={allowFontScaling}
      className={cn(variantClasses[variant], className)}
      style={[{ fontFamily: fontByFamilyAndWeight[family][weight] }, style]}
      {...props}
    />
  );
}
