const mongoose = require('mongoose');

// Sub-documento: cada item de uma venda referencia um produto,
// guarda a quantidade vendida e o preço unitário NO MOMENTO da venda
// (importante: se o preço do produto mudar depois, o histórico não muda)
const itemVendaSchema = new mongoose.Schema(
  {
    produto: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Produto',
      required: true,
    },
    quantidade: {
      type: Number,
      required: true,
      min: [1, 'A quantidade deve ser pelo menos 1'],
    },
    precoUnitario: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
);

const vendaSchema = new mongoose.Schema(
  {
    usuario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Usuario',
      required: true,
    },
    itens: {
      type: [itemVendaSchema],
      required: true,
      validate: {
        validator: (itens) => itens.length > 0,
        message: 'A venda deve ter pelo menos um item',
      },
    },
    total: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['concluida', 'cancelada'],
      default: 'concluida',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Venda', vendaSchema);
