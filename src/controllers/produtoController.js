const Produto = require('../models/Produto');

async function criar(req, res, next) {
  try {
    const produto = await Produto.create(req.body);
    return res.status(201).json({ sucesso: true, produto });
  } catch (erro) {
    next(erro);
  }
}

// GET /api/produtos  (aceita ?categoria=<id> como filtro opcional)
async function listar(req, res, next) {
  try {
    const filtro = {};
    if (req.query.categoria) filtro.categoria = req.query.categoria;

    const produtos = await Produto.find(filtro)
      .populate('categoria', 'nome')
      .populate('fornecedor', 'nome');
    return res.status(200).json({ sucesso: true, produtos });
  } catch (erro) {
    next(erro);
  }
}

async function buscarPorId(req, res, next) {
  try {
    const produto = await Produto.findById(req.params.id)
      .populate('categoria', 'nome')
      .populate('fornecedor', 'nome');
    if (!produto) {
      return res.status(404).json({ sucesso: false, mensagem: 'Produto não encontrado.' });
    }
    return res.status(200).json({ sucesso: true, produto });
  } catch (erro) {
    next(erro);
  }
}

async function atualizar(req, res, next) {
  try {
    const produto = await Produto.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!produto) {
      return res.status(404).json({ sucesso: false, mensagem: 'Produto não encontrado.' });
    }
    return res.status(200).json({ sucesso: true, produto });
  } catch (erro) {
    next(erro);
  }
}

async function deletar(req, res, next) {
  try {
    const produto = await Produto.findByIdAndDelete(req.params.id);
    if (!produto) {
      return res.status(404).json({ sucesso: false, mensagem: 'Produto não encontrado.' });
    }
    return res.status(200).json({ sucesso: true, mensagem: 'Produto removido com sucesso.' });
  } catch (erro) {
    next(erro);
  }
}

module.exports = { criar, listar, buscarPorId, atualizar, deletar };
