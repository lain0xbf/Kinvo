import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/ui/app-text';
import { SurfaceCard } from '@/components/ui/surface-card';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { useAppFonts } from '@/hooks/use-app-fonts';
import { useAuthenticatedTransactions } from '@/hooks/use-authenticated-transactions';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';



export default function Extrato() {
  const [fontsLoaded] = useAppFonts();
  const { authResolvida, carregando, userId } = useAuthenticatedTransactions();

  const tabBarHeight = useBottomTabBarHeight();
  const bottomPadding = tabBarHeight + 12; // 12 = respiro visual

  if (!fontsLoaded || !authResolvida || !userId || carregando) {
    return <LoadingScreen />;
  }

  return (
    <SafeAreaView className="flex-1 bg-[#F5F7FA]" edges={['top', 'left', 'right']}>
      <View className="flex-1 items-center justify-center px-6">
        <SurfaceCard className="w-full items-center rounded-[24px] border border-dashed border-slate-200 bg-white px-5 py-10">
          <Ionicons name="construct-outline" size={30} color="#64748B" />
          <AppText variant="subtitle" weight="bold" className="mt-2 text-slate-800">
            Tela em manutenção
          </AppText>
          <AppText variant="caption" className="mt-1 text-center text-slate-500">
            Estamos ajustando os relatórios. Tente novamente mais tarde.
          </AppText>
        </SurfaceCard>
      </View>
    </SafeAreaView>
  );
}
