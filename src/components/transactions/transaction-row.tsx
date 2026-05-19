import { memo } from 'react';
import { View } from 'react-native';
import type { TransacaoFinanceira } from '@/services/transactions';
import { AppText } from '@/components/ui/app-text';
import { formatarMoeda } from '@/utils/finance';

type TransactionRowProps = {
  item: TransacaoFinanceira;
  className?: string;
};

export const TransactionRow = memo(function TransactionRow({ item, className }: TransactionRowProps) {
  const ehReceita = item.tipo === 'receita';
  const dataFormatada = new Date(item.data).toLocaleDateString('pt-BR');
  const corIndicador = ehReceita ? 'bg-emerald-500' : 'bg-rose-500';
  const sinal = ehReceita ? '+' : '-';
  const corValor = ehReceita ? 'text-emerald-700' : 'text-rose-700';

  return (
    <View className={`flex-row items-center rounded-[18px] border border-slate-200/80 bg-white px-4 py-3.5 ${className ?? ''}`}>
      <View className={`mr-3 h-9 w-1.5 rounded-full ${corIndicador}`} />

      <View className="flex-1">
        <AppText variant="body" weight="bold" className="text-slate-900" numberOfLines={1}>
          {item.descricao}
        </AppText>
        <View className="mt-1 flex-row items-center">
          <AppText variant="caption" className="text-slate-500">
            {item.categoria}
          </AppText>
          <View className="mx-2 h-1 w-1 rounded-full bg-slate-300" />
          <AppText variant="caption" className="text-slate-500">
            {dataFormatada}
          </AppText>
        </View>
      </View>

      <View className="ml-3 items-end">
        <AppText variant="body" weight="bold" className={corValor}>
          {sinal} {formatarMoeda(item.valor)}
        </AppText>
      </View>
    </View>
  );
});
