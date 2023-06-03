const Shoe = require('../models/shoe');
const Brand = require('../models/brand');
const Category = require('../models/category');
const SKU = require('../models/sku');

const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');

exports.index = asyncHandler(async (req, res, next) => {
  // Get counts of shoes, brands, categories, and skus (in parallel)
  const [numShoes, numSKUs, numSKUsInStock, numBrands, numCategories] =
    await Promise.all([
      Shoe.countDocuments({}).exec(),
      SKU.countDocuments({}).exec(),
      SKU.countDocuments({ qty: { $gt: 0 } }).exec(),
      Brand.countDocuments({}).exec(),
      Category.countDocuments({}).exec(),
    ]);

  res.render('partials/index', {
    title: 'Home',
    shoe_count: numShoes,
    sku_count: numSKUs,
    sku_in_stock_count: numSKUsInStock,
    brand_count: numBrands,
    category_count: numCategories,
  });
});

// Display list of all shoes.
exports.shoe_list = asyncHandler(async (req, res, next) => {
  const allShoes = await Shoe.find()
    .populate('brand')
    .populate('category')
    .sort({ name: 1 })
    .exec();
  res.render('partials/shoe_list', { title: 'Shoe List', shoe_list: allShoes });
});

// Display detail page for a specific shoe.
exports.shoe_detail = asyncHandler(async (req, res, next) => {
  const [shoe, skus] = await Promise.all([
    Shoe.findById(req.params.id).populate('brand').populate('category').exec(),
    SKU.find({ shoe: req.params.id }).exec(),
  ]);

  if (shoe === null) {
    // No results.
    const err = new Error('Shoe not found');
    err.status = 404;
    return next(err);
  }

  const colors = [];
  const sizes = [];
  const prices = [];
  skus.forEach((val) => {
    colors.push(val.color);
    sizes.push(val.size);
    prices.push(val.price);
  });
  const uniqueColors = [...new Set(colors)];
  const uniqueSizes = [...new Set(sizes)];
  const uniquePrices = [...new Set(prices)];

  res.render('partials/shoe_detail', {
    title: shoe.name,
    shoe: shoe,
    skus: skus,
    colors: uniqueColors,
    sizes: uniqueSizes,
    prices: uniquePrices,
  });
});

// Display shoe create form on GET.
exports.shoe_create_get = asyncHandler(async (req, res, next) => {
  // Get all brands, gender, and shoe styles
  const [allBrands, allCategories] = await Promise.all([
    Brand.find().sort({ name: 1 }).exec(),
    Category.find().sort({ gender: 1, style: 1 }).exec(),
  ]);

  res.render('partials/forms/shoe_form', {
    title: 'Create Shoe',
    brand_list: allBrands,
    category_list: allCategories,
    shoe: '',
    errors: '',
  });
});

// Handle shoe create on POST.
exports.shoe_create_post = [
  // Validate and sanitize fields.
  body('name', 'Name must not be empty.').trim().isLength({ min: 1 }).escape(),
  body('brand').escape(),
  body('category').escape(),
  body('desc').trim().escape(),

  // Process request after validation and sanitization.
  asyncHandler(async (req, res, next) => {
    // Extract validation errors from a request.
    const errors = validationResult(req);

    // Create a Shoe object with escaped and trimmed data.
    const shoe = new Shoe({
      name: req.body.name,
      brand: req.body.brand,
      category: req.body.category,
      desc: req.body.desc,
    });

    if (!errors.isEmpty()) {
      // There are errors.

      // Get all brands and categories for form.
      const [allBrands, allCategories] = await Promise.all([
        Brand.find().exec(),
        Category.find().exec(),
      ]);

      // Render form again with sanitized values / error messages.
      res.render('partials/forms/shoe_form', {
        title: 'Create Shoe',
        brand_list: allBrands,
        category_list: allCategories,
        shoe: shoe,
        errors: errors.array(),
      });
    } else {
      // Data from form is valid.
      // Check if Shoe with same name and brand already exists.
      const shoeExists = await Shoe.findOne({
        name: req.body.name,
        brand: req.body.brand,
      })
        .populate('brand')
        .populate('category')
        .exec();
      if (shoeExists) {
        // Shoe exists, redirect to its detail page.
        res.redirect(shoeExists.url);
      } else {
        await shoe.save();
        // New shoe saved. Redirect to shoe detail page.
        res.redirect(shoe.url);
      }
    }
  }),
];

