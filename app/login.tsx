import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { cadastrarComEmailSenha, entrarComEmailSenha } from '@/services/auth';

export default function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [modoCadastro, setModoCadastro] = useState(false);
  const [carregando, setCarregando] = useState(false);

  async function handleEnviar() {
    if (!email.trim() || !senha.trim()) {
      Alert.alert('Campos obrigatórios', 'Preencha e-mail e senha para continuar.');
      return;
    }

    setCarregando(true);
    try {
      if (modoCadastro) {
        await cadastrarComEmailSenha(email, senha);
      } else {
        await entrarComEmailSenha(email, senha);
      }
      router.replace('/(tabs)/home');
    } catch (erro: any) {
      Alert.alert('Erro de autenticação', erro?.message ?? 'Não foi possível autenticar agora.');
    } finally {
      setCarregando(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-100" edges={['top', 'left', 'right']}>
      <View className="flex-1 justify-center px-5">
        <View className="rounded-3xl border border-slate-200 bg-white p-5">
          <Text className="text-[26px] text-slate-900" style={{ fontFamily: 'SofiaProBold' }}>
            {modoCadastro ? 'Criar conta' : 'Entrar'}
          </Text>
          <Text className="mt-1 text-slate-600" style={{ fontFamily: 'SofiaProRegular' }}>
            Use seu e-mail e senha para acessar o app.
          </Text>

          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="E-mail"
            autoCapitalize="none"
            keyboardType="email-address"
            className="mt-5 h-12 rounded-xl border border-slate-300 bg-slate-50 px-3 text-slate-900"
            placeholderTextColor="#94A3B8"
          />
          <TextInput
            value={senha}
            onChangeText={setSenha}
            placeholder="Senha"
            secureTextEntry
            className="mt-3 h-12 rounded-xl border border-slate-300 bg-slate-50 px-3 text-slate-900"
            placeholderTextColor="#94A3B8"
          />

          <Pressable
            onPress={handleEnviar}
            disabled={carregando}
            className="mt-5 h-12 items-center justify-center rounded-xl bg-slate-900"
          >
            {carregando ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text className="text-white" style={{ fontFamily: 'SofiaProBold' }}>
                {modoCadastro ? 'Criar e entrar' : 'Entrar'}
              </Text>
            )}
          </Pressable>

          <Pressable
            onPress={() => setModoCadastro((valor) => !valor)}
            className="mt-4 h-10 items-center justify-center"
          >
            <Text className="text-slate-600" style={{ fontFamily: 'SofiaProRegular' }}>
              {modoCadastro ? 'Já tenho conta' : 'Ainda não tenho conta'}
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
