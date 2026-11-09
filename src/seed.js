require('dotenv').config();
const mongoose = require('mongoose');
const conectarBanco = require('./config/db');
const Usuario = require('./models/Usuario');
const Categoria = require('./models/Categoria');
const Fornecedor = require('./models/Fornecedor');
const Produto = require('./models/Produto');

// Usuários de teste listados no README. Rodar o seed de novo redefine a senha
// e o cargo apenas deles; nenhum outro dado é apagado ou sobrescrito.
const USUARIOS = [
  { nome: 'Admin Teste', email: 'admin@loja.test', senha: 'admin123', cargo: 'admin' },
  { nome: 'Vendedor Teste', email: 'vendedor@loja.test', senha: 'vendedor123', cargo: 'vendedor' },
];

const CATEGORIAS = [
  { nome: 'Papelaria', descricao: 'Cadernos, canetas e material de escritório' },
  { nome: 'Limpeza', descricao: 'Produtos de limpeza' },
];

const FORNECEDOR = {
  nome: 'Distribuidora Exemplo',
  cnpj: '11.222.333/0001-81',
  email: 'contato@distribuidora.test',
  telefone: '(67) 3333-4444',
};

const PRODUTOS = [
  { nome: 'Caderno 96 folhas', preco: 18.9, quantidadeEstoque: 30, categoria: 'Papelaria' },
  { nome: 'Caneta azul', preco: 2.5, quantidadeEstoque: 100, categoria: 'Papelaria' },
  { nome: 'Borracha branca', preco: 1.2, quantidadeEstoque: 4, categoria: 'Papelaria' },
  { nome: 'Detergente 500ml', preco: 3.4, quantidadeEstoque: 0, categoria: 'Limpeza' },
];

// Devolve o documento que casa com o filtro ou cria um novo.
async function obterOuCriar(Modelo, filtro, dados) {
  return (await Modelo.findOne(filtro)) || Modelo.create({ ...filtro, ...dados });
}

async function semearUsuarios() {
  for (const dados of USUARIOS) {
    const usuario =
      (await Usuario.findOne({ email: dados.email })) || new Usuario({ email: dados.email });
    usuario.nome = dados.nome;
    usuario.senha = dados.senha; // o hook do model gera o hash ao salvar
    usuario.cargo = dados.cargo;
    await usuario.save();
  }
}

async function semear() {
  await conectarBanco();
  await semearUsuarios();

  const categorias = {};
  for (const { nome, descricao } of CATEGORIAS) {
    categorias[nome] = await obterOuCriar(Categoria, { nome }, { descricao });
  }

  const fornecedor = await obterOuCriar(Fornecedor, { cnpj: FORNECEDOR.cnpj }, FORNECEDOR);

  for (const { nome, categoria, ...resto } of PRODUTOS) {
    await obterOuCriar(
      Produto,
      { nome },
      { ...resto, categoria: categorias[categoria]._id, fornecedor: fornecedor._id }
    );
  }

  console.log(
    `Seed concluído: ${USUARIOS.length} usuários, ${CATEGORIAS.length} categorias, ` +
      `1 fornecedor e ${PRODUTOS.length} produtos garantidos no banco.`
  );
}

semear()
  .catch((erro) => {
    console.error('Erro ao rodar o seed:', erro.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
