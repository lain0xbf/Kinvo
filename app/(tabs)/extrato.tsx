import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { escutarTransacoes, type TipoTransacao, type TransacaoFinanceira } from '@/services/transactions';
import { escutarUsuarioAutenticado } from '@/services/auth';

type Filtro = 'todas' | TipoTransacao;

function formatarMoeda(valor: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor);
}

function ItemTransacao({ item }: { item: TransacaoFinanceira }) {
  const ehReceita = item.tipo === 'receita';
  const dataFormatada = new Date(item.data).toLocaleDateString('pt-BR');
  const icone = ehReceita ? 'arrow-down-outline' : 'arrow-up-outline';
  const corFundoIcone = ehReceita ? 'bg-emerald-100' : 'bg-rose-100';
  const corIcone = ehReceita ? '#047857' : '#BE123C';
  const sinal = ehReceita ? '+' : '-';
  const corValor = ehReceita ? 'text-emerald-700' : 'text-rose-700';

  return (
    <View className="mb-3 flex-row items-center rounded-2xl border border-slate-200 bg-white px-4 py-3">
      <View className={`mr-3 h-11 w-11 items-center justify-center rounded-xl ${corFundoIcone}`}>
        <Ionicons name={icone} size={18} color={corIcone} />
      </View>

      <View className="flex-1">
        <Text className="text-[15px] text-slate-900" style={{ fontFamily: 'SofiaProBold' }} numberOfLines={1}>
          {item.descricao}
        </Text>
        <Text className="mt-0.5 text-[12px] text-slate-500" style={{ fontFamily: 'SofiaProRegular' }}>
          {item.categoria} - {dataFormatada}
        </Text>
      </View>

      <Text className={`ml-3 text-[15px] ${corValor}`} style={{ fontFamily: 'SofiaProBold' }}>
        {sinal} {formatarMoeda(item.valor)}
      </Text>
    </View>
  );
}

export default function Extrato() {
  const [transacoes, setTransacoes] = useState<TransacaoFinanceira[]>([]);
  const [filtro, setFiltro] = useState<Filtro>('todas');
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [fontsLoaded] = useFonts({
    SofiaProBold: require('../../assets/fonts/SofiaProBold.otf'),
    SofiaProRegular: require('../../assets/fonts/SofiaProRegular.otf'),
  });

  useEffect(() => {
    const cancelarAuth = escutarUsuarioAutenticado((usuario) => {
      if (!usuario) {
        router.replace('/login');
        return;
      }
      setUserId(usuario.uid);
    });

    return () => cancelarAuth();
  }, []);

  useEffect(() => {
    if (!userId) return;

    setCarregando(true);
    setErro(null);

    const cancelar = escutarTransacoes(
      userId,
      (lista) => {
        setTransacoes(lista);
        setCarregando(false);
      },
      () => {
        setErro('Nao foi possivel carregar as transacoes.');
        setCarregando(false);
      }
    );

    return () => cancelar();
  }, [userId]);

  const transacoesFiltradas = useMemo(() => {
    if (filtro === 'todas') return transacoes;
    return transacoes.filter((item) => item.tipo === filtro);
  }, [transacoes, filtro]);

  const renderItem = useCallback(({ item }: { item: TransacaoFinanceira }) => <ItemTransacao item={item} />, []);

  if (!fontsLoaded || carregando) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-100 px-6">
        <ActivityIndicator size="large" color="#334155" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-100" edges={['top', 'left', 'right']}>
      <FlatList
        data={erro ? [] : transacoesFiltradas}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 56, flexGrow: 1 }}
        ListHeaderComponent={
          <View>
            <Text className="text-[12px] uppercase tracking-[0.9px] text-slate-500" style={{ fontFamily: 'SofiaProRegular' }}>
              Extrato
            </Text>
            <Text className="mb-4 mt-1 text-[24px] text-slate-900" style={{ fontFamily: 'SofiaProBold' }}>
              Movimentacoes
            </Text>

            <View className="mb-3 flex-row rounded-2xl border border-slate-200 bg-slate-50 p-1.5">
              {(['todas', 'receita', 'despesa'] as const).map((opcao) => {
                const ativo = filtro === opcao;
                const titulo = opcao === 'todas' ? 'Todas' : opcao === 'receita' ? 'Receitas' : 'Despesas';

                return (
                  <Pressable
                    key={opcao}
                    onPress={() => setFiltro(opcao)}
                    className={
                      ativo
                        ? 'h-11 flex-1 items-center justify-center rounded-xl border border-slate-300 bg-white'
                        : 'h-11 flex-1 items-center justify-center rounded-xl'
                    }
                  >
                    <Text
                      className={ativo ? 'text-[13px] text-slate-900' : 'text-[13px] text-slate-500'}
                      style={{ fontFamily: ativo ? 'SofiaProBold' : 'SofiaProRegular' }}
                    >
                      {titulo}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {erro ? (
              <View className="mb-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3">
                <Text className="text-rose-700" style={{ fontFamily: 'SofiaProRegular' }}>
                  {erro}
                </Text>
              </View>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          !erro ? (
            <View className="mt-8 items-center rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-10">
              <Ionicons name="wallet-outline" size={30} color="#64748B" />
              <Text className="mt-2 text-[16px] text-slate-800" style={{ fontFamily: 'SofiaProBold' }}>
                Nenhuma transacao encontrada
              </Text>
              <Text className="mt-1 text-center text-[13px] text-slate-500" style={{ fontFamily: 'SofiaProRegular' }}>
                Adicione uma nova transacao para iniciar seu historico financeiro.
              </Text>
            </View>
          ) : null
        }
        initialNumToRender={8}
        maxToRenderPerBatch={8}
        windowSize={5}
        removeClippedSubviews
      />
    </SafeAreaView>
  );
}
