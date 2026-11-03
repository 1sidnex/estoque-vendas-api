import http from '@/lib/http';

// GET /api/produtos -> { sucesso, produtos } (categoria e fornecedor populados)
export async function listar() {
  const { data } = await http.get('/produtos');
  return data.produtos;
}

export async function buscarPorId(id) {
  const { data } = await http.get(`/produtos/${id}`);
  return data.produto;
}

export async function criar(dados) {
  const { data } = await http.post('/produtos', dados);
  return data.produto;
}

export async function atualizar(id, dados) {
  const { data } = await http.put(`/produtos/${id}`, dados);
  return data.produto;
}

export async function deletar(id) {
  await http.delete(`/produtos/${id}`);
}
