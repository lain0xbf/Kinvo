import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { sairDaConta } from '@/services/auth';
import { AppText } from '@/components/ui/app-text';
import { SurfaceCard } from '@/components/ui/surface-card';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { useAppFonts } from '@/hooks/use-app-fonts';
import { useAuthenticatedTransactions } from '@/hooks/use-authenticated-transactions';
import { TransactionRow } from '@/components/transactions/transaction-row';
import { calcularResumoFinanceiro, formatarMoeda } from '@/utils/finance';
import { ImageBackground } from 'react-native';
import { Asset } from 'expo-asset';
import { LinearGradient } from 'expo-linear-gradient';
import { auth } from '@/config/firebase';
import { TransacaoFinanceira } from '@/services/transactions';
import { TransactionSheet } from '@/components/transactions/transactionSheet';

const fundo = require('../../assets/fundo_card.png');
const fundo2 = require('../../assets/button.png');

export default function Home() {
  console.log("Home renderizou");
  const [saindo, setSaindo] = useState(false);
  const [fontsLoaded] = useAppFonts();
  const { authResolvida, carregando, erro, transacoes, userId } = useAuthenticatedTransactions();
  const [carregouImagem, setCarregouImagem] = useState(false);
  const [transacaoSelecionada, setTransacaoSelecionada] = useState<TransacaoFinanceira | null>(null);


  const user = auth.currentUser;
  const nome = user?.displayName?.trim() || user?.email?.split('@')[0] || 'Usuario';

  useEffect(() => {
    async function carregarFundo() {
      await (Asset.fromModule(fundo).downloadAsync(), Asset.fromModule(fundo2).downloadAsync());
      setCarregouImagem(true);
    }

    carregarFundo();
  }, []);

  const handleSair = useCallback(async () => {
    setSaindo(true);
    try {
      await sairDaConta();
      router.replace('/login');
    } finally {
      setSaindo(false);
    }
  }
    , []);

  const resumo = useMemo(() => calcularResumoFinanceiro(transacoes), [transacoes]);
  /*   const ultimaMovimentacao = useMemo(() => obterUltimaTransacao(transacoes), [transacoes]);
   */
  const movimentacoesRecentes = useMemo(() => {
    return [...transacoes]
      .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
      .slice(0, 5);
  }, [transacoes]);

  /*   const saldoPositivo = resumo.saldo >= 0; */

  if (!fontsLoaded || !authResolvida || !userId || carregando || !carregouImagem) {
    return <LoadingScreen />;
  }

  return (
    <SafeAreaView className="flex-1 bg-[#F5F7FA]">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 96 }}>
        <View className="pb-4 pt-5">
          <View className="mb-5 flex-row items-start justify-between">
            <View className="flex-1 pr-4">
              <AppText family="sofia" weight="bold" className="text-[14px] leading-[20px] text-emerald-600">
                Olá, {nome}
              </AppText>

              <AppText family="sofia" weight="bold" className="mt-1 text-[26px] leading-[32px] text-slate-950">
                Sua carteira
              </AppText>
            </View>

            <View className="pt-1">
              <Pressable
                onPress={handleSair}
                disabled={saindo}
                accessibilityRole="button"
                accessibilityLabel="Sair da conta"
                hitSlop={8}
                className="h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white"
                style={({ pressed }) => [
                  { opacity: saindo ? 0.6 : pressed ? 0.78 : 1 },
                  { transform: [{ scale: pressed ? 0.97 : 1 }] },
                ]}
              >
                {saindo ? (
                  <ActivityIndicator size="small" color="#334155" />
                ) : (
                  <Ionicons name="log-out-outline" size={18} color="#334155" />
                )}
              </Pressable>
            </View>
          </View>

          <SurfaceCard
            className="mb-5 overflow-hidden rounded-[28px] border border-cyan-300/40 bg-transparent p-0"
            style={{
              shadowColor: '#0891B2',
              shadowOffset: { width: 0, height: 12 },
              shadowOpacity: 0.2,
              shadowRadius: 20,
              elevation: 10,
            }}>
            <ImageBackground
              source={fundo}
              resizeMode="cover"
              className="overflow-hidden rounded-[28px] px-4 pb-5 pt-5"
              imageStyle={{ borderRadius: 28 }}>
              <View className="absolute inset-0 bg-slate-950/25" />

              <View className="flex-row items-center">
                <AppText className="text-[12px] text-slate-300">Saldo disponível</AppText>
                <Ionicons name="eye-off-outline" size={16} color="#CBD5E1" style={{ marginLeft: 6 }} />
              </View>

              <AppText family='inter' weight='bold' className="mt-2 text-[30px] leading-[35px] text-white">
                {formatarMoeda(resumo.saldo)}
              </AppText>


              <View className="mt-2.5 self-start overflow-hidden rounded-full border border-emerald-300/10">
                <LinearGradient
                  colors={['rgba(45,212,191,0.18)', 'rgba(16,185,129,0.10)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{ paddingHorizontal: 10, paddingVertical: 2 }}
                >
                  <AppText
                    family="inter"
                    weight="regular"
                    className="text-[10px] leading-[14px] text-emerald-200/90"
                  >
                    ▲ 12,5% vs mês anterior
                  </AppText>
                </LinearGradient>
              </View>
              <View className="my-4 h-px bg-white/15" />

              <View className="flex-row items-center">
                <View className="flex-1">
                  <AppText className="text-[11px] text-slate-300">Entradas</AppText>

                  <AppText family="inter" weight="bold" className="mt-1 text-[16px] text-emerald-300">
                    {formatarMoeda(resumo.receitas)}
                  </AppText>
                </View>

                <View className="mx-2.5 h-9 w-px bg-white/15" />

                <View className="flex-1">
                  <AppText className="text-[11px] text-slate-300">Saídas</AppText>
                  <AppText family="inter" weight="bold" className="mt-1 text-[16px] text-rose-300">
                    {formatarMoeda(resumo.despesas)}
                  </AppText>
                </View>
              </View>
            </ImageBackground>
          </SurfaceCard>

          <Pressable
            onPress={() => router.push('/nova-despesa')}
            className="mb-6 mt-2 overflow-hidden rounded-[24px]">
            {({ pressed }) => (
              <ImageBackground
                source={fundo2}
                resizeMode="cover"
                className="h-[66px] flex-row items-center rounded-[24px] px-4"
                imageStyle={{
                  borderRadius: 24,
                  transform: [{ scale: pressed ? 1.08 : 1.12 }],
                }}>
                <View className={`absolute inset-0 ${pressed ? 'bg-black/20' : 'bg-black/5'}`} />

                <View className="h-10 w-10 items-center justify-center rounded-[14px] bg-white">
                  <Ionicons name="add" size={24} color="#10B981" />
                </View>

                <View className="ml-3 flex-1">
                  <AppText weight="bold" className="text-[17px] text-white">
                    Nova transação
                  </AppText>

                  <AppText className="mt-0.5 text-[12px] text-white/75">
                    Adicionar receita ou despesa
                  </AppText>
                </View>

                <Ionicons name="chevron-forward" size={20} color="#FFFFFFCC" />
              </ImageBackground>
            )}
          </Pressable>

          <View className="mb-3 mt-2 flex-row items-center justify-between px-1">
            <AppText weight="bold" className="text-[17px] text-slate-900">
              Atividade recente
            </AppText>

            <Pressable
              hitSlop={8}
              className="rounded-full px-2.5 py-1"
              style={({ pressed }) => [{ opacity: pressed ? 0.72 : 1 }]}
            >
              <View className="flex-row items-center">
                <AppText weight="bold" className="text-[13px] text-emerald-600">
                  Ver todas
                </AppText>
                <Ionicons name="chevron-forward" size={14} color="#059669" style={{ marginLeft: 2 }} />
              </View>
            </Pressable>
          </View>

          <SurfaceCard className="overflow-hidden rounded-[24px] border border-slate-100 bg-white p-0">
            {movimentacoesRecentes.map((item, index) => (
              <Pressable key={item.id} onPress={() => setTransacaoSelecionada(item)}>
                <TransactionRow
                  item={item}
                  className={
                    index !== movimentacoesRecentes.length - 1 ? 'border-b border-slate-100' : ''
                  }
                />
              </Pressable>
            ))}
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
      <TransactionSheet
        visible={!!transacaoSelecionada}
        transaction={transacaoSelecionada}
        onClose={() => setTransacaoSelecionada(null)}
      />
    </SafeAreaView>
  );
}
