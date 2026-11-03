'use client';

import { useCallback, useEffect, useState } from 'react';
import useAuth from '@/hooks/useAuth';
import * as categoriaService from '@/services/categoriaService';
import Cartao from '@/components/ui/Cartao';
import Botao from '@/components/ui/Botao';
import Aviso from '@/components/ui/Aviso';
import Modal from '@/components/ui/Modal';
import FormularioCategoria from '@/components/categorias/FormularioCategoria';

export default function CategoriasPage() {
  const { ehAdmin } = useAuth();

  const [categorias, setCategorias] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');

  // modal: { tipo: 'criar'|'editar'|'detalhes'|'excluir', categoria }
  const [modal, setModal] = useState(null);
  const [salvando, setSalvando] = useState(false);
  const [erroModal, setErroModal] = useState('');

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro('');
    try {
      setCategorias(await categoriaService.listar());
    } catch (e) {
      setErro(e.message);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  function abrir(tipo, categoria = null) {
    setErroModal('');
    setModal({ tipo, categoria });
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
        await categoriaService.atualizar(modal.categoria._id, dados);
        setSucesso('Categoria atualizada com sucesso.');
      } else {
        await categoriaService.criar(dados);
        setSucesso('Categoria cadastrada com sucesso.');
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
      await categoriaService.deletar(modal.categoria._id);
      setSucesso('Categoria removida com sucesso.');
      fechar();
      await carregar();
    } catch (e) {
      setErroModal(e.message);
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div>
      <div className="pagina__cabecalho">
        <div>
          <h1 className="pagina__titulo">Categorias</h1>
          <p className="pagina__subtitulo">Categorias usadas para organizar os produtos.</p>
        </div>
        {ehAdmin && <Botao onClick={() => abrir('criar')}>Nova categoria</Botao>}
      </div>

      {sucesso && <Aviso tipo="sucesso" aoFechar={() => setSucesso('')}>{sucesso}</Aviso>}
      {erro && <Aviso aoFechar={() => setErro('')}>{erro}</Aviso>}

      <Cartao>
        {carregando ? (
          <div className="estado">Carregando categorias...</div>
        ) : categorias.length === 0 ? (
          <div className="estado">Nenhuma categoria cadastrada.</div>
        ) : (
          <div className="tabela-wrap">
            <table className="tabela">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Descrição</th>
                  <th className="numero">Ações</th>
                </tr>
              </thead>
              <tbody>
                {categorias.map((c) => (
                  <tr key={c._id}>
                    <td>{c.nome}</td>
                    <td>{c.descricao || '—'}</td>
                    <td>
                      <div className="tabela__acoes">
                        <Botao
                          variante="texto"
                          className="botao--pequeno"
                          onClick={() => abrir('detalhes', c)}
                        >
                          Ver
                        </Botao>
                        {ehAdmin && (
                          <>
                            <Botao
                              variante="texto"
                              className="botao--pequeno"
                              onClick={() => abrir('editar', c)}
                            >
                              Editar
                            </Botao>
                            <Botao
                              variante="texto"
                              className="botao--pequeno"
                              onClick={() => abrir('excluir', c)}
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
          titulo={modal.tipo === 'editar' ? 'Editar categoria' : 'Nova categoria'}
          aoFechar={fechar}
        >
          <FormularioCategoria
            categoria={modal.categoria}
            aoSalvar={salvar}
            aoCancelar={fechar}
            salvando={salvando}
            erroGeral={erroModal}
          />
        </Modal>
      )}

      {/* Detalhes */}
      {modal && modal.tipo === 'detalhes' && (
        <Modal titulo="Detalhes da categoria" aoFechar={fechar} largura="420px">
          <dl className="detalhes">
            <div>
              <dt>Nome</dt>
              <dd>{modal.categoria.nome}</dd>
            </div>
            <div>
              <dt>Descrição</dt>
              <dd>{modal.categoria.descricao || '—'}</dd>
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
        <Modal titulo="Remover categoria" aoFechar={fechar} largura="420px">
          <Aviso>{erroModal}</Aviso>
          <p>
            Tem certeza que deseja remover <strong>{modal.categoria.nome}</strong>? Essa ação não
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
