import axios from 'axios';

// Instância do axios usada pelos serviços. baseURL vem do .env ou cai no padrão.
const http = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
});

// Anexa o token JWT em toda requisição (sem tocar no localStorage no servidor).
http.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Extrai a mensagem de erro da API para as telas lerem só `erro.message`.
http.interceptors.response.use(
  (resposta) => resposta,
  (erro) => {
    const rota = erro.config?.url || '';
    // No login/cadastro, 401 é "senha errada" e não deve derrubar a sessão.
    const ehRotaDeLogin = /\/auth\/(login|registrar)$/.test(rota);

    // Token expirado ou inválido em rota protegida: derruba a sessão.
    if (erro.response?.status === 401 && !ehRotaDeLogin && typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      window.location.href = '/login';
    }

    const dados = erro.response?.data;

    // Sem o formato { sucesso, mensagem }, o problema é de conexão com a API.
    const respostaNaoEhDaApi = !erro.response || typeof dados?.sucesso === 'undefined';

    const mensagem =
      dados?.mensagem ||
      (respostaNaoEhDaApi
        ? 'Não foi possível conectar à API. Confira se o servidor Express está rodando em http://localhost:3000.'
        : 'Erro inesperado ao comunicar com a API.');

    return Promise.reject(new Error(mensagem));
  }
);

export default http;
