import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { escutarTransacoes, type TransacaoFinanceira } from '@/services/transactions';
import { escutarUsuarioAutenticado, sairDaConta } from '@/services/auth';

function formatarMoeda(valor: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor);
}

export default function Home() {
  const [transacoes, setTransacoes] = useState<TransacaoFinanceira[]>([]);
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
        setErro('Nao foi possivel carregar as transacoes.');
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

  const resumo = useMemo(() => {
    return transacoes.reduce(
      (acumulador, item) => {
        if (item.tipo === 'receita') {
          acumulador.receitas += item.valor;
          acumulador.saldo += item.valor;
        } else {
          acumulador.despesas += item.valor;
          acumulador.saldo -= item.valor;
        }
        return acumulador;
      },
      { saldo: 0, receitas: 0, despesas: 0 }
    );
  }, [transacoes]);

  if (!fontsLoaded || carregando) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-100 px-6">
        <ActivityIndicator size="large" color="#334155" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-100" edges={['top', 'left', 'right']}>
      <View className="flex-1 px-4 pb-6 pt-3">
        <View className="mb-4 flex-row items-center justify-between">
          <View>
            <Text className="text-[12px] uppercase tracking-[0.9px] text-slate-500" style={{ fontFamily: 'SofiaProRegular' }}>
              Minha conta
            </Text>
            <Text className="mt-1 text-[24px] text-slate-900" style={{ fontFamily: 'SofiaProBold' }}>
              Controle financeiro
            </Text>
          </View>

          <Pressable
            onPress={handleSair}
            disabled={saindo}
            className="h-11 min-w-[84px] items-center justify-center rounded-xl border border-slate-300 bg-white px-3"
          >
            <Text className="text-[12px] text-slate-700" style={{ fontFamily: 'SofiaProBold' }}>
              {saindo ? 'Saindo...' : 'Sair'}
            </Text>
          </Pressable>
        </View>

        <View className="mb-4 overflow-hidden rounded-3xl bg-slate-950 p-4">
          <View className="absolute right-[-28px] top-[-28px] h-24 w-24 rounded-full bg-slate-800 opacity-60" />
          <View className="absolute bottom-[-34px] left-[-24px] h-28 w-28 rounded-full bg-emerald-900 opacity-35" />

          <View className="flex-row items-center justify-between">
            <Text className="text-[12px] uppercase tracking-[1px] text-slate-300" style={{ fontFamily: 'SofiaProRegular' }}>
              Saldo disponivel
            </Text>
            <Ionicons name="card-outline" size={20} color="#CBD5E1" />
          </View>

          <Text className="mt-2 text-[31px] leading-[36px] text-white" style={{ fontFamily: 'SofiaProBold' }}>
            {formatarMoeda(resumo.saldo)}
          </Text>

          <Text className="mt-2 text-[12px] text-slate-300" style={{ fontFamily: 'SofiaProRegular' }}>
            Conta final 2034
          </Text>
        </View>

        <Pressable
          onPress={() => router.push('/nova-despesa')}
          className="mb-4 h-12 flex-row items-center justify-center rounded-2xl bg-slate-900"
        >
          <Ionicons name="add-circle-outline" size={18} color="#FFFFFF" />
          <Text className="ml-1.5 text-[14px] text-white" style={{ fontFamily: 'SofiaProBold' }}>
            Nova transacao
          </Text>
        </Pressable>

        <View className="mb-3 flex-row gap-3">
          <View className="flex-1 rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-3">
            <Text className="text-[11px] uppercase tracking-[0.8px] text-emerald-700" style={{ fontFamily: 'SofiaProRegular' }}>
              Entradas
            </Text>
            <Text className="mt-1 text-[16px] text-emerald-800" style={{ fontFamily: 'SofiaProBold' }}>
              {formatarMoeda(resumo.receitas)}
            </Text>
          </View>

          <View className="flex-1 rounded-2xl border border-rose-200 bg-rose-50 px-3 py-3">
            <Text className="text-[11px] uppercase tracking-[0.8px] text-rose-700" style={{ fontFamily: 'SofiaProRegular' }}>
              Saidas
            </Text>
            <Text className="mt-1 text-[16px] text-rose-800" style={{ fontFamily: 'SofiaProBold' }}>
              {formatarMoeda(resumo.despesas)}
            </Text>
          </View>
        </View>

        <View className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
          <View className="flex-row items-center">
            <View className="mr-3 h-11 w-11 items-center justify-center rounded-xl bg-slate-100">
              <Ionicons name="shield-checkmark-outline" size={20} color="#0F172A" />
            </View>
            <View className="flex-1">
              <Text className="text-[15px] text-slate-900" style={{ fontFamily: 'SofiaProBold' }}>
                Conta organizada
              </Text>
              <Text className="mt-0.5 text-[12px] text-slate-500" style={{ fontFamily: 'SofiaProRegular' }}>
                {transacoes.length} movimentacoes sincronizadas.
              </Text>
            </View>
          </View>
        </View>

        {erro ? (
          <View className="mt-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3">
            <Text className="text-rose-700" style={{ fontFamily: 'SofiaProRegular' }}>
              {erro}
            </Text>
          </View>
        ) : null}
      </View>
    </SafeAreaView>
  );
}
