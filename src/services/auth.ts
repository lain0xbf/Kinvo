import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from 'firebase/auth';
import { auth } from '@/config/firebase';

export function escutarUsuarioAutenticado(
  aoAtualizar: (usuario: User | null) => void,
  aoFalhar?: (erro: Error) => void
) {
  return onAuthStateChanged(
    auth,
    (usuario) => aoAtualizar(usuario),
    (erro) => {
      if (aoFalhar) aoFalhar(erro as Error);
    }
  );
}

export async function entrarComEmailSenha(email: string, senha: string) {
  const credencial = await signInWithEmailAndPassword(auth, email.trim(), senha);
  return credencial.user;
}

export async function cadastrarComEmailSenha(email: string, senha: string) {
  const credencial = await createUserWithEmailAndPassword(auth, email.trim(), senha);
  return credencial.user;
}

export async function sairDaConta() {
  await signOut(auth);
}
