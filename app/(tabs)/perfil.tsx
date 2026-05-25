import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { auth } from '@/config/firebase';
import { sairDaConta } from '@/services/auth';
import { AppText } from '@/components/ui/app-text';
import { SurfaceCard } from '@/components/ui/surface-card';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { useAppFonts } from '@/hooks/use-app-fonts';
import { useAuthenticatedTransactions } from '@/hooks/use-authenticated-transactions';
import { calcularResumoFinanceiro, formatarMoeda } from '@/utils/finance';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';


type MenuItemProps = {
  icon: keyof typeof Ionicons.glyphMap;
  titulo: string;
  descricao: string;
  onPress: () => void;
  destaque?: boolean;
};

function MenuItem({
  icon,
  titulo,
  descricao,
  onPress,
  destaque = false,
}: MenuItemProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={titulo}
      className="min-h-[56px] flex-row items-center rounded-[16px] px-4 py-3"
      style={({ pressed }) => [
        {
          opacity: pressed ? 0.74 : 1,
          backgroundColor: pressed ? '#F8FAFC' : '#FFFFFF',
        },
      ]}
    >
      <View
        className={
          destaque
            ? 'h-11 w-11 items-center justify-center rounded-full bg-rose-50'
            : 'h-11 w-11 items-center justify-center rounded-full bg-emerald-50'
        }
      >
        <Ionicons
          name={icon}
          size={20}
          color={destaque ? '#E11D48' : '#059669'}
        />
      </View>

      <View className="ml-3 flex-1">
        <AppText family="inter" weight="bold" className={destaque ? 'text-rose-700' : 'text-slate-900'}>
          {titulo}
        </AppText>
        <AppText family="inter" variant="subcaption" className="mt-0.5 text-slate-500">
          {descricao}
        </AppText>
      </View>

      <Ionicons
        name="chevron-forward"
        size={18}
        color={destaque ? '#FB7185' : '#94A3B8'}
      />
    </Pressable>
  );
}

