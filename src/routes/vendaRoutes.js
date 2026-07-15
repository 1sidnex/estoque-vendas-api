const express = require('express');
const router = express.Router();
const { criar, listar, buscarPorId, cancelar } = require('../controllers/vendaController');
const { autenticar, autorizar } = require('../middlewares/auth');

// qualquer usuário autenticado (admin ou vendedor) pode registrar e ver vendas
router.use(autenticar);

router.post('/', criar);
router.get('/', listar);
router.get('/:id', buscarPorId);

// cancelar uma venda é uma ação mais sensível — só admin
router.patch('/:id/cancelar', autorizar('admin'), cancelar);

module.exports = router;
