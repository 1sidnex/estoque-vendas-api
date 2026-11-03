// Campo de seleção (<select>). `opcoes` é uma lista de { valor, rotulo }.
export default function Selecao({ rotulo, id, opcoes = [], placeholder, erro, ...resto }) {
  return (
    <div className="campo">
      {rotulo && (
        <label className="campo__rotulo" htmlFor={id}>
          {rotulo}
        </label>
      )}
      <select
        id={id}
        className={`campo__entrada ${erro ? 'campo__entrada--erro' : ''}`}
        {...resto}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {opcoes.map((opcao) => (
          <option key={opcao.valor} value={opcao.valor}>
            {opcao.rotulo}
          </option>
        ))}
      </select>
      {erro && <span className="campo__erro">{erro}</span>}
    </div>
  );
}
