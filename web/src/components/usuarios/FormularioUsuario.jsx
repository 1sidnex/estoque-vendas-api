'use client';

import { useState } from 'react';
import Campo from '@/components/ui/Campo';
import Selecao from '@/components/ui/Selecao';
import Botao from '@/components/ui/Botao';
import Aviso from '@/components/ui/Aviso';
import { emailValido } from '@/lib/mascaras';

const TAMANHO_MINIMO_SENHA = 6;

// Formulário de usuário em modal. `usuario` nulo = criação.
// Na edição a API só aceita nome e cargo. `cargoBloqueado` impede o admin
// logado de alterar o próprio cargo.
export default function FormularioUsuario({
  usuario,
  cargoBloqueado,
  aoSalvar,
  aoCancelar,
  salvando,
  erroGeral,
}) {
  const editando = Boolean(usuario);

  const [valores, setValores] = useState({
    nome: usuario?.nome || '',
    email: usuario?.email || '',
    senha: '',
    cargo: usuario?.cargo || 'vendedor',
  });
  const [erros, setErros] = useState({});

  function alterar(campo, valor) {
    setValores((antes) => ({ ...antes, [campo]: valor }));
    setErros((antes) => ({ ...antes, [campo]: '' }));
  }

  function validar() {
    const novos = {};
    if (!valores.nome.trim()) novos.nome = 'Informe o nome.';

    if (!editando) {
      if (!valores.email.trim()) novos.email = 'Informe o e-mail.';
      else if (!emailValido(valores.email)) novos.email = 'E-mail inválido.';

      if (valores.senha.length < TAMANHO_MINIMO_SENHA) {
        novos.senha = `A senha deve ter pelo menos ${TAMANHO_MINIMO_SENHA} caracteres.`;
      }
    }

    setErros(novos);
    return Object.keys(novos).length === 0;
  }

  function enviar(evento) {
    evento.preventDefault();
    if (!validar()) return;

    const dados = { nome: valores.nome.trim(), cargo: valores.cargo };
    aoSalvar(
      editando ? dados : { ...dados, email: valores.email.trim(), senha: valores.senha }
    );
  }

  return (
    <form className="formulario" onSubmit={enviar} noValidate>
      <Aviso>{erroGeral}</Aviso>

      <Campo
        id="usuario-nome"
        rotulo="Nome"
        value={valores.nome}
        onChange={(e) => alterar('nome', e.target.value)}
        erro={erros.nome}
        placeholder="Ex.: Ana Souza"
      />

      <Campo
        id="usuario-email"
        rotulo="E-mail"
        type="email"
        value={valores.email}
        onChange={(e) => alterar('email', e.target.value)}
        erro={erros.email}
        dica={editando ? 'O e-mail não pode ser alterado.' : undefined}
        disabled={editando}
        placeholder="ana@loja.com"
      />

      {!editando && (
        <Campo
          id="usuario-senha"
          rotulo="Senha"
          type="password"
          value={valores.senha}
          onChange={(e) => alterar('senha', e.target.value)}
          erro={erros.senha}
          autoComplete="new-password"
        />
      )}

      <Selecao
        id="usuario-cargo"
        rotulo="Cargo"
        value={valores.cargo}
        onChange={(e) => alterar('cargo', e.target.value)}
        disabled={cargoBloqueado}
        opcoes={[
          { valor: 'vendedor', rotulo: 'Vendedor' },
          { valor: 'admin', rotulo: 'Administrador' },
        ]}
      />

      <div className="modal__acoes">
        <Botao variante="secundario" onClick={aoCancelar}>
          Cancelar
        </Botao>
        <Botao tipo="submit" carregando={salvando}>
          Salvar
        </Botao>
      </div>
    </form>
  );
}
