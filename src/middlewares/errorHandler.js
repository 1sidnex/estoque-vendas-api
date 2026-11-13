// Middleware global de tratamento de erros.
// Garante que o servidor nunca "caia" por causa de uma exceção não tratada
// nas rotas — tudo cai aqui e retorna uma resposta HTTP padronizada.

// Nome dos campos como aparecem para o usuário.
const ROTULOS = {
  nome: 'nome',
  email: 'e-mail',
  senha: 'senha',
  cargo: 'cargo',
  cnpj: 'CNPJ',
  telefone: 'telefone',
  descricao: 'descrição',
  preco: 'preço',
  quantidadeEstoque: 'quantidade em estoque',
  categoria: 'categoria',
  fornecedor: 'fornecedor',
  ativo: 'situação',
  quantidade: 'quantidade',
};

// Mensagens para valor repetido em campo único (unique: true).
const DUPLICADOS = {
  email: 'Já existe um usuário com este e-mail.',
  cnpj: 'Já existe um fornecedor com este CNPJ.',
  nome: 'Já existe uma categoria com este nome.',
};

function rotulo(caminho) {
  const campo = caminho.split('.').pop();
  return ROTULOS[campo] || campo;
}

// Valor de tipo errado (ex.: texto no preço) ou fora da lista permitida
// geram mensagens técnicas em inglês no Mongoose; aqui viram português.
function mensagemDeValidacao(e) {
  if (e.name === 'CastError') return `Valor inválido para ${rotulo(e.path)}`;
  if (e.kind === 'enum') return `Valor inválido para ${rotulo(e.path)}`;
  return e.message.replace(/\.$/, '');
}

function errorHandler(erro, req, res, next) {
  // Erro de validação do Mongoose (ex: regex de e-mail, campos obrigatórios)
  if (erro.name === 'ValidationError') {
    const mensagens = Object.values(erro.errors).map(mensagemDeValidacao);
    return res.status(400).json({ sucesso: false, mensagem: `${mensagens.join('. ')}.` });
  }

  // Erro de chave duplicada (unique: true) — ex: e-mail já cadastrado
  if (erro.code === 11000) {
    const campo = Object.keys(erro.keyValue)[0];
    const mensagem = DUPLICADOS[campo] || `Já existe um registro com este ${rotulo(campo)}.`;
    return res.status(400).json({ sucesso: false, mensagem });
  }

  // Erro de ID inválido do Mongoose (ex: /produtos/123-invalido)
  if (erro.name === 'CastError') {
    return res.status(400).json({ sucesso: false, mensagem: 'ID inválido.' });
  }

  // Corpo da requisição que não é um JSON válido
  if (erro.type === 'entity.parse.failed') {
    return res
      .status(400)
      .json({ sucesso: false, mensagem: 'O corpo da requisição não é um JSON válido.' });
  }

  // Erro inesperado: a mensagem interna fica só no log, não vai para o cliente.
  // Os erros esperados acima já viram uma resposta clara; o log fica só para
  // o que é inesperado, para não poluir o terminal.
  const status = erro.status || 500;
  if (status >= 500) console.error(erro);
  const mensagem = status < 500 && erro.message ? erro.message : 'Erro interno no servidor.';
  return res.status(status).json({ sucesso: false, mensagem });
}

module.exports = errorHandler;
