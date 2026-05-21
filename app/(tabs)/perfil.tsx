import { useCallback, useMemo, useState } from 'react';
import { FlatList, Modal, Pressable, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { excluirTransacaoDoUsuario, type TipoTransacao, type TransacaoFinanceira } from '@/services/transactions';
import { AppText } from '@/components/ui/app-text';
import { SurfaceCard } from '@/components/ui/surface-card';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { useAppFonts } from '@/hooks/use-app-fonts';
import { useAuthenticatedTransactions } from '@/hooks/use-authenticated-transactions';
import { TransactionRow } from '@/components/transactions/transaction-row';
import { calcularResumoFinanceiro, formatarMoeda } from '@/utils/finance';
import { ActionButton } from '@/components/ui/action-button';

type Filtro = 'todas' | TipoTransacao;


export default function Extrato() {
  const [filtro, setFiltro] = useState<Filtro>('todas');
  const [fontsLoaded] = useAppFonts();
  const { authResolvida, carregando, erro, transacoes, userId } = useAuthenticatedTransactions();
  const [transacaoSelecionada, setTransacaoSelecionada] = useState<TransacaoFinanceira | null>(null);

  const transacoesFiltradas = useMemo(() => {
    if (filtro === 'todas') return transacoes;
    return transacoes.filter((item) => item.tipo === filtro);
  }, [transacoes, filtro]);

  async function handleExcluirTransacao() {
    if (!userId || !transacaoSelecionada) return;

    await excluirTransacaoDoUsuario(userId, transacaoSelecionada.id);
    setTransacaoSelecionada(null);
  }

  const handleMudarFiltro = useCallback((proximoFiltro: Filtro) => {
    setFiltro(proximoFiltro);
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: TransacaoFinanceira }) => (
      <Pressable onPress={() => setTransacaoSelecionada(item)}>
        <TransactionRow item={item} className="mb-3" />
      </Pressable>
    ),
    []
  );

  if (!fontsLoaded || !authResolvida || !userId || carregando) {
    return <LoadingScreen />;
  }

  return (
    <SafeAreaView className="flex-1 bg-[#F5F7FA]" edges={['top', 'left', 'right']}>
      <View className="px-4 pt-5">
        <View className="mb-4 flex-row items-end justify-between">
          <View className="flex-1 pr-4">
            <AppText variant="title" weight="bold" className="text-slate-950">
              Movimentações
            </AppText>
            <AppText variant="caption" className="mt-1 text-slate-500">
              Acompanhe suas entradas e saídas
            </AppText>
          </View>

          <View className="rounded-2xl border border-slate-200 bg-white px-3 py-2">
            <AppText variant="caption" weight="bold" className="text-slate-600">
              {transacoesFiltradas.length} itens
            </AppText>
          </View>
        </View>


        <View
          style={{
            marginBottom: 14,
            flexDirection: 'row',
            borderRadius: 18,
            borderWidth: 1,
            borderColor: '#E2E8F0',
            backgroundColor: '#FFFFFF',
            padding: 4,
          }}
        >
          {(['todas', 'receita', 'despesa'] as const).map((opcao) => {
            const ativo = filtro === opcao;
            const titulo = opcao === 'todas' ? 'Todas' : opcao === 'receita' ? 'Receitas' : 'Despesas';

            return (
              <TouchableOpacity
                key={opcao}
                onPress={() => handleMudarFiltro(opcao)}
                activeOpacity={0.82}
                style={{
                  height: 44,
                  flex: 1,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 14,
                  backgroundColor: ativo ? '#0F172A' : 'transparent',

                  shadowColor: ativo ? '#000' : 'transparent',
                  shadowOpacity: ativo ? 0.08 : 0,
                  shadowRadius: ativo ? 8 : 0,
                  shadowOffset: { width: 0, height: 2 },
                  elevation: ativo ? 2 : 0,
                }}
              >
                <Text
                  style={{
                    color: ativo ? '#FFFFFF' : '#64748B',
                    fontFamily: ativo ? 'SofiaProBold' : 'SofiaProRegular',
                    fontSize: 12,
                    lineHeight: 18,
                  }}
                >
                  {titulo}
                </Text>
              </TouchableOpacity>
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

      <FlatList
        data={erro ? [] : transacoesFiltradas}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 88, flexGrow: 1 }}
        ListEmptyComponent={
          !erro ? (
            <SurfaceCard className="mt-8 items-center rounded-[22px] border-dashed border-slate-300 px-5 py-10">
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
          backgroundColor: 'rgba(0,0,0,0.30)',
        }}>
          <SurfaceCard className="rounded-[28px] px-5 py-5">
            <View className="items-center">

              <AppText variant="title" weight="bold" className="mt-1 text-center text-slate-950">
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
