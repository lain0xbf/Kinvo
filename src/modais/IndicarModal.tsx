import { Ionicons } from "@expo/vector-icons";
import { Modal, Pressable, TouchableWithoutFeedback, View, Text, TouchableOpacity } from "react-native";

type ModalProps = {
    userName: string | null;
    modalVisible: boolean;
    onSetVisible: (text: boolean) => void;
}

export function IndicarModal({ userName, modalVisible, onSetVisible }: ModalProps) {
    return (
        <>
            <TouchableOpacity className="mx-6 mt-4 flex-row items-center justify-between rounded-3xl bg-white p-4 shadow-sm shadow-slate-200"
                onPress={() => (onSetVisible(true))}>
                <View className="flex-row items-center">
                    <Ionicons name="gift-outline" size={28} color="#EA1D2C" />
                    <View className="ml-3">
                        <Text style={{ fontFamily: 'SofiaProBold', color: '#0A2533' }} className="text-sm">
                            Ganhe R$ 10 indicando o app
                        </Text>
                        <Text style={{ fontFamily: 'SofiaProRegular', color: '#748189' }} className="text-xs">
                            Convide seus amigos
                        </Text>
                    </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#748189" />
            </TouchableOpacity>
            <Modal
                visible={modalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => onSetVisible(false)}
            >
                <TouchableWithoutFeedback onPress={() => onSetVisible(false)}>
                    <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
                        <TouchableWithoutFeedback>
                            <View style={{ backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingBottom: 32 }}>

                                {/* DRAG HANDLE */}
                                <View style={{ alignItems: 'center', paddingTop: 12, paddingBottom: 8 }}>
                                    <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: '#D1D5DB' }} />
                                </View>

                                {/* CLOSE BUTTON */}
                                <Pressable
                                    onPress={() => onSetVisible(false)}
                                    style={{ position: 'absolute', top: 16, right: 20, zIndex: 10 }}
                                >
                                    <Ionicons name="close" size={24} color="#748189" />
                                </Pressable>

                                {/* HEADER */}
                                <View style={{ alignItems: 'center', paddingHorizontal: 24, paddingTop: 8 }}>
                                    <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: '#FEF2F2', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                                        <Ionicons name="gift" size={32} color="#EA1D2C" />
                                    </View>
                                    <Text style={{ fontFamily: 'SofiaProBold', fontSize: 20, color: '#0A2533', textAlign: 'center' }}>
                                        Indique amigos e ganhe R$ 10
                                    </Text>
                                    <Text style={{ fontFamily: 'SofiaProRegular', fontSize: 14, color: '#748189', textAlign: 'center', marginTop: 6, lineHeight: 20 }}>
                                        Para cada amigo que fizer o primeiro pedido, vocês dois ganham R$ 10 de desconto!
                                    </Text>
                                </View>

                                {/* REFERRAL CODE */}
                                <View style={{ marginHorizontal: 24, marginTop: 20, borderWidth: 1.5, borderColor: '#E5E7EB', borderStyle: 'dashed', borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14 }}>
                                    <View>
                                        <Text style={{ fontFamily: 'SofiaProRegular', fontSize: 11, color: '#748189', textTransform: 'uppercase', letterSpacing: 1 }}>
                                            Seu código
                                        </Text>
                                        <Text style={{ fontFamily: 'SofiaProBold', fontSize: 18, color: '#0A2533', marginTop: 2 }}>
                                            {userName ? userName.toUpperCase().replace(/\s/g, '').slice(0, 6) + '10' : 'AMIGO10'}
                                        </Text>
                                    </View>
                                    <TouchableOpacity style={{ backgroundColor: '#FEF2F2', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 }}>
                                        <Text style={{ fontFamily: 'SofiaProBold', fontSize: 13, color: '#EA1D2C' }}>Copiar</Text>
                                    </TouchableOpacity>
                                </View>

                                {/* STEPS */}
                                <View style={{ marginHorizontal: 24, marginTop: 20, gap: 14 }}>
                                    {[
                                        { icon: 'paper-plane-outline' as const, text: 'Compartilhe seu código com amigos' },
                                        { icon: 'cart-outline' as const, text: 'Seu amigo faz o primeiro pedido' },
                                        { icon: 'cash-outline' as const, text: 'Vocês dois recebem R$ 10 de cupom' },
                                    ].map((step, i) => (
                                        <View key={i} style={{ flexDirection: 'row', alignItems: 'center' }}>
                                            <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#F8FAFC', alignItems: 'center', justifyContent: 'center' }}>
                                                <Ionicons name={step.icon} size={18} color="#EA1D2C" />
                                            </View>
                                            <Text style={{ fontFamily: 'SofiaProRegular', fontSize: 14, color: '#0A2533', marginLeft: 12, flex: 1 }}>
                                                {step.text}
                                            </Text>
                                        </View>
                                    ))}
                                </View>

                                {/* SHARE BUTTON */}
                                <TouchableOpacity
                                    style={{ marginHorizontal: 24, marginTop: 24, backgroundColor: '#EA1D2C', paddingVertical: 16, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                                    activeOpacity={0.85}
                                >
                                    <Ionicons name="share-social-outline" size={20} color="#fff" />
                                    <Text style={{ fontFamily: 'SofiaProBold', fontSize: 16, color: '#fff' }}>
                                        Compartilhar convite
                                    </Text>
                                </TouchableOpacity>

                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </>
    )
}