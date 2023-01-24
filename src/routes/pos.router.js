const router = require('express').Router();
const { POS } = require('../controllers');

router.get('/find', POS.find);
router.post('/add', POS.add);
router.post('/add/modelo', POS.add_modelo);

module.exports = router;