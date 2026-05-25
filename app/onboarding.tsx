import { LoadingScreen } from '@/components/ui/loading-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Asset } from 'expo-asset';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ImageBackground, Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { AppText } from '@/components/ui/app-text';

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
                    <AppText family="sofia" weight="bold" variant="display" className="text-white">
                        Controle seu dinheiro
                    </AppText>

                    <AppText family="inter" weight="regular" variant="subLogin" className="mt-4 text-slate-300">
                        Acompanhe seus gastos, defina metas e tenha uma vida financeira mais saudável.
                    </AppText>

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
                                minHeight: 58,
                                borderRadius: 24,
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <AppText family="sofia" weight="bold" variant="cta" className="text-center text-slate-950">
                                Vamos começar
                            </AppText>
                        </LinearGradient>
                    </Pressable>
                </View>
            </SafeAreaView>
        </ImageBackground>
    );
}