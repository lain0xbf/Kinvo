import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
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
import { ImageBackground } from 'react-native';
import { Asset } from 'expo-asset';

const fundo = require('../../assets/fundo_card.png');
const fundo2 = require('../../assets/button.png');

export default function Home() {
  const [saindo, setSaindo] = useState(false);
  const [fontsLoaded] = useAppFonts();
  const { authResolvida, carregando, erro, transacoes, userId } = useAuthenticatedTransactions();
  const [carregouImagem, setCarregouImagem] = useState(false);

  useEffect(() => {
    async function carregarFundo() {
      await Asset.fromModule(fundo && fundo2).downloadAsync();
      setCarregouImagem(true);
    }

    carregarFundo();
  }, []);
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
/*   const ultimaMovimentacao = useMemo(() => obterUltimaTransacao(transacoes), [transacoes]);
 */
  const movimentacoesRecentes = useMemo(() => {
    return [...transacoes]
      .sort(
        (a, b) =>
          new Date(b.data).getTime() -
          new Date(a.data).getTime()
      )
      .slice(0, 5);
  }, [transacoes]);

/*   const saldoPositivo = resumo.saldo >= 0; */

  if (!fontsLoaded || !authResolvida || !userId || carregando || !carregouImagem) {
    return <LoadingScreen />;
  }

  return (
    <SafeAreaView className="flex-1 bg-[#F5F7FA]">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 96 }}>
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

          <SurfaceCard
            className="mb-5 overflow-hidden rounded-[28px] border border-white/70 bg-white p-0 shadow-[0_12px_40px_rgba(16,185,129,0.12)]"
          >
            <ImageBackground
              source={require('../../assets/fundo_card.png')}
              resizeMode="stretch"
              className="w-full overflow-hidden rounded-[28px] px-6 pt-6 pb-5"
              imageStyle={{ borderRadius: 28 }}
            >

              <View className="absolute inset-0 bg-white/5" />
              <View className="flex-row items-start justify-between">
                <View className="flex-1">
                  <AppText className="
    text-[15px]
    text-zinc-500
  ">
                    Saldo disponível
                  </AppText>

                  <AppText
                    weight="bold"
                    className="mt-2 text-[42px] leading-[46px] tracking-[-1px] text-zinc-900"
                  >
                    {formatarMoeda(resumo.saldo)}
                  </AppText>

                  <View className="mt-3 self-start rounded-full border border-emerald-200 bg-emerald-50/80 px-3.5 py-1.5">
                    <AppText weight="bold" className="text-[15px] text-emerald-600">
                      ▲ 12,5% vs mês anterior
                    </AppText>
                  </View>
                </View>
              </View>

              <View className="my-5 h-px bg-zinc-200/70" />
              <View className="flex-row items-center">
                <View className="flex-1">
                  <AppText className="text-[14px] text-zinc-500">
                    Entradas
                  </AppText>

                  <AppText weight="bold" className="mt-1 text-[20px] text-emerald-700">
                    {formatarMoeda(resumo.receitas)}
                  </AppText>
                </View>

                <View className="mx-4 h-12 w-px bg-zinc-200/70" />

                <View className="flex-1">
                  <AppText className="text-[14px] text-zinc-500">
                    Saídas
                  </AppText>

                  <AppText weight="bold" className="mt-1 text-[20px] text-rose-500">
                    {formatarMoeda(resumo.despesas)}
                  </AppText>
                </View>
              </View>
            </ImageBackground>
          </SurfaceCard>

          <Pressable
            onPress={() => router.push('/nova-despesa')}
            className="mb-6 mt-2 overflow-hidden rounded-[24px]"
          >
            <ImageBackground
              source={fundo2}
              resizeMode="cover"
              className="h-[70px] flex-row items-center rounded-[24px] px-4"
              imageStyle={{
                borderRadius: 24,
                transform: [{ scale: 1.12 }],
              }}
            >
              <View className="absolute inset-0 bg-black/5" />

              <View className="h-12 w-12 items-center justify-center rounded-[16px] bg-white">
                <Ionicons name="add" size={24} color="#10B981" />
              </View>

              <View className="ml-4 flex-1">
                <AppText
                  weight="bold"
                  className="text-[18px] text-white"
                >
                  Nova transação
                </AppText>

                <AppText className="mt-0.5 text-[12px] text-white/75">
                  Adicionar receita ou despesa
                </AppText>
              </View>

              <Ionicons
                name="chevron-forward"
                size={24}
                color="#FFFFFF"
              />
            </ImageBackground>
          </Pressable>

          <View className="mb-4 mt-1 px-1 flex-row items-center justify-between">
            <AppText weight="bold" className="text-[18px] text-slate-900">
              Atividade recente
            </AppText>

            <Pressable>
              <AppText weight="bold" className="text-[14px] text-emerald-600">
                Ver todas
              </AppText>
            </Pressable>
          </View>

          <SurfaceCard className="overflow-hidden rounded-[24px] border border-slate-100 bg-white p-0">
            {movimentacoesRecentes.map((item, index) => (
              <TransactionRow
                key={item.id}
                item={item}
                className={
                  index !== movimentacoesRecentes.length - 1
                    ? 'border-b border-slate-100'
                    : ''
                }
              />
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
    </SafeAreaView>
  );
}
