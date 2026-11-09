import http from '@/lib/http';

// GET /api/vendas -> { sucesso, vendas } (usuario e itens.produto populados)
export async function listar() {
  const { data } = await http.get('/vendas');
  return data.vendas;
}

// POST /api/vendas -> a API calcula o total e dá baixa no estoque
export async function criar(itens) {
  const { data } = await http.post('/vendas', { itens });
  return data.venda;
}

// PATCH /api/vendas/:id/cancelar -> devolve os itens ao estoque (somente admin)
export async function cancelar(id) {
  const { data } = await http.patch(`/vendas/${id}/cancelar`);
  return data.venda;
}
