const express = require('express');
const router = express.Router();
const { criar, listar, buscarPorId, atualizar, deletar } = require('../controllers/produtoController');
const { autenticar, autorizar } = require('../middlewares/auth');

router.get('/', autenticar, listar);
router.get('/:id', autenticar, buscarPorId);

router.post('/', autenticar, autorizar('admin'), criar);
router.put('/:id', autenticar, autorizar('admin'), atualizar);
router.delete('/:id', autenticar, autorizar('admin'), deletar);

module.exports = router;
