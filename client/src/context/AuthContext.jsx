import { createContext, useCallback, useMemo, useState } from 'react';
import * as authService from '../api/authService';

export const AuthContext = createContext(null);

// Lê a sessão salva no localStorage. Assim o usuário não perde o login
// ao atualizar a página (F5).
function lerSessaoSalva() {
  try {
    const token = localStorage.getItem('token');
    const usuario = localStorage.getItem('usuario');
    if (!token || !usuario) return { token: null, usuario: null };
    return { token, usuario: JSON.parse(usuario) };
  } catch {
    return { token: null, usuario: null };
  }
}

export function AuthProvider({ children }) {
  const [sessao, setSessao] = useState(lerSessaoSalva);

  const entrar = useCallback(async (email, senha) => {
    const { token, usuario } = await authService.login(email, senha);
    localStorage.setItem('token', token);
    localStorage.setItem('usuario', JSON.stringify(usuario));
    setSessao({ token, usuario });
    return usuario;
  }, []);

  const sair = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    setSessao({ token: null, usuario: null });
  }, []);

  const valor = useMemo(
    () => ({
      usuario: sessao.usuario,
      token: sessao.token,
      autenticado: Boolean(sessao.token),
      ehAdmin: sessao.usuario?.cargo === 'admin',
      entrar,
      sair,
    }),
    [sessao, entrar, sair]
  );

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}
