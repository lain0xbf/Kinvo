import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { ImageBackground, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

const fundo2 = require('../../assets/button.png');

export default function TabsLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,

        tabBarActiveTintColor: '#10B981',
        tabBarInactiveTintColor: '#64748B',

        tabBarStyle: {
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,

          overflow: 'visible',

          height: 78 + insets.bottom,
          paddingTop: 12,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 12,

          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,

          borderTopLeftRadius: 32,
          borderTopRightRadius: 32,

          borderTopColor: '#F1F5F9',

          shadowColor: '#0F172A',
          shadowOpacity: 0.08,
          shadowRadius: 18,
          shadowOffset: { width: 0, height: -6 },
          elevation: 12,
        },

        tabBarItemStyle: {
          paddingTop: 4,
        },

        tabBarLabelStyle: {
          fontSize: 11,
          fontFamily: 'SofiaProBold',
          marginTop: 1,
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
              size={23}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="extrato"
        options={{
          title: 'Transações',
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
                style={{
                  position: 'absolute',
                  top: -34,
                  height: 65,
                  width: 65,
                  borderRadius: 999,
                }}
              >
                <LinearGradient
                  colors={['#2EE6A6', '#18C58F', '#0fa596']}
                  start={{ x: 0, y: 0.2 }}
                  end={{ x: 1, y: 0.8 }}
                  style={{
                    flex: 1,
                    borderRadius: 999,
                    alignItems: 'center',
                    justifyContent: 'center',
                    shadowColor: '#10B981',
                    shadowOpacity: 0.18,
                    shadowRadius: 28,
                    shadowOffset: { width: 0, height: 12 },
                    elevation: 16,
                  }}
                >
                  <Ionicons name="add" size={30} color="#FFFFFF" />
                </LinearGradient>
              </Pressable>
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="relatorios"
        options={{
          title: 'Relatórios',
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
              size={23}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}