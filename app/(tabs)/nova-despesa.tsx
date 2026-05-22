import { useEffect, useState } from 'react';
import { Pressable, ScrollView, TextInput, View } from 'react-native';
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
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 20, paddingBottom: 88 }}>
        <SurfaceCard className="rounded-[28px] overflow-hidden px-4 py-4">
          <View className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-slate-100" />
          <View className="mb-5">
            <AppText variant="title" weight="bold" className="mt-1 text-slate-950">
              Nova transacão
            </AppText>
            <AppText variant="caption" className="mt-1 text-slate-500">
              Registre uma movimentação financeira
            </AppText>
          </View>

          <View className="mb-1 flex-row rounded-[22px] border border-slate-200 bg-white p-1.5">
            {(['despesa', 'receita'] as const).map((opcao) => {
              const ativo = tipo === opcao;
              return (
                <Pressable
                  key={opcao}
                  onPress={() => setTipo(opcao)}
                  className={
                    ativo
                      ? 'h-12 flex-1 items-center justify-center rounded-2xl bg-slate-950'
                      : 'h-12 flex-1 items-center justify-center rounded-2xl bg-transparent'
                  }
                >
                  <AppText
                    variant="caption"
                    weight={ativo ? 'bold' : 'regular'}
                    className={ativo ? 'text-white' : 'text-slate-500'}
                  >
                    {opcao === 'despesa' ? 'Despesa' : 'Receita'}
                  </AppText>
                </Pressable>
              );
            })}
          </View>

          <View className="mt-3 gap-3">
            <View className="rounded-[20px] border border-slate-200 bg-white px-3 py-2.5">
              <AppText variant="caption" className="mb-1 text-slate-500">
                Descrição
              </AppText>
              <TextInput
                value={descricao}
                onChangeText={setDescricao}
                placeholder="Ex: Restaurante"
                placeholderTextColor="#94A3B8"
                className="min-h-[26px] text-[15px] text-slate-900"
                style={{ fontFamily: 'SofiaProRegular' }}
              />
            </View>

            <View className="rounded-[20px] border border-slate-200 bg-white px-3 py-2.5">
              <AppText variant="caption" className="mb-1 text-slate-500">
                Valor
              </AppText>
              <TextInput
                value={valorTexto}
                onChangeText={(texto) => {
                  setValorTexto(formatarValor(texto));
                }}
                placeholder="R$ 0,00"
                placeholderTextColor="#94A3B8"
                keyboardType="numeric"
                className="min-h-[26px] text-[15px] text-slate-900"
                style={{ fontFamily: 'SofiaProRegular' }}
              />
            </View>

            <View className="rounded-[20px] border border-slate-200 bg-white px-3 py-2.5">
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
            </View>
          </View>

          {erro ? (
            <SurfaceCard className="mt-3 rounded-[18px] border-rose-200 bg-rose-50 px-3 py-2.5">
              <AppText variant="caption" className="text-rose-700">
                {erro}
              </AppText>
            </SurfaceCard>
          ) : null}

          <ActionButton
            onPress={handleSalvarTransacao}
            loading={salvando}
            label={salvando ? 'Salvando...' : 'Salvar transacao'}
            className="mt-5 min-h-[56px] rounded-[20px]"
          />

          <ActionButton onPress={() => router.back()} variant="ghost" label="Cancelar" className="mt-2" />
        </SurfaceCard>
      </ScrollView>
    </SafeAreaView>
  );
}
