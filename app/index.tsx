import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Redirect } from 'expo-router';
import { escutarUsuarioAutenticado } from '@/services/auth';
import { type User } from 'firebase/auth';

export default function Index() {
  const [usuario, setUsuario] = useState<User | null | undefined>(undefined);

  useEffect(() => {
    const cancelar = escutarUsuarioAutenticado((usuarioAtual) => {
      setUsuario(usuarioAtual);
    });

    return () => cancelar();
  }, []);

  if (usuario === undefined) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-100">
        <ActivityIndicator size="large" color="#334155" />
      </View>
    );
  }

  return <Redirect href={usuario ? '/(tabs)/home' : '/login'} />;
}
