'use client';

import { useCallback, useEffect, useState } from 'react';
import useAuth from '@/hooks/useAuth';
import * as fornecedorService from '@/services/fornecedorService';
import Cartao from '@/components/ui/Cartao';
import Botao from '@/components/ui/Botao';
import Aviso from '@/components/ui/Aviso';
import Modal from '@/components/ui/Modal';
import FormularioFornecedor from '@/components/fornecedores/FormularioFornecedor';

export default function FornecedoresPage() {
  const { ehAdmin } = useAuth();

  const [fornecedores, setFornecedores] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');

  // modal: { tipo: 'criar'|'editar'|'detalhes'|'excluir', fornecedor }
  const [modal, setModal] = useState(null);
  const [salvando, setSalvando] = useState(false);
  const [erroModal, setErroModal] = useState('');

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro('');
    try {
      setFornecedores(await fornecedorService.listar());
    } catch (e) {
      setErro(e.message);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  function abrir(tipo, fornecedor = null) {
    setErroModal('');
    setModal({ tipo, fornecedor });
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
        await fornecedorService.atualizar(modal.fornecedor._id, dados);
        setSucesso('Fornecedor atualizado com sucesso.');
      } else {
        await fornecedorService.criar(dados);
        setSucesso('Fornecedor cadastrado com sucesso.');
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
      await fornecedorService.deletar(modal.fornecedor._id);
      setSucesso('Fornecedor removido com sucesso.');
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
          <h1 className="pagina__titulo">Fornecedores</h1>
          <p className="pagina__subtitulo">Fornecedores dos produtos da loja.</p>
        </div>
        {ehAdmin && <Botao onClick={() => abrir('criar')}>Novo fornecedor</Botao>}
      </div>

      {sucesso && <Aviso tipo="sucesso" aoFechar={() => setSucesso('')}>{sucesso}</Aviso>}
      {erro && <Aviso aoFechar={() => setErro('')}>{erro}</Aviso>}

      <Cartao>
        {carregando ? (
          <div className="estado">Carregando fornecedores...</div>
        ) : fornecedores.length === 0 ? (
          <div className="estado">Nenhum fornecedor cadastrado.</div>
        ) : (
          <div className="tabela-wrap">
            <table className="tabela">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>CNPJ</th>
                  <th>E-mail</th>
                  <th>Telefone</th>
                  <th className="numero">Ações</th>
                </tr>
              </thead>
              <tbody>
                {fornecedores.map((f) => (
                  <tr key={f._id}>
                    <td>{f.nome}</td>
                    <td>{f.cnpj}</td>
                    <td>{f.email || '—'}</td>
                    <td>{f.telefone || '—'}</td>
                    <td>
                      <div className="tabela__acoes">
                        <Botao
                          variante="texto"
                          className="botao--pequeno"
                          onClick={() => abrir('detalhes', f)}
                        >
                          Ver
                        </Botao>
                        {ehAdmin && (
                          <>
                            <Botao
                              variante="texto"
                              className="botao--pequeno"
                              onClick={() => abrir('editar', f)}
                            >
                              Editar
                            </Botao>
                            <Botao
                              variante="texto"
                              className="botao--pequeno"
                              onClick={() => abrir('excluir', f)}
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
          titulo={modal.tipo === 'editar' ? 'Editar fornecedor' : 'Novo fornecedor'}
          aoFechar={fechar}
        >
          <FormularioFornecedor
            fornecedor={modal.fornecedor}
            aoSalvar={salvar}
            aoCancelar={fechar}
            salvando={salvando}
            erroGeral={erroModal}
          />
        </Modal>
      )}

      {/* Detalhes */}
      {modal && modal.tipo === 'detalhes' && (
        <Modal titulo="Detalhes do fornecedor" aoFechar={fechar} largura="420px">
          <dl className="detalhes">
            <div>
              <dt>Nome</dt>
              <dd>{modal.fornecedor.nome}</dd>
            </div>
            <div>
              <dt>CNPJ</dt>
              <dd>{modal.fornecedor.cnpj}</dd>
            </div>
            <div>
              <dt>E-mail</dt>
              <dd>{modal.fornecedor.email || '—'}</dd>
            </div>
            <div>
              <dt>Telefone</dt>
              <dd>{modal.fornecedor.telefone || '—'}</dd>
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
        <Modal titulo="Remover fornecedor" aoFechar={fechar} largura="420px">
          <Aviso>{erroModal}</Aviso>
          <p>
            Tem certeza que deseja remover <strong>{modal.fornecedor.nome}</strong>? Essa ação não
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
