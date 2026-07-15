const mongoose = require('mongoose');

const produtoSchema = new mongoose.Schema(
  {
    nome: {
      type: String,
      required: [true, 'O nome do produto é obrigatório'],
      trim: true,
    },
    descricao: {
      type: String,
      trim: true,
    },
    preco: {
      type: Number,
      required: [true, 'O preço é obrigatório'],
      min: [0, 'O preço não pode ser negativo'],
    },
    quantidadeEstoque: {
      type: Number,
      required: true,
      default: 0,
      min: [0, 'A quantidade em estoque não pode ser negativa'],
    },
    categoria: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Categoria',
      required: [true, 'A categoria é obrigatória'],
    },
    fornecedor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Fornecedor',
    },
    ativo: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Produto', produtoSchema);
