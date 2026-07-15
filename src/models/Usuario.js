const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Regex simples e eficaz para validar formato de e-mail (usuario@dominio.com)
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const usuarioSchema = new mongoose.Schema(
  {
    nome: {
      type: String,
      required: [true, 'O nome é obrigatório'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'O e-mail é obrigatório'],
      unique: true, // impede cadastro de e-mails duplicados
      lowercase: true,
      trim: true,
      validate: {
        validator: (valor) => EMAIL_REGEX.test(valor),
        message: (props) => `${props.value} não é um e-mail válido`,
      },
    },
    senha: {
      type: String,
      required: [true, 'A senha é obrigatória'],
      minlength: [6, 'A senha deve ter pelo menos 6 caracteres'],
      select: false, // por padrão, a senha não vem nas consultas
    },
    cargo: {
      type: String,
      enum: ['admin', 'vendedor'],
      default: 'vendedor',
    },
  },
  { timestamps: true }
);

// Antes de salvar, gera o hash da senha (nunca salva em texto plano)
usuarioSchema.pre('save', async function (next) {
  if (!this.isModified('senha')) return next();

  const salt = await bcrypt.genSalt(10);
  this.senha = await bcrypt.hash(this.senha, salt);
  next();
});

// Método de instância para comparar senha digitada com o hash salvo
usuarioSchema.methods.compararSenha = async function (senhaDigitada) {
  return bcrypt.compare(senhaDigitada, this.senha);
};

module.exports = mongoose.model('Usuario', usuarioSchema);
