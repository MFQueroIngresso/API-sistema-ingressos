const router = require('express').Router();
const { Status } = require('../controllers');

router.post('/add', Status.add);

module.exports = router;