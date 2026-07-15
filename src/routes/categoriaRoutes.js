const express = require('express');
const router = express.Router();
const { criar, listar, buscarPorId, atualizar, deletar } = require('../controllers/categoriaController');
const { autenticar, autorizar } = require('../middlewares/auth');

// leitura liberada para qualquer usuário autenticado
router.get('/', autenticar, listar);
router.get('/:id', autenticar, buscarPorId);

// escrita restrita a admin
router.post('/', autenticar, autorizar('admin'), criar);
router.put('/:id', autenticar, autorizar('admin'), atualizar);
router.delete('/:id', autenticar, autorizar('admin'), deletar);

module.exports = router;
