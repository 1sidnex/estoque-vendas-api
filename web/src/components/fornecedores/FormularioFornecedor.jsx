'use client';

import { useState } from 'react';
import Campo from '@/components/ui/Campo';
import Botao from '@/components/ui/Botao';
import Aviso from '@/components/ui/Aviso';

// Formulário de criação/edição de fornecedor, exibido em modal.
// `fornecedor` nulo = criação.
// Validação básica por enquanto (nome e CNPJ obrigatórios); a checagem de
// formato de CNPJ/e-mail e as máscaras ficam para a etapa de melhorias.
export default function FormularioFornecedor({
  fornecedor,
  aoSalvar,
  aoCancelar,
  salvando,
  erroGeral,
}) {
  const [valores, setValores] = useState({
    nome: fornecedor?.nome || '',
    cnpj: fornecedor?.cnpj || '',
    email: fornecedor?.email || '',
    telefone: fornecedor?.telefone || '',
  });
  const [erros, setErros] = useState({});

  function alterar(campo, valor) {
    setValores((antes) => ({ ...antes, [campo]: valor }));
    setErros((antes) => ({ ...antes, [campo]: '' }));
  }

  function validar() {
    const novos = {};
    if (!valores.nome.trim()) novos.nome = 'Informe o nome.';
    if (!valores.cnpj.trim()) novos.cnpj = 'Informe o CNPJ.';
    setErros(novos);
    return Object.keys(novos).length === 0;
  }

  function enviar(evento) {
    evento.preventDefault();
    if (!validar()) return;

    const dados = {
      nome: valores.nome.trim(),
      cnpj: valores.cnpj.trim(),
    };
    // campos opcionais só vão quando preenchidos
    if (valores.email.trim()) dados.email = valores.email.trim();
    if (valores.telefone.trim()) dados.telefone = valores.telefone.trim();

    aoSalvar(dados);
  }

  return (
    <form className="formulario" onSubmit={enviar}>
      <Aviso>{erroGeral}</Aviso>

      <Campo
        id="fornecedor-nome"
        rotulo="Nome"
        value={valores.nome}
        onChange={(e) => alterar('nome', e.target.value)}
        erro={erros.nome}
        placeholder="Ex.: Distribuidora Souza"
      />

      <Campo
        id="fornecedor-cnpj"
        rotulo="CNPJ"
        value={valores.cnpj}
        onChange={(e) => alterar('cnpj', e.target.value)}
        erro={erros.cnpj}
        dica="Formato 00.000.000/0000-00 ou 14 dígitos"
        placeholder="00.000.000/0000-00"
      />

      <Campo
        id="fornecedor-email"
        rotulo="E-mail (opcional)"
        type="email"
        value={valores.email}
        onChange={(e) => alterar('email', e.target.value)}
        placeholder="contato@fornecedor.com"
      />

      <Campo
        id="fornecedor-telefone"
        rotulo="Telefone (opcional)"
        value={valores.telefone}
        onChange={(e) => alterar('telefone', e.target.value)}
        placeholder="(67) 90000-0000"
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
