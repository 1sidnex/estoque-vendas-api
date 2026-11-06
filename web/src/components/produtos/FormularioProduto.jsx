'use client';

import { useState } from 'react';
import Campo from '@/components/ui/Campo';
import Selecao from '@/components/ui/Selecao';
import Botao from '@/components/ui/Botao';
import Aviso from '@/components/ui/Aviso';

// Formulário de criação/edição de produto, exibido dentro de um modal.
// `produto` nulo = criação. `aoSalvar` recebe os dados já tratados.
export default function FormularioProduto({
  produto,
  categorias,
  fornecedores,
  aoSalvar,
  aoCancelar,
  salvando,
  erroGeral,
}) {
  const [valores, setValores] = useState({
    nome: produto?.nome || '',
    descricao: produto?.descricao || '',
    preco: produto?.preco ?? '',
    quantidadeEstoque: produto?.quantidadeEstoque ?? '',
    categoria: produto?.categoria?._id || produto?.categoria || '',
    fornecedor: produto?.fornecedor?._id || produto?.fornecedor || '',
    ativo: produto ? String(produto.ativo) : 'true',
  });
  const [erros, setErros] = useState({});

  function alterar(campo, valor) {
    setValores((antes) => ({ ...antes, [campo]: valor }));
    setErros((antes) => ({ ...antes, [campo]: '' }));
  }

  function validar() {
    const novos = {};
    if (!valores.nome.trim()) novos.nome = 'Informe o nome.';

    if (valores.preco === '' || Number.isNaN(Number(valores.preco))) {
      novos.preco = 'Informe um preço válido.';
    } else if (Number(valores.preco) < 0) {
      novos.preco = 'O preço não pode ser negativo.';
    }

    if (valores.quantidadeEstoque === '' || Number.isNaN(Number(valores.quantidadeEstoque))) {
      novos.quantidadeEstoque = 'Informe a quantidade.';
    } else if (Number(valores.quantidadeEstoque) < 0) {
      novos.quantidadeEstoque = 'A quantidade não pode ser negativa.';
    }

    if (!valores.categoria) novos.categoria = 'Selecione a categoria.';

    setErros(novos);
    return Object.keys(novos).length === 0;
  }

  function enviar(evento) {
    evento.preventDefault();
    if (!validar()) return;

    const dados = {
      nome: valores.nome.trim(),
      descricao: valores.descricao.trim(),
      preco: Number(valores.preco),
      quantidadeEstoque: Number(valores.quantidadeEstoque),
      categoria: valores.categoria,
      ativo: valores.ativo === 'true',
      // null remove o fornecedor na edição ('' não é um ObjectId válido).
      fornecedor: valores.fornecedor || null,
    };

    aoSalvar(dados);
  }

  return (
    <form className="formulario" onSubmit={enviar}>
      <Aviso>{erroGeral}</Aviso>

      <Campo
        id="produto-nome"
        rotulo="Nome"
        value={valores.nome}
        onChange={(e) => alterar('nome', e.target.value)}
        erro={erros.nome}
        placeholder="Ex.: Caderno 96 folhas"
      />

      <Campo
        id="produto-descricao"
        rotulo="Descrição"
        value={valores.descricao}
        onChange={(e) => alterar('descricao', e.target.value)}
        placeholder="Opcional"
      />

      <div className="formulario__linha">
        <Campo
          id="produto-preco"
          rotulo="Preço (R$)"
          type="number"
          step="0.01"
          min="0"
          value={valores.preco}
          onChange={(e) => alterar('preco', e.target.value)}
          erro={erros.preco}
        />
        <Campo
          id="produto-estoque"
          rotulo="Estoque"
          type="number"
          min="0"
          value={valores.quantidadeEstoque}
          onChange={(e) => alterar('quantidadeEstoque', e.target.value)}
          erro={erros.quantidadeEstoque}
        />
      </div>

      <Selecao
        id="produto-categoria"
        rotulo="Categoria"
        value={valores.categoria}
        onChange={(e) => alterar('categoria', e.target.value)}
        erro={erros.categoria}
        placeholder="Selecione..."
        opcoes={categorias.map((c) => ({ valor: c._id, rotulo: c.nome }))}
      />

      <Selecao
        id="produto-fornecedor"
        rotulo="Fornecedor (opcional)"
        value={valores.fornecedor}
        onChange={(e) => alterar('fornecedor', e.target.value)}
        placeholder="Sem fornecedor"
        opcoes={fornecedores.map((f) => ({ valor: f._id, rotulo: f.nome }))}
      />

      <Selecao
        id="produto-ativo"
        rotulo="Situação"
        value={valores.ativo}
        onChange={(e) => alterar('ativo', e.target.value)}
        opcoes={[
          { valor: 'true', rotulo: 'Ativo' },
          { valor: 'false', rotulo: 'Inativo' },
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
