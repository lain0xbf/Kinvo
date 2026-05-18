import '../../global.css';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';


type FavoriteCardProps = {
  title: string;
  subtitle: string;
  image?: string;
  rating?: number;
  onPress?: () => void;
  onToggleFavorite?: () => void;
};

export const offers = [
  { id: 1, title: "Summer Combo",    description: "Burger + fritas + refri", price: 32, originalPrice: 45, emoji: "🍔", bg: "#fff4ee", rating: 4.8, deliveryTime: "25 min", deliveryFee: "Entrega grátis", discount: "-15%" },
  { id: 2, title: "Pizza Party",     description: "Mussarela, calabresa",     price: 45, originalPrice: null, emoji: "🍕", bg: "#eef7f0", rating: 4.6, deliveryTime: "35 min", deliveryFee: "R$ 5,99",        discount: null },
  { id: 3, title: "Burrito Delight", description: "Frango, queijo, molho",    price: 28, originalPrice: 35, emoji: "🌯", bg: "#fef9ee", rating: 4.9, deliveryTime: "20 min", deliveryFee: "Entrega grátis", discount: "-20%" },
  { id: 4, title: "Burger Bash",     description: "Duplo, bacon, cheddar",    price: 38, originalPrice: null, emoji: "🍟", bg: "#f0f4ff", rating: 4.7, deliveryTime: "30 min", deliveryFee: "R$ 3,99",        discount: null },
];

export const promos = [
  {
    id: 1,
    tag: "MAIS PEDIDO",
    title: "Summer\nCombo",
    price: 32,
    emoji: "🍔",
    color: "#fff4ee",
    imageUrl: "https://firebasestorage.googleapis.com/v0/b/exlamce-8ea06.firebasestorage.app/o/favorites%2Fburger.png?alt=media",
  },
  {
    id: 2,
    tag: "MAIS PEDIDO",
    title: "Pizza\nParty",
    price: 45,
    emoji: "🍕",
    color: "#eef7f0",
    imageUrl: "https://firebasestorage.googleapis.com/v0/b/exlamce-8ea06.firebasestorage.app/o/favorites%2Fpizza.png?alt=media",
  },
  {
    id: 3,
    tag: "NOVO",
    title: "Burrito\nDelight",
    price: 28,
    emoji: "🌯",
    color: "#fef9ee",
    imageUrl: "https://firebasestorage.googleapis.com/v0/b/exlamce-8ea06.firebasestorage.app/o/favorites%2Fburitto.png?alt=media",
  },
];

export const FavoriteCard = ({
  title,
  subtitle,
  image,
  rating = 4.8,
  onPress,
  onToggleFavorite,
}: FavoriteCardProps) => {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      className="mb-4 overflow-hidden rounded-[28px] bg-white"
      style={{
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 8 },
        elevation: 4,
      }}>
      <View className="relative">
        {image ? (
          <Image source={{ uri: image }} className="h-20 w-full" resizeMode="cover" />
        ) : (
          <View className="h-20 w-full items-center justify-center bg-slate-200">
            <Ionicons name="image-outline" size={34} color="#94A3B8" />
          </View>
        )}

        <TouchableOpacity
          onPress={onToggleFavorite}
          activeOpacity={0.8}
          className="absolute right-3 top-3 h-10 w-10 items-center justify-center rounded-full bg-white"
          style={{
            shadowColor: '#000',
            shadowOpacity: 0.1,
            shadowRadius: 10,
            shadowOffset: { width: 0, height: 4 },
            elevation: 3,
          }}>
          <Ionicons name="heart" size={18} color="#70B9BE" />
        </TouchableOpacity>
        
      </View>

      <View className="p-4">
        <View className="flex-row items-start justify-between">
          <View className="flex-1 pr-3">
            <Text
              numberOfLines={1}
              className="text-base"
              style={{ fontFamily: 'SofiaProBold', color: '#0F172A' }}>
              {title}
            </Text>

            <Text
              numberOfLines={1}
              className="mt-1 text-sm"
              style={{ fontFamily: 'SofiaProRegular', color: '#64748B' }}>
              {subtitle}
            </Text>
          </View>

          <View className="flex-row items-center rounded-full bg-amber-50 px-2 py-1">
            <Ionicons name="star" size={14} color="#F59E0B" />
            <Text className="ml-1 text-xs" style={{ fontFamily: 'SofiaProBold', color: '#92400E' }}>
              {rating}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export const FavoriteCardCompact = ({
  title,
  subtitle,
  image,
  rating = 4.8,
  onPress,
  onToggleFavorite,
}: FavoriteCardProps) => {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      className="flex-row items-center overflow-hidden rounded-2xl bg-white px-3 py-3"
      style={{
        shadowColor: '#000',
        shadowOpacity: 0.07,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 3,
      }}>
      
      {/* Imagem à esquerda */}
      <View className="relative">
        {image ? (
          <Image
            source={{ uri: image }}
            className="h-16 w-16 rounded-xl"
            resizeMode="cover"
          />
        ) : (
          <View className="h-16 w-16 items-center justify-center rounded-xl bg-slate-100">
            <Ionicons name="image-outline" size={24} color="#94A3B8" />
          </View>
        )}
      </View>

      {/* Textos no centro */}
      <View className="ml-3 flex-1">
        <Text
          numberOfLines={1}
          className="text-sm"
          style={{ fontFamily: 'SofiaProBold', color: '#0F172A' }}>
          {title}
        </Text>
        <Text
          numberOfLines={1}
          className="mt-0.5 text-xs"
          style={{ fontFamily: 'SofiaProRegular', color: '#64748B' }}>
          {subtitle}
        </Text>
        <View className="mt-1.5 flex-row items-center gap-1">
          <Ionicons name="star" size={11} color="#F59E0B" />
          <Text className="text-xs" style={{ fontFamily: 'SofiaProBold', color: '#92400E' }}>
            {rating}
          </Text>
        </View>
      </View>

      {/* Botão coração à direita */}
      <TouchableOpacity
        onPress={onToggleFavorite}
        activeOpacity={0.8}
        className="ml-2 h-8 w-8 items-center justify-center rounded-full bg-slate-50">
        <Ionicons name="heart" size={16} color="#70B9BE" />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

export const MenuButton = ({ icon, label, onPress, danger }: any) => (
  <TouchableOpacity
    onPress={onPress}
    className="mb-2 flex-row items-center rounded-3xl bg-slate-50 p-5 active:bg-slate-100">
    <Ionicons name={icon} size={20} color={danger ? '#ef4444' : '#64748b'} />
    <Text className={`ml-4 flex-1 font-bold ${danger ? 'text-red-500' : 'text-slate-600'}`}>
      {label}
    </Text>
    <Ionicons name="chevron-forward" size={16} color="#cbd5e1" />
  </TouchableOpacity>
);
