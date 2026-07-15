const Venda = require('../models/Venda');
const Produto = require('../models/Produto');

// POST /api/vendas
// body esperado: { itens: [{ produto: <id>, quantidade: <n> }, ...] }
async function criar(req, res, next) {
  try {
    const { itens } = req.body;

    if (!itens || itens.length === 0) {
      return res.status(400).json({ sucesso: false, mensagem: 'A venda precisa de ao menos um item.' });
    }

    let total = 0;
    const itensProcessados = [];

    // valida estoque e monta os itens com o preço atual do produto
    for (const item of itens) {
      const produto = await Produto.findById(item.produto);

      if (!produto) {
        return res.status(404).json({ sucesso: false, mensagem: `Produto ${item.produto} não encontrado.` });
      }

      if (produto.quantidadeEstoque < item.quantidade) {
        return res.status(400).json({
          sucesso: false,
          mensagem: `Estoque insuficiente para o produto "${produto.nome}". Disponível: ${produto.quantidadeEstoque}.`,
        });
      }

      itensProcessados.push({
        produto: produto._id,
        quantidade: item.quantidade,
        precoUnitario: produto.preco,
      });

      total += produto.preco * item.quantidade;
    }

    // dá baixa no estoque de cada produto
    for (const item of itensProcessados) {
      await Produto.findByIdAndUpdate(item.produto, {
        $inc: { quantidadeEstoque: -item.quantidade },
      });
    }

    const venda = await Venda.create({
      usuario: req.usuario.id, // vem do middleware de autenticação
      itens: itensProcessados,
      total,
    });

    return res.status(201).json({ sucesso: true, venda });
  } catch (erro) {
    next(erro);
  }
}

// GET /api/vendas
async function listar(req, res, next) {
  try {
    const vendas = await Venda.find()
      .populate('usuario', 'nome email')
      .populate('itens.produto', 'nome')
      .sort({ createdAt: -1 });
    return res.status(200).json({ sucesso: true, vendas });
  } catch (erro) {
    next(erro);
  }
}

// GET /api/vendas/:id
async function buscarPorId(req, res, next) {
  try {
    const venda = await Venda.findById(req.params.id)
      .populate('usuario', 'nome email')
      .populate('itens.produto', 'nome');
    if (!venda) {
      return res.status(404).json({ sucesso: false, mensagem: 'Venda não encontrada.' });
    }
    return res.status(200).json({ sucesso: true, venda });
  } catch (erro) {
    next(erro);
  }
}

// PATCH /api/vendas/:id/cancelar — devolve os itens ao estoque
async function cancelar(req, res, next) {
  try {
    const venda = await Venda.findById(req.params.id);
    if (!venda) {
      return res.status(404).json({ sucesso: false, mensagem: 'Venda não encontrada.' });
    }

    if (venda.status === 'cancelada') {
      return res.status(400).json({ sucesso: false, mensagem: 'Esta venda já está cancelada.' });
    }

    for (const item of venda.itens) {
      await Produto.findByIdAndUpdate(item.produto, {
        $inc: { quantidadeEstoque: item.quantidade },
      });
    }

    venda.status = 'cancelada';
    await venda.save();

    return res.status(200).json({ sucesso: true, venda });
  } catch (erro) {
    next(erro);
  }
}

module.exports = { criar, listar, buscarPorId, cancelar };
