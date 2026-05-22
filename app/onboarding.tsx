import { LoadingScreen } from '@/components/ui/loading-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Asset } from 'expo-asset';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ImageBackground, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';

const fundo = require('../assets/fundo.webp');

export default function Onboarding() {
    const [carregouImagem, setCarregouImagem] = useState(false);

    useEffect(() => {
        async function carregarFundo() {
            await Asset.fromModule(fundo).downloadAsync();
            setCarregouImagem(true);
        }

        carregarFundo();
    }, []);


    async function finalizarOnboarding() {
        await AsyncStorage.setItem('@viu_onboarding', 'true');

        router.replace('/login');
    }

    if (!carregouImagem) {
        return <LoadingScreen />;
    }

    return (
        <ImageBackground
            source={fundo}
            className="flex-1"
            resizeMode="cover"
        >
            <StatusBar style="light" translucent backgroundColor="transparent" />
            <View className="absolute inset-0 bg-black/20" />
            <SafeAreaView className="flex-1">

                <View className="flex-1 justify-end px-6 pb-8">
                    <Text className="text-4xl font-bold text-white">
                        Controle seu dinheiro
                    </Text>

                    <Text className="mt-4 text-base leading-6 text-slate-300">
                        Acompanhe seus gastos, defina metas e tenha uma vida financeira mais saudável.
                    </Text>

                    <Pressable
                        onPress={finalizarOnboarding}
                        className="mt-8 overflow-hidden rounded-full"
                        style={{
                            shadowColor: '#10B981',
                            shadowOpacity: 0.22,
                            shadowRadius: 20,
                            shadowOffset: { width: 0, height: 10 },
                            elevation: 10,
                        }}
                    >
                        <LinearGradient
                            colors={['#2DD4BF', '#10B981', '#047857']}
                            start={{ x: 0, y: 0.2 }}
                            end={{ x: 1, y: 0.8 }}
                            style={{
                                paddingVertical: 16,
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: 999,
                            }}
                        >
                            <Text className="text-center text-lg font-bold text-slate-950">
                                Vamos começar
                            </Text>
                        </LinearGradient>
                    </Pressable>
                </View>
            </SafeAreaView>
        </ImageBackground>
    );
}