const mongoose = require('mongoose');

const categoriaSchema = new mongoose.Schema(
  {
    nome: {
      type: String,
      required: [true, 'O nome da categoria é obrigatório'],
      unique: true,
      trim: true,
    },
    descricao: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Categoria', categoriaSchema);
