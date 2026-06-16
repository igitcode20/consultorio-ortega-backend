const express = require('express');
const router = express.Router();
const { getPosts, createPost, toggleLike, deletePost } = require('../controllers/postController');
const { protect, admin } = require('../middlewares/authMiddleware');
const multer = require('multer');

const upload = multer({ storage: multer.memoryStorage() });

router.get('/', getPosts); 
router.post('/', protect, admin, upload.single('image'), createPost); 
router.post('/:id/like', protect, toggleLike); 
router.delete('/:id', protect, admin, deletePost); 

module.exports = router;