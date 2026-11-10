import http from '@/lib/http';

// GET /api/usuarios -> { sucesso, usuarios } (somente admin)
export async function listar() {
  const { data } = await http.get('/usuarios');
  return data.usuarios;
}

// POST /api/usuarios -> admin cria usuário escolhendo o cargo
export async function criar(dados) {
  const { data } = await http.post('/usuarios', dados);
  return data.usuario;
}

// PUT /api/usuarios/:id -> a API só altera nome e cargo
export async function atualizar(id, dados) {
  const { data } = await http.put(`/usuarios/${id}`, dados);
  return data.usuario;
}

export async function deletar(id) {
  await http.delete(`/usuarios/${id}`);
}
