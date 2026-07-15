const Fornecedor = require('../models/Fornecedor');

async function criar(req, res, next) {
  try {
    const fornecedor = await Fornecedor.create(req.body);
    return res.status(201).json({ sucesso: true, fornecedor });
  } catch (erro) {
    next(erro);
  }
}

async function listar(req, res, next) {
  try {
    const fornecedores = await Fornecedor.find();
    return res.status(200).json({ sucesso: true, fornecedores });
  } catch (erro) {
    next(erro);
  }
}

async function buscarPorId(req, res, next) {
  try {
    const fornecedor = await Fornecedor.findById(req.params.id);
    if (!fornecedor) {
      return res.status(404).json({ sucesso: false, mensagem: 'Fornecedor não encontrado.' });
    }
    return res.status(200).json({ sucesso: true, fornecedor });
  } catch (erro) {
    next(erro);
  }
}

async function atualizar(req, res, next) {
  try {
    const fornecedor = await Fornecedor.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!fornecedor) {
      return res.status(404).json({ sucesso: false, mensagem: 'Fornecedor não encontrado.' });
    }
    return res.status(200).json({ sucesso: true, fornecedor });
  } catch (erro) {
    next(erro);
  }
}

async function deletar(req, res, next) {
  try {
    const fornecedor = await Fornecedor.findByIdAndDelete(req.params.id);
    if (!fornecedor) {
      return res.status(404).json({ sucesso: false, mensagem: 'Fornecedor não encontrado.' });
    }
    return res.status(200).json({ sucesso: true, mensagem: 'Fornecedor removido com sucesso.' });
  } catch (erro) {
    next(erro);
  }
}

module.exports = { criar, listar, buscarPorId, atualizar, deletar };
