import { Link } from 'react-router-dom';
import Botao from '../components/ui/Botao';

export default function NaoEncontrada() {
  return (
    <div className="nao-encontrada">
      <h1>404</h1>
      <p>A página que você tentou abrir não existe.</p>
      <Link to="/">
        <Botao>Voltar ao início</Botao>
      </Link>
    </div>
  );
}
