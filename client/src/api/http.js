import axios from 'axios';

// Instância única do axios usada por todos os serviços.
// Em desenvolvimento a baseURL é /api, e o proxy do Vite encaminha
// as chamadas para o Express (http://localhost:3000).
const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

// Antes de cada requisição, anexa o token JWT salvo no login.
// É o header que o middleware `autenticar` da API espera.
http.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Centraliza o tratamento de erro. A API sempre responde no formato
// { sucesso: false, mensagem: '...' }, então extraímos a mensagem aqui
// e as telas só precisam ler `erro.message`.
http.interceptors.response.use(
  (resposta) => resposta,
  (erro) => {
    const rota = erro.config?.url || '';
    const ehRotaDeLogin = rota.includes('/auth/');

    // Token expirado ou inválido em rota protegida: derruba a sessão.
    if (erro.response?.status === 401 && !ehRotaDeLogin) {
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      window.location.href = '/login';
    }

    const dados = erro.response?.data;

    // A API sempre responde { sucesso, mensagem }. Se a resposta não tem esse
    // formato (ou nem chegou a existir), o problema é de conexão: servidor
    // fora do ar, porta errada ou o proxy do Vite sem destino.
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
