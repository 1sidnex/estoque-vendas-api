'use client';

import useAuth from '@/hooks/useAuth';
import Cartao from '@/components/ui/Cartao';
import Etiqueta from '@/components/ui/Etiqueta';

// Painel inicial da área logada. Por enquanto mostra os dados do usuário.
export default function PainelPage() {
  const { usuario } = useAuth();
  const primeiroNome = usuario?.nome?.split(' ')[0] || 'bem-vindo';

  return (
    <div className="painel">
      <h1 className="painel__titulo">Olá, {primeiroNome}!</h1>
      <p className="painel__subtitulo">
        Bem-vindo ao painel de controle de estoque e vendas.
      </p>

      <Cartao titulo="Seus dados">
        <dl className="dados">
          <div>
            <dt>Nome</dt>
            <dd>{usuario?.nome}</dd>
          </div>
          <div>
            <dt>E-mail</dt>
            <dd>{usuario?.email}</dd>
          </div>
          <div>
            <dt>Cargo</dt>
            <dd>
              <Etiqueta tom={usuario?.cargo === 'admin' ? 'info' : 'neutro'}>
                {usuario?.cargo}
              </Etiqueta>
            </dd>
          </div>
        </dl>
      </Cartao>
    </div>
  );
}
