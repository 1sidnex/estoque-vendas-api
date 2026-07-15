const jwt = require('jsonwebtoken');

// Middleware de AUTENTICAÇÃO: verifica se o token JWT enviado no header
// Authorization: Bearer <token> é válido. Se for, libera o acesso e
// disponibiliza os dados do usuário logado em req.usuario.
function autenticar(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ sucesso: false, mensagem: 'Token não fornecido.' });
  }

  const partes = authHeader.split(' ');
  if (partes.length !== 2 || partes[0] !== 'Bearer') {
    return res.status(401).json({ sucesso: false, mensagem: 'Token mal formatado.' });
  }

  const token = partes[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = payload; // { id, email, cargo }
    return next();
  } catch (erro) {
    return res.status(401).json({ sucesso: false, mensagem: 'Token inválido ou expirado.' });
  }
}

// Middleware de AUTORIZAÇÃO: restringe uma rota a determinados cargos.
// Uso: autorizar('admin') ou autorizar('admin', 'vendedor')
function autorizar(...cargosPermitidos) {
  return (req, res, next) => {
    if (!req.usuario) {
      return res.status(401).json({ sucesso: false, mensagem: 'Usuário não autenticado.' });
    }

    if (!cargosPermitidos.includes(req.usuario.cargo)) {
      return res.status(403).json({ sucesso: false, mensagem: 'Acesso negado para o seu perfil.' });
    }

    return next();
  };
}

module.exports = { autenticar, autorizar };
