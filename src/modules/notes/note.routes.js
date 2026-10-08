const router = require('express').Router();
const auth = require('../../common/middleware/auth');
const authorize = require('../../common/middleware/authorize');
const noteController = require('./note.controller');

router.use(auth);

router.post('/', noteController.create);
router.get('/', noteController.listMine);
router.get('/all', authorize('admin'), noteController.listAll); 
router.get('/:id', noteController.getOne);
router.put('/:id', noteController.update);
router.delete('/:id', noteController.remove);

module.exports = router;