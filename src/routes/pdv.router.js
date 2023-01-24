const router = require('express').Router();
const { PDV } = require('../controllers');

router.get('/find', PDV.find);
router.get('/list', PDV.list);
router.post('/add', PDV.add);
router.put('/up', PDV.up);
router.delete('/del', PDV.del);

module.exports = router;