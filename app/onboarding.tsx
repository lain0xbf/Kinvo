import { LoadingScreen } from '@/components/ui/loading-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Asset } from 'expo-asset';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ImageBackground, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

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
                        className="mt-8 rounded-full bg-emerald-400 py-4"
                    >
                        <Text className="text-center text-lg font-bold text-slate-950">
                            Vamos começar
                        </Text>
                    </Pressable>
                </View>
            </SafeAreaView>
        </ImageBackground>
    );
}