import { useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { AppText } from '@/components/ui/app-text';
import { SurfaceCard } from '@/components/ui/surface-card';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { useAppFonts } from '@/hooks/use-app-fonts';
import { useAuthenticatedTransactions } from '@/hooks/use-authenticated-transactions';
import { TransactionRow } from '@/components/transactions/transaction-row';
import { calcularResumoFinanceiro, formatarMoeda } from '@/utils/finance';
import { Asset } from 'expo-asset';
import { auth } from '@/config/firebase';
import { excluirTransacaoDoUsuario, type TransacaoFinanceira } from '@/services/transactions';
import { TransactionSheet } from '@/components/transactions/transactionSheet';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { AppScreen } from '@/components/ui/app-screen';

const fundoApp = require('../../assets/fundo_login.webp');

type PeriodFilter = 'currentMonth' | 'previousMonth' | 'all';

const periodLabels: Record<PeriodFilter, string> = {
  currentMonth: 'Este mês',
  previousMonth: 'Mês passado',
  all: 'Tudo',
};

const periodOptions: Array<{
  value: PeriodFilter;
  label: string;
  description: string;
}> = [
    {
      value: 'currentMonth',
      label: 'Este mês',
      description: 'Entradas e saídas do mês atual',
    },
    {
      value: 'previousMonth',
      label: 'Mês passado',
      description: 'Compare com o ciclo anterior',
    },
    {
      value: 'all',
      label: 'Tudo',
      description: 'Resumo completo da carteira',
    },
  ];

function isTransactionInPeriod(dateValue: string, period: PeriodFilter) {
  if (period === 'all') return true;

  const transactionDate = new Date(dateValue);
  const now = new Date();

  const targetMonth =
    period === 'currentMonth'
      ? now.getMonth()
      : now.getMonth() === 0
        ? 11
        : now.getMonth() - 1;

  const targetYear =
    period === 'currentMonth'
      ? now.getFullYear()
      : now.getMonth() === 0
        ? now.getFullYear() - 1
        : now.getFullYear();

  return (
    transactionDate.getMonth() === targetMonth &&
    transactionDate.getFullYear() === targetYear
  );
}

function formatMonthLabel(date: Date) {
  return date.toLocaleDateString('pt-BR', {
    month: 'short',
    year: 'numeric',
  });
}

function getPeriodDisplayLabel(period: PeriodFilter) {
  const now = new Date();

  if (period === 'all') return 'Tudo';

  if (period === 'currentMonth') {
    return formatMonthLabel(now);
  }

  const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  return formatMonthLabel(previousMonth);
}

function getPeriodDescription(period: PeriodFilter) {
  const now = new Date();

  if (period === 'all') return 'Resumo completo da carteira';

  if (period === 'currentMonth') {
    return `Entradas e saídas de ${now.toLocaleDateString('pt-BR', {
      month: 'long',
      year: 'numeric',
    })}`;
  }

  const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  return `Entradas e saídas de ${previousMonth.toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric',
  })}`;
}

type BalanceMetricProps = {
  label: string;
  value: string;
  tone: 'income' | 'expense';
};

function BalanceMetric({ label, value, tone }: BalanceMetricProps) {
  return (
    <View className="flex-1 rounded-[20px] border border-white/10 bg-white/5 px-4 py-3">
      <AppText variant="label" family="inter" className="text-slate-400">
        {label}
      </AppText>

      <AppText
        family="inter"
        weight="bold"
        variant="titleCardES"
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.82}
        className={tone === 'income' ? 'mt-1 text-emerald-300' : 'mt-1 text-rose-300'}
      >
        {value}
      </AppText>
    </View>
  );
}

type LedgerFlowStripProps = {
  income: number;
  expense: number;
};

function LedgerFlowStrip({ income, expense }: LedgerFlowStripProps) {
  const hasFlow = income > 0 || expense > 0;

  if (!hasFlow) {
    return (
      <View className="mt-5">
        <View className="h-1.5 rounded-full bg-white/10" />

        <AppText family="inter" variant="caption" className="mt-2 text-slate-500">
          Nenhum fluxo registrado neste período
        </AppText>
      </View>
    );
  }

  return (
    <View className="mt-5 h-1.5 flex-row overflow-hidden rounded-full bg-white/10">
      <View
        className="h-full bg-emerald-400"
        style={{ flex: Math.max(income, 1) }}
      />

      <View
        className="h-full bg-rose-400/80"
        style={{ flex: Math.max(expense, 1) }}
      />
    </View>
  );
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) return 'U';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();

  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}
