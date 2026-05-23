import { Ionicons } from '@expo/vector-icons';
import { Modal, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TransacaoFinanceira } from '@/services/transactions';
import { formatarMoeda } from '@/utils/finance';
import { SurfaceCard } from '../ui/surface-card';
import { AppText } from '../ui/app-text';
import { ActionButton } from '../ui/action-button';

type Props = {
  visible: boolean;
  transaction: TransacaoFinanceira | null;
  onClose: () => void;
  onDelete?: () => Promise<void> | void;
};

export function TransactionSheet({ visible, transaction, onClose, onDelete }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 bg-slate-950/45">
        <Pressable className="flex-1" onPress={onClose} />

        <SurfaceCard
          className="rounded-t-[28px] px-5 pt-4"
          style={{ paddingBottom: Math.max(insets.bottom + 12, 24) }}
        >
          <View className="mb-3 h-1.5 w-12 self-center rounded-full bg-slate-300" />

          <View className="items-center">
            <AppText family="sofia" variant="title" weight="bold" className="mt-1 text-center text-slate-950">
              {transaction?.descricao}
            </AppText>

            <AppText
              variant="display"
              weight="bold"
              className={transaction?.tipo === 'receita' ? 'mt-3 text-emerald-600' : 'mt-3 text-rose-600'}
            >
              {transaction ? formatarMoeda(transaction.valor) : ''}
            </AppText>
          </View>

          <View className="mt-5 rounded-[20px] bg-slate-50 px-4 py-3">
            <View className="flex-row items-center justify-between">
              <AppText variant="caption" className="text-slate-500">Tipo</AppText>
              <AppText variant="caption" weight="bold" className="text-slate-800">
                {transaction?.tipo === 'receita' ? 'Receita' : 'Despesa'}
              </AppText>
            </View>

            <View className="mt-3 flex-row items-center justify-between">
              <AppText variant="caption" className="text-slate-500">Categoria</AppText>
              <AppText variant="caption" weight="bold" className="text-slate-800">
                {transaction?.categoria || 'Sem categoria'}
              </AppText>
            </View>
          </View>

          {onDelete ? (
            <ActionButton
              label="Excluir transação"
              icon={<Ionicons name="trash-outline" size={18} color="#FFFFFF" />}
              className="mt-5 bg-rose-600"
              onPress={onDelete}
            />
          ) : null}

          <ActionButton label="Fechar" variant="ghost" className="mt-2" onPress={onClose} />
        </SurfaceCard>
      </View>
    </Modal>
  );
}