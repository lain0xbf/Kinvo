import { firestore } from '@/config/firebase';
import {
  addDoc,
  collection,
  onSnapshot,
  query,
  serverTimestamp,
  where,
  type DocumentData,
  type QueryDocumentSnapshot,
} from 'firebase/firestore';

export type TipoTransacao = 'receita' | 'despesa';

export type TransacaoFinanceira = {
  id: string;
  descricao: string;
  valor: number;
  tipo: TipoTransacao;
  categoria: string;
  data: string;
};

type RegistroBruto = {
  userId?: unknown;
  descricao?: unknown;
  valor?: unknown;
  tipo?: unknown;
  categoria?: unknown;
  data?: unknown;
};

export type NovaTransacao = {
  descricao: string;
  valor: number;
  tipo: TipoTransacao;
  categoria: string;
  data?: Date;
};

function normalizarNumero(valor: unknown): number {
  if (typeof valor === 'number' && Number.isFinite(valor)) return valor;
  if (typeof valor === 'string') {
    const numero = Number(valor);
    return Number.isFinite(numero) ? numero : 0;
  }
  return 0;
}

function normalizarTexto(valor: unknown, fallback: string): string {
  return typeof valor === 'string' && valor.trim() ? valor.trim() : fallback;
}

function normalizarTipo(valor: unknown): TipoTransacao {
  return valor === 'receita' ? 'receita' : 'despesa';
}

function normalizarData(valor: unknown): string {
  if (typeof valor === 'string' || typeof valor === 'number') {
    const data = new Date(valor);
    if (!Number.isNaN(data.getTime())) return data.toISOString();
  }

  if (typeof valor === 'object' && valor !== null && 'toDate' in valor) {
    const timestamp = valor as { toDate: () => Date };
    const data = timestamp.toDate();
    if (!Number.isNaN(data.getTime())) return data.toISOString();
  }

  return new Date().toISOString();
}

function mapearTransacao(documento: QueryDocumentSnapshot<DocumentData>): TransacaoFinanceira {
  const dados = documento.data() as RegistroBruto;

  return {
    id: documento.id,
    descricao: normalizarTexto(dados.descricao, 'Sem descrição'),
    valor: normalizarNumero(dados.valor),
    tipo: normalizarTipo(dados.tipo),
    categoria: normalizarTexto(dados.categoria, 'Geral'),
    data: normalizarData(dados.data),
  };
}

export function escutarTransacoes(
  userId: string,
  aoAtualizar: (lista: TransacaoFinanceira[]) => void,
  aoFalhar?: (erro: Error) => void
) {
  const referencia = query(collection(firestore, 'transacoes'), where('userId', '==', userId));

  return onSnapshot(
    referencia,
    (snapshot) => {
      const lista = snapshot.docs
        .map(mapearTransacao)
        .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
      aoAtualizar(lista);
    },
    (erro) => {
      if (aoFalhar) aoFalhar(erro as Error);
    }
  );
}

export async function criarTransacaoParaUsuario(userId: string, transacao: NovaTransacao) {
  await addDoc(collection(firestore, 'transacoes'), {
    userId,
    descricao: transacao.descricao.trim(),
    valor: transacao.valor,
    tipo: transacao.tipo,
    categoria: transacao.categoria.trim() || 'Geral',
    data: (transacao.data ?? new Date()).toISOString(),
    criadoEm: serverTimestamp(),
  });
}
