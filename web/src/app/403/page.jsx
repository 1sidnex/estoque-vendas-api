import Link from 'next/link';

// 403: acesso negado por falta de permissão (enviado pelo RotaPrivada).
export default function AcessoNegado() {
  return (
    <div className="aviso-pagina">
      <h1>403</h1>
      <p>Você não tem permissão para acessar esta página.</p>
      <Link href="/" className="botao botao--primario">
        Voltar ao início
      </Link>
    </div>
  );
}
