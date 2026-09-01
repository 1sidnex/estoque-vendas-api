import { Navigate, Outlet, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

// Protege as rotas internas: sem token, o usuário é mandado para /login.
// Guardamos de onde ele veio para poder devolvê-lo ao mesmo lugar depois
// que o login der certo.
export default function RotaPrivada() {
  const { autenticado } = useAuth();
  const localizacao = useLocation();

  if (!autenticado) {
    return <Navigate to="/login" state={{ de: localizacao.pathname }} replace />;
  }

  return <Outlet />;
}
