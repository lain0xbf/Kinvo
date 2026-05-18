import { auth } from "@/config/firebase";
import { CarteiraModal } from "@/modais/carteiraModal";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { signOut } from "firebase/auth";
import { useState } from "react";
import { TouchableOpacity, View, Text } from "react-native";

type ModalProps = {
    userName: string | null;
}

async function handleLogout() {
    await signOut(auth);
    router.replace('/(auth)/login');
}

export function MenuPerfil({ userName }: ModalProps) {
    return (
        <View className="mx-6 mt-6 mb-8 rounded-3xl bg-white shadow-sm shadow-slate-200 overflow-hidden">

            {/* Item: Chats */}
            <TouchableOpacity className="flex-row items-center justify-between px-4 py-4">
                <View className="flex-row items-center">
                    <Ionicons name="chatbubbles-outline" size={24} color="#0A2533" />
                    <View className="ml-3">
                        <Text style={{ fontFamily: 'SofiaProBold', color: '#0A2533' }} className="text-sm">Chats</Text>
                        <Text style={{ fontFamily: 'SofiaProRegular', color: '#748189' }} className="text-xs">Minhas conversas</Text>
                    </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#748189" />
            </TouchableOpacity>

            <View className="h-px bg-slate-100 mx-4" />

            {/* Item: Notificações */}
            <TouchableOpacity className="flex-row items-center justify-between px-4 py-4">
                <View className="flex-row items-center">
                    <Ionicons name="notifications-outline" size={24} color="#0A2533" />
                    <View className="ml-3">
                        <Text style={{ fontFamily: 'SofiaProBold', color: '#0A2533' }} className="text-sm">Notificações</Text>
                        <Text style={{ fontFamily: 'SofiaProRegular', color: '#748189' }} className="text-xs">Minha central de notificações</Text>
                    </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#748189" />
            </TouchableOpacity>

            <View className="h-px bg-slate-100 mx-4" />

            {/* Item: Carteira */}
            <CarteiraModal userName={userName} />

            <View className="h-px bg-slate-100 mx-4" />

            {/* Item: Clube (com badge NOVO!) */}
            <TouchableOpacity className="flex-row items-center justify-between px-4 py-4">
                <View className="flex-row items-center">
                    <Ionicons name="ribbon-outline" size={24} color="#0A2533" />
                    <View className="ml-3">
                        <Text style={{ fontFamily: 'SofiaProBold', color: '#0A2533' }} className="text-sm">Clube</Text>
                        <Text style={{ fontFamily: 'SofiaProRegular', color: '#748189' }} className="text-xs">Meus pacotes de desconto</Text>
                    </View>
                </View>
                <View className="flex-row items-center gap-2">
                    <View className="rounded-full bg-red-500 px-2 py-0.5">
                        <Text style={{ fontFamily: 'SofiaProBold' }} className="text-xs text-white">NOVO!</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#748189" />
                </View>
            </TouchableOpacity>

            <View className="h-px bg-slate-100 mx-4" />

            {/* Item: Cupons */}
            <TouchableOpacity className="flex-row items-center justify-between px-4 py-4">
                <View className="flex-row items-center">
                    <Ionicons name="pricetag-outline" size={24} color="#0A2533" />
                    <View className="ml-3">
                        <Text style={{ fontFamily: 'SofiaProBold', color: '#0A2533' }} className="text-sm">Cupons</Text>
                        <Text style={{ fontFamily: 'SofiaProRegular', color: '#748189' }} className="text-xs">Meus cupons de desconto</Text>
                    </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#748189" />
            </TouchableOpacity>

            <View className="h-px bg-slate-100 mx-4" />

            {/* Item: Sair */}
            <TouchableOpacity
                className="flex-row items-center justify-between px-4 py-4"
                onPress={handleLogout}>
                <View className="flex-row items-center">
                    <Ionicons name="log-out-outline" size={24} color="#EA1D2C" />
                    <View className="ml-3">
                        <Text style={{ fontFamily: 'SofiaProBold', color: '#EA1D2C' }} className="text-sm">
                            Sair da conta
                        </Text>
                    </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#748189" />
            </TouchableOpacity>

        </View>
    )
}