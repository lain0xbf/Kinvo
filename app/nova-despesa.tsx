import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { criarTransacaoParaUsuario, type TipoTransacao } from '@/services/transactions';
import { escutarUsuarioAutenticado } from '@/services/auth';

export default function NovaDespesa() {
  const [userId, setUserId] = useState<string | null>(null);
  const [descricao, setDescricao] = useState('');
  const [valorTexto, setValorTexto] = useState('');
  const [categoria, setCategoria] = useState('');
  const [tipo, setTipo] = useState<TipoTransacao>('despesa');
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    const cancelar = escutarUsuarioAutenticado((usuario) => {
      if (!usuario) {
        router.replace('/login');
        return;
      }
      setUserId(usuario.uid);
    });

    return () => cancelar();
  }, []);

  async function handleSalvarTransacao() {
    if (!userId) return;

    const valor = Number(valorTexto.replace(',', '.'));
    if (!descricao.trim()) {
      setErro('Informe a descrição da transação.');
      return;
    }
    if (!Number.isFinite(valor) || valor <= 0) {
      setErro('Informe um valor válido maior que zero.');
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
      router.back();
    } catch {
      setErro('Não foi possível salvar a transação.');
    } finally {
      setSalvando(false);
    }
  }

  if (!userId) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-100 px-6">
        <ActivityIndicator size="large" color="#334155" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-100" edges={['top', 'left', 'right']}>
      <View className="flex-1 px-4 pb-4 pt-3">
        <View className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
          <Text className="text-[24px] text-slate-900" style={{ fontFamily: 'SofiaProBold' }}>
            Nova transação
          </Text>
          <Text className="mt-1 text-slate-500" style={{ fontFamily: 'SofiaProRegular' }}>
            Registre receita ou despesa para manter seu saldo atualizado.
          </Text>

          <View className="mt-4 flex-row rounded-xl border border-slate-200 bg-slate-50 p-1">
            {(['despesa', 'receita'] as const).map((opcao) => {
              const ativo = tipo === opcao;
              return (
                <Pressable
                  key={opcao}
                  onPress={() => setTipo(opcao)}
                  className={
                    ativo
                      ? 'h-11 flex-1 items-center justify-center rounded-lg border border-slate-300 bg-white'
                      : 'h-11 flex-1 items-center justify-center rounded-lg'
                  }
                >
                  <Text
                    className={ativo ? 'text-slate-900' : 'text-slate-500'}
                    style={{ fontFamily: ativo ? 'SofiaProBold' : 'SofiaProRegular' }}
                  >
                    {opcao === 'despesa' ? 'Despesa' : 'Receita'}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <TextInput
            value={descricao}
            onChangeText={setDescricao}
            placeholder="Descrição"
            placeholderTextColor="#94A3B8"
            className="mt-3 h-11 rounded-xl border border-slate-300 bg-slate-50 px-3 text-slate-900"
          />
          <TextInput
            value={valorTexto}
            onChangeText={setValorTexto}
            placeholder="Valor (ex: 89.90)"
            placeholderTextColor="#94A3B8"
            keyboardType="decimal-pad"
            className="mt-3 h-11 rounded-xl border border-slate-300 bg-slate-50 px-3 text-slate-900"
          />
          <TextInput
            value={categoria}
            onChangeText={setCategoria}
            placeholder="Categoria (opcional)"
            placeholderTextColor="#94A3B8"
            className="mt-3 h-11 rounded-xl border border-slate-300 bg-slate-50 px-3 text-slate-900"
          />

          {erro ? (
            <View className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2">
              <Text className="text-rose-700" style={{ fontFamily: 'SofiaProRegular' }}>
                {erro}
              </Text>
            </View>
          ) : null}

          <Pressable
            onPress={handleSalvarTransacao}
            disabled={salvando}
            className="mt-4 h-11 items-center justify-center rounded-xl bg-slate-900"
          >
            <Text className="text-white" style={{ fontFamily: 'SofiaProBold' }}>
              {salvando ? 'Salvando...' : 'Salvar transação'}
            </Text>
          </Pressable>

          <Pressable onPress={() => router.back()} className="mt-2 h-11 items-center justify-center rounded-xl">
            <Text className="text-slate-600" style={{ fontFamily: 'SofiaProRegular' }}>
              Cancelar
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
