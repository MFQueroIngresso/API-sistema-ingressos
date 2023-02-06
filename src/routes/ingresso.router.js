const router = require('express').Router();
const { Ingresso } = require('../controllers');

router.post('/register', Ingresso.register);
router.post('/confirm', Ingresso.confirmIngresso);
router.post('/finish', Ingresso.finishIngresso);
router.delete('/cancel', Ingresso.cancelIngresso);

module.exports = router;