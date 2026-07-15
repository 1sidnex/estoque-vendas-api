const Categoria = require('../models/Categoria');

async function criar(req, res, next) {
  try {
    const categoria = await Categoria.create(req.body);
    return res.status(201).json({ sucesso: true, categoria });
  } catch (erro) {
    next(erro);
  }
}

async function listar(req, res, next) {
  try {
    const categorias = await Categoria.find();
    return res.status(200).json({ sucesso: true, categorias });
  } catch (erro) {
    next(erro);
  }
}

async function buscarPorId(req, res, next) {
  try {
    const categoria = await Categoria.findById(req.params.id);
    if (!categoria) {
      return res.status(404).json({ sucesso: false, mensagem: 'Categoria não encontrada.' });
    }
    return res.status(200).json({ sucesso: true, categoria });
  } catch (erro) {
    next(erro);
  }
}

async function atualizar(req, res, next) {
  try {
    const categoria = await Categoria.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!categoria) {
      return res.status(404).json({ sucesso: false, mensagem: 'Categoria não encontrada.' });
    }
    return res.status(200).json({ sucesso: true, categoria });
  } catch (erro) {
    next(erro);
  }
}

async function deletar(req, res, next) {
  try {
    const categoria = await Categoria.findByIdAndDelete(req.params.id);
    if (!categoria) {
      return res.status(404).json({ sucesso: false, mensagem: 'Categoria não encontrada.' });
    }
    return res.status(200).json({ sucesso: true, mensagem: 'Categoria removida com sucesso.' });
  } catch (erro) {
    next(erro);
  }
}

module.exports = { criar, listar, buscarPorId, atualizar, deletar };
