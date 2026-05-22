import { memo } from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { TransacaoFinanceira } from '@/services/transactions';
import { AppText } from '@/components/ui/app-text';
import { formatarMoeda } from '@/utils/finance';

type TransactionRowProps = {
  item: TransacaoFinanceira;
  className?: string;
};

export const TransactionRow = memo(function TransactionRow({
  item,
  className,
}: TransactionRowProps) {
  console.log('Renderizou:', item.id);
  const ehReceita = item.tipo === 'receita';
  const dataFormatada = new Date(item.data).toLocaleDateString('pt-BR');

  const sinal = ehReceita ? '+' : '-';
  const corValor = ehReceita ? 'text-emerald-600' : 'text-slate-900';
  const bgIcone = ehReceita ? 'bg-emerald-100' : 'bg-rose-100';
  const corIcone = ehReceita ? '#10B981' : '#E11D48';
  const corBolinha = ehReceita ? 'bg-emerald-500' : 'bg-rose-500';

  return (
    <View className={`flex-row items-center bg-white px-4 py-4 ${className ?? ''}`}>
      <View className={`h-12 w-12 items-center justify-center rounded-full ${bgIcone}`}>
        <Ionicons
          name={ehReceita ? 'wallet-outline' : 'cart-outline'}
          size={22}
          color={corIcone}
        />
      </View>

      <View className="ml-4 flex-1">
        <AppText
        family='inter'
          weight="bold"
          variant='body'
          className="text-slate-900"
          numberOfLines={1}
        >
          {item.descricao}
        </AppText>

        <View className="mt-1 flex-row items-center">
          <AppText family="inter" weight="regular" variant='subcaption' className="text-slate-500" numberOfLines={1}>
            {item.categoria}
          </AppText>
        </View>
      </View>

      <View className="ml-3 items-end">
        <AppText family="inter" weight="bold" variant='body' className={`${corValor}`}>
          {sinal} {formatarMoeda(item.valor)}
        </AppText>

        <AppText family="inter" weight="regular" variant='caption' className="mt-1 text-slate-400">
          {dataFormatada}
        </AppText>
      </View>

      <Ionicons
        name="chevron-forward"
        size={18}
        color="#94A3B8"
        style={{ marginLeft: 8 }}
      />
    </View>
  );
});