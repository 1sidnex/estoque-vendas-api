const mongoose = require('mongoose');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Regex simples para CNPJ no formato 00.000.000/0000-00 ou apenas 14 dígitos
const CNPJ_REGEX = /^(\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}|\d{14})$/;

const fornecedorSchema = new mongoose.Schema(
  {
    nome: {
      type: String,
      required: [true, 'O nome do fornecedor é obrigatório'],
      trim: true,
    },
    cnpj: {
      type: String,
      required: [true, 'O CNPJ é obrigatório'],
      unique: true,
      validate: {
        validator: (valor) => CNPJ_REGEX.test(valor),
        message: (props) => `${props.value} não é um CNPJ válido`,
      },
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      validate: {
        validator: (valor) => !valor || EMAIL_REGEX.test(valor),
        message: (props) => `${props.value} não é um e-mail válido`,
      },
    },
    telefone: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Fornecedor', fornecedorSchema);
