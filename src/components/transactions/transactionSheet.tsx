import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';
import { Modal, Pressable, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TransacaoFinanceira } from '@/services/transactions';
import { formatarMoeda } from '@/utils/finance';
import { SurfaceCard } from '../ui/surface-card';
import { AppText } from '../ui/app-text';
import { ActionButton } from '../ui/action-button';
import { useState } from 'react';

type Props = {
  visible: boolean;
  transaction: TransacaoFinanceira | null;
  onClose: () => void;
  onDelete?: () => Promise<void> | void;
  onEdit?: () => void;
};

export function TransactionSheet({ visible, transaction, onClose, onDelete, onEdit }: Props) {
  const [deletando, setDeletando] = useState(false);
  const [confirmandoExclusao, setConfirmandoExclusao] = useState(false);

  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();

  async function handleDelete() {
    if (!onDelete || deletando) return;

    setDeletando(true);

    try {
      await onDelete();
      setConfirmandoExclusao(false);
    } finally {
      setDeletando(false);
    }
  }

  function handleClose() {
    if (deletando) return;
    setConfirmandoExclusao(false);
    onClose();
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <View className="flex-1 bg-slate-950/40">
        <Pressable className="flex-1" onPress={handleClose} />

        <SurfaceCard
          variant="nightSheet"
          className="rounded-t-[28px] px-5 pt-4"
          style={{
            maxHeight: height * 0.85,
            paddingBottom: Math.max(insets.bottom + 12, 24),
          }}
        >
          <View className="mb-3 h-1.5 w-12 self-center rounded-full bg-white/20" />


          {confirmandoExclusao ? (
            <Animated.View
              key="confirmar-exclusao"
              entering={FadeInDown.duration(180)}
              exiting={FadeOutDown.duration(120)}
            >
              <View className="items-center">
                <View className="h-14 w-14 items-center justify-center rounded-full border border-rose-400/20 bg-rose-400/10">
                  <Ionicons name="trash-outline" size={24} color="#FB7185" />
                </View>

                <AppText
                  family="sofia"
                  variant="title"
                  weight="bold"
                  className="mt-4 text-center text-white"
                >
                  Excluir transação?
                </AppText>

                <AppText
                  family="inter"
                  variant="body"
                  className="mt-2 text-center text-slate-400"
                >
                  Essa ação remove o lançamento do seu histórico e não pode ser desfeita.
                </AppText>
              </View>

              <View className="mt-5 flex-row">
                <ActionButton
                  label="Cancelar"
                  variant="secondary"
                  disabled={deletando}
                  className="mr-2 flex-1 border-white/10 bg-white/5"
                  textClassName="text-slate-200"
                  onPress={() => setConfirmandoExclusao(false)}
                />

                <ActionButton
                  label={deletando ? 'Excluindo...' : 'Excluir'}
                  loading={deletando}
                  disabled={deletando}
                  className="ml-2 flex-1 border border-rose-400/20 bg-rose-500"
                  onPress={handleDelete}
                />
              </View>
            </Animated.View>
          ) : (
            <Animated.View
              key="detalhes-transacao"
              entering={FadeInDown.duration(140)}
              exiting={FadeOutDown.duration(100)}
            >
              <View className="items-center">
                <AppText
                  family="sofia"
                  variant="title"
                  numberOfLines={2}
                  weight="bold"
                  className="text-center text-white"
                >
                  {transaction?.descricao}
                </AppText>

                <AppText
                  family="inter"
                  variant="modalValor"
                  weight="bold"
                  className={transaction?.tipo === 'receita' ? 'mt-3 text-emerald-300' : 'mt-3 text-rose-300'}
                >
                  {transaction ? formatarMoeda(transaction.valor) : ''}
                </AppText>
              </View>

              <View className="mt-4 rounded-[20px] border border-white/10 bg-white/5 px-4 py-3">
                <View className="flex-row items-center justify-between">
                  <AppText variant="modalLabel" family="inter" className="text-slate-400">
                    Tipo
                  </AppText>

                  <AppText variant="body" family="inter" weight="bold" className="text-white">
                    {transaction?.tipo === 'receita' ? 'Receita' : 'Despesa'}
                  </AppText>
                </View>

                <View className="my-3 h-px bg-white/10" />

                <View className="flex-row items-center justify-between">
                  <AppText variant="modalLabel" family="inter" className="text-slate-400">
                    Categoria
                  </AppText>

                  <AppText variant="body" family="inter" weight="bold" className="text-white">
                    {transaction?.categoria || 'Sem categoria'}
                  </AppText>
                </View>
              </View>

              {onEdit ? (
                <ActionButton
                  label="Editar transação"
                  variant="ghost"
                  className="mt-4 border border-white/10 bg-white/5"
                  textClassName="text-slate-200"
                  onPress={onEdit}
                />
              ) : null}

              {onDelete ? (
                <ActionButton
                  label={deletando ? 'Excluindo...' : 'Excluir transação'}
                  loading={deletando}
                  disabled={deletando}
                  className={onEdit ? 'mt-2 border border-rose-400/20 bg-rose-500' : 'mt-4 border border-rose-400/20 bg-rose-500'}
                  onPress={() => setConfirmandoExclusao(true)}
                />
              ) : null}

              <ActionButton
                label="Fechar"
                variant="ghost"
                className={onDelete ? 'mt-2' : 'mt-4'}
                textClassName="text-slate-400"
                onPress={handleClose}
              />
            </Animated.View>
          )}
        </SurfaceCard>
      </View>
    </Modal>
  );
}