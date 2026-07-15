require('dotenv').config();
const express = require('express');
const cors = require('cors');
const conectarBanco = require('./config/db');
const errorHandler = require('./middlewares/errorHandler');

const authRoutes = require('./routes/authRoutes');
const usuarioRoutes = require('./routes/usuarioRoutes');
const categoriaRoutes = require('./routes/categoriaRoutes');
const fornecedorRoutes = require('./routes/fornecedorRoutes');
const produtoRoutes = require('./routes/produtoRoutes');
const vendaRoutes = require('./routes/vendaRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// rota de verificação rápida (útil para saber se a API está no ar)
app.get('/', (req, res) => {
  res.status(200).json({ sucesso: true, mensagem: 'API de Controle de Estoque e Vendas no ar 🚀' });
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

const PORTA = process.env.PORT || 3000;

conectarBanco().then(() => {
  app.listen(PORTA, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORTA}`);
  });
});
