import { useEffect, useState } from 'react';
import { ImageBackground, Pressable, ScrollView, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { criarTransacaoParaUsuario, type TipoTransacao } from '@/services/transactions';
import { escutarUsuarioAutenticado } from '@/services/auth';
import { AppText } from '@/components/ui/app-text';
import { ActionButton } from '@/components/ui/action-button';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { SurfaceCard } from '@/components/ui/surface-card';
import { useAppFonts } from '@/hooks/use-app-fonts';
import { Ionicons } from '@expo/vector-icons';

const fundo2 = require('../../assets/button.png');

const categorias = [
  { nome: 'Alimentação', icon: 'cart-outline' },
  { nome: 'Transporte', icon: 'bus-outline' },
  { nome: 'Moradia', icon: 'home-outline' },
  { nome: 'Saúde', icon: 'heart-outline' },
  { nome: 'Lazer', icon: 'game-controller-outline' },
  { nome: 'Educação', icon: 'school-outline' },
  { nome: 'Compras', icon: 'bag-outline' },
  { nome: 'Serviços', icon: 'construct-outline' },
  { nome: 'Outros', icon: 'ellipsis-horizontal' },
] as const;

function formatarValor(texto: string) {
  const numero = texto.replace(/\D/g, '');

  const valor = Number(numero) / 100;

  return valor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

export default function NovaDespesa() {
  const [userId, setUserId] = useState<string | null>(null);
  const [descricao, setDescricao] = useState('');
  const [valorTexto, setValorTexto] = useState('');
  const [categoria, setCategoria] = useState('');
  const [tipo, setTipo] = useState<TipoTransacao>('despesa');
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [fontsLoaded] = useAppFonts();

  const router = useRouter();

  useEffect(() => {
    const cancelar = escutarUsuarioAutenticado((usuario) => {
      if (!usuario) {
        router.replace('/login');
        return;
      }

      setUserId(usuario.uid);
    });

    return () => cancelar();
  }, [router]);

  async function handleSalvarTransacao() {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (!userId) return;

    const valor = Number(
      valorTexto
        .replace(/[^\d,]/g, '')
        .replace(',', '.')
    );
    if (!descricao.trim()) {
      setErro('Informe a descricao da transacao.');
      return;
    }
    if (!Number.isFinite(valor) || valor <= 0) {
      setErro('Informe um valor valido maior que zero.');
      return;
    }

    setErro(null);
    setSalvando(true);
    try {
      await criarTransacaoParaUsuario(userId, {
        descricao,
        valor,
        categoria,
        tipo,
      });
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setErro('Nao foi possivel salvar a transacao.');
    } finally {
      setSalvando(false);
    }
  }

  if (!fontsLoaded || !userId) {
    return <LoadingScreen />;
  }

  return (
    <SafeAreaView className="flex-1 bg-[#F5F7FA]" edges={['top', 'left', 'right']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        bounces={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingTop: 20,
          paddingBottom: 120,
        }}
      >
        <View className="mb-4 h-[64px] items-center justify-center">
          <Pressable
            onPress={() => router.back()}
            className="absolute left-0 h-12 w-12 items-center justify-center rounded-full border border-slate-100 bg-white"
          >
            <Ionicons name="arrow-back" size={22} color="#0F172A" />
          </Pressable>

          <AppText className="text-center text-[20px] text-slate-950" style={{ fontFamily: 'InterBold' }}>
            Nova transação
          </AppText>

          <AppText variant='subcaption' className="mt-1 text-center text-slate-500" style={{ fontFamily: 'InterRegular' }}>
            Adicione um lançamento
          </AppText>
        </View>

        <View className="mb-2 flex-row rounded-[22px] border border-slate-200 bg-white p-1.5">
          {(['despesa', 'receita'] as const).map((opcao) => {
            const ativo = tipo === opcao;
            return (
              <Pressable
                key={opcao}
                onPress={() => setTipo(opcao)}
                className={
                  ativo
                    ? tipo === 'despesa'
                      ? 'h-12 flex-1 items-center justify-center rounded-2xl bg-rose-50'
                      : 'h-12 flex-1 items-center justify-center rounded-2xl bg-emerald-50'
                    : 'h-12 flex-1 items-center justify-center rounded-2xl bg-transparent'
                }
              >
                <AppText
                  variant="caption"
                  style={{ fontFamily: ativo ? 'InterBold' : 'InterRegular' }}
                  className={ativo
                    ? tipo === 'despesa'
                      ? 'text-rose-600'
                      : 'text-emerald-600'
                    : 'text-slate-500'}
                >
                  {opcao === 'despesa' ? 'Despesa' : 'Receita'}
                </AppText>
              </Pressable>
            );
          })}
        </View>

        <View className="mt-3">
          <AppText className="mt-4 text-[16px] text-slate-500" style={{ fontFamily: 'InterRegular' }}>
            Valor
          </AppText>

          <View className="h-[88px] mt-3 flex-row items-center rounded-[24px] border border-slate-200 bg-white px-6">
            <TextInput
              value={valorTexto}
              onChangeText={(texto) => setValorTexto(formatarValor(texto))}
              placeholder="R$ 0,00"
              placeholderTextColor="#9CA3AF"
              keyboardType="numeric"
              className="flex-1 text-[34px] text-slate-950"
              style={{
                fontFamily: 'InterRegular',
                padding: 0,
              }}
            />
            <View className="h-10 w-10 items-center justify-center rounded-2xl border border-slate-100 bg-slate-50">
              <Ionicons name="calculator-outline" size={20} color="#10B981" />
            </View>
          </View>

          <AppText className="mt-4 text-[16px] text-slate-500" style={{ fontFamily: 'InterRegular' }}>
            Descrição
          </AppText>
          <View className="h-16 mt-3 flex-row items-center rounded-[24px] border border-slate-200 bg-white px-5">
            <Ionicons name="document-text-outline" size={22} color="#64748B" />
            <TextInput
              value={descricao}
              onChangeText={setDescricao}
              placeholder="Adicione uma descrição"
              placeholderTextColor="#94A3B8"
              className="ml-4 flex-1 text-[17px] text-slate-900"
              style={{ fontFamily: 'InterRegular' }}
            />
          </View>

          <AppText className="mt-4 text-[16px] text-slate-500" style={{ fontFamily: 'InterRegular' }}>
            Categoria
          </AppText>

          <View className="h-16 mt-3 flex-row items-center rounded-[24px] border border-slate-200 bg-white px-5">
            <View className="h-10 w-10 items-center justify-center rounded-full bg-emerald-500">
              <Ionicons name="cart-outline" size={22} color="#FFFFFF" />
            </View>

            <AppText className="ml-4 flex-1 text-[16px] text-slate-700" style={{ fontFamily: 'InterRegular' }}>
              {categoria || 'Selecione uma categoria'}
            </AppText>
          </View>

          <View className="mt-4 flex-row flex-wrap">
            {categorias.map((item) => {
              const ativo = categoria === item.nome;

              return (
                <Pressable
                  key={item.nome}
                  onPress={() => setCategoria(item.nome)}
                  className="mb-3 w-1/5 items-center"
                >
                  <View
                    className={
                      ativo
                        ? 'h-12 w-12 items-center justify-center rounded-full border border-emerald-300 bg-emerald-50'
                        : 'h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-white'
                    }
                  >
                    <Ionicons
                      name={item.icon}
                      size={20}
                      color={ativo ? '#10B981' : '#64748B'}
                    />
                  </View>

                  <AppText
                    variant="categoria"
                    className={
                      ativo
                        ? 'mt-1 text-center text-emerald-600'
                        : 'mt-1 text-center text-slate-500'
                    }
                    style={{ fontFamily: 'InterRegular' }}
                  >
                    {item.nome}
                  </AppText>
                </Pressable>
              );
            })}
          </View>

          {/*           <View className="rounded-[20px] border border-slate-200 bg-white px-3 py-2.5">
            <AppText variant="caption" className="mb-1 text-slate-500">
              Categoria (opcional)
            </AppText>
            <TextInput
              value={categoria}
              onChangeText={setCategoria}
              placeholder="Ex: Alimentacao"
              placeholderTextColor="#94A3B8"
              className="min-h-[26px] text-[15px] text-slate-900"
              style={{ fontFamily: 'SofiaProRegular' }}
            />
          </View> */}
        </View>

        {erro ? (
          <SurfaceCard className="mt-3 rounded-[18px] border-rose-200 bg-rose-50 px-3 py-2.5">
            <AppText variant="caption" className="text-rose-700">
              {erro}
            </AppText>
          </SurfaceCard>
        ) : null}

        <Pressable
          onPress={handleSalvarTransacao}
          disabled={salvando}
          className="mt-8 mb-10 overflow-hidden rounded-[28px]"
        >
          <ImageBackground
            source={fundo2}
            resizeMode="cover"
            className="h-[74px] items-center justify-center"
            imageStyle={{
              borderRadius: 28,
              transform: [{ scale: 1.08 }],
            }}
          >
            <View className="absolute inset-0 bg-black/5" />



              <AppText
                style={{ fontFamily: 'InterBold' }}
                className="text-[17px] text-white text-center"
              >
                {salvando ? 'Salvando...' : 'Salvar transação'}
              </AppText>

          </ImageBackground>
        </Pressable>

      </ScrollView>
    </SafeAreaView>
  );
}
