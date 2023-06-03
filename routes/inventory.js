const express = require('express');
const router = express.Router();

// Controller modules
const shoe_controller = require('../controllers/shoeController');
const brand_controller = require('../controllers/brandController');
const category_controller = require('../controllers/categoryController');
const sku_controller = require('../controllers/skuController');

/* ***SHOE ROUTES*** */

// GET inventory home page.
router.get('/', shoe_controller.index);

// GET request for creating a Shoe.
router.get('/shoe/create', shoe_controller.shoe_create_get);

// POST request for creating Shoe.
router.post('/shoe/create', shoe_controller.shoe_create_post);

// GET request to delete Shoe.
router.get('/shoe/:id/delete', shoe_controller.shoe_delete_get);

// POST request to delete Shoe.
router.post('/shoe/:id/delete', shoe_controller.shoe_delete_post);

// GET request to update Shoe.
router.get('/shoe/:id/update', shoe_controller.shoe_update_get);

// POST request to update Shoe.
router.post('/shoe/:id/update', shoe_controller.shoe_update_post);

// GET request for one Shoe.
router.get('/shoe/:id', shoe_controller.shoe_detail);

// GET request for list of all Shoe items.
router.get('/shoes', shoe_controller.shoe_list);

/* ***BRAND ROUTES*** */

// GET request for creating a Brand.
router.get('/brand/create', brand_controller.brand_create_get);

// POST request for creating Brand.
router.post('/brand/create', brand_controller.brand_create_post);

// GET request to delete Brand.
router.get('/brand/:id/delete', brand_controller.brand_delete_get);

// POST request to delete Brand.
router.post('/brand/:id/delete', brand_controller.brand_delete_post);

// GET request to update Brand.
router.get('/brand/:id/update', brand_controller.brand_update_get);

// POST request to update Brand.
router.post('/brand/:id/update', brand_controller.brand_update_post);

// GET request for one Brand.
router.get('/brand/:id', brand_controller.brand_detail);

// GET request for list of all Brand items.
router.get('/brands', brand_controller.brand_list);

/* ***CATEGORY ROUTES*** */

// GET request for creating a Category.
router.get('/category/create', category_controller.category_create_get);

//POST request for creating Category.
router.post('/category/create', category_controller.category_create_post);

// GET request to delete Category.
router.get('/category/:id/delete', category_controller.category_delete_get);

// POST request to delete Category.
router.post('/category/:id/delete', category_controller.category_delete_post);

// GET request to update Category.
router.get('/category/:id/update', category_controller.category_update_get);

// POST request to update Category.
router.post('/category/:id/update', category_controller.category_update_post);

// GET request for one Category.
router.get('/category/:id', category_controller.category_detail);

// GET request for list of all Categories.
router.get('/categories', category_controller.category_list);

/* ***SKU ROUTES*** */

// GET request for creating a SKU
router.get('/sku/create', sku_controller.sku_create_get);

// POST request for creating SKU.
router.post('/sku/create', sku_controller.sku_create_post);

// GET request to delete SKU.
router.get('/sku/:id/delete', sku_controller.sku_delete_get);

// POST request to delete SKU.
router.post('/sku/:id/delete', sku_controller.sku_delete_post);

// GET request to update SKU.
router.get('/sku/:id/update', sku_controller.sku_update_get);

// POST request to update SKU.
router.post('/sku/:id/update', sku_controller.sku_update_post);

// GET request for one SKU.
router.get('/sku/:id', sku_controller.sku_detail);

// GET request for list of all SKUs.
router.get('/skus', sku_controller.sku_list);

module.exports = router;
