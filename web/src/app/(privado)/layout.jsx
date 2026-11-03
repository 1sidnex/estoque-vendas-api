import RotaPrivada from '@/components/RotaPrivada';
import LayoutApp from '@/components/LayoutApp';

// Layout das páginas internas: RotaPrivada bloqueia não autenticados e
// LayoutApp desenha a casca.
export default function LayoutPrivado({ children }) {
  return (
    <RotaPrivada>
      <LayoutApp>{children}</LayoutApp>
    </RotaPrivada>
  );
}
