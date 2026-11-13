const express = require('express');
const router = express.Router();
const { registrar, login, eu } = require('../controllers/authController');
const { autenticar } = require('../middlewares/auth');

router.post('/registrar', registrar);
router.post('/login', login);
router.get('/eu', autenticar, eu);

module.exports = router;
