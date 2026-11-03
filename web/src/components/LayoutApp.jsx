'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import useAuth from '@/hooks/useAuth';
import Botao from '@/components/ui/Botao';
import Etiqueta from '@/components/ui/Etiqueta';

// Casca da área logada: barra superior com navegação, usuário e logout.
const LINKS = [{ href: '/', rotulo: 'Painel' }];

export default function LayoutApp({ children }) {
  const { usuario, sair } = useAuth();
  const router = useRouter();
  const caminho = usePathname();

  function sairDoSistema() {
    sair();
    router.replace('/login');
  }

  return (
    <div className="app">
      <header className="app__topo">
        <Link href="/" className="app__marca">
          Estoque &amp; Vendas
        </Link>

        <nav className="app__nav">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={caminho === link.href ? 'ativo' : ''}
            >
              {link.rotulo}
            </Link>
          ))}
        </nav>

        <div className="app__usuario">
          <span className="app__usuario-nome">{usuario?.nome}</span>
          <Etiqueta tom={usuario?.cargo === 'admin' ? 'info' : 'neutro'}>
            {usuario?.cargo}
          </Etiqueta>
          <Botao variante="secundario" className="botao--pequeno" onClick={sairDoSistema}>
            Sair
          </Botao>
        </div>
      </header>

      <main className="app__conteudo">{children}</main>
    </div>
  );
}