export default function Perfil() {
  const [fontsLoaded] = useAppFonts();
  const [saindo, setSaindo] = useState(false);
  const { authResolvida, carregando, transacoes, userId } = useAuthenticatedTransactions();

  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();


  const user = auth.currentUser;
  const nome = user?.displayName?.trim() || user?.email?.split('@')[0] || 'Usuario';
  const email = user?.email || 'Email nao disponivel';

  const iniciais = useMemo(() => {
    const palavras = nome.split(' ').filter(Boolean);
    if (palavras.length === 1) return palavras[0].slice(0, 2).toUpperCase();
    return `${palavras[0][0] ?? ''}${palavras[1][0] ?? ''}`.toUpperCase();
  }, [nome]);

  const resumo = useMemo(() => calcularResumoFinanceiro(transacoes), [transacoes]);

  const quantidadeReceitas = useMemo(
    () => transacoes.filter((item) => item.tipo === 'receita').length,
    [transacoes]
  );
  const quantidadeDespesas = useMemo(
    () => transacoes.filter((item) => item.tipo === 'despesa').length,
    [transacoes]
  );

  async function handleSair() {
    if (saindo) return;
    setSaindo(true);
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      await sairDaConta();
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace('/login');
    } catch {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setSaindo(false);
    }
  }

  if (!fontsLoaded || !authResolvida || !userId || carregando) {
    return <LoadingScreen />;
  }

  const bottomPadding = tabBarHeight + 12; // 12 = respiro visual


  return (
    <SafeAreaView className="flex-1 bg-[#F5F7FA]" edges={['top', 'left', 'right', 'bottom']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: bottomPadding }}
      >
        <View className="pb-4 pt-5">
          <View className="mb-5 flex-row items-center justify-between">
            <AppText family="sofia" weight="bold" className="text-[26px] leading-[32px] text-slate-950">
              Perfil
            </AppText>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Ir para configuracoes"
              onPress={() => router.push('/relatorios')}
              className="h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white"
              style={({ pressed }) => [{ opacity: pressed ? 0.72 : 1 }]}
            >
              <Ionicons name="settings-outline" size={19} color="#334155" />
            </Pressable>
          </View>

          <SurfaceCard className="mb-5 rounded-[28px] border border-emerald-100 bg-white px-5 py-5">
            <View className="flex-row items-center">
              <View className="h-16 w-16 items-center justify-center rounded-full bg-emerald-500">
                <AppText family="inter" weight="bold" className="text-[22px] text-white">
                  {iniciais}
                </AppText>
              </View>

              <View className="ml-4 flex-1">
                <AppText family="inter" weight="bold" className="text-[18px] leading-[24px] text-slate-900">
                  {nome}
                </AppText>
                <AppText family="inter" variant="subcaption" className="mt-1 text-slate-500">
                  {email}
                </AppText>
              </View>
            </View>

            <View className="mt-4 rounded-[18px] bg-emerald-50 px-4 py-3">
              <AppText family="inter" variant="caption" className="text-emerald-700">
                Saldo atual
              </AppText>
              <AppText family="inter" weight="bold" className="mt-1 text-[24px] leading-[30px] text-emerald-700">
                {formatarMoeda(resumo.saldo)}
              </AppText>
            </View>

            <View className="mt-3 flex-row">
              <View className="flex-1 rounded-[16px] bg-slate-50 px-3 py-3">
                <AppText family="inter" variant="caption" className="text-slate-500">
                  Receitas
                </AppText>
                <AppText family="inter" weight="bold" className="mt-1 text-emerald-600">
                  {quantidadeReceitas}
                </AppText>
              </View>

              <View className="mx-2 flex-1 rounded-[16px] bg-slate-50 px-3 py-3">
                <AppText family="inter" variant="caption" className="text-slate-500">
                  Despesas
                </AppText>
                <AppText family="inter" weight="bold" className="mt-1 text-rose-600">
                  {quantidadeDespesas}
                </AppText>
              </View>

              <View className="flex-1 rounded-[16px] bg-slate-50 px-3 py-3">
                <AppText family="inter" variant="caption" className="text-slate-500">
                  Lancamentos
                </AppText>
                <AppText family="inter" weight="bold" className="mt-1 text-slate-900">
                  {transacoes.length}
                </AppText>
              </View>
            </View>
          </SurfaceCard>

          <AppText family="inter" weight="bold" className="mb-3 ml-1 text-slate-700">
            Atalhos
          </AppText>

          <SurfaceCard className="overflow-hidden rounded-[24px] border border-slate-100 bg-white p-1.5">
            <MenuItem
              icon="bar-chart-outline"
              titulo="Meu extrato"
              descricao="Visualize e filtre todas as movimentacoes"
              onPress={() => router.push('/extrato')}
            />

            <View className="mx-4 h-px bg-slate-100" />

            <MenuItem
              icon="add-circle-outline"
              titulo="Nova transacao"
              descricao="Adicione uma nova receita ou despesa"
              onPress={() => router.push('/nova-despesa')}
            />

            <View className="mx-4 h-px bg-slate-100" />

            <MenuItem
              icon="pie-chart-outline"
              titulo="Relatorios"
              descricao="Acompanhe seu desempenho financeiro"
              onPress={() => router.push('/relatorios')}
            />

            <View className="mx-4 h-px bg-slate-100" />

            <MenuItem
              icon="log-out-outline"
              titulo={saindo ? 'Saindo...' : 'Sair da conta'}
              descricao="Encerre a sessao neste dispositivo"
              destaque
              onPress={handleSair}
            />
          </SurfaceCard>

          <View className="mt-5 rounded-[18px] border border-slate-200 bg-white px-4 py-3">
            <AppText family="inter" variant="caption" className="text-slate-500">
              ID da conta
            </AppText>
            <AppText family="inter" variant="subcaption" className="mt-1 text-slate-700">
              {userId}
            </AppText>
          </View>
        </View>
      </ScrollView>

      {saindo ? (
        <View className="absolute inset-0 items-center justify-center bg-slate-950/15">
          <View className="rounded-full bg-white p-4">
            <ActivityIndicator size="small" color="#0F172A" />
          </View>
        </View>
      ) : null}
    </SafeAreaView>
  );
}
