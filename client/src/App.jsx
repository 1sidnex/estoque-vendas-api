import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import RotaPrivada from './components/RotaPrivada';

import Login from './pages/Login';
import Registrar from './pages/Registrar';
import Home from './pages/Home';
import NaoEncontrada from './pages/NaoEncontrada';

// Mapa de rotas da aplicação.
// O AuthProvider fica por fora de tudo para que qualquer página consiga
// saber quem está logado. A Home fica dentro de <RotaPrivada>, que exige
// um token válido.
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* públicas */}
          <Route path="/login" element={<Login />} />
          <Route path="/registrar" element={<Registrar />} />

          {/* exige estar autenticado */}
          <Route element={<RotaPrivada />}>
            <Route index element={<Home />} />
          </Route>

          <Route path="/404" element={<NaoEncontrada />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
