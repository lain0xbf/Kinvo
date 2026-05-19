import { useEffect, useState } from 'react';
import { escutarUsuarioAutenticado } from '@/services/auth';
import { escutarTransacoes, type TransacaoFinanceira } from '@/services/transactions';

export function useAuthenticatedTransactions() {
  const [transacoes, setTransacoes] = useState<TransacaoFinanceira[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [authResolvida, setAuthResolvida] = useState(false);

  useEffect(() => {
    const cancelarAuth = escutarUsuarioAutenticado((usuario) => {
      if (!usuario) {
        setUserId(null);
        setTransacoes([]);
        setAuthResolvida(true);
        setCarregando(false);
        return;
      }

      setUserId(usuario.uid);
      setAuthResolvida(true);
    });

    return () => cancelarAuth();
  }, []);

  useEffect(() => {
    if (!userId) return;

    setCarregando(true);
    setErro(null);

    const cancelar = escutarTransacoes(
      userId,
      (lista) => {
        setTransacoes(lista);
        setCarregando(false);
      },
      () => {
        setErro('Nao foi possivel carregar as transacoes.');
        setCarregando(false);
      }
    );

    return () => cancelar();
  }, [userId]);

  return {
    authResolvida,
    carregando,
    erro,
    transacoes,
    userId,
  };
}
