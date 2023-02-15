const router = require('express').Router();
const { Ingresso } = require('../controllers');

router.post('/reserve', Ingresso.reserve);
router.post('/register', Ingresso.register);
router.post('/validade', Ingresso.validade);
router.post('/received', Ingresso.received);

router.get('/last', Ingresso.findLast);

router.delete('/cancel', Ingresso.cancel);
router.delete('/cancel/last', Ingresso.cancelLast);

module.exports = router;