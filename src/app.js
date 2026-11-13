const express = require('express');
const cors = require('cors');
const errorHandler = require('./middlewares/errorHandler');

const authRoutes = require('./routes/authRoutes');
const usuarioRoutes = require('./routes/usuarioRoutes');
const categoriaRoutes = require('./routes/categoriaRoutes');
const fornecedorRoutes = require('./routes/fornecedorRoutes');
const produtoRoutes = require('./routes/produtoRoutes');
const vendaRoutes = require('./routes/vendaRoutes');

// Monta a API (rotas e middlewares) sem abrir porta nem conectar ao banco.
// O server.js usa este app para subir o servidor, e os testes o usam direto.
const app = express();

app.use(cors());
app.use(express.json());

// rota de verificação rápida (útil para saber se a API está no ar)
app.get('/', (req, res) => {
  res.status(200).json({ sucesso: true, mensagem: 'API de Controle de Estoque e Vendas no ar' });
});

app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/categorias', categoriaRoutes);
app.use('/api/fornecedores', fornecedorRoutes);
app.use('/api/produtos', produtoRoutes);
app.use('/api/vendas', vendaRoutes);

// rota não encontrada
app.use((req, res) => {
  res.status(404).json({ sucesso: false, mensagem: 'Rota não encontrada.' });
});

// middleware global de erros — precisa ser o último `app.use`
app.use(errorHandler);

module.exports = app;
