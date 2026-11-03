import Link from 'next/link';

// 404: o Next usa este arquivo para qualquer rota inexistente.
export default function NaoEncontrada() {
  return (
    <div className="aviso-pagina">
      <h1>404</h1>
      <p>A página que você tentou abrir não existe.</p>
      <Link href="/" className="botao botao--primario">
        Voltar ao início
      </Link>
    </div>
  );
}
