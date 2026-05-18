import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import { router } from 'expo-router';
import { escutarTransacoes, type TransacaoFinanceira, type TipoTransacao } from '@/services/transactions';
import { escutarUsuarioAutenticado, sairDaConta } from '@/services/auth';

type Filtro = 'todas' | TipoTransacao;

function formatarMoeda(valor: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor);
}

function ItemTransacao({ item }: { item: TransacaoFinanceira }) {
  const corTipo = item.tipo === 'receita' ? 'text-emerald-700' : 'text-rose-700';
  const textoTipo = item.tipo === 'receita' ? 'Receita' : 'Despesa';
  const dataFormatada = new Date(item.data).toLocaleDateString('pt-BR');

  return (
    <View className="mb-3 rounded-2xl border border-slate-200 bg-white px-4 py-4">
      <View className="flex-row items-center justify-between">
        <Text className="mr-3 flex-1 text-[16px] text-slate-900" style={{ fontFamily: 'SofiaProBold' }}>
          {item.descricao}
        </Text>
        <Text className={`text-[13px] ${corTipo}`} style={{ fontFamily: 'SofiaProBold' }}>
          {textoTipo}
        </Text>
      </View>

      <View className="mt-1 flex-row items-center justify-between">
        <Text className="text-[13px] text-slate-500" style={{ fontFamily: 'SofiaProRegular' }}>
          {item.categoria} • {dataFormatada}
        </Text>
        <Text className="text-[16px] text-slate-900" style={{ fontFamily: 'SofiaProBold' }}>
          {formatarMoeda(item.valor)}
        </Text>
      </View>
    </View>
  );
}

export default function Home() {
  const [transacoes, setTransacoes] = useState<TransacaoFinanceira[]>([]);
  const [filtro, setFiltro] = useState<Filtro>('todas');
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [saindo, setSaindo] = useState(false);
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
        setErro('Não foi possível carregar as transações.');
        setCarregando(false);
      }
    );

    return () => cancelar();
  }, [userId]);

  async function handleSair() {
    setSaindo(true);
    try {
      await sairDaConta();
      router.replace('/login');
    } finally {
      setSaindo(false);
    }
  }

  const transacoesFiltradas = useMemo(() => {
    if (filtro === 'todas') return transacoes;
    return transacoes.filter((item) => item.tipo === filtro);
  }, [transacoes, filtro]);

  const saldo = useMemo(() => {
    return transacoes.reduce((acumulador, item) => {
      if (item.tipo === 'receita') return acumulador + item.valor;
      return acumulador - item.valor;
    }, 0);
  }, [transacoes]);

  const renderItem = useCallback(({ item }: { item: TransacaoFinanceira }) => {
    return <ItemTransacao item={item} />;
  }, []);

  if (!fontsLoaded || carregando) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-100 px-6">
        <ActivityIndicator size="large" color="#334155" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-100" edges={['top', 'left', 'right']}>
      <View className="flex-1 px-4 pb-4 pt-3">
        <View className="mb-4 rounded-2xl border border-slate-200 bg-white px-4 py-4">
          <View className="flex-row items-start justify-between">
            <View className="mr-3 flex-1">
              <Text className="text-[12px] uppercase tracking-[0.8px] text-slate-500" style={{ fontFamily: 'SofiaProRegular' }}>
                Controle financeiro
              </Text>
              <Text
                className="mt-1 text-[27px] leading-[32px] tracking-[-0.2px] text-slate-900"
                style={{ fontFamily: 'SofiaProBold' }}
              >
                Saldo: {formatarMoeda(saldo)}
              </Text>
            </View>

            <Pressable
              onPress={handleSair}
              disabled={saindo}
              className="h-10 min-w-[72px] items-center justify-center rounded-xl border border-slate-300 bg-slate-50 px-3"
            >
              <Text className="text-[12px] text-slate-700" style={{ fontFamily: 'SofiaProBold' }}>
                {saindo ? 'Saindo...' : 'Sair'}
              </Text>
            </Pressable>
          </View>
        </View>

        <Pressable
          onPress={() => router.push('/nova-despesa')}
          className="mb-3 h-12 items-center justify-center rounded-2xl bg-slate-900"
        >
          <Text className="text-white" style={{ fontFamily: 'SofiaProBold' }}>
            Nova transação
          </Text>
        </Pressable>

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
                    ? 'h-11 flex-1 items-center justify-center rounded-xl border border-slate-300 bg-white px-4'
                    : 'h-11 flex-1 items-center justify-center rounded-xl px-4'
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
          <View className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3">
            <Text className="text-rose-700" style={{ fontFamily: 'SofiaProRegular' }}>
              {erro}
            </Text>
          </View>
        ) : (
          <FlatList
            data={transacoesFiltradas}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 56 }}
            initialNumToRender={8}
            maxToRenderPerBatch={8}
            windowSize={5}
            removeClippedSubviews
          />
        )}
      </View>
    </SafeAreaView>
  );
}
