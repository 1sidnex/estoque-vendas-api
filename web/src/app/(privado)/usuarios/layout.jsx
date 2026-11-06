import RotaPrivada from '@/components/RotaPrivada';

// Gestão de usuários é restrita a admin; os demais vão para /403.
export default function LayoutUsuarios({ children }) {
  return <RotaPrivada cargo="admin">{children}</RotaPrivada>;
}
