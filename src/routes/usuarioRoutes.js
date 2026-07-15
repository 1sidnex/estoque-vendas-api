const express = require('express');
const router = express.Router();
const { listar, buscarPorId, atualizar, deletar } = require('../controllers/usuarioController');
const { autenticar, autorizar } = require('../middlewares/auth');

// todas as rotas de usuário exigem login, e apenas admin pode gerenciar usuários
router.use(autenticar);

router.get('/', autorizar('admin'), listar);
router.get('/:id', autorizar('admin'), buscarPorId);
router.put('/:id', autorizar('admin'), atualizar);
router.delete('/:id', autorizar('admin'), deletar);

module.exports = router;
