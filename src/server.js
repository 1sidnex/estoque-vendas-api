require('dotenv').config();
const app = require('./app');
const conectarBanco = require('./config/db');

const PORTA = process.env.PORT || 3000;

conectarBanco().then(() => {
  app.listen(PORTA, () => {
    console.log(`Servidor rodando em http://localhost:${PORTA}`);
  });
});
