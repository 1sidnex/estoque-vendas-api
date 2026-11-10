import http from '@/lib/http';

// GET /api/categorias -> { sucesso, categorias }
export async function listar() {
  const { data } = await http.get('/categorias');
  return data.categorias;
}

export async function criar(dados) {
  const { data } = await http.post('/categorias', dados);
  return data.categoria;
}

export async function atualizar(id, dados) {
  const { data } = await http.put(`/categorias/${id}`, dados);
  return data.categoria;
}

export async function deletar(id) {
  await http.delete(`/categorias/${id}`);
}
