// Barra acima das listagens: campo de busca e, opcionalmente, um seletor.
// `selecao` = { rotulo, todos, valor, aoMudar, opcoes: [{ valor, rotulo }] }.
// Enquanto há filtro ativo, mostra quantos itens aparecem do total.
export default function FiltroLista({ busca, aoBuscar, placeholder, selecao, exibidos, total }) {
  const filtrando = busca.trim() !== '' || Boolean(selecao?.valor);

  return (
    <div className="filtros">
      <input
        type="search"
        className="campo__entrada filtros__busca"
        placeholder={placeholder}
        aria-label={placeholder}
        value={busca}
        onChange={(e) => aoBuscar(e.target.value)}
      />
      {selecao && (
        <select
          className="campo__entrada filtros__selecao"
          aria-label={selecao.rotulo}
          value={selecao.valor}
          onChange={(e) => selecao.aoMudar(e.target.value)}
        >
          <option value="">{selecao.todos}</option>
          {selecao.opcoes.map((opcao) => (
            <option key={opcao.valor} value={opcao.valor}>
              {opcao.rotulo}
            </option>
          ))}
        </select>
      )}
      {filtrando && (
        <span className="filtros__contagem">
          {exibidos} de {total}
        </span>
      )}
    </div>
  );
}
