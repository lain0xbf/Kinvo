import type { TransacaoFinanceira } from '@/services/transactions';

export type ResumoFinanceiro = {
  saldo: number;
  receitas: number;
  despesas: number;
};

export function formatarMoeda(valor: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor);
}

export function calcularResumoFinanceiro(transacoes: TransacaoFinanceira[]): ResumoFinanceiro {
  return transacoes.reduce(
    (acumulador, item) => {
      if (item.tipo === 'receita') {
        acumulador.receitas += item.valor;
        acumulador.saldo += item.valor;
      } else {
        acumulador.despesas += item.valor;
        acumulador.saldo -= item.valor;
      }
      return acumulador;
    },
    { saldo: 0, receitas: 0, despesas: 0 }
  );
}

export function obterUltimaTransacao(transacoes: TransacaoFinanceira[]) {
  if (!transacoes.length) {
    return null;
  }

  return [...transacoes].sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())[0];
}
