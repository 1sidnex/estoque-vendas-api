'use client';

import { useEffect } from 'react';

// Modal genérico: fecha ao clicar no fundo, no X ou com Esc.
export default function Modal({ titulo, aoFechar, children, largura }) {
  useEffect(() => {
    function aoTeclar(e) {
      if (e.key === 'Escape') aoFechar?.();
    }
    document.addEventListener('keydown', aoTeclar);
    return () => document.removeEventListener('keydown', aoTeclar);
  }, [aoFechar]);

  return (
    <div className="modal__fundo" onClick={aoFechar}>
      <div
        className="modal"
        style={largura ? { maxWidth: largura } : undefined}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="modal__cabecalho">
          <h2 className="modal__titulo">{titulo}</h2>
          <button type="button" className="modal__fechar" onClick={aoFechar} aria-label="Fechar">
            ×
          </button>
        </header>
        <div className="modal__corpo">{children}</div>
      </div>
    </div>
  );
}
