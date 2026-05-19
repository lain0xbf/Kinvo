import { ActivityIndicator, View } from 'react-native';

type LoadingScreenProps = {
  color?: string;
};

export function LoadingScreen({ color = '#0F172A' }: LoadingScreenProps) {
  return (
    <View className="flex-1 items-center justify-center bg-[#F5F7FA] px-6">
      <ActivityIndicator size="large" color={color} />
    </View>
  );
}
