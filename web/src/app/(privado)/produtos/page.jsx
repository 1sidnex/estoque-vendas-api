'use client';

import { useCallback, useEffect, useState } from 'react';
import useAuth from '@/hooks/useAuth';
import * as produtoService from '@/services/produtoService';
import * as categoriaService from '@/services/categoriaService';
import * as fornecedorService from '@/services/fornecedorService';
import { formatarMoeda } from '@/lib/formato';
import { tomEstoque } from '@/lib/estoque';
import Cartao from '@/components/ui/Cartao';
import Botao from '@/components/ui/Botao';
import Aviso from '@/components/ui/Aviso';
import FiltroLista from '@/components/ui/FiltroLista';
import { contemTodas } from '@/lib/texto';
import Etiqueta from '@/components/ui/Etiqueta';
import Modal from '@/components/ui/Modal';
import FormularioProduto from '@/components/produtos/FormularioProduto';

export default function ProdutosPage() {
  const { ehAdmin } = useAuth();

  const [produtos, setProdutos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [fornecedores, setFornecedores] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [busca, setBusca] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('');

  // modal: { tipo: 'criar'|'editar'|'detalhes'|'excluir', produto }
  const [modal, setModal] = useState(null);
  const [salvando, setSalvando] = useState(false);
  const [erroModal, setErroModal] = useState('');

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro('');
    try {
      const [prods, cats, forns] = await Promise.all([
        produtoService.listar(),
        categoriaService.listar(),
        fornecedorService.listar(),
      ]);
      setProdutos(prods);
      setCategorias(cats);
      setFornecedores(forns);
    } catch (e) {
      setErro(e.message);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  function abrir(tipo, produto = null) {
    setErroModal('');
    setModal({ tipo, produto });
  }

  function fechar() {
    setModal(null);
    setErroModal('');
  }

  async function salvar(dados) {
    setSalvando(true);
    setErroModal('');
    try {
      if (modal.tipo === 'editar') {
        await produtoService.atualizar(modal.produto._id, dados);
        setSucesso('Produto atualizado com sucesso.');
      } else {
        await produtoService.criar(dados);
        setSucesso('Produto cadastrado com sucesso.');
      }
      fechar();
      await carregar();
    } catch (e) {
      setErroModal(e.message);
    } finally {
      setSalvando(false);
    }
  }

  async function excluir() {
    setSalvando(true);
    setErroModal('');
    try {
      await produtoService.deletar(modal.produto._id);
      setSucesso('Produto removido com sucesso.');
      fechar();
      await carregar();
    } catch (e) {
      setErroModal(e.message);
    } finally {
      setSalvando(false);
    }
  }

  const filtrados = produtos.filter(
    (p) =>
      contemTodas(p.nome, busca) &&
      (!categoriaFiltro || p.categoria?._id === categoriaFiltro)
  );

  return (
    <div>
      <div className="pagina__cabecalho">
        <div>
          <h1 className="pagina__titulo">Produtos</h1>
          <p className="pagina__subtitulo">Catálogo de produtos da loja.</p>
        </div>
        {ehAdmin && <Botao onClick={() => abrir('criar')}>Novo produto</Botao>}
      </div>

      {sucesso && <Aviso tipo="sucesso" aoFechar={() => setSucesso('')}>{sucesso}</Aviso>}
      {erro && <Aviso aoFechar={() => setErro('')}>{erro}</Aviso>}

      <FiltroLista
        busca={busca}
        aoBuscar={setBusca}
        placeholder="Buscar produto pelo nome..."
        selecao={{
          rotulo: 'Filtrar por categoria',
          todos: 'Todas as categorias',
          valor: categoriaFiltro,
          aoMudar: setCategoriaFiltro,
          opcoes: categorias.map((c) => ({ valor: c._id, rotulo: c.nome })),
        }}
        exibidos={filtrados.length}
        total={produtos.length}
      />

      <Cartao className="cartao--tabela">
        {carregando ? (
          <div className="estado">Carregando produtos...</div>
        ) : produtos.length === 0 ? (
          <div className="estado">Nenhum produto cadastrado.</div>
        ) : filtrados.length === 0 ? (
          <div className="estado">Nenhum resultado para a busca.</div>
        ) : (
          <div className="tabela-wrap">
            <table className="tabela">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Categoria</th>
                  <th className="numero">Preço</th>
                  <th className="numero">Estoque</th>
                  <th>Situação</th>
                  <th className="numero">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtrados.map((p) => (
                  <tr key={p._id}>
                    <td>{p.nome}</td>
                    <td>{p.categoria?.nome || '—'}</td>
                    <td className="numero">{formatarMoeda(p.preco)}</td>
                    <td className="numero">
                      <Etiqueta tom={tomEstoque(p.quantidadeEstoque)}>
                        {p.quantidadeEstoque}
                      </Etiqueta>
                    </td>
                    <td>
                      <Etiqueta tom={p.ativo ? 'sucesso' : 'neutro'}>
                        {p.ativo ? 'Ativo' : 'Inativo'}
                      </Etiqueta>
                    </td>
                    <td>
                      <div className="tabela__acoes">
                        <Botao
                          variante="texto"
                          className="botao--pequeno"
                          onClick={() => abrir('detalhes', p)}
                        >
                          Ver
                        </Botao>
                        {ehAdmin && (
                          <>
                            <Botao
                              variante="texto"
                              className="botao--pequeno"
                              onClick={() => abrir('editar', p)}
                            >
                              Editar
                            </Botao>
                            <Botao
                              variante="texto"
                              className="botao--pequeno"
                              onClick={() => abrir('excluir', p)}
                            >
                              Excluir
                            </Botao>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Cartao>

      {/* Criação / edição */}
      {modal && (modal.tipo === 'criar' || modal.tipo === 'editar') && (
        <Modal
          titulo={modal.tipo === 'editar' ? 'Editar produto' : 'Novo produto'}
          aoFechar={fechar}
        >
          <FormularioProduto
            produto={modal.produto}
            categorias={categorias}
            fornecedores={fornecedores}
            aoSalvar={salvar}
            aoCancelar={fechar}
            salvando={salvando}
            erroGeral={erroModal}
          />
        </Modal>
      )}

      {/* Detalhes */}
      {modal && modal.tipo === 'detalhes' && (
        <Modal titulo="Detalhes do produto" aoFechar={fechar}>
          <dl className="detalhes">
            <div>
              <dt>Nome</dt>
              <dd>{modal.produto.nome}</dd>
            </div>
            <div>
              <dt>Descrição</dt>
              <dd>{modal.produto.descricao || '—'}</dd>
            </div>
            <div>
              <dt>Preço</dt>
              <dd>{formatarMoeda(modal.produto.preco)}</dd>
            </div>
            <div>
              <dt>Estoque</dt>
              <dd>{modal.produto.quantidadeEstoque} unidade(s)</dd>
            </div>
            <div>
              <dt>Categoria</dt>
              <dd>{modal.produto.categoria?.nome || '—'}</dd>
            </div>
            <div>
              <dt>Fornecedor</dt>
              <dd>{modal.produto.fornecedor?.nome || '—'}</dd>
            </div>
            <div>
              <dt>Situação</dt>
              <dd>
                <Etiqueta tom={modal.produto.ativo ? 'sucesso' : 'neutro'}>
                  {modal.produto.ativo ? 'Ativo' : 'Inativo'}
                </Etiqueta>
              </dd>
            </div>
          </dl>
          <div className="modal__acoes">
            <Botao variante="secundario" onClick={fechar}>
              Fechar
            </Botao>
          </div>
        </Modal>
      )}

      {/* Exclusão */}
      {modal && modal.tipo === 'excluir' && (
        <Modal titulo="Remover produto" aoFechar={fechar} largura="420px">
          <Aviso>{erroModal}</Aviso>
          <p>
            Tem certeza que deseja remover <strong>{modal.produto.nome}</strong>? Essa ação não
            pode ser desfeita.
          </p>
          <div className="modal__acoes">
            <Botao variante="secundario" onClick={fechar}>
              Cancelar
            </Botao>
            <Botao variante="perigo" onClick={excluir} carregando={salvando}>
              Remover
            </Botao>
          </div>
        </Modal>
      )}
    </div>
  );
}
