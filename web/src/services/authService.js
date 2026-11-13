import http from '@/lib/http';

// POST /api/auth/login -> { sucesso, token, usuario }
export async function login(email, senha) {
  const { data } = await http.post('/auth/login', { email, senha });
  return { token: data.token, usuario: data.usuario };
}

// GET /api/auth/eu -> { sucesso, usuario } com o cargo atual
export async function eu() {
  const { data } = await http.get('/auth/eu');
  return data.usuario;
}

// POST /api/auth/registrar -> { sucesso, usuario }
export async function registrar(dados) {
  const { data } = await http.post('/auth/registrar', dados);
  return data.usuario;
}
