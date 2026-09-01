// Mensagem de erro ou de sucesso exibida no topo das telas.
// tipo: 'erro' | 'sucesso'
export default function Aviso({ tipo = 'erro', children, aoFechar }) {
  if (!children) return null;
  return (
    <div className={`aviso aviso--${tipo}`}>
      <span>{children}</span>
      {aoFechar && (
        <button type="button" className="aviso__fechar" onClick={aoFechar} aria-label="Fechar">
          ×
        </button>
      )}
    </div>
  );
}
