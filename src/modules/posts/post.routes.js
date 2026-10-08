const router = require('express').Router();
const auth = require('../../common/middleware/auth');
const postController = require('./post.controller');

router.get('/', postController.listAll); // public feed
router.get('/user/:userId', postController.listByUser); // public: visible to everyone

router.post('/', auth, postController.create); // needs login to know the author

module.exports = router;