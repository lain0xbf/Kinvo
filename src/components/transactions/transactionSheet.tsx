import { Ionicons } from '@expo/vector-icons';
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

  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();

  async function handleDelete() {
    if (!onDelete || deletando) return;
    setDeletando(true);
    try {
      await onDelete();
    } finally {
      setDeletando(false);
    }
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 bg-slate-950/40">
        <Pressable className="flex-1" onPress={onClose} />

        <SurfaceCard
          className="rounded-t-[28px] px-5 pt-4"
          style={{ maxHeight: height * 0.85, paddingBottom: Math.max(insets.bottom + 12, 24) }}
        >
          <View className="mb-3 h-1.5 w-12 self-center rounded-full bg-slate-300" />

          <View className="items-center">
            <AppText family="sofia" variant="title" numberOfLines={2} weight="bold" className="text-center text-slate-900">
              {transaction?.descricao}
            </AppText>

            <AppText
              family='inter'
              variant="modalValor"
              weight="bold"
              className={transaction?.tipo === 'receita' ? 'mt-3 text-emerald-600' : 'mt-3 text-rose-600'}
            >
              {transaction ? formatarMoeda(transaction.valor) : ''}
            </AppText>
          </View>



          <View className="mt-4 rounded-[20px] bg-slate-50 px-4 py-3">
            <View className="flex-row items-center justify-between">
              <AppText variant="modalLabel" family='inter' className="text-slate-500">Tipo</AppText>
              <AppText variant="body" family='inter' weight="bold" className="text-slate-900">
                {transaction?.tipo === 'receita' ? 'Receita' : 'Despesa'}
              </AppText>
            </View>

            <View className="my-3 h-px bg-slate-200" />

            <View className="flex-row items-center justify-between">
              <AppText variant="modalLabel" family='inter' className="text-slate-500">Categoria</AppText>
              <AppText variant="body" family="inter" weight="bold" className="text-slate-900">
                {transaction?.categoria || 'Sem categoria'}
              </AppText>
            </View>
          </View>

          {onEdit ? (
            <ActionButton
              label="Editar transacao"
              variant="ghost"
              className="mt-4"
              onPress={onEdit}
            />
          ) : null}

          {onDelete ? (
            <ActionButton
              label={deletando ? 'Excluindo...' : 'Excluir transação'}
              loading={deletando}
              disabled={deletando}
              // icon={<Ionicons name="trash-outline" size={18} color="#FFFFFF" />}
              className={onEdit ? 'mt-2 bg-rose-600' : 'mt-4 bg-rose-600'}
              onPress={handleDelete}
            />
          ) : null}

          <ActionButton
            label="Fechar"
            variant="ghost"
            className={onDelete ? 'mt-2' : 'mt-4'} // 8 entre botões, 16 se for botão único
            onPress={onClose} />
        </SurfaceCard>
      </View>
    </Modal>
  );
}