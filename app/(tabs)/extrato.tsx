import { useCallback, useMemo, useState } from 'react';
import { FlatList, Modal, Pressable, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { excluirTransacaoDoUsuario, type TipoTransacao, type TransacaoFinanceira } from '@/services/transactions';
import { AppText } from '@/components/ui/app-text';
import { SurfaceCard } from '@/components/ui/surface-card';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { useAppFonts } from '@/hooks/use-app-fonts';
import { useAuthenticatedTransactions } from '@/hooks/use-authenticated-transactions';
import { TransactionRow } from '@/components/transactions/transaction-row';
import { formatarMoeda } from '@/utils/finance';
import { ActionButton } from '@/components/ui/action-button';

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

export default function Extrato() {
  const [filtro, setFiltro] = useState<Filtro>('todas');
  const [fontsLoaded] = useAppFonts();
  const { authResolvida, carregando, erro, transacoes, userId } = useAuthenticatedTransactions();
  const [transacaoSelecionada, setTransacaoSelecionada] = useState<TransacaoFinanceira | null>(null);
  const [busca, setBusca] = useState('');

  function normalizar(valor: string) {
    return valor
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }

  const transacoesFiltradas = useMemo(() => {
    const base =
      filtro === 'todas'
        ? transacoes
        : transacoes.filter((item) => item.tipo === filtro);

    const termo = normalizar(busca);
    if (!termo) return base;

    return base.filter((item) => {
      const tipoLabel = item.tipo === 'receita' ? 'receita' : 'despesa';
      const alvo = normalizar(
        `${item.descricao} ${item.categoria ?? ''} ${tipoLabel}`
      );
      return alvo.includes(termo);
    });
  }, [transacoes, filtro, busca]);

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

  const handleMudarFiltro = useCallback((proximoFiltro: Filtro) => {
    setFiltro(proximoFiltro);
  }, []);


  const listHeader = (
    <View className="pt-5">
      <View className="mb-4 flex-row items-end justify-between">
        <View className="flex-1 pr-4">
          <AppText family="sofia" weight="bold" className="mt-1 text-[26px] leading-[32px] text-slate-950">
            Extrato
          </AppText>
        </View>
      </View>

      <View className="mb-4 flex-row items-center rounded-[16px] border border-slate-200 bg-white px-4">
        <Ionicons name="search-outline" size={18} color="#64748B" />
        <TextInput
          value={busca}
          onChangeText={setBusca}
          placeholder="Pesquisar..."
          placeholderTextColor="#94A3B8"
          autoCapitalize="none"
          autoCorrect={false}
          className="ml-2.5 flex-1 py-3 text-[14px] text-slate-900"
          style={{ fontFamily: 'InterRegular' }}
        />
        {busca.length > 0 ? (
          <Pressable onPress={() => setBusca('')} className="h-8 w-8 items-center justify-center">
            <Ionicons name="close-circle" size={18} color="#94A3B8" />
          </Pressable>
        ) : null}
      </View>

      <View className="mb-4 flex-row rounded-[22px] border border-slate-200 bg-white p-1.5">
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
                  ? 'h-12 flex-1 items-center justify-center rounded-2xl bg-emerald-50'
                  : 'h-12 flex-1 items-center justify-center rounded-2xl bg-transparent'
              }
              style={({ pressed }) => [{ opacity: pressed ? 0.72 : 1 }]}
            >
              <AppText
                family="inter"
                weight={ativo ? 'bold' : 'regular'}
                className={
                  ativo
                    ? 'text-[13px] leading-[18px] text-emerald-700'
                    : 'text-[13px] leading-[18px] text-slate-500'
                }
              >
                {titulo}
              </AppText>
            </Pressable>
          );
        })}
      </View>

      {erro ? (
        <SurfaceCard className="mb-3 rounded-[20px] border-rose-200 bg-rose-50 px-4 py-3">
          <AppText variant="caption" className="text-rose-700">
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
          <AppText family="sofia" weight="bold" className="mb-3 mt-4 text-[18px] text-slate-700">
            {item.titulo}
          </AppText>
        );
      }

      return (
        <Pressable onPress={() => setTransacaoSelecionada(item.transacao)}>
          <TransactionRow item={item.transacao} className="mb-2 rounded-[20px] border border-slate-100 bg-white" />
        </Pressable>
      );
    },
    []
  );

  if (!fontsLoaded || !authResolvida || !userId || carregando) {
    return <LoadingScreen />;
  }

  return (
    <SafeAreaView className="flex-1 bg-[#F5F7FA]" edges={['top', 'left', 'right']}>
      <FlatList
        data={erro ? [] : linhasExtrato}
        renderItem={renderLinha}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 96 }}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={
          !erro ? (
            <SurfaceCard className="mt-8 items-center rounded-[24px] border border-dashed border-slate-200 bg-white px-5 py-10">
              <Ionicons name="wallet-outline" size={30} color="#64748B" />
              <AppText variant="subtitle" weight="bold" className="mt-2 text-slate-800">
                Nenhuma transacao encontrada
              </AppText>
              <AppText variant="caption" className="mt-1 text-center text-slate-500">
                Adicione uma nova transacao para iniciar seu historico financeiro.
              </AppText>
            </SurfaceCard>
          ) : null
        }
        initialNumToRender={8}
        maxToRenderPerBatch={8}
        windowSize={5}
        removeClippedSubviews
      />

      <Modal
        visible={!!transacaoSelecionada}
        transparent
        animationType="fade"
        onRequestClose={() => setTransacaoSelecionada(null)}
      >
        <View style={{
          flex: 1,
          justifyContent: 'center',
          paddingHorizontal: 20,
          backgroundColor: 'rgba(15,23,42,0.42)',

        }}>
          <SurfaceCard className="rounded-[28px] px-5 py-5">
            <View className="items-center">

              <AppText family="sofia" variant="title" weight="bold" className="mt-1 text-center text-slate-950">

                {transacaoSelecionada?.descricao}
              </AppText>

              <AppText
                variant="display"
                weight="bold"
                className={
                  transacaoSelecionada?.tipo === 'receita'
                    ? 'mt-3 text-emerald-600'
                    : 'mt-3 text-rose-600'
                }
              >
                {transacaoSelecionada ? formatarMoeda(transacaoSelecionada.valor) : ''}
              </AppText>
            </View>

            <View className="mt-5 rounded-[20px] bg-slate-50 px-4 py-3">
              <View className="flex-row items-center justify-between">
                <AppText variant="caption" className="text-slate-500">
                  Tipo
                </AppText>
                <AppText variant="caption" weight="bold" className="text-slate-800">
                  {transacaoSelecionada?.tipo === 'receita' ? 'Receita' : 'Despesa'}
                </AppText>
              </View>

              <View className="mt-3 flex-row items-center justify-between">
                <AppText variant="caption" className="text-slate-500">
                  Categoria
                </AppText>
                <AppText variant="caption" weight="bold" className="text-slate-800">
                  {transacaoSelecionada?.categoria || 'Sem categoria'}
                </AppText>
              </View>
            </View>

            <ActionButton
              label="Excluir transação"
              icon={<Ionicons name="trash-outline" size={18} color="#FFFFFF" />}
              className="mt-5 bg-rose-600"
              onPress={() => {
                handleExcluirTransacao()
              }}
            />

            <ActionButton
              label="Fechar"
              variant="ghost"
              className="mt-2"
              onPress={() => setTransacaoSelecionada(null)}
            />
          </SurfaceCard>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
