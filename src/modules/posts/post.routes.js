const router = require('express').Router();
const auth = require('../../common/middleware/auth');
const postController = require('./post.controller');

router.get('/', postController.listAll);
router.get('/user/:userId', postController.listByUser);

router.post('/', auth, postController.create);

module.exports = router;