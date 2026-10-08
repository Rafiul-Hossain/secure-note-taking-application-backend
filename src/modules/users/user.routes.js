const router = require('express').Router();
const auth = require('../../common/middleware/auth');
const authorize = require('../../common/middleware/authorize');
const userController = require('./user.controller');

router.use(auth);

router.get('/me', userController.me); // must stay above '/:id'
router.get('/grouped-by-interests', authorize('admin'), userController.groupedByInterests); // must stay above '/:id'

router.post('/', authorize('admin'), userController.create);
router.get('/', authorize('admin'), userController.list);
router.get('/:id', authorize('admin'), userController.getOne);
router.put('/:id', authorize('admin'), userController.update);
router.delete('/:id', authorize('admin'), userController.remove);

module.exports = router;