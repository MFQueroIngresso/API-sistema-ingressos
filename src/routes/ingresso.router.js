const router = require('express').Router();
const { Ingresso } = require('../controllers');

router.post('/set', Ingresso.setIngresso);
router.post('/confirm', Ingresso.confirmIngresso);
router.post('/finish', Ingresso.finishIngresso);
router.delete('/cancel', Ingresso.cancelIngresso);

module.exports = router;