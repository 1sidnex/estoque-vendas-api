const Usuario = require('../models/Usuario');

// GET /api/usuarios
async function listar(req, res, next) {
  try {
    const usuarios = await Usuario.find();
    return res.status(200).json({ sucesso: true, usuarios });
  } catch (erro) {
    next(erro);
  }
}

// GET /api/usuarios/:id
async function buscarPorId(req, res, next) {
  try {
    const usuario = await Usuario.findById(req.params.id);
    if (!usuario) {
      return res.status(404).json({ sucesso: false, mensagem: 'Usuário não encontrado.' });
    }
    return res.status(200).json({ sucesso: true, usuario });
  } catch (erro) {
    next(erro);
  }
}

// PUT /api/usuarios/:id
async function atualizar(req, res, next) {
  try {
    const { nome, cargo } = req.body; // e-mail e senha têm rotas/regras próprias
    const usuario = await Usuario.findByIdAndUpdate(
      req.params.id,
      { nome, cargo },
      { new: true, runValidators: true }
    );
    if (!usuario) {
      return res.status(404).json({ sucesso: false, mensagem: 'Usuário não encontrado.' });
    }
    return res.status(200).json({ sucesso: true, usuario });
  } catch (erro) {
    next(erro);
  }
}

// DELETE /api/usuarios/:id
async function deletar(req, res, next) {
  try {
    const usuario = await Usuario.findByIdAndDelete(req.params.id);
    if (!usuario) {
      return res.status(404).json({ sucesso: false, mensagem: 'Usuário não encontrado.' });
    }
    return res.status(200).json({ sucesso: true, mensagem: 'Usuário removido com sucesso.' });
  } catch (erro) {
    next(erro);
  }
}

module.exports = { listar, buscarPorId, atualizar, deletar };
