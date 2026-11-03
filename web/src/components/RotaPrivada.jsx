'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useAuth from '@/hooks/useAuth';

// Protege rotas internas: sem sessão vai para /login; sem o `cargo` exigido,
// para /403. Enquanto a sessão carrega, mostra uma tela neutra.
export default function RotaPrivada({ children, cargo }) {
  const { autenticado, carregando, usuario } = useAuth();
  const router = useRouter();

  const semPermissao = cargo && usuario?.cargo !== cargo;

  useEffect(() => {
    if (carregando) return;
    if (!autenticado) {
      router.replace('/login');
      return;
    }
    if (semPermissao) {
      router.replace('/403');
    }
  }, [carregando, autenticado, semPermissao, router]);

  if (carregando) {
    return <div className="carregando-tela">Carregando...</div>;
  }

  if (!autenticado || semPermissao) {
    // Não renderiza o conteúdo enquanto o redirecionamento acontece.
    return null;
  }

  return children;
}
