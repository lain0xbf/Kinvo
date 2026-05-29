import { useCallback, useMemo, useState } from 'react';
import { FlatList, Pressable, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { excluirTransacaoDoUsuario, type TipoTransacao, type TransacaoFinanceira } from '@/services/transactions';
import { AppText } from '@/components/ui/app-text';
import { SurfaceCard } from '@/components/ui/surface-card';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { useAppFonts } from '@/hooks/use-app-fonts';
import { useAuthenticatedTransactions } from '@/hooks/use-authenticated-transactions';
import { TransactionRow } from '@/components/transactions/transaction-row';
import { TransactionSheet } from '@/components/transactions/transactionSheet';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useRouter } from 'expo-router';
import { AppScreen } from '@/components/ui/app-screen';
import { calcularResumoFinanceiro, formatarMoeda } from '@/utils/finance';


type Filtro = 'todas' | TipoTransacao;
type LinhaExtrato =
  | { tipo: 'secao'; id: string; titulo: string }
  | { tipo: 'item'; id: string; transacao: TransacaoFinanceira };

function tituloSecao(data: Date) {
  const hoje = new Date();
  const ontem = new Date();
  ontem.setDate(hoje.getDate() - 1);

  const chave = chaveDiaLocal(data);
  if (chave === chaveDiaLocal(hoje)) return 'Hoje';
  if (chave === chaveDiaLocal(ontem)) return 'Ontem';

  return data.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' });
}


