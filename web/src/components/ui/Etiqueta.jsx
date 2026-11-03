// Etiqueta colorida usada para cargo, status da venda e nível de estoque.
// tom: 'neutro' | 'sucesso' | 'alerta' | 'perigo' | 'info'
export default function Etiqueta({ children, tom = 'neutro' }) {
  return <span className={`etiqueta etiqueta--${tom}`}>{children}</span>;
}
