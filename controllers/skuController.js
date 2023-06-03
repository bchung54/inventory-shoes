const SKU = require('../models/sku');
const Shoe = require('../models/shoe');
const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');

// Display list of all skus.
exports.sku_list = asyncHandler(async (req, res, next) => {
  const allSKUs = await SKU.find().populate('shoe').exec();

  res.render('partials/sku_list', {
    title: 'SKU List',
    sku_list: allSKUs,
  });
});

// Display detail page for a specific sku.
exports.sku_detail = asyncHandler(async (req, res, next) => {
  const sku = await SKU.findById(req.params.id).populate('shoe').exec();

  if (sku === null) {
    // No results.
    const err = new Error('SKU not found');
    err.status = 404;
    return next(err);
  }

  res.render('partials/sku_detail', {
    title: 'SKU',
    sku: sku,
  });
});

// Display sku create form on GET.
exports.sku_create_get = asyncHandler(async (req, res, next) => {
  const allShoes = await Shoe.find()
    .populate('brand')
    .populate('category')
    .exec();

  allShoes.sort((a, b) => {
    let brandA = a.brand.name.toUpperCase();
    let brandB = b.brand.name.toUpperCase();
    if (brandA < brandB) {
      return -1;
    } else if (brandA > brandB) {
      return 1;
    } else {
      let nameA = a.name.toUpperCase();
      let nameB = b.name.toUpperCase();
      return nameA < nameB ? -1 : nameA > nameB ? 1 : 0;
    }
  });

  res.render('partials/forms/sku_form', {
    title: 'Create SKU',
    shoe_list: allShoes,
    selected_shoe: '',
    sku: '',
    errors: '',
  });
});

// Handle sku create on POST.
exports.sku_create_post = [
  // Validate and sanitize fields.
  body('shoe').escape(),
  body('color', 'Color must have 3 characters or more')
    .trim()
    .isLength({ min: 3 })
    .escape(),
  body('size', 'Size must be an integer').isInt({ min: 1, max: 99 }).toInt(),
  body('price', 'Price must be a float').isFloat({ min: 0 }).toFloat(),
  body('qty', 'Quantity must be an integer').isInt({ min: 0 }).toInt(),

  // Process request after validation and sanitization.
  asyncHandler(async (req, res, next) => {
    // Extract validation errors from a request.
    const errors = validationResult(req);

    // Create a SKU object with escaped and trimmed data.
    const sku = new SKU({
      shoe: req.body.shoe,
      color: req.body.color,
      size: req.body.size,
      price: req.body.price,
      qty: req.body.qty,
    });

    if (!errors.isEmpty()) {
      // There are errors.
      // Render form with sanitized values and error messages.
      const allShoes = await Shoe.find()
        .populate('brand')
        .populate('category')
        .exec();

      res.render('partials/forms/sku_form', {
        title: 'Create SKU',
        shoe_list: allShoes,
        selected_shoe: sku.shoe._id,
        sku: sku,
        errors: errors.array(),
      });
    } else {
      // Data from form is valid
      // Check if SKU for this shoe already exists
      const skuExists = await SKU.findOne({
        shoe: req.body.shoe,
        color: req.body.color,
        size: req.body.size,
      });
      if (skuExists) {
        // SKU exists, redirect to its detail page.
        res.redirect(skuExists.url);
      } else {
        // New SKU saved. Redirect to SKU detail page.
        await sku.save();
        res.redirect(sku.url);
      }
    }
  }),
];

// Display sku delete form on GET.
exports.sku_delete_get = asyncHandler(async (req, res, next) => {
  // Get details of sku
  const sku = await SKU.findById(req.params.id).populate('shoe').exec();

  if (sku === null) {
    // No results.
    res.redirect('/catalog/skus');
  }

  res.render('partials/sku_delete', {
    title: 'Delete SKU',
    sku: sku,
  });
});

// Handle sku delete on POST.
exports.sku_delete_post = asyncHandler(async (req, res, next) => {
  // No checks before removal
  await SKU.findByIdAndRemove(req.body.skuid);
  res.redirect('/inventory/skus');
});

// Display sku update form on GET.
exports.sku_update_get = asyncHandler(async (req, res, next) => {
  const sku = await SKU.findById(req.params.id).populate('shoe').exec();

  if (sku === null) {
    // No results.
    const err = new Error('Book copy not found');
    err.status = 404;
    return next(err);
  }

  const shoe = await Shoe.findById(sku.shoe._id)
    .populate('brand')
    .populate('category')
    .exec();

  res.render('partials/forms/sku_form', {
    title: 'Update SKU',
    shoe_list: [shoe],
    selected_shoe: shoe._id,
    sku: sku,
    errors: '',
  });
});

// Handle sku update on POST.
exports.sku_update_post = [
  // Validate and sanitize fields.
  body('shoe').escape(),
  body('color', 'Color must have 3 characters or more')
    .trim()
    .isLength({ min: 3 })
    .escape(),
  body('size', 'Size must be an integer').isInt({ min: 1, max: 99 }).toInt(),
  body('price', 'Price must be a float').isFloat({ min: 0 }).toFloat(),
  body('qty', 'Quantity must be an integer').isInt({ min: 0 }).toInt(),

  // Process request after validation and sanitization.
  asyncHandler(async (req, res, next) => {
    // Extract validation errors from a request.
    const errors = validationResult(req);

    // Create a SKU object with escaped and trimmed data.
    const sku = new SKU({
      shoe: req.body.shoe,
      color: req.body.color,
      size: req.body.size,
      price: req.body.price,
      qty: req.body.qty,
      _id: req.params.id,
    });

    if (!errors.isEmpty()) {
      // There are errors.
      // Render form with sanitized values and error messages.
      const shoe = await Shoe.findById(sku.shoe._id)
        .populate('brand')
        .populate('category')
        .exec();

      res.render('partials/forms/sku_form', {
        title: 'Update SKU',
        shoe_list: [shoe],
        selected_shoe: shoe._id,
        sku: sku,
        errors: errors.array(),
      });
    } else {
      // Data from form is valid. Update SKU
      const thesku = await SKU.findByIdAndUpdate(req.params.id, sku, {});
      // New SKU saved. Redirect to SKU detail page.
      res.redirect(thesku.url);
    }
  }),
];
