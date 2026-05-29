import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { AppText } from '@/components/ui/app-text';
import { SurfaceCard } from '@/components/ui/surface-card';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { useAppFonts } from '@/hooks/use-app-fonts';
import { useAuthenticatedTransactions } from '@/hooks/use-authenticated-transactions';
import { TransactionRow } from '@/components/transactions/transaction-row';
import { calcularResumoFinanceiro, formatarMoeda } from '@/utils/finance';
import { ImageBackground } from 'react-native';
import { Asset } from 'expo-asset';
import { auth } from '@/config/firebase';
import { excluirTransacaoDoUsuario, type TransacaoFinanceira } from '@/services/transactions';
import { TransactionSheet } from '@/components/transactions/transactionSheet';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

const fundoApp = require('../../assets/fundo_login.webp');

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

export default function Home() {
  const [fontsLoaded] = useAppFonts();
  const { authResolvida, carregando, erro, transacoes, userId } = useAuthenticatedTransactions();
  const [carregouImagem, setCarregouImagem] = useState(false);
  const [transacaoSelecionada, setTransacaoSelecionada] = useState<TransacaoFinanceira | null>(null);

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


  const resumo = useMemo(() => calcularResumoFinanceiro(transacoes), [transacoes]);
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
    <ImageBackground source={fundoApp} className="flex-1" resizeMode="cover">
      <View className="absolute inset-0 bg-slate-950/85" />
      <SafeAreaView className="flex-1">
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
                    {nome.slice(0, 1).toUpperCase()}
                  </AppText>
                </Pressable>
              </View>
            </View>

            <SurfaceCard
              variant="wallet"
              className="mb-5 overflow-hidden rounded-[28px] px-5 pb-5 pt-5"
            >
              <View className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-emerald-400/10" />
              <View className="absolute -bottom-12 -left-8 h-36 w-36 rounded-full bg-teal-300/5" />

              <View className="flex-row items-center justify-between">
                <AppText weight="regular" family="inter" variant="caption" className="text-slate-300">
                  Saldo disponível
                </AppText>

                <Ionicons name="eye-off-outline" size={16} color="#CBD5E1" />
              </View>

              <AppText
                family="inter"
                weight="bold"
                variant="display"
                className="mt-2 text-[34px] leading-[40px] text-white"
              >
                {formatarMoeda(resumo.saldo)}
              </AppText>
              

              <View className="mt-5 flex-row">
                <BalanceMetric
                  label="Entradas"
                  value={formatarMoeda(resumo.receitas)}
                  tone="income"
                />

                <View className="w-2" />

                <BalanceMetric
                  label="Saídas"
                  value={formatarMoeda(resumo.despesas)}
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
        <TransactionSheet
          visible={!!transacaoSelecionada}
          transaction={transacaoSelecionada}
          onClose={() => setTransacaoSelecionada(null)}
          onDelete={handleExcluirTransacao}
          onEdit={handleEditarTransacao}
        />
      </SafeAreaView>
    </ImageBackground>
  );
}

