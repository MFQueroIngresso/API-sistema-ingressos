const router = require('express').Router();
const { Ingresso } = require('../controllers');

router.post('/set', Ingresso.setIngresso);

module.exports = router;