'use client';

import { useState } from 'react';
import Campo from '@/components/ui/Campo';
import Botao from '@/components/ui/Botao';
import Aviso from '@/components/ui/Aviso';

// Formulário de criação/edição de categoria, exibido em modal.
// `categoria` nulo = criação.
export default function FormularioCategoria({
  categoria,
  aoSalvar,
  aoCancelar,
  salvando,
  erroGeral,
}) {
  const [valores, setValores] = useState({
    nome: categoria?.nome || '',
    descricao: categoria?.descricao || '',
  });
  const [erros, setErros] = useState({});

  function alterar(campo, valor) {
    setValores((antes) => ({ ...antes, [campo]: valor }));
    setErros((antes) => ({ ...antes, [campo]: '' }));
  }

  function validar() {
    const novos = {};
    if (!valores.nome.trim()) novos.nome = 'Informe o nome.';
    setErros(novos);
    return Object.keys(novos).length === 0;
  }

  function enviar(evento) {
    evento.preventDefault();
    if (!validar()) return;
    aoSalvar({ nome: valores.nome.trim(), descricao: valores.descricao.trim() });
  }

  return (
    <form className="formulario" onSubmit={enviar}>
      <Aviso>{erroGeral}</Aviso>

      <Campo
        id="categoria-nome"
        rotulo="Nome"
        value={valores.nome}
        onChange={(e) => alterar('nome', e.target.value)}
        erro={erros.nome}
        placeholder="Ex.: Papelaria"
      />

      <Campo
        id="categoria-descricao"
        rotulo="Descrição"
        value={valores.descricao}
        onChange={(e) => alterar('descricao', e.target.value)}
        placeholder="Opcional"
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
