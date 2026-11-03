import './globals.css';
import { AuthProvider } from '@/context/AuthContext';

export const metadata = {
  title: 'Estoque & Vendas',
  description: 'Painel de controle de estoque e vendas da loja',
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>
        {/* AuthProvider disponibiliza a sessão para toda a aplicação. */}
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
