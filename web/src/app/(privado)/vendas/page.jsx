'use client';

import { useCallback, useEffect, useState } from 'react';
import useAuth from '@/hooks/useAuth';
import * as vendaService from '@/services/vendaService';
import * as produtoService from '@/services/produtoService';
import { formatarData, formatarMoeda } from '@/lib/formato';
import Cartao from '@/components/ui/Cartao';
import Botao from '@/components/ui/Botao';
import Aviso from '@/components/ui/Aviso';
import Etiqueta from '@/components/ui/Etiqueta';
import Modal from '@/components/ui/Modal';
import FormularioVenda from '@/components/vendas/FormularioVenda';

const STATUS = {
  concluida: { rotulo: 'Concluída', tom: 'sucesso' },
  cancelada: { rotulo: 'Cancelada', tom: 'perigo' },
};

function EtiquetaStatus({ status }) {
  return <Etiqueta tom={STATUS[status]?.tom}>{STATUS[status]?.rotulo || status}</Etiqueta>;
}

export default function VendasPage() {
  const { ehAdmin } = useAuth();

  const [vendas, setVendas] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');

  // modal: { tipo: 'criar'|'detalhes'|'cancelar', venda }
  const [modal, setModal] = useState(null);
  const [salvando, setSalvando] = useState(false);
  const [erroModal, setErroModal] = useState('');

  const produtosVendaveis = produtos.filter((p) => p.ativo && p.quantidadeEstoque > 0);

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro('');
    try {
      const [listaVendas, listaProdutos] = await Promise.all([
        vendaService.listar(),
        produtoService.listar(),
      ]);
      setVendas(listaVendas);
      setProdutos(listaProdutos);
    } catch (e) {
      setErro(e.message);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  function abrir(tipo, venda = null) {
    setErroModal('');
    setModal({ tipo, venda });
  }

  function fechar() {
    setModal(null);
    setErroModal('');
  }

  async function registrar(itens) {
    setSalvando(true);
    setErroModal('');
    try {
      await vendaService.criar(itens);
      setSucesso('Venda registrada com sucesso.');
      fechar();
      await carregar();
    } catch (e) {
      setErroModal(e.message);
    } finally {
      setSalvando(false);
    }
  }

  async function cancelar() {
    setSalvando(true);
    setErroModal('');
    try {
      await vendaService.cancelar(modal.venda._id);
      setSucesso('Venda cancelada e itens devolvidos ao estoque.');
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
          <h1 className="pagina__titulo">Vendas</h1>
          <p className="pagina__subtitulo">Histórico de vendas da loja.</p>
        </div>
        <Botao onClick={() => abrir('criar')} disabled={carregando}>
          Nova venda
        </Botao>
      </div>

      {sucesso && <Aviso tipo="sucesso" aoFechar={() => setSucesso('')}>{sucesso}</Aviso>}
      {erro && <Aviso aoFechar={() => setErro('')}>{erro}</Aviso>}

      <Cartao>
        {carregando ? (
          <div className="estado">Carregando vendas...</div>
        ) : vendas.length === 0 ? (
          <div className="estado">Nenhuma venda registrada.</div>
        ) : (
          <div className="tabela-wrap">
            <table className="tabela">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Vendedor</th>
                  <th className="numero">Itens</th>
                  <th className="numero">Total</th>
                  <th>Status</th>
                  <th className="numero">Ações</th>
                </tr>
              </thead>
              <tbody>
                {vendas.map((v) => (
                  <tr key={v._id}>
                    <td>{formatarData(v.createdAt)}</td>
                    <td>{v.usuario?.nome || '—'}</td>
                    <td className="numero">{v.itens.length}</td>
                    <td className="numero">{formatarMoeda(v.total)}</td>
                    <td>
                      <EtiquetaStatus status={v.status} />
                    </td>
                    <td>
                      <div className="tabela__acoes">
                        <Botao
                          variante="texto"
                          className="botao--pequeno"
                          onClick={() => abrir('detalhes', v)}
                        >
                          Ver
                        </Botao>
                        {ehAdmin && v.status === 'concluida' && (
                          <Botao
                            variante="texto"
                            className="botao--pequeno"
                            onClick={() => abrir('cancelar', v)}
                          >
                            Cancelar
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

      {/* Nova venda */}
      {modal && modal.tipo === 'criar' && (
        <Modal titulo="Nova venda" aoFechar={fechar} largura="640px">
          <FormularioVenda
            produtos={produtosVendaveis}
            aoSalvar={registrar}
            aoCancelar={fechar}
            salvando={salvando}
            erroGeral={erroModal}
          />
        </Modal>
      )}

      {/* Detalhes */}
      {modal && modal.tipo === 'detalhes' && (
        <Modal titulo="Detalhes da venda" aoFechar={fechar} largura="560px">
          <dl className="detalhes">
            <div>
              <dt>Data</dt>
              <dd>{formatarData(modal.venda.createdAt)}</dd>
            </div>
            <div>
              <dt>Vendedor</dt>
              <dd>{modal.venda.usuario?.nome || '—'}</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>
                <EtiquetaStatus status={modal.venda.status} />
              </dd>
            </div>
          </dl>
          <div className="tabela-wrap">
            <table className="tabela">
              <thead>
                <tr>
                  <th>Produto</th>
                  <th className="numero">Qtd.</th>
                  <th className="numero">Preço</th>
                  <th className="numero">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {modal.venda.itens.map((item, indice) => (
                  <tr key={indice}>
                    <td>{item.produto?.nome || 'Produto removido'}</td>
                    <td className="numero">{item.quantidade}</td>
                    <td className="numero">{formatarMoeda(item.precoUnitario)}</td>
                    <td className="numero">
                      {formatarMoeda(item.precoUnitario * item.quantidade)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="venda__total">
            Total: <strong>{formatarMoeda(modal.venda.total)}</strong>
          </p>
          <div className="modal__acoes">
            <Botao variante="secundario" onClick={fechar}>
              Fechar
            </Botao>
          </div>
        </Modal>
      )}

      {/* Cancelamento */}
      {modal && modal.tipo === 'cancelar' && (
        <Modal titulo="Cancelar venda" aoFechar={fechar} largura="420px">
          <Aviso>{erroModal}</Aviso>
          <p>
            Cancelar a venda de <strong>{formatarMoeda(modal.venda.total)}</strong>? Os itens voltam
            ao estoque e a venda continua no histórico como cancelada.
          </p>
          <div className="modal__acoes">
            <Botao variante="secundario" onClick={fechar}>
              Voltar
            </Botao>
            <Botao variante="perigo" onClick={cancelar} carregando={salvando}>
              Cancelar venda
            </Botao>
          </div>
        </Modal>
      )}
    </div>
  );
}
