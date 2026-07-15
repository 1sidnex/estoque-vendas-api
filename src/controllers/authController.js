const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

function gerarToken(usuario) {
  return jwt.sign(
    { id: usuario._id, email: usuario.email, cargo: usuario.cargo },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
  );
}

// POST /api/auth/registrar
async function registrar(req, res, next) {
  try {
    const { nome, email, senha, cargo } = req.body;

    const usuario = await Usuario.create({ nome, email, senha, cargo });

    // nunca devolvemos a senha, nem o hash, na resposta
    return res.status(201).json({
      sucesso: true,
      usuario: { id: usuario._id, nome: usuario.nome, email: usuario.email, cargo: usuario.cargo },
    });
  } catch (erro) {
    next(erro);
  }
}

// POST /api/auth/login
async function login(req, res, next) {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ sucesso: false, mensagem: 'E-mail e senha são obrigatórios.' });
    }

    // precisamos pedir explicitamente o campo senha, pois no Model ele está com select: false
    const usuario = await Usuario.findOne({ email }).select('+senha');
    if (!usuario) {
      return res.status(401).json({ sucesso: false, mensagem: 'E-mail ou senha inválidos.' });
    }

    const senhaCorreta = await usuario.compararSenha(senha);
    if (!senhaCorreta) {
      return res.status(401).json({ sucesso: false, mensagem: 'E-mail ou senha inválidos.' });
    }

    const token = gerarToken(usuario);

    return res.status(200).json({
      sucesso: true,
      token,
      usuario: { id: usuario._id, nome: usuario.nome, email: usuario.email, cargo: usuario.cargo },
    });
  } catch (erro) {
    next(erro);
  }
}

module.exports = { registrar, login };
