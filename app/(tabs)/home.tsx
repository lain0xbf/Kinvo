import { useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { sairDaConta } from '@/services/auth';
import { AppText } from '@/components/ui/app-text';
import { ActionButton } from '@/components/ui/action-button';
import { SurfaceCard } from '@/components/ui/surface-card';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { useAppFonts } from '@/hooks/use-app-fonts';
import { useAuthenticatedTransactions } from '@/hooks/use-authenticated-transactions';
import { TransactionRow } from '@/components/transactions/transaction-row';
import { calcularResumoFinanceiro, formatarMoeda, obterUltimaTransacao } from '@/utils/finance';

export default function Home() {
  const [saindo, setSaindo] = useState(false);
  const [fontsLoaded] = useAppFonts();
  const { authResolvida, carregando, erro, transacoes, userId } = useAuthenticatedTransactions();

  async function handleSair() {
    setSaindo(true);
    try {
      await sairDaConta();
      router.replace('/login');
    } finally {
      setSaindo(false);
    }
  }

  const resumo = useMemo(() => calcularResumoFinanceiro(transacoes), [transacoes]);
  const ultimaMovimentacao = useMemo(() => obterUltimaTransacao(transacoes), [transacoes]);

  const saldoPositivo = resumo.saldo >= 0;

  if (!fontsLoaded || !authResolvida || !userId || carregando) {
    return <LoadingScreen />;
  }

  return (
    <SafeAreaView className="flex-1 bg-[#F5F7FA]" edges={['top', 'left', 'right']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 96 }}>
        <View className="pb-4 pt-5">
          <View className="mb-6 flex-row items-end justify-between">
            <View className="flex-1 pr-4">
              <AppText variant="title" weight="bold" className="mt-1 text-slate-950">
                Sua carteira
              </AppText>

              <AppText variant="caption" className="mt-1 text-slate-500">
                Controle seus gastos de forma simples
              </AppText>
            </View>

            <View className="flex-row items-center">
              <ActionButton
                onPress={handleSair}
                loading={saindo}
                variant="secondary"
                icon={<Ionicons
                  name="log-out-outline"
                  size={18}
                  color="#0F172A" />}
                className="h-11 w-11 rounded-full bg-white border border-slate-200" label={''} />
            </View>
          </View>

          <SurfaceCard variant="dark" className="mb-5 overflow-hidden rounded-[28px] bg-slate-950 px-5 py-5">
            <View className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/5" />
            <View className="flex-row items-center justify-between">
              <View className="flex-1 pr-4">
                <AppText variant="caption" className="text-slate-300">
                  Saldo disponível
                </AppText>

                <AppText variant="display" weight="bold" className="mt-1 text-white">
                  {formatarMoeda(resumo.saldo)}
                </AppText>
              </View>

              <View className="h-11 w-11 items-center justify-center rounded-2xl bg-white/10">
                <Ionicons
                  name={saldoPositivo ? 'trending-up-outline' : 'trending-down-outline'}
                  size={19}
                  color="#FFFFFF"
                />
              </View>
            </View>

            <View className="mt-4 flex-row">
              <View className="flex-1">
                <AppText variant="caption" className="text-slate-400">
                  Entradas
                </AppText>
                <AppText variant="body" weight="bold" className="text-emerald-300">
                  {formatarMoeda(resumo.receitas)}
                </AppText>
              </View>

              <View className="mx-4 w-px bg-white/10" />

              <View className="flex-1">
                <AppText variant="caption" className="text-slate-400">
                  Saídas
                </AppText>
                <AppText variant="body" weight="bold" className="mt-0.5 text-rose-300">
                  {formatarMoeda(resumo.despesas)}
                </AppText>
              </View>
            </View>
          </SurfaceCard>

          <ActionButton
            onPress={() => router.push('/nova-despesa')}
            label="Nova transação"
            icon={<Ionicons name="add-circle-outline" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />}
            className="mb-6 min-h-[54px] rounded-[18px] mt-2"
          />

          <View className="mb-3 flex-row items-center justify-between">
            <AppText variant="body" weight="bold" className="text-slate-900">
              Atividade recente
            </AppText>
          </View>

          <SurfaceCard className="rounded-[22px] px-4 py-4">
            {ultimaMovimentacao ? (
              <TransactionRow item={ultimaMovimentacao} className="border-0 px-0 py-0" />
            ) : (
              <View className="items-center px-4 py-8">
                <View className="mb-3 h-11 w-11 items-center justify-center rounded-2xl bg-slate-100">
                  <Ionicons name="receipt-outline" size={19} color="#64748B" />
                </View>
                <AppText variant="body" weight="bold" className="text-slate-900">
                  Nenhuma movimentação ainda
                </AppText>
                <AppText variant="caption" className="mt-1 text-center text-slate-500">
                  Crie sua primeira transacao para acompanhar o saldo.
                </AppText>
              </View>
            )}
          </SurfaceCard>

          {erro ? (
            <SurfaceCard className="mt-4 rounded-[20px] border-rose-200 bg-rose-50 px-4 py-3">
              <AppText variant="caption" className="text-rose-700">
                {erro}
              </AppText>
            </SurfaceCard>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
