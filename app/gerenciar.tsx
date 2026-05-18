import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, ActivityIndicator, Pressable, TouchableOpacity } from 'react-native';
import { useFonts } from 'expo-font';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { router } from 'expo-router';
import { useRef } from 'react';


async function buscarTarefas() {
    const response = await api.get('/lembretes?numero=5521990555020');
    return response.data
        .slice()
        .sort(
            (a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        )
}

export default function Home() {
    const [fontsLoaded] = useFonts({
        SofiaProBold: require('../assets/fonts/SofiaProBold.otf'),
        SofiaProRegular: require('../assets/fonts/SofiaProRegular.otf'),
    });

    const navigatingRef = useRef(false);

    function handleGerenciar() {
        if (navigatingRef.current) return;

        navigatingRef.current = true;
        router.push('/gerenciar');

        setTimeout(() => {
            navigatingRef.current = false;
        }, 700);
    }

    const {
        data,
        isLoading,
        isFetching,
        isError,
        refetch,
    } = useQuery({
        queryKey: ['tarefas'],
        queryFn: buscarTarefas,
        refetchInterval: 10000,
    });


    if (!fontsLoaded || isLoading) {
        return (
            <View className="flex-1 items-center justify-center bg-slate-50">
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-gray-100" edges={['top']}>
            <View className='ml-6 mt-4'>
                <Pressable onPress={() => router.back()} className='px-5 bg-slate-600'>
                    <Text>Voltar</Text>
                </Pressable>
            </View>
            <View className='flex-1 justify-center'>
                <View className='items-center'>
                    <View>
                        {data?.map((item: any) => (
                            <Text key={item.id}>{item.message} ás {item.time}</Text>
                        ))}

                        <Text>{data?.length ?? 0}</Text>
                    </View>
                    <TouchableOpacity onPress={handleGerenciar} className='mt-4 px-4 py-2.5 bg-red-200'>
                        <Text className='text-base'>
                            Gerenciar
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}
