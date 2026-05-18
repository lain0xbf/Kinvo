import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, ActivityIndicator } from 'react-native';
import { useFonts } from 'expo-font';
import { useEffect, useState, useMemo, useCallback } from 'react';
import { database } from '@/config/firebase';
import { ref, onValue, query, orderByKey, endBefore } from "firebase/database";
import { Lista } from '@/components/Lista';


type Usuario = {
  idUsuario: string;
  idFerias: string;
  nome: string;
  comentario?: string;
  dataHoraCadastrado?: string;
  numDias?: number;
};

const usuariosNome: any = {
  '01102624764011': { nome: 'Humberto' },
  '07934781709079': { nome: 'Marco' },
  '10016227743100': { nome: 'Patrick' },
  '12989939709129': { nome: 'João Carlos' },
  '13519019744135': { nome: 'Diego' },
  '15120398707151': { nome: 'Patrick Amorim' },
  '18104569759181': { nome: 'Maria Apolinário' },
  '20171660730201': { nome: 'João Pedro' },
  '70424551772704': { nome: 'Luis Fernando' },
};
const db = database;

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

export default function Home() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [filtro, setFiltro] = useState<'todos' | 'pendentes' | 'finalizados'>('pendentes');
  const [loading, setLoading] = useState(true);
  const [fontsLoaded] = useFonts({
    SofiaProBold: require('../../assets/fonts/SofiaProBold.otf'),
    SofiaProRegular: require('../../assets/fonts/SofiaProRegular.otf'),
  });

  const agora = Date.now();

  useEffect(() => {
    setLoading(true);
    const dbRef = query(ref(db, 'horarios/'), orderByKey(), endBefore('99999999999999'));
    const unsubscribe = onValue(dbRef, (snapshot) => {

      const data = snapshot.val();

      if (!data) {
        setUsuarios([]);
        setLoading(false);
        return;
      }

      const lista = Object.entries(data).flatMap(([idUsuario, usuario]: any) => {
        return Object.entries(usuario)
          .filter(([idFerias, ferias]: any) => {
            const ano = new Date(ferias.dataHoraCadastrado).getFullYear();
            return ferias.status === 7 && ano === 2026;
          })
          .map(([idFerias, ferias]: any) => ({
            id: `${idUsuario}-${idFerias}`,
            idUsuario,
            idFerias,

            nome: usuariosNome[idUsuario]?.nome ?? 'Sem nome',


            ...ferias,
          }));
      }).sort((a: any, b: any) => {
        const statusA = getStatusFerias(
          a.dataHoraCadastrado,
          a.numDias,
          agora
        );

        const statusB = getStatusFerias(
          b.dataHoraCadastrado,
          b.numDias,
          agora
        );

        const ordemStatus: any = {
          'em-ferias': 0,
          pendente: 1,
          finalizado: 2,
        };

        if (ordemStatus[statusA] !== ordemStatus[statusB]) {
          return ordemStatus[statusA] - ordemStatus[statusB];
        }

        return (
          new Date(a.dataHoraCadastrado).getTime() -
          new Date(b.dataHoraCadastrado).getTime()
        );
      });

      setUsuarios(lista);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [])



  const usuariosFiltrados = useMemo(() => {
    return usuarios.filter((item) => {
      const status = getStatusFerias(item.dataHoraCadastrado, item.numDias, agora);

      if (filtro === 'pendentes') {
        return status === 'pendente' || status === 'em-ferias';
      }
      if (filtro === 'finalizados') return status === 'finalizado';

      return true;
    });
  }, [usuarios, filtro]);

  const handleSetFiltro = useCallback((novoFiltro: 'pendentes' | 'todos' | 'finalizados') => {
    setFiltro(novoFiltro);
  }, []);

  if (!fontsLoaded || loading) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-100 px-6">
        <ActivityIndicator size="large" color="#334155" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-100" edges={['top', 'left', 'right']}>
      <View className="flex-1 px-4 pb-4 pt-3">
        <View className="mb-4 rounded-2xl border border-slate-200 bg-white px-4 py-4">
          <Text
            className="text-[12px] uppercase tracking-[0.8px] text-slate-500"
            style={{ fontFamily: 'SofiaProRegular' }}
          >
            Gestão de férias
          </Text>
          <Text
            className="mt-1 text-[27px] leading-[32px] tracking-[-0.2px] text-slate-900"
            style={{ fontFamily: 'SofiaProBold' }}
          >
            Equipe - TIC
          </Text>
{/*           <Text
            className="mt-1 text-sm leading-5 text-slate-600"
            style={{ fontFamily: 'SofiaProRegular' }}
          >
            Acompanhe os periodos planejados e em andamento do time.
          </Text> */}
        </View>

        <View className="flex-1">
          <Lista
            usuariosFiltrados={usuariosFiltrados}
            filtro={filtro}
            onChangeFiltro={handleSetFiltro}
            agora={agora}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
