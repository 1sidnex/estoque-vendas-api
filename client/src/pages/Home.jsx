import useAuth from '../hooks/useAuth';
import Cartao from '../components/ui/Cartao';
import Etiqueta from '../components/ui/Etiqueta';
import Botao from '../components/ui/Botao';

// Área interna da aplicação. Só é possível chegar aqui com um token válido
// (veja RotaPrivada em App.jsx). Os dados exibidos vêm do usuário que a API
// devolveu no login e que o AuthContext guardou.
export default function Home() {
  const { usuario, sair } = useAuth();

  const primeiroNome = usuario?.nome?.split(' ')[0] || 'bem-vindo';

  return (
    <div className="home">
      <header className="home__topo">
        <div className="home__marca">
          <strong>Estoque &amp; Vendas</strong>
        </div>
        <Botao variante="secundario" onClick={sair}>
          Sair
        </Botao>
      </header>

      <main className="home__conteudo">
        <h1 className="home__saudacao">Olá, {primeiroNome}!</h1>
        <p className="home__texto">
          Você está autenticado. Esta página só abre com um token JWT válido guardado no navegador.
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
      </main>
    </div>
  );
}
