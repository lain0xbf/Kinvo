import '../global.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAppFonts } from '@/hooks/use-app-fonts';
import { LoadingScreen } from '@/components/ui/loading-screen';

const queryClient = new QueryClient();

export default function RootLayout() {
  const [fontsLoaded] = useAppFonts();
  if (!fontsLoaded) {
    return <LoadingScreen />;
  }
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider>
          <Stack screenOptions={{ headerShown: false }} />
        </SafeAreaProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
