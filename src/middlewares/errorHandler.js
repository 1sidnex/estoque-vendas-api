// Middleware global de tratamento de erros.
// Garante que o servidor nunca "caia" por causa de uma exceção não tratada
// nas rotas — tudo cai aqui e retorna uma resposta HTTP padronizada.
function errorHandler(erro, req, res, next) {
  console.error(erro);

  // Erro de validação do Mongoose (ex: regex de e-mail, campos obrigatórios)
  if (erro.name === 'ValidationError') {
    const mensagens = Object.values(erro.errors).map((e) => e.message);
    return res.status(400).json({ sucesso: false, mensagem: mensagens.join(', ') });
  }

  // Erro de chave duplicada (unique: true) — ex: e-mail já cadastrado
  if (erro.code === 11000) {
    const campo = Object.keys(erro.keyValue).join(', ');
    return res.status(400).json({ sucesso: false, mensagem: `O campo '${campo}' já está em uso.` });
  }

  // Erro de ID inválido do Mongoose (ex: /produtos/123-invalido)
  if (erro.name === 'CastError') {
    return res.status(400).json({ sucesso: false, mensagem: 'ID inválido.' });
  }

  const status = erro.status || 500;
  return res.status(status).json({
    sucesso: false,
    mensagem: erro.message || 'Erro interno no servidor',
  });
}

module.exports = errorHandler;
