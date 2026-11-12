// A partir desta quantidade (inclusive) o estoque é considerado baixo.
export const LIMITE_ESTOQUE_BAIXO = 5;

// Tom da etiqueta conforme o nível de estoque.
export function tomEstoque(qtd) {
  if (qtd <= 0) return 'perigo';
  if (qtd <= LIMITE_ESTOQUE_BAIXO) return 'alerta';
  return 'sucesso';
}
