import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

// Atalho para consumir o AuthContext sem repetir useContext em toda tela.
export default function useAuth() {
  const contexto = useContext(AuthContext);
  if (!contexto) {
    throw new Error('useAuth precisa estar dentro de <AuthProvider>.');
  }
  return contexto;
}
