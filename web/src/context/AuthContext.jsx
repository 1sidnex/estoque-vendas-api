'use client';

import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import * as authService from '@/services/authService';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [sessao, setSessao] = useState({ token: null, usuario: null });
  // true até ler o localStorage no cliente (evita mismatch de hidratação).
  const [carregando, setCarregando] = useState(true);

  // Recupera a sessão salva ao montar no navegador.
  useEffect(() => {
    try {
      const token = localStorage.getItem('token');
      const usuario = localStorage.getItem('usuario');
      if (token && usuario) {
        setSessao({ token, usuario: JSON.parse(usuario) });
      }
    } catch {
      // localStorage indisponível ou dado inválido: segue deslogado.
    }
    setCarregando(false);
  }, []);

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
      carregando,
      entrar,
      sair,
    }),
    [sessao, carregando, entrar, sair]
  );

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}
