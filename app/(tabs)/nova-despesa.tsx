import { useEffect, useState } from 'react';
import { ImageBackground, Pressable, ScrollView, TextInput, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { criarTransacaoParaUsuario, type TipoTransacao } from '@/services/transactions';
import { escutarUsuarioAutenticado } from '@/services/auth';
import { AppText } from '@/components/ui/app-text';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { SurfaceCard } from '@/components/ui/surface-card';
import { useAppFonts } from '@/hooks/use-app-fonts';
import { Ionicons } from '@expo/vector-icons';
import { FormField } from '@/components/FormField';
import { categoriasTransacao } from '@/constants/transacoes-categorias';


const fundo2 = require('../../assets/button.png');


function formatarValor(texto: string) {
  const numero = texto.replace(/\D/g, '');
  const valor = Number(numero) / 100;

  return valor.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function CategoryOption({
  nome,
  icon,
  ativo,
  onPress,
}: {
  nome: string;
  icon: keyof typeof Ionicons.glyphMap;
  ativo: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={6}
      accessibilityRole="button"
      accessibilityLabel={`Categoria ${nome}`}
      accessibilityState={{ selected: ativo }}
      className="mb-4 w-1/5 items-center px-1"
      style={({ pressed }) => [
        {
          opacity: pressed ? 0.72 : 1,
          transform: [{ scale: pressed ? 0.96 : 1 }],
        },
      ]}
    >
      <View
        className={
          ativo
            ? 'h-12 w-12 items-center justify-center rounded-full border border-emerald-300 bg-emerald-50'
            : 'h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-white'
        }
      >
        <Ionicons name={icon} size={21} color={ativo ? '#059669' : '#64748B'} />
      </View>

      <AppText
        family="inter"
        weight={ativo ? 'bold' : 'regular'}
        numberOfLines={1}
        variant='categoria'
        className={
          ativo
            ? 'mt-1.5 max-w-[54px] text-center text-emerald-700'
            : 'mt-1.5 max-w-[54px] text-center text-slate-500'
        }
      >
        {nome}
      </AppText>
    </Pressable>
  );
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

  const insets = useSafeAreaInsets();


  const router = useRouter();


  const botaoDesabilitado = salvando || valorTexto.trim() === '';

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
      setValorTexto('');
      setDescricao('');
      setCategoria('');
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
    <SafeAreaView className="flex-1 bg-[#F5F7FA]" edges={['top', 'left', 'right', 'bottom']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        bounces={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 12,
          paddingBottom: Math.max(120, insets.bottom + 88),

        }}
      >
        <View className="mb-4 h-[76px] items-center justify-center py-2">
          <Pressable
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Voltar"
            className="absolute left-0 h-12 w-12 items-center justify-center rounded-full border border-slate-100 bg-white"
          >
            <Ionicons name="arrow-back" size={22} color="#0F172A" />
          </Pressable>

          <AppText variant='screenTitle' family='sofia' weight='bold' className="text-center text-slate-950">
            Nova transação
          </AppText>

          <AppText variant="screenSubtitle" weight='regular' family='inter' className="mt-1 text-center text-slate-500">
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
                accessibilityRole="button"
                accessibilityLabel={opcao === 'despesa' ? 'Selecionar despesa' : 'Selecionar receita'}
                accessibilityState={{ selected: ativo }}
                className={ativo ? 'h-12 flex-1 items-center justify-center rounded-2xl bg-emerald-50' : 'h-12 flex-1 items-center justify-center rounded-2xl bg-transparent'}
              >
                <AppText
                  family="inter"
                  weight={ativo ? 'bold' : 'regular'}
                  variant='subcaption'
                  className={
                    ativo
                      ? 'text-emerald-700'
                      : 'text-slate-500'
                  }
                >
                  {opcao === 'despesa' ? 'Despesa' : 'Receita'}
                </AppText>
              </Pressable>
            );
          })}
        </View>

        <View className="mt-3">
          <AppText variant="fieldLabel" family="inter" className="text-slate-500">
            Valor
          </AppText>

          <SurfaceCard variant="control" className="mt-3 flex-row items-center rounded-[26px] border-slate-200 bg-white px-6 py-4"
          >
            <AppText
              family="inter"
              weight="regular"
              variant='fieldLabel'
              className="mr-2 text-slate-400"
            >
              R$
            </AppText>

            <TextInput
              value={valorTexto}
              onChangeText={(texto) => setValorTexto(formatarValor(texto))}
              placeholder="0,00"
              placeholderTextColor="#94A3B8"
              maxLength={15}
              keyboardType="decimal-pad"
              allowFontScaling={false}
              style={{
                flex: 1,
                minWidth: 0,
                fontFamily: 'InterBold',
                fontSize: 38,
                lineHeight: 46,
                padding: 0,
                includeFontPadding: false,
                textAlignVertical: 'center',
                color: '#0F172A',
              }}
            />

            <View className="h-11 w-11 items-center justify-center rounded-2xl border border-slate-100 bg-slate-50">
              <Ionicons name="calculator-outline" size={20} color="#10B981" />
            </View>
          </SurfaceCard>

          <FormField
            label="Descrição"
            leftIcon={<Ionicons name="document-text-outline" size={22} color="#64748B" />}
          >
            <TextInput
              value={descricao}
              onChangeText={setDescricao}
              placeholder="Adicione uma descrição"
              placeholderTextColor="#94A3B8"
              className="text-[16px] leading-[22px] text-slate-900"
              style={{ fontFamily: 'InterRegular', padding: 0 }}
            />
          </FormField>



          <AppText variant="fieldLabel" family="inter" className="mt-4 text-slate-500">
            Categoria
          </AppText>

          <View className="mt-3 flex-row flex-wrap">
            {categoriasTransacao.map((item) => (
              <CategoryOption
                key={item.nome}
                nome={item.nome}
                icon={item.icon}
                ativo={categoria === item.nome}
                onPress={() => setCategoria(item.nome)}
              />
            ))}
          </View>

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
          disabled={botaoDesabilitado}
          accessibilityRole="button"
          accessibilityLabel={salvando ? 'Salvando transação' : 'Salvar transação'}
          className={`mt-8 mb-10 overflow-hidden rounded-[24px] ${botaoDesabilitado ? 'opacity-70' : ''}`}
        >
          {({ pressed }) => (
            <ImageBackground
              source={fundo2}
              resizeMode="cover"
              className="h-[66px] flex-row items-center rounded-[24px] px-4"
              imageStyle={{
                borderRadius: 24,
                transform: [{ scale: pressed ? 1.02 : 1.05 }],
              }}
            >
              <View className={`absolute inset-0 ${pressed ? 'bg-black/20' : 'bg-black/5'}`} />

              <View className="h-10 w-10 items-center justify-center rounded-[14px] bg-white">
                <Ionicons
                  name={salvando ? 'hourglass-outline' : 'checkmark'}
                  size={24}
                  color="#10B981"
                />
              </View>

              <View className="ml-3 flex-1">
                <AppText family="sofia" weight="bold" variant='subtitle' className="text-white">
                  {salvando ? 'Salvando...' : 'Salvar transação'}
                </AppText>

                <AppText family="sofia" variant='subcaption' className="mt-0.5 text-white/75">
                  Registrar lançamento na carteira
                </AppText>
              </View>

              <Ionicons name="chevron-forward" size={20} color="#FFFFFFCC" />
            </ImageBackground>
          )}
        </Pressable>

      </ScrollView>
    </SafeAreaView>
  );
}
