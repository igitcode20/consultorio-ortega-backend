const express = require('express');
const router = express.Router();
const { getProducts, createProduct, updateProduct, deleteProduct } = require('../controllers/productController');
const { protect, admin } = require('../middlewares/authMiddleware');
const multer = require('multer');

const upload = multer({ storage: multer.memoryStorage() });

router.get('/', getProducts); 
router.post('/', protect, admin, upload.single('image'), createProduct); 
router.put('/:id', protect, admin, upload.single('image'), updateProduct); 
router.delete('/:id', protect, admin, deleteProduct); 

module.exports = router;