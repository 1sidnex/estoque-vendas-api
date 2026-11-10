'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import useAuth from '@/hooks/useAuth';
import Botao from '@/components/ui/Botao';
import Etiqueta from '@/components/ui/Etiqueta';

// Casca da área logada: barra superior com navegação, usuário e logout.
// Em telas estreitas os links ficam num menu aberto pelo botão.
const LINKS = [
  { href: '/', rotulo: 'Painel' },
  { href: '/produtos', rotulo: 'Produtos' },
  { href: '/categorias', rotulo: 'Categorias' },
  { href: '/fornecedores', rotulo: 'Fornecedores' },
  { href: '/vendas', rotulo: 'Vendas' },
  { href: '/usuarios', rotulo: 'Usuários', apenasAdmin: true },
];

function IconeMenu({ aberto }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      {aberto ? (
        <path d="M6 6l12 12M18 6L6 18" />
      ) : (
        <path d="M4 7h16M4 12h16M4 17h16" />
      )}
    </svg>
  );
}

export default function LayoutApp({ children }) {
  const { usuario, ehAdmin, sair } = useAuth();
  const router = useRouter();
  const caminho = usePathname();
  const [menuAberto, setMenuAberto] = useState(false);

  // Fecha o menu ao trocar de página.
  useEffect(() => {
    setMenuAberto(false);
  }, [caminho]);

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

        <nav id="menu-principal" className={`app__nav ${menuAberto ? 'app__nav--aberto' : ''}`}>
          {LINKS.filter((link) => !link.apenasAdmin || ehAdmin).map((link) => (
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
          <span className="app__usuario-nome" title={usuario?.nome}>
            {usuario?.nome}
          </span>
          <Etiqueta tom={usuario?.cargo === 'admin' ? 'info' : 'neutro'}>
            {usuario?.cargo}
          </Etiqueta>
          <Botao variante="secundario" className="botao--pequeno" onClick={sairDoSistema}>
            Sair
          </Botao>
        </div>

        <button
          type="button"
          className="app__menu-botao"
          aria-label={menuAberto ? 'Fechar menu' : 'Abrir menu'}
          aria-expanded={menuAberto}
          aria-controls="menu-principal"
          onClick={() => setMenuAberto((aberto) => !aberto)}
        >
          <IconeMenu aberto={menuAberto} />
        </button>
      </header>

      <main className="app__conteudo">{children}</main>
    </div>
  );
}
