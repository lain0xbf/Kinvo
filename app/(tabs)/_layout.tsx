import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';


export default function TabsLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,

        tabBarActiveTintColor: '#34D399',
        tabBarInactiveTintColor: '#64748B',

        tabBarStyle: {
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,

          overflow: 'visible',

          height: 76 + insets.bottom,

          paddingTop: 10,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 12,

          backgroundColor: '#020617',
          borderTopWidth: 1,
          borderTopColor: 'rgba(255,255,255,0.10)',

          borderTopLeftRadius: 32,
          borderTopRightRadius: 32,

          shadowColor: '#000000',
          shadowOpacity: 0.22,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: -4 },
          elevation: 6,
        },

        tabBarItemStyle: {
          paddingTop: 4,
        },

        tabBarLabelStyle: {
          fontSize: 12,
          lineHeight: 16,
          fontFamily: 'InterBold',
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Início',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'home' : 'home-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="relatorios"
        options={{
          title: 'Relatorios',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'pie-chart' : 'pie-chart-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="nova-despesa"
        options={{
          title: '',
          tabBarLabel: '',
          tabBarIcon: () => null,
          tabBarButton: ({ onPress }) => (
            <View className="flex-1 items-center">
              <Pressable
                onPress={onPress}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                style={{
                  position: 'absolute',
                  top: -34,
                  height: 65,
                  width: 65,
                  borderRadius: 999,
                }}
              >
                <LinearGradient
                  colors={['#34D399', '#10B981', '#047857']}

                  start={{ x: 0, y: 0.2 }}
                  end={{ x: 1, y: 0.8 }}
                  style={{
                    flex: 1,
                    borderRadius: 999,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Ionicons name="add" size={28} color="#020617" />
                </LinearGradient>
              </Pressable>
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="extrato"
        options={{
          title: 'Extrato',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'bar-chart' : 'bar-chart-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="perfil"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'person' : 'person-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}