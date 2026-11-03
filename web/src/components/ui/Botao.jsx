// Botão padrão da aplicação.
// variante: 'primario' | 'secundario' | 'perigo' | 'texto'
export default function Botao({
  children,
  variante = 'primario',
  tipo = 'button',
  carregando = false,
  className = '',
  ...resto
}) {
  return (
    <button
      type={tipo}
      className={`botao botao--${variante} ${className}`}
      disabled={carregando || resto.disabled}
      {...resto}
    >
      {carregando ? 'Aguarde...' : children}
    </button>
  );
}