function chaveDiaLocal(data: Date) {
  const y = data.getFullYear();
  const m = String(data.getMonth() + 1).padStart(2, '0');
  const d = String(data.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

type FilterSummaryMetricProps = {
  label: string;
  value: string;
  tone?: 'income' | 'expense' | 'neutral';
};

function FilterSummaryMetric({
  label,
  value,
  tone = 'neutral',
}: FilterSummaryMetricProps) {
  const valueClassName =
    tone === 'income'
      ? 'text-emerald-300'
      : tone === 'expense'
        ? 'text-rose-300'
        : 'text-white';

  return (
    <View className="flex-1 px-2 py-1">
      <AppText family="inter" variant="caption" className="text-slate-500">
        {label}
      </AppText>

      <AppText
        family="inter"
        weight="bold"
        variant="titleCardES"
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.82}
        className={`mt-1 ${valueClassName}`}
      >
        {value}
      </AppText>
    </View>
  );
}

type PeriodFilter = 'currentMonth' | 'previousMonth' | 'all';

const periodLabels: Record<PeriodFilter, string> = {
  currentMonth: 'Este mês',
  previousMonth: 'Mês passado',
  all: 'Tudo',
};

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

export default function Extrato() {
  const [filtro, setFiltro] = useState<Filtro>('todas');
  const [fontsLoaded] = useAppFonts();
  const { authResolvida, carregando, erro, transacoes, userId } = useAuthenticatedTransactions();
  const [transacaoSelecionada, setTransacaoSelecionada] = useState<TransacaoFinanceira | null>(null);
  const [busca, setBusca] = useState('');
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('all');


  const router = useRouter();

  const tabBarHeight = useBottomTabBarHeight();
  const bottomPadding = tabBarHeight + 12; // 12 = respiro visual

  function normalizar(valor: string) {
    return valor
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }

  const transacoesFiltradas = useMemo(() => {
    const porPeriodo = transacoes.filter((item) =>
      isTransactionInPeriod(item.data, periodFilter)
    );

    const base =
      filtro === 'todas'
        ? porPeriodo
        : porPeriodo.filter((item) => item.tipo === filtro);

    const termo = normalizar(busca);
    if (!termo) return base;

    return base.filter((item) => {
      const tipoLabel = item.tipo === 'receita' ? 'receita' : 'despesa';
      const alvo = normalizar(
        `${item.descricao} ${item.categoria ?? ''} ${tipoLabel}`
      );
      return alvo.includes(termo);
    });
  }, [transacoes, filtro, busca, periodFilter]);

  const resumoFiltrado = useMemo(
    () => calcularResumoFinanceiro(transacoesFiltradas),
    [transacoesFiltradas]
  );

  const hasActiveFilter =
    busca.trim().length > 0 || filtro !== 'todas' || periodFilter !== 'all';

  const linhasExtrato = useMemo<LinhaExtrato[]>(() => {
    const ordenadas = [...transacoesFiltradas].sort(
      (a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()
    );

    const grupos = new Map<string, TransacaoFinanceira[]>();

    for (const tx of ordenadas) {
      const data = new Date(tx.data);
      const chave = chaveDiaLocal(data);
      if (!grupos.has(chave)) grupos.set(chave, []);
      grupos.get(chave)!.push(tx);
    }

    const resultado: LinhaExtrato[] = [];
    for (const [chave, itens] of grupos.entries()) {
      const dataRef = new Date(itens[0].data);
      resultado.push({ tipo: 'secao', id: `secao-${chave}`, titulo: tituloSecao(dataRef) });

      for (const tx of itens) {
        resultado.push({ tipo: 'item', id: tx.id, transacao: tx });
      }
    }

    return resultado;
  }, [transacoesFiltradas]);


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

  const handleMudarFiltro = useCallback((proximoFiltro: Filtro) => {
    setFiltro(proximoFiltro);
  }, []);


  const listHeader = (
    <View className="pt-5">
      <View className="mb-4 flex-row items-end justify-between">
        <View className="flex-1 pr-4">
          <AppText family="inter" weight="bold" className="text-[28px] leading-[34px] text-white">
            Extrato
          </AppText>

          <AppText family="inter" variant="caption" className="mt-1 text-slate-500">
            Busque e filtre seus lançamentos
          </AppText>
        </View>
      </View>

      <SurfaceCard variant="night" className="mb-4 rounded-[24px] p-2">
        <View className="flex-row items-center rounded-[18px] bg-white/5 px-4">

          <Ionicons name="search-outline" size={18} color="#64748B" />
          <TextInput
            value={busca}
            onChangeText={setBusca}
            placeholder="Pesquisar..."
            placeholderTextColor="#64748B"
            autoCapitalize="none"
            autoCorrect={false}
            className="ml-2.5 flex-1 py-3 text-[14px] text-white"
            style={{ fontFamily: 'InterRegular' }}
          />
          {busca.length > 0 ? (
            <Pressable onPress={() => setBusca('')} className="h-8 w-8 items-center justify-center">
              <Ionicons name="close-circle" size={18} color="#94A3B8" />
            </Pressable>
          ) : null}
        </View>

        <View className="mb-2 ml-1 mt-3 flex-row items-center">
          <Ionicons name="swap-horizontal-outline" size={13} color="#64748B" />
          <AppText family="inter" variant="caption" className="ml-1.5 text-slate-500">
            Tipo
          </AppText>
        </View>

        <View className="mt-2 flex-row rounded-[18px] bg-slate-950/40 p-1">

          {(['todas', 'receita', 'despesa'] as const).map((opcao) => {
            const ativo = filtro === opcao;
            const titulo = opcao === 'todas' ? 'Todas' : opcao === 'receita' ? 'Receitas' : 'Despesas';

            return (
              <Pressable
                key={opcao}
                onPress={() => handleMudarFiltro(opcao)}
                accessibilityRole="button"
                accessibilityLabel={`Filtrar por ${titulo}`}
                accessibilityState={{ selected: ativo }}
                className={
                  ativo
                    ? 'h-10 flex-1 items-center justify-center rounded-[14px] bg-emerald-400'
                    : 'h-10 flex-1 items-center justify-center rounded-[14px] bg-transparent'
                }
                style={({ pressed }) => [{ opacity: pressed ? 0.72 : 1 }]}
              >
                <AppText
                  family="inter"
                  weight={ativo ? 'bold' : 'regular'}
                  className={
                    ativo
                      ? 'text-[13px] leading-[18px] text-slate-950'
                      : 'text-[13px] leading-[18px] text-slate-400'

                  }
                >
                  {titulo}
                </AppText>
              </Pressable>
            );
          })}
        </View>

        <View className="mb-2 ml-1 mt-3 flex-row items-center">
          <Ionicons name="calendar-outline" size={13} color="#64748B" />
          <AppText family="inter" variant="caption" className="ml-1.5 text-slate-500">
            Período
          </AppText>
        </View>

        <View className="flex-row rounded-[18px] bg-slate-950/40 p-1">
          {(['currentMonth', 'previousMonth', 'all'] as const).map((option) => {
            const active = periodFilter === option;

            return (
              <Pressable
                key={option}
                onPress={() => setPeriodFilter(option)}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                className={
                  active
                    ? 'h-10 flex-1 items-center justify-center rounded-[14px] bg-white/10'
                    : 'h-10 flex-1 items-center justify-center rounded-[14px] bg-transparent'
                }
              >
                <AppText
                  family="inter"
                  weight={active ? 'bold' : 'regular'}
                  className={
                    active
                      ? 'text-[13px] leading-[18px] text-white'
                      : 'text-[13px] leading-[18px] text-slate-500'
                  }
                >
                  {periodLabels[option]}
                </AppText>
              </Pressable>
            );
          })}
        </View>
      </SurfaceCard>

      {hasActiveFilter ? (
        <SurfaceCard variant="night" className="mb-3 rounded-[22px] px-3 py-3">
          <View className="flex-row">
            <FilterSummaryMetric
              label="Entradas"
              value={formatarMoeda(resumoFiltrado.receitas)}
              tone="income"
            />

            <View className="mx-1.5 h-9 w-px bg-white/10" />

            <FilterSummaryMetric
              label="Saídas"
              value={formatarMoeda(resumoFiltrado.despesas)}
              tone="expense"
            />

            <View className="mx-1.5 h-9 w-px bg-white/10" />


            <FilterSummaryMetric
              label="Saldo"
              value={formatarMoeda(resumoFiltrado.saldo)}
              tone="neutral"
            />
          </View>
        </SurfaceCard>
      ) : null}

      <View className="mb-2 flex-row items-center justify-between px-1">
        <AppText family="inter" variant="caption" className="text-slate-500">
          {transacoesFiltradas.length === 1
            ? '1 lançamento encontrado'
            : `${transacoesFiltradas.length} lançamentos encontrados`}
        </AppText>

        {hasActiveFilter ? (
          <AppText family="inter" variant="caption" className="text-slate-500">
            Filtros ativos
          </AppText>
        ) : null}
      </View>

      {erro ? (
        <SurfaceCard variant="nightDanger" className="mb-3 rounded-[20px] px-4 py-3">
          <AppText variant="caption" className="text-rose-200">
            {erro}
          </AppText>
        </SurfaceCard>
      ) : null}
    </View>
  );
  const renderLinha = useCallback(
    ({ item }: { item: LinhaExtrato }) => {
      if (item.tipo === 'secao') {
        return (
          <View className="mb-2 mt-5 flex-row items-center px-1">
            <AppText
              family="inter"
              weight="bold"
              className="text-[13px] uppercase leading-[18px] text-slate-500"
            >
              {item.titulo}
            </AppText>

            <View className="ml-3 h-px flex-1 bg-white/10" />
          </View>
        );
      }

      return (
        <Pressable
          onPress={() => setTransacaoSelecionada(item.transacao)}
          style={({ pressed }) => [
            {
              opacity: pressed ? 0.82 : 1,
              transform: [{ scale: pressed ? 0.995 : 1 }],
            },
          ]}
        >
          <TransactionRow
            density="compact"
            variant="dark"
            item={item.transacao}
            className="mb-1.5 rounded-[16px] border border-white/10 bg-white/[0.035]"
          />
        </Pressable>
      );
    },
    []
  );

  if (!fontsLoaded || !authResolvida || !userId || carregando) {
    return <LoadingScreen />;
  }


  return (
    <AppScreen edges={['top', 'left', 'right']}>

      <FlatList
        data={erro ? [] : linhasExtrato}
        renderItem={renderLinha}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: bottomPadding }}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={
          !erro ? (
            <SurfaceCard variant="nightSoft" className="mt-8 items-center rounded-[24px] border-dashed px-5 py-10">
              <Ionicons name="wallet-outline" size={30} color="#94A3B8" />
              <AppText variant="subtitle" weight="bold" className="mt-2 text-white">
                {hasActiveFilter ? 'Nenhum resultado encontrado' : 'Nenhuma transação encontrada'}
              </AppText>
              <AppText variant="caption" className="mt-1 text-center text-slate-400">
                {hasActiveFilter
                  ? 'Ajuste a busca ou altere o filtro para ver outros lançamentos.'
                  : 'Adicione uma nova transação para iniciar seu histórico financeiro.'}
              </AppText>
            </SurfaceCard>
          ) : null
        }
        initialNumToRender={8}
        maxToRenderPerBatch={8}
        windowSize={5}
        removeClippedSubviews
      />

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
