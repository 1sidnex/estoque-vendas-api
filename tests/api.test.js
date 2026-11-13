// Testes automatizados da API. Rodam com `npm test` usando um MongoDB
// temporário em memória: não precisam do Atlas nem do .env.
const { describe, it, before, after, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server-core');

process.env.JWT_SECRET = 'segredo-somente-para-os-testes';

const app = require('../src/app');
const Usuario = require('../src/models/Usuario');
const Categoria = require('../src/models/Categoria');
const Fornecedor = require('../src/models/Fornecedor');
const Produto = require('../src/models/Produto');

let mongo;
let ids;

async function login(email, senha = 'teste123') {
  const resposta = await request(app).post('/api/auth/login').send({ email, senha });
  return resposta.body.token;
}

async function estoqueDe(id) {
  return (await Produto.findById(id)).quantidadeEstoque;
}

before(async () => {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
  // cria os índices únicos (e-mail, CNPJ, nome da categoria) antes dos testes
  await Promise.all([Usuario.init(), Categoria.init(), Fornecedor.init()]);
});

after(async () => {
  await mongoose.disconnect();
  await mongo.stop();
});

// Cada teste começa com o mesmo cenário: um admin, um vendedor e um produto.
beforeEach(async () => {
  await Promise.all(
    Object.values(mongoose.connection.collections).map((c) => c.deleteMany({}))
  );
  const admin = await Usuario.create({
    nome: 'Admin',
    email: 'admin@teste.test',
    senha: 'teste123',
    cargo: 'admin',
  });
  const vendedor = await Usuario.create({
    nome: 'Vendedor',
    email: 'vendedor@teste.test',
    senha: 'teste123',
    cargo: 'vendedor',
  });
  const categoria = await Categoria.create({ nome: 'Papelaria' });
  const caderno = await Produto.create({
    nome: 'Caderno',
    preco: 10,
    quantidadeEstoque: 5,
    categoria: categoria._id,
  });
  ids = { admin: admin._id, vendedor: vendedor._id, categoria: categoria._id, caderno: caderno._id };
});

describe('Autenticação', () => {
  it('login correto devolve token e não devolve a senha', async () => {
    const resposta = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@teste.test', senha: 'teste123' });
    assert.equal(resposta.status, 200);
    assert.ok(resposta.body.token);
    assert.equal(resposta.body.usuario.cargo, 'admin');
    assert.equal(resposta.body.usuario.senha, undefined);
  });

  it('senha errada é recusada', async () => {
    const resposta = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@teste.test', senha: 'errada' });
    assert.equal(resposta.status, 401);
  });

  it('cadastro público sempre cria vendedor, mesmo pedindo admin', async () => {
    const resposta = await request(app)
      .post('/api/auth/registrar')
      .send({ nome: 'Novo', email: 'novo@teste.test', senha: 'teste123', cargo: 'admin' });
    assert.equal(resposta.status, 201);
    assert.equal(resposta.body.usuario.cargo, 'vendedor');
  });

  it('e-mail repetido devolve mensagem clara', async () => {
    const resposta = await request(app)
      .post('/api/auth/registrar')
      .send({ nome: 'Outro', email: 'admin@teste.test', senha: 'teste123' });
    assert.equal(resposta.status, 400);
    assert.equal(resposta.body.mensagem, 'Já existe um usuário com este e-mail.');
  });

  it('/auth/eu devolve o usuário logado e exige token', async () => {
    const token = await login('vendedor@teste.test');
    const comToken = await request(app).get('/api/auth/eu').set('Authorization', `Bearer ${token}`);
    assert.equal(comToken.status, 200);
    assert.equal(comToken.body.usuario.cargo, 'vendedor');

    const semToken = await request(app).get('/api/auth/eu');
    assert.equal(semToken.status, 401);
  });
});

describe('Permissões', () => {
  it('rota protegida sem token devolve 401', async () => {
    const resposta = await request(app).get('/api/produtos');
    assert.equal(resposta.status, 401);
  });

  it('vendedor não cria categoria nem lista usuários; admin pode', async () => {
    const tokenVendedor = await login('vendedor@teste.test');
    const tokenAdmin = await login('admin@teste.test');

    const vendedorCria = await request(app)
      .post('/api/categorias')
      .set('Authorization', `Bearer ${tokenVendedor}`)
      .send({ nome: 'Limpeza' });
    assert.equal(vendedorCria.status, 403);

    const vendedorLista = await request(app)
      .get('/api/usuarios')
      .set('Authorization', `Bearer ${tokenVendedor}`);
    assert.equal(vendedorLista.status, 403);

    const adminCria = await request(app)
      .post('/api/categorias')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ nome: 'Limpeza' });
    assert.equal(adminCria.status, 201);
  });

  it('admin rebaixado perde o acesso na hora, mesmo com o token antigo', async () => {
    const outroAdmin = await Usuario.create({
      nome: 'Outro',
      email: 'outro@teste.test',
      senha: 'teste123',
      cargo: 'admin',
    });
    const tokenAntigo = await login('outro@teste.test');
    await Usuario.findByIdAndUpdate(outroAdmin._id, { cargo: 'vendedor' });

    const resposta = await request(app)
      .get('/api/usuarios')
      .set('Authorization', `Bearer ${tokenAntigo}`);
    assert.equal(resposta.status, 403);
  });

  it('conta excluída perde o acesso na hora', async () => {
    const token = await login('vendedor@teste.test');
    await Usuario.findByIdAndDelete(ids.vendedor);

    const resposta = await request(app).get('/api/produtos').set('Authorization', `Bearer ${token}`);
    assert.equal(resposta.status, 401);
  });

  it('admin não exclui a própria conta nem remove o próprio cargo', async () => {
    const token = await login('admin@teste.test');

    const excluir = await request(app)
      .delete(`/api/usuarios/${ids.admin}`)
      .set('Authorization', `Bearer ${token}`);
    assert.equal(excluir.status, 403);

    const rebaixar = await request(app)
      .put(`/api/usuarios/${ids.admin}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ nome: 'Admin', cargo: 'vendedor' });
    assert.equal(rebaixar.status, 403);
  });
});

describe('Vendas e estoque', () => {
  async function vender(itens, email = 'vendedor@teste.test') {
    const token = await login(email);
    return request(app).post('/api/vendas').set('Authorization', `Bearer ${token}`).send({ itens });
  }

  it('venda válida calcula o total e dá baixa no estoque', async () => {
    const resposta = await vender([{ produto: ids.caderno, quantidade: 2 }]);
    assert.equal(resposta.status, 201);
    assert.equal(resposta.body.venda.total, 20);
    assert.equal(await estoqueDe(ids.caderno), 3);
  });

  it('quantidade zero, negativa ou fracionada é recusada sem mexer no estoque', async () => {
    for (const quantidade of [0, -2, 1.5]) {
      const resposta = await vender([{ produto: ids.caderno, quantidade }]);
      assert.equal(resposta.status, 400, `quantidade ${quantidade}`);
    }
    assert.equal(await estoqueDe(ids.caderno), 5);
  });

  it('o mesmo produto repetido é somado antes de conferir o estoque', async () => {
    const resposta = await vender([
      { produto: ids.caderno, quantidade: 3 },
      { produto: ids.caderno, quantidade: 3 },
    ]);
    assert.equal(resposta.status, 400);
    assert.equal(await estoqueDe(ids.caderno), 5);
  });

  it('produto inativo não pode ser vendido', async () => {
    await Produto.findByIdAndUpdate(ids.caderno, { ativo: false });
    const resposta = await vender([{ produto: ids.caderno, quantidade: 1 }]);
    assert.equal(resposta.status, 400);
  });

  it('cancelar devolve ao estoque; só admin cancela e só uma vez', async () => {
    const venda = (await vender([{ produto: ids.caderno, quantidade: 2 }])).body.venda;
    const tokenVendedor = await login('vendedor@teste.test');
    const tokenAdmin = await login('admin@teste.test');
    const cancelar = (token) =>
      request(app)
        .patch(`/api/vendas/${venda._id}/cancelar`)
        .set('Authorization', `Bearer ${token}`);

    assert.equal((await cancelar(tokenVendedor)).status, 403);
    assert.equal((await cancelar(tokenAdmin)).status, 200);
    assert.equal(await estoqueDe(ids.caderno), 5);
    assert.equal((await cancelar(tokenAdmin)).status, 400);
    assert.equal(await estoqueDe(ids.caderno), 5);
  });
});

describe('Categorias', () => {
  it('não exclui categoria com produtos, mas exclui categoria vazia', async () => {
    const token = await login('admin@teste.test');
    const vazia = await Categoria.create({ nome: 'Vazia' });

    const emUso = await request(app)
      .delete(`/api/categorias/${ids.categoria}`)
      .set('Authorization', `Bearer ${token}`);
    assert.equal(emUso.status, 409);

    const semProdutos = await request(app)
      .delete(`/api/categorias/${vazia._id}`)
      .set('Authorization', `Bearer ${token}`);
    assert.equal(semProdutos.status, 200);
  });
});
