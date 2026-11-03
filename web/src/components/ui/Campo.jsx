// Campo de formulário: rótulo + input + mensagem de erro.
// Evita repetir essa mesma marcação em cada formulário do projeto.
export default function Campo({ rotulo, id, erro, dica, ...resto }) {
  return (
    <div className="campo">
      <label className="campo__rotulo" htmlFor={id}>
        {rotulo}
      </label>
      <input
        id={id}
        className={`campo__entrada ${erro ? 'campo__entrada--erro' : ''}`}
        {...resto}
      />
      {dica && !erro && <span className="campo__dica">{dica}</span>}
      {erro && <span className="campo__erro">{erro}</span>}
    </div>
  );
}
