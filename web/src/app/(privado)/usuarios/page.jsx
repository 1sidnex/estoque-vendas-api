'use client';

import { useCallback, useEffect, useState } from 'react';
import useAuth from '@/hooks/useAuth';
import * as usuarioService from '@/services/usuarioService';
import Cartao from '@/components/ui/Cartao';
import Botao from '@/components/ui/Botao';
import Aviso from '@/components/ui/Aviso';
import Etiqueta from '@/components/ui/Etiqueta';
import Modal from '@/components/ui/Modal';
import FormularioUsuario from '@/components/usuarios/FormularioUsuario';

function tomCargo(cargo) {
  return cargo === 'admin' ? 'info' : 'neutro';
}

export default function UsuariosPage() {
  const { usuario: usuarioLogado } = useAuth();

  const [usuarios, setUsuarios] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');

  // modal: { tipo: 'criar'|'editar'|'detalhes'|'excluir', usuario }
  const [modal, setModal] = useState(null);
  const [salvando, setSalvando] = useState(false);
  const [erroModal, setErroModal] = useState('');

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro('');
    try {
      setUsuarios(await usuarioService.listar());
    } catch (e) {
      setErro(e.message);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  // O login devolve `id`; a listagem devolve `_id`.
  function ehUsuarioLogado(usuario) {
    return usuario?._id === usuarioLogado?.id;
  }

  function abrir(tipo, usuario = null) {
    setErroModal('');
    setModal({ tipo, usuario });
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
        await usuarioService.atualizar(modal.usuario._id, dados);
        setSucesso('Usuário atualizado com sucesso.');
      } else {
        await usuarioService.criar(dados);
        setSucesso('Usuário cadastrado com sucesso.');
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
      await usuarioService.deletar(modal.usuario._id);
      setSucesso('Usuário removido com sucesso.');
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
          <h1 className="pagina__titulo">Usuários</h1>
          <p className="pagina__subtitulo">Contas com acesso ao sistema.</p>
        </div>
        <Botao onClick={() => abrir('criar')}>Novo usuário</Botao>
      </div>

      {sucesso && <Aviso tipo="sucesso" aoFechar={() => setSucesso('')}>{sucesso}</Aviso>}
      {erro && <Aviso aoFechar={() => setErro('')}>{erro}</Aviso>}

      <Cartao>
        {carregando ? (
          <div className="estado">Carregando usuários...</div>
        ) : usuarios.length === 0 ? (
          <div className="estado">Nenhum usuário cadastrado.</div>
        ) : (
          <div className="tabela-wrap">
            <table className="tabela">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>E-mail</th>
                  <th>Cargo</th>
                  <th className="numero">Ações</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map((u) => (
                  <tr key={u._id}>
                    <td>{u.nome}</td>
                    <td>{u.email}</td>
                    <td>
                      <Etiqueta tom={tomCargo(u.cargo)}>{u.cargo}</Etiqueta>
                    </td>
                    <td>
                      <div className="tabela__acoes">
                        <Botao
                          variante="texto"
                          className="botao--pequeno"
                          onClick={() => abrir('detalhes', u)}
                        >
                          Ver
                        </Botao>
                        <Botao
                          variante="texto"
                          className="botao--pequeno"
                          onClick={() => abrir('editar', u)}
                        >
                          Editar
                        </Botao>
                        {!ehUsuarioLogado(u) && (
                          <Botao
                            variante="texto"
                            className="botao--pequeno"
                            onClick={() => abrir('excluir', u)}
                          >
                            Excluir
                          </Botao>
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
          titulo={modal.tipo === 'editar' ? 'Editar usuário' : 'Novo usuário'}
          aoFechar={fechar}
        >
          <FormularioUsuario
            usuario={modal.usuario}
            cargoBloqueado={ehUsuarioLogado(modal.usuario)}
            aoSalvar={salvar}
            aoCancelar={fechar}
            salvando={salvando}
            erroGeral={erroModal}
          />
        </Modal>
      )}

      {/* Detalhes */}
      {modal && modal.tipo === 'detalhes' && (
        <Modal titulo="Detalhes do usuário" aoFechar={fechar} largura="420px">
          <dl className="detalhes">
            <div>
              <dt>Nome</dt>
              <dd>{modal.usuario.nome}</dd>
            </div>
            <div>
              <dt>E-mail</dt>
              <dd>{modal.usuario.email}</dd>
            </div>
            <div>
              <dt>Cargo</dt>
              <dd>
                <Etiqueta tom={tomCargo(modal.usuario.cargo)}>{modal.usuario.cargo}</Etiqueta>
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
        <Modal titulo="Remover usuário" aoFechar={fechar} largura="420px">
          <Aviso>{erroModal}</Aviso>
          <p>
            Tem certeza que deseja remover <strong>{modal.usuario.nome}</strong>? Essa ação não
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
