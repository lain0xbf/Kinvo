import { useEffect, useState } from 'react';
import { Alert, ImageBackground, KeyboardAvoidingView, Platform, Pressable, ScrollView, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { cadastrarComEmailSenha, entrarComEmailSenha } from '@/services/auth';
import { AppText } from '@/components/ui/app-text';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { useAppFonts } from '@/hooks/use-app-fonts';
import { cn } from '@/utils/cn';
import { StatusBar } from 'expo-status-bar';
import { Asset } from 'expo-asset';

const fundo = require('../assets/fundo_login.webp');

export default function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [modoCadastro, setModoCadastro] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [campoFocado, setCampoFocado] = useState<'email' | 'senha' | null>(null);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [fontsLoaded] = useAppFonts();
  const formFocado = campoFocado !== null;
  const [carregouImagem, setCarregouImagem] = useState(false);

  useEffect(() => {
    async function carregarFundo() {
      await Asset.fromModule(fundo).downloadAsync();
      setCarregouImagem(true);
    }

    carregarFundo();
  }, []);


  async function handleEnviar() {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (!email.trim() || !senha.trim()) {
      Alert.alert('Campos obrigatorios', 'Preencha e-mail e senha para continuar.');
      return;
    }

    setCarregando(true);
    try {
      if (modoCadastro) {
        await cadastrarComEmailSenha(email, senha);
      } else {
        await entrarComEmailSenha(email, senha);
      }
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace('/(tabs)/home');
    } catch (erro: any) {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Erro de autenticacao', erro?.message ?? 'Nao foi possivel autenticar agora.');
    } finally {
      setCarregando(false);
    }
  }

  if (!fontsLoaded || !carregouImagem) {
    return <LoadingScreen />;
  }

  return (
    <ImageBackground
      source={fundo}
      className="flex-1"
      resizeMode="cover"
    >
      <StatusBar style="light" translucent backgroundColor="transparent" />
      <View className="absolute inset-0 bg-black/35" />

      <SafeAreaView className="flex-1">

        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
          <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{
            flexGrow: 1, paddingHorizontal: 20, paddingVertical: 12, paddingBottom: 16,
          }}>
            <View
              className={cn(
                'flex-1 pb-4',
                formFocado
                  ? 'justify-end pt-2'
                  : 'justify-between pt-2'
              )}
            >
              {!formFocado && (
                <View className="px-1">
                  <View className="flex-row items-center">
                    <View className="mr-2 h-10 w-10 items-center justify-center rounded-2xl bg-emerald-400/15">
                      <Ionicons name="stats-chart" size={22} color="#34D399" />
                    </View>

                    <AppText
                      variant="caption"
                      weight="bold"
                      className="text-[18px] text-white"
                    >
                      Kinvo
                    </AppText>
                  </View>

                  <AppText
                    weight="bold"
                    className="mt-10 text-[46px] leading-[50px] text-white"
                  >
                    Bem-vindo
                  </AppText>

                  <AppText
                    weight="bold"
                    className="text-[46px] leading-[50px] text-emerald-400"
                  >
                    de volta
                  </AppText>

                  <AppText
                    className="mt-5 max-w-[280px] text-[16px] leading-[28px] text-slate-300"
                  >
                    Faça login para continuar
                    {'\n'}
                    cuidando do seu dinheiro.
                  </AppText>
                </View>
              )}
              <View className="rounded-[36px] border border-emerald-400/20 bg-[#020617]/70 px-5 py-6 backdrop-blur">
                <AppText variant="body" weight="bold" className="text-center text-white text-[28px]">
                  Acesse sua conta
                </AppText>

                <AppText variant="body" className="mt-2 text-center text-slate-400">
                  Entre com seu e-mail e senha para continuar
                </AppText>

                <View className="mt-6">
                  <AppText variant="caption" className="mb-2 text-slate-400">
                    E-mail
                  </AppText>
                  <View
                    className={cn(
                      'min-h-[60px] flex-row items-center rounded-[18px] border border-white/10 bg-slate-900/80 px-5',
                      campoFocado === 'email'
                        ? 'border-emerald-400'
                        : 'border-white/10'
                    )}
                  >
                    <Ionicons name="mail-outline" size={18} color={campoFocado === 'email' ? '#34D399' : '#64748B'} />
                    <TextInput
                      value={email}
                      onChangeText={setEmail}
                      onFocus={() => setCampoFocado('email')}
                      onBlur={() => setCampoFocado(null)}
                      placeholder="seuemail@dominio.com"
                      autoCapitalize="none"
                      keyboardType="email-address"
                      autoCorrect={false}
                      returnKeyType="next"
                      className="ml-2.5 flex-1 text-[16px] text-white"
                      placeholderTextColor="#64748B"
                      style={{ fontFamily: 'SofiaProRegular' }}
                    />
                  </View>
                </View>

                <View className="mt-4">
                  <AppText variant="caption" className="mb-2 text-slate-400">
                    Senha
                  </AppText>
                  <View
                    className={cn(
                      'min-h-[60px] flex-row items-center rounded-[18px] border border-white/10 bg-slate-900/80 px-5',
                      campoFocado === 'senha'
                        ? 'border-emerald-400'
                        : 'border-white/10'
                    )}
                  >
                    <Ionicons name="lock-closed-outline" size={18} color={campoFocado === 'senha' ? '#34D399' : '#64748B'} />
                    <TextInput
                      value={senha}
                      onChangeText={setSenha}
                      onFocus={() => setCampoFocado('senha')}
                      onBlur={() => setCampoFocado(null)}
                      placeholder="Digite sua senha"
                      secureTextEntry={!mostrarSenha}
                      returnKeyType="done"
                      onSubmitEditing={() => {
                        void handleEnviar();
                      }}
                      className="ml-2.5 flex-1 text-[16px] text-white"
                      placeholderTextColor="#64748B"
                      style={{ fontFamily: 'SofiaProRegular' }}
                    />
                    <Pressable
                      onPress={() => {
                        void Haptics.selectionAsync();
                        setMostrarSenha((valorAtual) => !valorAtual);
                      }}
                      accessibilityRole="button"
                      accessibilityLabel={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
                      android_ripple={{ color: 'rgba(15, 23, 42, 0.08)', borderless: true }}
                      className="ml-2 min-h-[44px] min-w-[44px] items-center justify-center rounded-full"
                    >
                      <Ionicons name={mostrarSenha ? 'eye-off-outline' : 'eye-outline'} size={18} color="#64748B" />
                    </Pressable>
                  </View>
                </View>

                <Pressable
                  onPress={handleEnviar}
                  disabled={carregando}
                  className={cn(
                    'mt-6 min-h-[58px] flex-row items-center justify-center rounded-[24px] bg-emerald-400 active:opacity-90',
                    carregando && 'opacity-70'
                  )}

                  style={{
                    shadowColor: '#34D399',
                    shadowOffset: {
                      width: 0,
                      height: 10,
                    },
                    shadowOpacity: 0.35,
                    shadowRadius: 20,
                    elevation: 8,
                  }}
                >
                  <AppText
                    weight="bold"
                    className="text-[16px] text-slate-950"
                  >
                    {carregando
                      ? 'Entrando...'
                      : modoCadastro
                        ? 'Criar conta'
                        : 'Entrar'}
                  </AppText>
                </Pressable>

                <View className="mt-6 flex-row items-center justify-center">
                  <AppText className="text-slate-400">
                    {modoCadastro ? 'Já tem uma conta?' : 'Ainda não tem uma conta?'}
                  </AppText>

                  <Pressable
                    onPress={() => {
                      void Haptics.selectionAsync();
                      setModoCadastro((valorAtual) => !valorAtual);
                    }}
                    className="ml-2"
                  >
                    <AppText weight="bold" className="text-emerald-400">
                      {modoCadastro ? 'Entrar' : 'Criar conta'}
                    </AppText>
                  </Pressable>
                </View>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ImageBackground>
  );
}
