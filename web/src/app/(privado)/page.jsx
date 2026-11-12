'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import useAuth from '@/hooks/useAuth';
import * as produtoService from '@/services/produtoService';
import * as vendaService from '@/services/vendaService';
import { formatarData, formatarMoeda } from '@/lib/formato';
import { LIMITE_ESTOQUE_BAIXO, tomEstoque } from '@/lib/estoque';
import Cartao from '@/components/ui/Cartao';
import Aviso from '@/components/ui/Aviso';
import Etiqueta from '@/components/ui/Etiqueta';
import EtiquetaStatus from '@/components/vendas/EtiquetaStatus';

const QTD_ULTIMAS_VENDAS = 5;

function ehHoje(data) {
  return new Date(data).toDateString() === new Date().toDateString();
}

// Calcula os números do painel a partir das listas da API.
function resumir(produtos, vendas) {
  const ativos = produtos.filter((p) => p.ativo);
  const esgotados = ativos.filter((p) => p.quantidadeEstoque <= 0);
  const baixos = ativos.filter(
    (p) => p.quantidadeEstoque > 0 && p.quantidadeEstoque <= LIMITE_ESTOQUE_BAIXO
  );
  const vendasHoje = vendas.filter((v) => v.status === 'concluida' && ehHoje(v.createdAt));

  return {
    produtosAtivos: ativos.length,
    esgotados: esgotados.length,
    estoqueBaixo: baixos.length,
    paraRepor: [...esgotados, ...baixos],
    vendasHoje: vendasHoje.length,
    totalHoje: vendasHoje.reduce((soma, v) => soma + v.total, 0),
    // a API já devolve as vendas da mais recente para a mais antiga
    ultimasVendas: vendas.slice(0, QTD_ULTIMAS_VENDAS),
  };
}

function Indicador({ rotulo, valor, detalhe, tom }) {
  return (
    <div className={`indicador ${tom ? `indicador--${tom}` : ''}`}>
      <span className="indicador__rotulo">{rotulo}</span>
      <strong className="indicador__valor">{valor}</strong>
      {detalhe && <span className="indicador__detalhe">{detalhe}</span>}
    </div>
  );
}

// Painel inicial: resumo do estoque e das vendas para admin e vendedor.
export default function PainelPage() {
  const { usuario } = useAuth();
  const primeiroNome = usuario?.nome?.split(' ')[0] || 'bem-vindo';

  const [resumo, setResumo] = useState(null);
  const [erro, setErro] = useState('');

  const carregar = useCallback(async () => {
    setErro('');
    try {
      const [produtos, vendas] = await Promise.all([
        produtoService.listar(),
        vendaService.listar(),
      ]);
      setResumo(resumir(produtos, vendas));
    } catch (e) {
      setErro(e.message);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  return (
    <div className="painel">
      <h1 className="painel__titulo">Olá, {primeiroNome}!</h1>
      <p className="painel__subtitulo">Resumo do estoque e das vendas da loja.</p>

      {erro && <Aviso aoFechar={() => setErro('')}>{erro}</Aviso>}

      {!resumo && !erro && <div className="estado">Carregando resumo...</div>}

      {resumo && (
        <>
          <div className="indicadores">
            <Indicador rotulo="Produtos ativos" valor={resumo.produtosAtivos} />
            <Indicador
              rotulo="Estoque baixo"
              valor={resumo.estoqueBaixo}
              detalhe={`até ${LIMITE_ESTOQUE_BAIXO} unidades`}
              tom={resumo.estoqueBaixo > 0 ? 'alerta' : undefined}
            />
            <Indicador
              rotulo="Esgotados"
              valor={resumo.esgotados}
              tom={resumo.esgotados > 0 ? 'perigo' : undefined}
            />
            <Indicador
              rotulo="Vendas hoje"
              valor={resumo.vendasHoje}
              detalhe={formatarMoeda(resumo.totalHoje)}
            />
          </div>

          <div className="painel__grade">
            <Cartao
              titulo="Produtos para repor"
              acoes={<Link href="/produtos">Ver produtos</Link>}
            >
              {resumo.paraRepor.length === 0 ? (
                <div className="estado">Nenhum produto com estoque baixo.</div>
              ) : (
                <div className="tabela-wrap">
                  <table className="tabela">
                    <thead>
                      <tr>
                        <th>Produto</th>
                        <th className="numero">Estoque</th>
                      </tr>
                    </thead>
                    <tbody>
                      {resumo.paraRepor.map((p) => (
                        <tr key={p._id}>
                          <td>{p.nome}</td>
                          <td className="numero">
                            <Etiqueta tom={tomEstoque(p.quantidadeEstoque)}>
                              {p.quantidadeEstoque}
                            </Etiqueta>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Cartao>

            <Cartao titulo="Últimas vendas" acoes={<Link href="/vendas">Ver vendas</Link>}>
              {resumo.ultimasVendas.length === 0 ? (
                <div className="estado">Nenhuma venda registrada.</div>
              ) : (
                <div className="tabela-wrap">
                  <table className="tabela">
                    <thead>
                      <tr>
                        <th>Data</th>
                        <th className="numero">Total</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {resumo.ultimasVendas.map((v) => (
                        <tr key={v._id}>
                          <td>{formatarData(v.createdAt)}</td>
                          <td className="numero">{formatarMoeda(v.total)}</td>
                          <td>
                            <EtiquetaStatus status={v.status} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Cartao>
          </div>
        </>
      )}
    </div>
  );
}
