import { StatusBar } from 'expo-status-bar';
import type { ReactNode } from 'react';
import { ImageBackground, View } from 'react-native';
import { SafeAreaView, type Edges } from 'react-native-safe-area-context';

const backgroundImage = require('../../../assets/fundo_login.webp');

type AppScreenProps = {
  children: ReactNode;
  edges?: Edges;
  overlayClassName?: string;
};

export function AppScreen({
  children,
  edges = ['top', 'left', 'right'],
  overlayClassName = 'bg-slate-950/85',
}: AppScreenProps) {
  return (
    <ImageBackground source={backgroundImage} className="flex-1" resizeMode="cover">
      <StatusBar style="light" translucent backgroundColor="transparent" />

      <View className={`absolute inset-0 ${overlayClassName}`} />

      <SafeAreaView className="flex-1" edges={edges}>
        {children}
      </SafeAreaView>
    </ImageBackground>
  );
}