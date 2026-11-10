import http from '@/lib/http';

// GET /api/fornecedores -> { sucesso, fornecedores }
export async function listar() {
  const { data } = await http.get('/fornecedores');
  return data.fornecedores;
}

export async function criar(dados) {
  const { data } = await http.post('/fornecedores', dados);
  return data.fornecedor;
}

export async function atualizar(id, dados) {
  const { data } = await http.put(`/fornecedores/${id}`, dados);
  return data.fornecedor;
}

export async function deletar(id) {
  await http.delete(`/fornecedores/${id}`);
}