export default function Home() {
  const [fontsLoaded] = useAppFonts();
  const { authResolvida, carregando, erro, transacoes, userId } = useAuthenticatedTransactions();
  const [carregouImagem, setCarregouImagem] = useState(false);
  const [transacaoSelecionada, setTransacaoSelecionada] = useState<TransacaoFinanceira | null>(null);
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('currentMonth');
  const [periodSheetOpen, setPeriodSheetOpen] = useState(false);

  const insets = useSafeAreaInsets();


  const tabBarHeight = useBottomTabBarHeight();
  const bottomPadding = tabBarHeight + 12; // 12 = respiro visual

  const user = auth.currentUser;
  const nome = user?.displayName?.trim() || user?.email?.split('@')[0] || 'Usuario';

  useEffect(() => {
    async function carregarFundo() {
      await Promise.all([
        Asset.fromModule(fundoApp).downloadAsync(),
      ]);
      setCarregouImagem(true);
    }

    carregarFundo();
  }, []);


  const transacoesDoPeriodo = useMemo(() => {
    return transacoes.filter((item) =>
      isTransactionInPeriod(item.data, periodFilter)
    );
  }, [transacoes, periodFilter]);

  const resumoTotal = useMemo(
    () => calcularResumoFinanceiro(transacoes),
    [transacoes]
  );

  const resumoPeriodo = useMemo(
    () => calcularResumoFinanceiro(transacoesDoPeriodo),
    [transacoesDoPeriodo]
  );

  const movimentacoesRecentes = useMemo(() => {
    return [...transacoes]
      .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
      .slice(0, 5);
  }, [transacoes]);

  async function handleExcluirTransacao() {
    if (!userId || !transacaoSelecionada) return;

    await excluirTransacaoDoUsuario(userId, transacaoSelecionada.id);
    setTransacaoSelecionada(null);
  }

  function handleEditarTransacao() {
    if (!transacaoSelecionada) return;

    const transacaoId = transacaoSelecionada.id;
    setTransacaoSelecionada(null);

    router.push({
      pathname: '/editar-transacao',
      params: { id: transacaoId },
    });
  }

  if (!fontsLoaded || !authResolvida || !userId || carregando || !carregouImagem) {
    return <LoadingScreen />;
  }


  return (
    <AppScreen edges={['top', 'left', 'right']}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: bottomPadding }}>
          <View className="pb-4 pt-5">
            <View className="mb-5 flex-row items-start justify-between">
              <View className="flex-1 pr-4">
                <AppText family="inter" weight="bold" className="text-[13px] leading-[18px] text-emerald-400">
                  Olá, {nome}
                </AppText>

                <AppText family="sofia" weight="bold" className="mt-1 text-[28px] leading-[34px] text-white">
                  Visão da carteira
                </AppText>
              </View>

              <View className="pt-1">
                <Pressable
                  onPress={() => router.push('/perfil')}
                  accessibilityRole="button"
                  accessibilityLabel="Abrir perfil"
                  hitSlop={8}
                  className="h-11 w-11 items-center justify-center rounded-full border border-emerald-400/20 bg-emerald-400/10"
                  style={({ pressed }) => [
                    { opacity: pressed ? 0.78 : 1 },
                    { transform: [{ scale: pressed ? 0.97 : 1 }] },
                  ]}
                >
                  <AppText family="inter" weight="bold" className="text-[13px] text-emerald-300">
                    {getInitials(nome)}
                  </AppText>
                </Pressable>
              </View>
            </View>

            <SurfaceCard
              variant="wallet"
              className="mb-5 overflow-hidden rounded-[28px] px-5 pb-5 pt-5"
            >


              <View className="flex-row items-start justify-between">
                <View>
                  <AppText weight="regular" family="inter" variant="caption" className="text-slate-300">
                    Saldo disponível
                  </AppText>

                  <AppText family="inter" variant="caption" className="mt-0.5 text-slate-500">
                    {periodFilter === 'all'
                      ? 'Fluxo geral da carteira'
                      : `Fluxo de ${getPeriodDisplayLabel(periodFilter)}`}
                  </AppText>
                </View>

                <Pressable
                  onPress={() => setPeriodSheetOpen(true)}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5"
                  hitSlop={8}
                >
                  <View className="flex-row items-center">
                    <AppText family="inter" weight="bold" variant="caption" className="text-slate-200">
                      {getPeriodDisplayLabel(periodFilter)}
                    </AppText>

                    <Ionicons name="chevron-down" size={13} color="#94A3B8" style={{ marginLeft: 4 }} />
                  </View>
                </Pressable>
              </View>

              <AppText
                family="inter"
                weight="bold"
                variant="display"
                className="mt-2 text-[34px] leading-[40px] text-white"
              >
                {formatarMoeda(resumoTotal.saldo)}

              </AppText>

              <LedgerFlowStrip
                income={resumoPeriodo.receitas}
                expense={resumoPeriodo.despesas}
              />


              <View className="mt-4 flex-row">
                <BalanceMetric
                  label="Entradas"
                  value={formatarMoeda(resumoPeriodo.receitas)}
                  tone="income"
                />

                <View className="w-2" />

                <BalanceMetric
                  label="Saídas"
                  value={formatarMoeda(resumoPeriodo.despesas)}
                  tone="expense"
                />
              </View>
            </SurfaceCard>

            <View className="mb-3 mt-2 flex-row items-center justify-between px-1">
              <AppText weight="bold" className="text-white" style={{ fontSize: 17, lineHeight: 24 }}>
                Atividade recente
              </AppText>

              <Pressable
                onPress={() => router.push('/extrato')}
                hitSlop={8}
                className="rounded-full px-2.5 py-1"
                style={({ pressed }) => [{ opacity: pressed ? 0.72 : 1 }]}
              >
                <View className="flex-row items-center">
                  <AppText weight="bold" variant="fieldLabel" className="text-emerald-400">
                    Ver todas
                  </AppText>
                  <Ionicons name="chevron-forward" size={14} color="#34D399" style={{ marginLeft: 2 }} />
                </View>
              </Pressable>
            </View>

            {movimentacoesRecentes.length > 0 ? (
              <SurfaceCard variant="night" className="overflow-hidden rounded-[24px] p-0">
                {movimentacoesRecentes.map((item, index) => (
                  <Pressable key={item.id} onPress={() => setTransacaoSelecionada(item)}>
                    <TransactionRow
                      variant="dark"
                      item={item}
                      className={index !== movimentacoesRecentes.length - 1 ? 'border-b border-white/10' : ''}
                    />
                  </Pressable>
                ))}
              </SurfaceCard>
            ) : (
              <SurfaceCard variant="nightSoft" className="items-center rounded-[24px] border-dashed px-5 py-8">
                <View className="h-12 w-12 items-center justify-center rounded-[16px] bg-white/5">
                  <Ionicons name="receipt-outline" size={24} color="#94A3B8" />
                </View>

                <AppText variant="subtitle" weight="bold" className="mt-3 text-center text-white">
                  Nenhuma movimentação ainda
                </AppText>

                <AppText variant="caption" family="inter" className="mt-1 text-center text-slate-400">
                  Adicione sua primeira transação para começar a acompanhar sua carteira.
                </AppText>
              </SurfaceCard>
            )}

            {erro ? (
              <SurfaceCard variant="nightDanger" className="mt-4 rounded-[20px] px-4 py-3">
                <AppText variant="caption" className="text-rose-200">
                  {erro}
                </AppText>
              </SurfaceCard>
            ) : null}
          </View>
        </ScrollView>

        <Modal
          visible={periodSheetOpen}
          transparent
          animationType="fade"
          onRequestClose={() => setPeriodSheetOpen(false)}
        >
          <View className="flex-1 justify-end bg-slate-950/65">
            <Pressable
              className="flex-1"
              onPress={() => setPeriodSheetOpen(false)}
            />

            <View
              className="rounded-t-[28px] border border-white/10 bg-slate-950 px-5 pt-4"
              style={{ paddingBottom: Math.max(insets.bottom + 16, 32) }}
            >
              <View className="mb-4 h-1.5 w-12 self-center rounded-full bg-white/20" />

              <AppText family="inter" weight="bold" variant="subtitle" className="text-white">
                Período do resumo
              </AppText>

              {periodOptions.map((option) => {
                const selected = periodFilter === option.value;

                return (
                  <Pressable
                    key={option.value}
                    onPress={() => {
                      setPeriodFilter(option.value);
                      setPeriodSheetOpen(false);
                    }}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    className={
                      selected
                        ? 'mt-3 flex-row items-center justify-between rounded-[18px] border border-emerald-400/25 bg-emerald-400/10 px-4 py-4'
                        : 'mt-3 flex-row items-center justify-between rounded-[18px] border border-white/10 bg-white/5 px-4 py-4'
                    }
                  >
                    <View className="flex-1 pr-3">
                      <AppText
                        family="inter"
                        weight="bold"
                        variant="body"
                        className={selected ? 'text-emerald-300' : 'text-slate-100'}
                      >
                        {option.label}
                      </AppText>

                      <AppText
                        family="inter"
                        variant="caption"
                        className={selected ? 'mt-0.5 text-emerald-200/70' : 'mt-0.5 text-slate-500'}
                      >
                        {getPeriodDescription(option.value)}
                      </AppText>
                    </View>

                    <View
                      className={
                        selected
                          ? 'h-8 w-8 items-center justify-center rounded-full bg-emerald-400'
                          : 'h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5'
                      }
                    >
                      {selected ? (
                        <Ionicons name="checkmark" size={17} color="#020617" />
                      ) : null}
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </Modal>

        <TransactionSheet
          visible={!!transacaoSelecionada}
          transaction={transacaoSelecionada}
          onClose={() => setTransacaoSelecionada(null)}
          onDelete={handleExcluirTransacao}
          onEdit={handleEditarTransacao}
        />
    </AppScreen>
  );
}

