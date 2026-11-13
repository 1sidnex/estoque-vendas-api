'use client';

import { useState } from 'react';
import { formatarMoeda } from '@/lib/formato';
import Cartao from '@/components/ui/Cartao';
import estilos from './VendasPorVendedor.module.css';

const PERIODOS = [
  { valor: 'dia', rotulo: 'Hoje' },
  { valor: 'semana', rotulo: 'Esta semana' },
  { valor: 'mes', rotulo: 'Este mês' },
];

// Início do período no horário local: hoje à meia-noite, a segunda-feira
// desta semana ou o dia 1 deste mês.
function inicioDoPeriodo(periodo, agora = new Date()) {
  const ano = agora.getFullYear();
  const mes = agora.getMonth();
  const dia = agora.getDate();
  if (periodo === 'mes') return new Date(ano, mes, 1);
  if (periodo === 'semana') {
    const diasDesdeSegunda = (agora.getDay() + 6) % 7;
    return new Date(ano, mes, dia - diasDesdeSegunda);
  }
  return new Date(ano, mes, dia);
}

// Soma as vendas concluídas do período por vendedor. Quem não vendeu nada
// também aparece (com zero), para o admin ver a equipe inteira.
function agruparPorVendedor(vendas, usuarios, periodo) {
  const inicio = inicioDoPeriodo(periodo);
  const porVendedor = new Map(
    usuarios.map((u) => [u._id, { id: u._id, nome: u.nome, quantidade: 0, total: 0 }])
  );

  for (const venda of vendas) {
    if (venda.status !== 'concluida' || new Date(venda.createdAt) < inicio) continue;
    const id = venda.usuario?._id || 'removido';
    const nome = venda.usuario?.nome || 'Usuário removido';
    const atual = porVendedor.get(id) || { id, nome, quantidade: 0, total: 0 };
    porVendedor.set(id, {
      ...atual,
      quantidade: atual.quantidade + 1,
      total: atual.total + venda.total,
    });
  }

  return [...porVendedor.values()].sort(
    (a, b) => b.total - a.total || a.nome.localeCompare(b.nome)
  );
}

// Dashboard do admin: valor vendido e número de vendas de cada vendedor,
// no dia, na semana ou no mês atual.
export default function VendasPorVendedor({ vendas, usuarios }) {
  const [periodo, setPeriodo] = useState('dia');

  const linhas = agruparPorVendedor(vendas, usuarios, periodo);
  const totalVendido = linhas.reduce((soma, l) => soma + l.total, 0);
  const totalVendas = linhas.reduce((soma, l) => soma + l.quantidade, 0);
  const maior = Math.max(...linhas.map((l) => l.total), 0);
  const rotuloPeriodo = PERIODOS.find((p) => p.valor === periodo).rotulo.toLowerCase();

  return (
    <Cartao titulo="Vendas por vendedor" className={estilos.cartao}>
      <div className={estilos.periodos} role="group" aria-label="Período">
        {PERIODOS.map((p) => (
          <button
            key={p.valor}
            type="button"
            className={`${estilos.periodo} ${periodo === p.valor ? estilos.periodoAtivo : ''}`}
            aria-pressed={periodo === p.valor}
            onClick={() => setPeriodo(p.valor)}
          >
            {p.rotulo}
          </button>
        ))}
      </div>

      <dl className={estilos.totais}>
        <div>
          <dt>Total vendido</dt>
          <dd>{formatarMoeda(totalVendido)}</dd>
        </div>
        <div>
          <dt>Vendas</dt>
          <dd>{totalVendas}</dd>
        </div>
        <div>
          <dt>Ticket médio</dt>
          <dd>{formatarMoeda(totalVendas ? totalVendido / totalVendas : 0)}</dd>
        </div>
      </dl>

      {linhas.length === 0 ? (
        <div className="estado">Nenhum vendedor cadastrado.</div>
      ) : (
        <div className="tabela-wrap">
          <table className={`tabela ${estilos.tabela}`}>
            <caption className={estilos.legenda}>
              Valor vendido por vendedor ({rotuloPeriodo}), do maior para o menor. Só
              vendas concluídas.
            </caption>
            <thead>
              <tr>
                <th>Vendedor</th>
                <th className="numero">Vendas</th>
                <th>Valor vendido</th>
              </tr>
            </thead>
            <tbody>
              {linhas.map((l) => {
                const largura = maior > 0 ? (l.total / maior) * 100 : 0;
                return (
                  <tr
                    key={l.id}
                    className={estilos.linha}
                    title={`${l.nome}: ${l.quantidade} venda(s), ${formatarMoeda(l.total)}`}
                  >
                    <td>{l.nome}</td>
                    <td className="numero">{l.quantidade}</td>
                    <td>
                      <div className={estilos.celulaBarra}>
                        <span className={estilos.trilho} aria-hidden="true">
                          {largura > 0 && (
                            <span className={estilos.barra} style={{ width: `${largura}%` }} />
                          )}
                        </span>
                        <span className={estilos.valor}>{formatarMoeda(l.total)}</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Cartao>
  );
}
