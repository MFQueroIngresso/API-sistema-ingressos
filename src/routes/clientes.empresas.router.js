const router = require('express').Router();
const { ClienteEmpresa } = require('../controllers');

router.get('/list', ClienteEmpresa.list);
router.post('/cliente/add', ClienteEmpresa.add_cli);
router.post('/empresa/add', ClienteEmpresa.add_emp);
router.post('/empresa/tipo/add', ClienteEmpresa.add_tipo_emp);

module.exports = router;