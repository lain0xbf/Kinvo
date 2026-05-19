import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { cadastrarComEmailSenha, entrarComEmailSenha } from '@/services/auth';
import { ActionButton } from '@/components/ui/action-button';
import { AppText } from '@/components/ui/app-text';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { useAppFonts } from '@/hooks/use-app-fonts';
import { cn } from '@/utils/cn';

export default function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [modoCadastro, setModoCadastro] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [campoFocado, setCampoFocado] = useState<'email' | 'senha' | null>(null);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [fontsLoaded] = useAppFonts();

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

  if (!fontsLoaded) {
    return <LoadingScreen />;
  }

  return (
    <SafeAreaView className="flex-1 bg-[#F6F7FB]" edges={['top', 'left', 'right']}>
      <View className="absolute -left-24 top-6 h-56 w-56 rounded-full bg-[#E4ECF8]" />
      <View className="absolute -right-20 bottom-20 h-52 w-52 rounded-full bg-[#E5F1EB]" />
      <View className="absolute left-10 top-40 h-20 w-20 rounded-full bg-white/60" />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 20, paddingVertical: 20 }}>
          <View className="flex-1 justify-center">
            <View className="mb-7">
              <View className="self-start rounded-full border border-white/80 bg-white px-3 py-2 shadow-sm shadow-slate-900/5">
                <AppText variant="caption" weight="bold" className="text-slate-800">
                  Kinvo
                </AppText>
              </View>

              <AppText variant="title" weight="bold" className="mt-3 text-slate-950">
                {modoCadastro ? 'Crie sua conta' : 'Bem-vindo de volta'}
              </AppText>
              <AppText variant="body" className="mt-2 max-w-[300px] text-[15px] leading-[23px] text-slate-600">
                {modoCadastro
                  ? 'Crie seu acesso em segundos e comece a organizar suas financas.'
                  : 'Acesse sua conta para continuar com seu controle financeiro.'}
              </AppText>
            </View>

            <View className="rounded-[30px] border border-white/80 bg-white px-5 py-5 shadow-lg shadow-slate-900/10">
              <View className="mb-5 flex-row items-center justify-between">
                <View>
                  <AppText variant="caption" className="text-slate-500">
                    Acesso
                  </AppText>
                  <AppText variant="subtitle" weight="bold" className="mt-1 text-slate-950">
                    {modoCadastro ? 'Novo cadastro' : 'Entrar na conta'}
                  </AppText>
                </View>

                <View className="rounded-full bg-emerald-50 px-3 py-2">
                  <AppText variant="caption" weight="bold" className="text-emerald-700">
                    Seguro
                  </AppText>
                </View>
              </View>

              <View className="flex-row rounded-[18px] border border-slate-200 bg-slate-100 p-1.5">
                {[
                  { id: 'login', title: 'Entrar', value: false },
                  { id: 'cadastro', title: 'Criar conta', value: true },
                ].map((item) => {
                  const ativo = modoCadastro === item.value;
                  return (
                    <Pressable
                      key={item.id}
                      onPress={() => {
                        void Haptics.selectionAsync();
                        setModoCadastro(item.value);
                      }}
                      accessibilityRole="button"
                      accessibilityLabel={item.title}
                      android_ripple={{ color: 'rgba(15, 23, 42, 0.08)' }}
                      className={cn(
                        'min-h-[48px] flex-1 items-center justify-center rounded-[14px] active:opacity-85',
                        ativo ? 'bg-white' : 'bg-transparent'
                      )}
                    >
                      <AppText variant="caption" weight={ativo ? 'bold' : 'regular'} className={ativo ? 'text-slate-900' : 'text-slate-500'}>
                        {item.title}
                      </AppText>
                    </Pressable>
                  );
                })}
              </View>

              <View className="mt-6">
                <AppText variant="caption" className="mb-2 text-slate-500">
                  E-mail
                </AppText>
                <View
                  className={cn(
                    'min-h-[56px] flex-row items-center rounded-[18px] border bg-slate-50 px-4',
                    campoFocado === 'email' ? 'border-slate-900 bg-white' : 'border-slate-200'
                  )}
                >
                  <Ionicons name="mail-outline" size={18} color={campoFocado === 'email' ? '#0F172A' : '#64748B'} />
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
                    className="ml-2.5 flex-1 text-[16px] text-slate-900"
                    placeholderTextColor="#94A3B8"
                    style={{ fontFamily: 'SofiaProRegular' }}
                  />
                </View>
              </View>

              <View className="mt-4">
                <AppText variant="caption" className="mb-2 text-slate-500">
                  Senha
                </AppText>
                <View
                  className={cn(
                    'min-h-[56px] flex-row items-center rounded-[18px] border bg-slate-50 px-4',
                    campoFocado === 'senha' ? 'border-slate-900 bg-white' : 'border-slate-200'
                  )}
                >
                  <Ionicons name="lock-closed-outline" size={18} color={campoFocado === 'senha' ? '#0F172A' : '#64748B'} />
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
                    className="ml-2.5 flex-1 text-[16px] text-slate-900"
                    placeholderTextColor="#94A3B8"
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

                <View className="mt-3 flex-row items-center justify-between">
                  <AppText variant="caption" className="text-slate-500">
                    {modoCadastro ? 'Use pelo menos 6 caracteres.' : 'Seus dados ficam protegidos no dispositivo.'}
                  </AppText>
                  {!modoCadastro ? (
                    <AppText variant="caption" weight="bold" className="text-slate-700">
                      Acesso rapido
                    </AppText>
                  ) : null}
                </View>
              </View>

              <ActionButton
                onPress={handleEnviar}
                loading={carregando}
                label={modoCadastro ? 'Criar e entrar' : 'Entrar'}
                className="mt-6 min-h-[56px] rounded-[18px] shadow-sm shadow-slate-900/10"
              />

              <View className="mt-5 rounded-[18px] bg-slate-50 px-4 py-3">
                <View className="flex-row items-center">
                  <Ionicons name="shield-checkmark-outline" size={15} color="#0F172A" />
                  <AppText variant="caption" weight="bold" className="ml-2 text-slate-800">
                    Experiencia segura e sem friccao
                  </AppText>
                </View>
                <AppText variant="caption" className="mt-1 text-slate-500">
                  Fluxo simples, toque confortavel e autenticacao direta.
                </AppText>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
