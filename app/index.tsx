import { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import { escutarUsuarioAutenticado } from '@/services/auth';
import { type User } from 'firebase/auth';
import { LoadingScreen } from '@/components/ui/loading-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';


export default function Index() {
  const [usuario, setUsuario] = useState<User | null | undefined>(undefined);
  const [viuOnboarding, setViuOnboarding] = useState<boolean | null>(null);

  useEffect(() => {
    verificarOnboarding();
    const cancelar = escutarUsuarioAutenticado((usuarioAtual) => {
      setUsuario(usuarioAtual);
    });

    return () => cancelar();
  }, []);

  async function verificarOnboarding() {
    const valor = await AsyncStorage.getItem('@viu_onboarding');

    setViuOnboarding(valor === 'true');
  }

  if (usuario === undefined || viuOnboarding === null) {
    return <LoadingScreen />;
  }

  if (!viuOnboarding) {
    return <Redirect href="/onboarding" />;
  }

  return <Redirect href={usuario ? '/(tabs)/home' : '/login'} />;
}
