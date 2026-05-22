import { useEffect, useState } from 'react';
import { Alert, ImageBackground, Pressable, TextInput, useWindowDimensions, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
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
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

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
  const { height } = useWindowDimensions();

  const paddingFormFocado = Math.min(height * 0.06, 56);
  const paddingScrollFocado = Math.min(height * 0.12, 100)
  const insets = useSafeAreaInsets();


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

        <KeyboardAwareScrollView
          className="flex-1"
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: 20,
            paddingTop: 12,
            paddingBottom: formFocado
  ? paddingScrollFocado
  : Math.max(insets.bottom + 20, 32),

          }}
          keyboardShouldPersistTaps="handled"
          enableOnAndroid
          enableAutomaticScroll={false}
          extraScrollHeight={0}
          extraHeight={0}
          scrollEnabled={formFocado}
          showsVerticalScrollIndicator={false}
        >
          <View
            className={cn(
              'flex-1 pb-4',
              formFocado
                ? 'justify-center pt-2'
                : 'justify-end pt-2'
            )}
            style={formFocado ? { paddingBottom: paddingFormFocado } : undefined}
          >
            <View className={cn('px-1 mb-10', formFocado && 'mb-4')}>
              <View className="flex-row items-center">
                <View className="mr-2 h-10 w-10 items-center justify-center rounded-2xl bg-emerald-400/15">
                  <Ionicons name="stats-chart" size={22} color="#34D399" />
                </View>

                <AppText variant="caption" weight="bold" className="text-[18px] text-white">
                  Kinvo
                </AppText>
              </View>

              {!formFocado && (
                <Animated.View
                  entering={FadeIn.duration(180)}
                  exiting={FadeOut.duration(120)}
                >
                  <AppText weight="bold" className="mt-10 text-[42px] leading-[50px] text-white">
                    Bem-vindo
                  </AppText>

                  <AppText weight="bold" className="text-[42px] leading-[50px] text-emerald-400">
                    de volta
                  </AppText>

                  <AppText className="mt-5 max-w-[280px] text-[16px] leading-[28px] text-slate-300">
                    Faça login para continuar{'\n'}
                    cuidando do seu dinheiro.
                  </AppText>
                </Animated.View>
              )}
            </View>
            <View className={cn(
              'rounded-[32px] border border-emerald-400/20 bg-[#020617]/60 px-6 backdrop-blur',
              formFocado ? 'py-5' : 'py-6'
            )}>
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
                    'min-h-[60px] flex-row items-center rounded-[18px] border bg-slate-900/80 px-5',
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
                    'min-h-[60px] flex-row items-center rounded-[18px] border bg-slate-900/80 px-5',
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
                    android_ripple={{ color: 'rgba(255,255,255,0.08)', borderless: true }}
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
                  'mt-6 min-h-[58px] overflow-hidden rounded-[24px]',
                  carregando && 'opacity-70'
                )}
                style={{
                  shadowColor: '#10B981',
                  shadowOffset: {
                    width: 0,
                    height: 10,
                  },
                  shadowOpacity: 0.22,
                  shadowRadius: 20,
                  elevation: 10,
                }}
              >
                <LinearGradient
                  colors={['#2DD4BF', '#10B981', '#047857']}
                  start={{ x: 0, y: 0.2 }}
                  end={{ x: 1, y: 0.8 }}
                  style={{
                    minHeight: 58,
                    borderRadius: 24,
                    alignItems: 'center',
                    justifyContent: 'center',
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
                </LinearGradient>
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
        </KeyboardAwareScrollView>
      </SafeAreaView >
    </ImageBackground >
  );
}
