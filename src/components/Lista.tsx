import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { FlatList, TouchableOpacity, View, Text } from 'react-native';

type Usuario = {
    idUsuario: string;
    idFerias: string;
    nome: string;
    numDias?: number;
    comentario?: string;
    dataHoraCadastrado?: string;
};

type Filtro = 'todos' | 'pendentes' | 'finalizados';

type ListaProps = {
    usuariosFiltrados: Usuario[];
    filtro: 'todos' | 'pendentes' | 'finalizados';
    onChangeFiltro: (filtro: 'todos' | 'pendentes' | 'finalizados') => void;
    agora: number;
};

function getTime(data?: string | number) {
    return data ? new Date(data).getTime() : 0;
}

function getStatusFerias(data?: string, numDias = 0, agora = Date.now()) {
    if (!data) return 'sem-data';

    const inicio = new Date(data).getTime();
    const fim = inicio + numDias * 24 * 60 * 60 * 1000;

    if (agora < inicio) return 'pendente';
    if (agora >= inicio && agora <= fim) return 'em-ferias';

    return 'finalizado';
}



function ListaComponente({
    usuariosFiltrados,
    filtro,
    onChangeFiltro,
    agora,
}: ListaProps) {


    return (
        <View className="flex-1 rounded-2xl bg-slate-100 px-2 pt-2">
            <View className="mb-3 flex-row rounded-2xl border border-slate-200 bg-slate-50 p-1.5">
                {(['pendentes', 'todos', 'finalizados'] as const).map((opcao) => {
                    const ativo = filtro === opcao;

                    return (
                        <TouchableOpacity
                            key={opcao}
                            onPress={() => {
                                onChangeFiltro(opcao);
                            }}
                            activeOpacity={0.85}
                            className={
                                ativo
                                    ? 'h-11 flex-1 items-center justify-center rounded-xl border border-slate-300 bg-white px-4'
                                    : 'h-11 flex-1 items-center justify-center rounded-xl px-4'
                            }
                        >
                            <Text
                                className={
                                    ativo
                                        ? 'text-center text-[13px] text-slate-900'
                                        : 'text-center text-[13px] text-slate-500'
                                }
                                style={{
                                    fontFamily: ativo ? 'SofiaProBold' : 'SofiaProRegular',
                                }}
                            >
                                {opcao === 'todos'
                                    ? 'Todos'
                                    : opcao === 'pendentes'
                                        ? 'Pendentes'
                                        : 'Finalizados'}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>

            <FlatList
                data={usuariosFiltrados}
                keyExtractor={(item) => `${item.idUsuario}-${item.idFerias}`}
                showsVerticalScrollIndicator={false}
                initialNumToRender={8}
                maxToRenderPerBatch={5}
                windowSize={5}
                removeClippedSubviews
                contentContainerStyle={{
                    paddingTop: 8,
                    paddingBottom: 56,
                }}
                style={{ flex: 1 }}
                renderItem={({ item }) => {
                    const status = getStatusFerias(item.dataHoraCadastrado, item.numDias, agora);
                    const jaPassou = status === 'finalizado';
                    const emFerias = status === 'em-ferias';
                    const dataInicio = item.dataHoraCadastrado
                        ? new Date(item.dataHoraCadastrado)
                        : null;

                    const dataFim = dataInicio
                        ? new Date(
                            dataInicio.getTime() +
                            (item.numDias ?? 0) * 24 * 60 * 60 * 1000
                        )
                        : null;

                    return (
                        <View className="mb-3 rounded-2xl border border-slate-200 bg-white px-4 py-4">
                            <View className="flex-row items-center justify-between">
                                <View className="mr-3 flex-1" style={{ minWidth: 0 }}>
                                    <Text
                                        className={
                                            jaPassou
                                                ? 'text-[16px] text-slate-400 line-through'
                                                : 'text-[16px] text-slate-900'
                                        }
                                        style={{ fontFamily: 'SofiaProBold' }}
                                        numberOfLines={1}
                                    >
                                        {item.nome}
                                    </Text>
                                </View>

                                <View
                                    className={
                                        emFerias
                                            ? 'h-7 rounded-full border border-blue-100 bg-blue-50/60 px-3'
                                            : jaPassou
                                                ? 'h-7 rounded-full border border-slate-200 bg-slate-100/80 px-3'
                                                : 'h-7 rounded-full border border-emerald-100 bg-emerald-50/60 px-3'
                                    }
                                    style={{ justifyContent: 'center' }}
                                >
                                    <Text
                                        className={
                                            emFerias
                                                ? 'text-[10px] text-blue-600'
                                                : jaPassou
                                                    ? 'text-[10px] text-slate-500'
                                                    : 'text-[10px] text-emerald-600'
                                        }
                                        style={{ fontFamily: 'SofiaProRegular' }}
                                    >
                                        {emFerias
                                            ? 'Em férias'
                                            : jaPassou
                                                ? 'Finalizado'
                                                : 'Férias Pendente'}
                                    </Text>
                                </View>
                            </View>

                            <View className="mt-2.5 flex-row items-center justify-between">
                                <View className="mr-3 flex-row items-center" style={{ flexShrink: 1 }}>
                                    <Ionicons
                                        name="calendar-outline"
                                        size={14}
                                        color="#94A3B8"
                                    />

                                    <Text
                                        className="ml-1.5 text-[14px] text-slate-800"
                                        style={{ fontFamily: 'SofiaProRegular' }}
                                    >
                                        {item.dataHoraCadastrado
                                            ? new Date(item.dataHoraCadastrado).toLocaleDateString(
                                                'pt-BR',
                                                {
                                                    day: '2-digit',
                                                    month: '2-digit',
                                                }
                                            )
                                            : 'Sem data'}
                                    </Text>
                                    <Ionicons
                                        style={{ marginLeft: 6 }}
                                        name="arrow-forward"
                                        size={12}
                                        color="#94A3B8"
                                    />

                                    <Text
                                        className="ml-1.5 text-[14px] text-slate-800"
                                        style={{ fontFamily: 'SofiaProRegular' }}
                                    >
                                        {dataFim?.toLocaleDateString('pt-BR', {
                                            day: '2-digit',
                                            month: '2-digit',
                                        })}
                                    </Text>
                                </View>

                                <Text
                                    className="ml-3 w-28 text-right text-[12px] text-slate-400 opacity-80"
                                    style={{ fontFamily: 'SofiaProRegular' }}
                                    numberOfLines={1}
                                >
                                    {item.comentario ?? 'Sem comentário'}
                                </Text>
                            </View>
                        </View>
                    );
                }}
            />
        </View>
    );
}

export const Lista = React.memo(ListaComponente);
