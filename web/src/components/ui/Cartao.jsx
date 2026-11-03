// Caixa branca com título opcional e área de ações no canto direito.
export default function Cartao({ titulo, acoes, children, className = '' }) {
  return (
    <section className={`cartao ${className}`}>
      {(titulo || acoes) && (
        <header className="cartao__cabecalho">
          {titulo && <h2 className="cartao__titulo">{titulo}</h2>}
          {acoes && <div className="cartao__acoes">{acoes}</div>}
        </header>
      )}
      <div className="cartao__corpo">{children}</div>
    </section>
  );
}
