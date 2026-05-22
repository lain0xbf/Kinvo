import { useFonts } from 'expo-font';

export function useAppFonts() {
  return useFonts({
    SofiaProBold: require('../../assets/fonts/SofiaProBold.otf'),
    SofiaProRegular: require('../../assets/fonts/SofiaProRegular.otf'),
    InterBold: require('../../assets/fonts/InterBold.ttf'),
    InterRegular: require('../../assets/fonts/InterRegular.ttf'),
  });
}
