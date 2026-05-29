import { memo } from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { TransacaoFinanceira } from '@/services/transactions';
import { AppText } from '@/components/ui/app-text';
import { formatarMoeda } from '@/utils/finance';
import { cn } from '@/utils/cn';

type TransactionRowVariant = 'light' | 'dark';
type TransactionRowDensity = 'regular' | 'compact';


type TransactionRowProps = {
  item: TransacaoFinanceira;
  className?: string;
  variant?: TransactionRowVariant;
  density?: TransactionRowDensity;
};

export const TransactionRow = memo(function TransactionRow({
  item,
  className,
  variant = 'light',
  density = 'regular',
}: TransactionRowProps) {
  const ehReceita = item.tipo === 'receita';
  const isDark = variant === 'dark';
  const isCompact = density === 'compact';

  const dataFormatada = new Date(item.data).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
  });

  return (
    <View
      className={cn(
        isCompact
          ? 'min-h-[64px] flex-row items-center px-3.5 py-2.5'
          : 'min-h-[72px] flex-row items-center px-4 py-3',
        isDark ? 'bg-transparent' : 'bg-white',
        className
      )}
    >
      <View
        className={cn(
          isCompact
            ? 'h-9 w-9 items-center justify-center rounded-[13px] border'
            : 'h-10 w-10 items-center justify-center rounded-[14px] border',
          ehReceita
            ? isDark
              ? 'border-emerald-400/20 bg-emerald-400/10'
              : 'border-emerald-200 bg-emerald-50'
            : isDark
              ? 'border-rose-400/20 bg-rose-400/10'
              : 'border-rose-200 bg-rose-50'
        )}
      >
        <Ionicons
          name={ehReceita ? 'arrow-down-left-box' : 'arrow-up-right-box'}
          size={isCompact ? 17 : 18}
          color={ehReceita ? '#34D399' : '#FB7185'}
        />
      </View>

      <View className="ml-3 flex-1">
        <AppText
          family="inter"
          weight="bold"
          variant="body"
          className={isDark ? 'text-white' : 'text-slate-950'}
          numberOfLines={1}
        >
          {item.descricao}
        </AppText>

        <View className="mt-1 flex-row items-center">
          <AppText
            family="inter"
            variant="subcaption"
            className={isDark ? 'text-slate-400' : 'text-slate-500'}
            numberOfLines={1}
          >
            {item.categoria || 'Sem categoria'}
          </AppText>

          <View
            className={cn(
              'mx-2 h-1 w-1 rounded-full',
              isDark ? 'bg-white/20' : 'bg-slate-300'
            )}
          />

          <AppText
            family="inter"
            variant="subcaption"
            className={isDark ? 'text-slate-500' : 'text-slate-400'}
          >
            {dataFormatada}
          </AppText>
        </View>
      </View>

      <View className="ml-3 items-end">
        <AppText
          family="inter"
          weight="bold"
          variant="body"
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.85}
          className={
            ehReceita
              ? isDark
                ? 'text-emerald-300'
                : 'text-emerald-600'
              : isDark
                ? 'text-white'
                : 'text-slate-950'
          }
        >
          {ehReceita ? '+' : '-'} {formatarMoeda(item.valor)}
        </AppText>

        <AppText
          family="inter"
          variant="caption"
          className={isDark ? 'mt-0.5 text-slate-500' : 'mt-0.5 text-slate-400'}
        >
          {ehReceita ? 'Entrada' : 'Saída'}
        </AppText>
      </View>
    </View>
  );
});