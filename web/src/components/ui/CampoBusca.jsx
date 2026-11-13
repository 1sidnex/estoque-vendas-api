'use client';

import { useEffect, useState } from 'react';

// Ignora maiúsculas e acentos: "agua" encontra "Água mineral".
function normalizar(texto) {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();
}

// Campo de texto que filtra uma lista de opções enquanto se digita.
// `opcoes` é uma lista de { valor, rotulo, detalhe }. `valor` vazio limpa o campo.
// Teclado: setas navegam, Enter escolhe, Esc fecha.
export default function CampoBusca({
  id,
  rotulo,
  opcoes = [],
  valor,
  aoSelecionar,
  placeholder,
  vazio = 'Nenhum resultado encontrado.',
  inputRef,
}) {
  const [texto, setTexto] = useState('');
  const [aberto, setAberto] = useState(false);
  const [ativo, setAtivo] = useState(0);

  // Quando o formulário limpa a seleção (ex.: depois de adicionar), limpa o texto.
  useEffect(() => {
    if (!valor) setTexto('');
  }, [valor]);

  const palavras = normalizar(texto).split(/\s+/).filter(Boolean);
  const filtradas = opcoes.filter((opcao) => {
    const rotuloNormalizado = normalizar(opcao.rotulo);
    return palavras.every((palavra) => rotuloNormalizado.includes(palavra));
  });

  function escolher(opcao) {
    setTexto(opcao.rotulo);
    setAberto(false);
    aoSelecionar(opcao.valor);
  }

  function digitar(evento) {
    setTexto(evento.target.value);
    setAtivo(0);
    setAberto(true);
    if (valor) aoSelecionar('');
  }

  function aoTeclar(evento) {
    if (evento.key === 'ArrowDown' || evento.key === 'ArrowUp') {
      evento.preventDefault();
      if (!aberto) {
        setAberto(true);
        return;
      }
      const passo = evento.key === 'ArrowDown' ? 1 : -1;
      setAtivo((antes) => (antes + passo + filtradas.length) % Math.max(filtradas.length, 1));
    } else if (evento.key === 'Enter' && aberto) {
      // Enter escolhe a opção destacada em vez de enviar o formulário.
      evento.preventDefault();
      if (filtradas[ativo]) escolher(filtradas[ativo]);
    } else if (evento.key === 'Escape') {
      setAberto(false);
    }
  }

  const idLista = `${id}-lista`;
  const mostrarLista = aberto && opcoes.length > 0;

  return (
    <div className="campo busca">
      {rotulo && (
        <label className="campo__rotulo" htmlFor={id}>
          {rotulo}
        </label>
      )}
      <input
        id={id}
        ref={inputRef}
        className="campo__entrada"
        type="text"
        autoComplete="off"
        role="combobox"
        aria-expanded={mostrarLista}
        aria-controls={idLista}
        aria-autocomplete="list"
        aria-activedescendant={mostrarLista && filtradas[ativo] ? `${id}-opcao-${ativo}` : undefined}
        value={texto}
        placeholder={placeholder}
        onChange={digitar}
        onKeyDown={aoTeclar}
        onFocus={() => setAberto(true)}
        onBlur={() => setAberto(false)}
      />
      {mostrarLista && (
        <ul id={idLista} className="busca__lista" role="listbox">
          {filtradas.length === 0 ? (
            <li className="busca__vazio">{vazio}</li>
          ) : (
            filtradas.map((opcao, indice) => (
              <li
                key={opcao.valor}
                id={`${id}-opcao-${indice}`}
                role="option"
                aria-selected={indice === ativo}
                className={`busca__opcao ${indice === ativo ? 'busca__opcao--ativa' : ''}`}
                // mousedown evita que o blur do campo feche a lista antes do clique
                onMouseDown={(e) => {
                  e.preventDefault();
                  escolher(opcao);
                }}
                onMouseEnter={() => setAtivo(indice)}
              >
                <span>{opcao.rotulo}</span>
                {opcao.detalhe && <span className="busca__detalhe">{opcao.detalhe}</span>}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