// Display shoe delete form on GET.
exports.shoe_delete_get = asyncHandler(async (req, res, next) => {
  // Get details of shoe and SKUs for specific shoe
  const [shoe, skus] = await Promise.all([
    Shoe.findById(req.params.id).populate('brand').exec(),
    SKU.find({ shoe: req.params.id }).exec(),
  ]);

  if (shoe === null) {
    // No results.
    res.redirect('/inventory/shoes');
  }

  res.render('partials/shoe_delete', {
    title: 'Delete Shoe',
    shoe: shoe,
    skus: skus,
  });
});

// Handle shoe delete on POST.
exports.shoe_delete_post = asyncHandler(async (req, res, next) => {
  // Get details of shoe and all SKUs
  const [shoe, allSKUsForShoe] = await Promise.all([
    Shoe.findById(req.params.id).exec(),
    SKU.find({ shoe: req.params.id }).exec(),
  ]);

  if (allSKUsForShoe.length > 0) {
    // Shoe has SKUs. Render in same way as for GET route.
    res.render('partials/shoe_delete', {
      title: 'Delete Shoe',
      shoe: shoe,
      skus: allSKUsForShoe,
    });
  } else {
    // Shoe has no SKUs. Delete object and redirect to the list of shoes.
    await Shoe.findByIdAndRemove(req.body.shoeid);
    res.redirect('/inventory/shoes');
  }
});

// Display shoe update form on GET.
exports.shoe_update_get = asyncHandler(async (req, res, next) => {
  // Get shoe, brands, and categories for form.
  const [shoe, allBrands, allCategories] = await Promise.all([
    Shoe.findById(req.params.id).populate('brand').populate('category').exec(),
    Brand.find().exec(),
    Category.find().exec(),
  ]);

  if (shoe === null) {
    // No results.
    const err = new Error('Shoe not found');
    err.status = 404;
    return next(err);
  }

  res.render('partials/forms/shoe_form', {
    title: 'Create Shoe',
    brand_list: allBrands,
    category_list: allCategories,
    shoe: shoe,
    errors: '',
  });
});

// Handle shoe update on POST.
exports.shoe_update_post = [
  // Validate and sanitize fields.
  body('name', 'Name must not be empty.').trim().isLength({ min: 1 }).escape(),
  body('brand').escape(),
  body('category').escape(),
  body('desc').trim().escape(),

  // Process request after validation and sanitization.
  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a Book object with escaped/trimmed data and old id.
    const shoe = new Shoe({
      name: req.body.name,
      brand: req.body.brand,
      category: req.body.category,
      desc: req.body.desc,
      _id: req.params.id, // This is required, or a new ID will be assigned!
    });

    if (!errors.isEmpty()) {
      // There are errors.
      // Render form again with sanitized values/error messages.
      // Get all brands and categories for form
      const [allBrands, allCategories] = await Promise.all([
        Brand.find().exec(),
        Category.find().exec(),
      ]);

      res.render('partials/forms/shoe_form', {
        title: 'Update Shoe',
        brand_list: allBrands,
        category_list: allCategories,
        shoe: shoe,
        errors: errors.array(),
      });
    } else {
      // Data from form is valid. Update the record.
      const theshoe = await Shoe.findByIdAndUpdate(req.params.id, shoe, {});
      // Redirect to shoe detail page.
      res.redirect(theshoe.url);
    }
  }),
];
