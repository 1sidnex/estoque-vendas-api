'use client';

import { useRef, useState } from 'react';
import Campo from '@/components/ui/Campo';
import CampoBusca from '@/components/ui/CampoBusca';
import Botao from '@/components/ui/Botao';
import Aviso from '@/components/ui/Aviso';
import { formatarMoeda } from '@/lib/formato';

// Formulário de nova venda, exibido em modal. `produtos` traz só os vendáveis.
// A API valida cada item separadamente, então o mesmo produto é somado aqui
// para a quantidade total nunca passar do estoque.
export default function FormularioVenda({
  produtos,
  aoSalvar,
  aoCancelar,
  salvando,
  erroGeral,
}) {
  const [produtoId, setProdutoId] = useState('');
  const [quantidade, setQuantidade] = useState('1');
  const [itens, setItens] = useState([]);
  const [erro, setErro] = useState('');
  const buscaRef = useRef(null);
  const quantidadeRef = useRef(null);

  const total = itens.reduce((soma, item) => soma + item.preco * item.quantidade, 0);

  function adicionar() {
    const produto = produtos.find((p) => p._id === produtoId);
    if (!produto) {
      setErro('Selecione um produto.');
      return;
    }

    const qtd = Number(quantidade);
    if (!Number.isInteger(qtd) || qtd < 1) {
      setErro('Informe uma quantidade inteira maior que zero.');
      return;
    }

    const noCarrinho = itens.find((item) => item.produto === produtoId)?.quantidade || 0;
    if (noCarrinho + qtd > produto.quantidadeEstoque) {
      setErro(
        `Estoque insuficiente para "${produto.nome}". Disponível: ${produto.quantidadeEstoque}.`
      );
      return;
    }

    setItens((antes) =>
      noCarrinho
        ? antes.map((item) =>
            item.produto === produtoId ? { ...item, quantidade: noCarrinho + qtd } : item
          )
        : [...antes, { produto: produtoId, nome: produto.nome, preco: produto.preco, quantidade: qtd }]
    );
    setProdutoId('');
    setQuantidade('1');
    setErro('');
    buscaRef.current?.focus();
  }

  // Ao escolher um produto, o cursor vai para a quantidade.
  function selecionarProduto(id) {
    setProdutoId(id);
    if (id) {
      setErro('');
      quantidadeRef.current?.focus();
      quantidadeRef.current?.select();
    }
  }

  function remover(id) {
    setItens((antes) => antes.filter((item) => item.produto !== id));
  }

  function enviar(evento) {
    evento.preventDefault();
    if (itens.length === 0) {
      setErro('Adicione ao menos um item.');
      return;
    }
    aoSalvar(itens.map(({ produto, quantidade: qtd }) => ({ produto, quantidade: qtd })));
  }

  return (
    <form className="formulario" onSubmit={enviar} noValidate>
      <Aviso>{erroGeral || erro}</Aviso>

      <div className="venda__adicionar">
        <CampoBusca
          id="venda-produto"
          rotulo="Produto"
          inputRef={buscaRef}
          valor={produtoId}
          aoSelecionar={selecionarProduto}
          placeholder="Digite para buscar..."
          vazio="Nenhum produto encontrado."
          opcoes={produtos.map((p) => ({
            valor: p._id,
            rotulo: p.nome,
            detalhe: `${formatarMoeda(p.preco)} • ${p.quantidadeEstoque} em estoque`,
          }))}
        />
        <Campo
          id="venda-quantidade"
          rotulo="Qtd."
          type="number"
          min="1"
          step="1"
          value={quantidade}
          onChange={(e) => setQuantidade(e.target.value)}
          onKeyDown={(e) => {
            // Enter na quantidade adiciona o item em vez de registrar a venda
            if (e.key === 'Enter') {
              e.preventDefault();
              adicionar();
            }
          }}
          ref={quantidadeRef}
        />
        <Botao variante="secundario" onClick={adicionar}>
          Adicionar
        </Botao>
      </div>

      {itens.length === 0 ? (
        <div className="estado">Nenhum item adicionado.</div>
      ) : (
        <div className="tabela-wrap">
          <table className="tabela">
            <thead>
              <tr>
                <th>Produto</th>
                <th className="numero">Qtd.</th>
                <th className="numero">Subtotal</th>
                <th aria-label="Ações" />
              </tr>
            </thead>
            <tbody>
              {itens.map((item) => (
                <tr key={item.produto}>
                  <td>{item.nome}</td>
                  <td className="numero">{item.quantidade}</td>
                  <td className="numero">{formatarMoeda(item.preco * item.quantidade)}</td>
                  <td className="numero">
                    <Botao
                      variante="texto"
                      className="botao--pequeno"
                      onClick={() => remover(item.produto)}
                    >
                      Remover
                    </Botao>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="venda__total">
        Total: <strong>{formatarMoeda(total)}</strong>
      </p>

      <div className="modal__acoes">
        <Botao variante="secundario" onClick={aoCancelar}>
          Cancelar
        </Botao>
        <Botao tipo="submit" carregando={salvando}>
          Registrar venda
        </Botao>
      </div>
    </form>
  );
}
