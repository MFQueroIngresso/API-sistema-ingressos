const router = require('express').Router();
const { POS } = require('../controllers');

router.post('/login', POS.login);
router.post('/login/adm', POS.loginAdm);

router.post('/getData', POS.getData);
router.post('/getClass', POS.getClass);
router.post('/getInfo', POS.getInfo);

module.exports = router;