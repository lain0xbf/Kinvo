import { Pressable, View, Text, TextInput, FlatList } from "react-native";
import { Feather, Ionicons } from '@expo/vector-icons';
import { PromoCard } from '@/components/PromoCard';
import { SkeletonCard } from '@/components/SkeletonCard';
import { promos } from '@/components/componentes';


type Header = {
    search: string;
    onSearchChange: (text: string) => void;
    name: string;
    loading: boolean;
}

function obterPeriodoDia(): 'Bom dia' | 'Boa tarde' | 'Boa noite' {
  const hour = parseInt(
    new Intl.DateTimeFormat('pt-BR', {
      hour: 'numeric',
      hour12: false,
      timeZone: 'America/Sao_Paulo',
    }).format(new Date())
  );

  if (hour >= 6 && hour < 12) return 'Bom dia';
  if (hour >= 12 && hour < 18) return 'Boa tarde';
  return 'Boa noite'; // cobre 18–5h (madrugada inclusa)
}

function primeiroNome(name: string) {
  if (!name) return null;
  return name.split(' ')[0];
}

export function Header({name, search, onSearchChange, loading}: Header){
    return(
        <View className="px-4">
            <View className="pt-4 pb-4 flex-row items-center justify-between">
      <View>
        <Text className="text-xs text-gray-400 font-medium tracking-wider" style={{ fontFamily: 'SofiaProRegular' }}>
          Olá {primeiroNome(name)}, {obterPeriodoDia()} 👋
        </Text>
        <Text className="text-2xl font-semibold text-gray-900 mt-0.5 tracking-tight" style={{ fontFamily: 'SofiaProBold' }}>
          O que vai ser hoje?
        </Text>
      </View>

      <Pressable className="relative">
        <View className="w-11 h-11 rounded-3xl bg-[#181C2E] items-center justify-center">
          <Ionicons name="bag-handle-outline" size={20} color="#fff" />
        </View>
        <View className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-orange-600 items-center justify-center">
          <Text className="text-white font-semibold" style={{ fontSize: 9 }}>
            2
          </Text>
        </View>
      </Pressable>
    </View>

        <View
      className="flex-row items-center gap-x-2 bg-white rounded-2xl px-4 mb-4 border border-gray-100"
      style={{
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.04,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 1 },
      }}
    >
      <Feather name="search" size={16} color="#ccc" />
      <TextInput
        className="flex-1 text-sm text-gray-700 py-3"
        placeholder="Buscar um prato..."
        placeholderTextColor="#d1d5db"
        value={search}
        onChangeText={onSearchChange}
      />
    </View>

        {loading ? (
          <View style={{ flexDirection: 'row' }}>
            {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
          </View>
        ) : (
          <FlatList
            data={promos}
            horizontal
            keyExtractor={(promo) => promo.id.toString()}
            showsHorizontalScrollIndicator={false}
            nestedScrollEnabled
            contentContainerStyle={{ columnGap: 12, paddingBottom: 16, paddingTop: 4 }}
            renderItem={({ item: promo }) => 
              <PromoCard promo={promo} />
            }
          />
        )}
    
        <Text className="text-base font-bold text-gray-900 mt-2 mb-2">Destaques pra você</Text>
    </View>
    )
}