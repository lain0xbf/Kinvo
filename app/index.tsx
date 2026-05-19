import { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import { escutarUsuarioAutenticado } from '@/services/auth';
import { type User } from 'firebase/auth';
import { LoadingScreen } from '@/components/ui/loading-screen';

export default function Index() {
  const [usuario, setUsuario] = useState<User | null | undefined>(undefined);

  useEffect(() => {
    const cancelar = escutarUsuarioAutenticado((usuarioAtual) => {
      setUsuario(usuarioAtual);
    });

    return () => cancelar();
  }, []);

  if (usuario === undefined) {
    return <LoadingScreen />;
  }

  return <Redirect href={usuario ? '/(tabs)/home' : '/login'} />;
}
