import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { registrar } from '../api/authService';
import Campo from '../components/ui/Campo';
import Selecao from '../components/ui/Selecao';
import Botao from '../components/ui/Botao';
import Aviso from '../components/ui/Aviso';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Registrar() {
  const { entrar, autenticado } = useAuth();
  const navegar = useNavigate();

  const [valores, setValores] = useState({
    nome: '',
    email: '',
    senha: '',
    confirmacao: '',
    cargo: 'vendedor',
  });
  const [erros, setErros] = useState({});
  const [erroGeral, setErroGeral] = useState('');
  const [enviando, setEnviando] = useState(false);

  if (autenticado) return <Navigate to="/" replace />;

  function alterar(campo, valor) {
    setValores((antes) => ({ ...antes, [campo]: valor }));
    setErros((antes) => ({ ...antes, [campo]: '' }));
  }

  function validar() {
    const novos = {};
    if (!valores.nome.trim()) novos.nome = 'Informe o nome.';

    if (!valores.email.trim()) novos.email = 'Informe o e-mail.';
    else if (!EMAIL_REGEX.test(valores.email.trim())) novos.email = 'E-mail inválido.';

    if (valores.senha.length < 6) novos.senha = 'A senha deve ter pelo menos 6 caracteres.';
    if (valores.confirmacao !== valores.senha) novos.confirmacao = 'As senhas não conferem.';

    setErros(novos);
    return Object.keys(novos).length === 0;
  }

  async function enviar(evento) {
    evento.preventDefault();
    if (!validar()) return;

    setEnviando(true);
    setErroGeral('');
    try {
      await registrar({
        nome: valores.nome.trim(),
        email: valores.email.trim(),
        senha: valores.senha,
        cargo: valores.cargo,
      });
      // já entra na aplicação com a conta recém-criada
      await entrar(valores.email.trim(), valores.senha);
      navegar('/', { replace: true });
    } catch (e) {
      setErroGeral(e.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="acesso">
      <div className="acesso__caixa">
        <div className="acesso__marca">
          <h1>Criar conta</h1>
          <p>Cadastre um usuário para acessar o painel.</p>
        </div>

        <form className="formulario" onSubmit={enviar}>
          <Aviso aoFechar={() => setErroGeral('')}>{erroGeral}</Aviso>

          <Campo
            id="registro-nome"
            rotulo="Nome"
            value={valores.nome}
            onChange={(e) => alterar('nome', e.target.value)}
            erro={erros.nome}
            placeholder="Ex.: Ana Souza"
          />

          <Campo
            id="registro-email"
            rotulo="E-mail"
            type="email"
            value={valores.email}
            onChange={(e) => alterar('email', e.target.value)}
            erro={erros.email}
            placeholder="ana@loja.com"
          />

          <div className="formulario__linha">
            <Campo
              id="registro-senha"
              rotulo="Senha"
              type="password"
              value={valores.senha}
              onChange={(e) => alterar('senha', e.target.value)}
              erro={erros.senha}
              autoComplete="new-password"
            />
            <Campo
              id="registro-confirmacao"
              rotulo="Confirmar senha"
              type="password"
              value={valores.confirmacao}
              onChange={(e) => alterar('confirmacao', e.target.value)}
              erro={erros.confirmacao}
              autoComplete="new-password"
            />
          </div>

          {/*
            ATENÇÃO: escolher o cargo aqui só é possível porque a rota pública
            POST /api/auth/registrar aceita o campo `cargo` vindo do body.
            Isso é uma falha de segurança da API (qualquer pessoa se cadastra
            como admin). O campo está aqui para dar conta de criar o PRIMEIRO
            administrador do sistema — depois que a API for corrigida, este
            seletor deve sair e a criação de admin passa a ser feita na tela
            de Usuários, por quem já é admin.
          */}
          <Selecao
            id="registro-cargo"
            rotulo="Cargo"
            value={valores.cargo}
            onChange={(e) => alterar('cargo', e.target.value)}
            opcoes={[
              { valor: 'vendedor', rotulo: 'Vendedor' },
              { valor: 'admin', rotulo: 'Administrador' },
            ]}
          />

          <Botao tipo="submit" carregando={enviando} className="botao--largo">
            Criar conta e entrar
          </Botao>
        </form>

        <p className="acesso__rodape">
          Já tem conta? <Link to="/login">Fazer login</Link>
        </p>
      </div>
    </div>
  );
}
