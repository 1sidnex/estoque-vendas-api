import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import Campo from '../components/ui/Campo';
import Botao from '../components/ui/Botao';
import Aviso from '../components/ui/Aviso';

export default function Login() {
  const { entrar, autenticado } = useAuth();
  const navegar = useNavigate();
  const localizacao = useLocation();

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  // Já logado? Não faz sentido ver a tela de login.
  if (autenticado) return <Navigate to="/" replace />;

  async function enviar(evento) {
    evento.preventDefault();
    setErro('');
    setEnviando(true);
    try {
      await entrar(email.trim(), senha);
      // volta para a página que o usuário tentou abrir antes de logar
      navegar(localizacao.state?.de || '/', { replace: true });
    } catch (e) {
      setErro(e.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="acesso">
      <div className="acesso__caixa">
        <div className="acesso__marca">
          <h1>Estoque &amp; Vendas</h1>
          <p>Entre com sua conta para acessar o painel da loja.</p>
        </div>

        <form className="formulario" onSubmit={enviar}>
          <Aviso aoFechar={() => setErro('')}>{erro}</Aviso>

          <Campo
            id="login-email"
            rotulo="E-mail"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="voce@loja.com"
            autoComplete="username"
            required
          />

          <Campo
            id="login-senha"
            rotulo="Senha"
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            placeholder="••••••"
            autoComplete="current-password"
            required
          />

          <Botao tipo="submit" carregando={enviando} className="botao--largo">
            Entrar
          </Botao>
        </form>

        <p className="acesso__rodape">
          Ainda não tem conta? <Link to="/registrar">Criar uma conta</Link>
        </p>
      </div>
    </div>
  );
}
