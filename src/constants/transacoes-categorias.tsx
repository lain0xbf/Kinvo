import { Ionicons } from '@expo/vector-icons';

export const categoriasTransacao = [
  { nome: 'Alimentação', icon: 'cart-outline' },
  { nome: 'Transporte', icon: 'bus-outline' },
  { nome: 'Moradia', icon: 'home-outline' },
  { nome: 'Saúde', icon: 'heart-outline' },
  { nome: 'Lazer', icon: 'game-controller-outline' },
  { nome: 'Educação', icon: 'school-outline' },
  { nome: 'Compras', icon: 'bag-outline' },
  { nome: 'Serviços', icon: 'construct-outline' },
  { nome: 'Outros', icon: 'ellipsis-horizontal' },
] as const satisfies ReadonlyArray<{
  nome: string;
  icon: keyof typeof Ionicons.glyphMap;
}>;