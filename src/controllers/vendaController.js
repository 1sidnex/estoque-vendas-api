const Venda = require('../models/Venda');
const Produto = require('../models/Produto');

// Confere o formato dos itens e soma as quantidades do mesmo produto, para que
// o estoque seja comparado com o total vendido de cada um (e não item a item).
function agruparItens(itens) {
  const quantidades = new Map();

  for (const item of itens) {
    if (!item?.produto || !Number.isInteger(item.quantidade) || item.quantidade < 1) {
      return {
        erro: 'Cada item precisa de um produto e de uma quantidade inteira maior que zero.',
      };
    }
    const id = String(item.produto);
    quantidades.set(id, (quantidades.get(id) || 0) + item.quantidade);
  }

  return { quantidades };
}

// POST /api/vendas
// body esperado: { itens: [{ produto: <id>, quantidade: <n> }, ...] }
async function criar(req, res, next) {
  try {
    const { itens } = req.body;

    if (!Array.isArray(itens) || itens.length === 0) {
      return res.status(400).json({ sucesso: false, mensagem: 'A venda precisa de ao menos um item.' });
    }

    // tudo é validado antes de mexer no estoque
    const { erro, quantidades } = agruparItens(itens);
    if (erro) {
      return res.status(400).json({ sucesso: false, mensagem: erro });
    }

    let total = 0;
    const itensProcessados = [];

    // valida estoque e monta os itens com o preço atual do produto
    for (const [id, quantidade] of quantidades) {
      const produto = await Produto.findById(id);

      if (!produto) {
        return res.status(404).json({ sucesso: false, mensagem: `Produto ${id} não encontrado.` });
      }

      if (!produto.ativo) {
        return res.status(400).json({
          sucesso: false,
          mensagem: `O produto "${produto.nome}" está inativo e não pode ser vendido.`,
        });
      }

      if (produto.quantidadeEstoque < quantidade) {
        return res.status(400).json({
          sucesso: false,
          mensagem: `Estoque insuficiente para o produto "${produto.nome}". Disponível: ${produto.quantidadeEstoque}.`,
        });
      }

      itensProcessados.push({
        produto: produto._id,
        quantidade,
        precoUnitario: produto.preco,
      });

      total += produto.preco * quantidade;
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
