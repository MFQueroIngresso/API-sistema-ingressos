const router = require('express').Router();
const { Ingresso } = require('../controllers');

router.post('/register', Ingresso.register);
router.post('/validade', Ingresso.validade);
router.post('/received', Ingresso.received);
router.delete('/cancel', Ingresso.cancelIngresso);

module.exports = router;