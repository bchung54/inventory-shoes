const Brand = require('../models/brand');
const Shoe = require('../models/shoe');
const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');

// Display list of all brands.
exports.brand_list = asyncHandler(async (req, res, next) => {
  const allBrands = await Brand.find({}, 'name').sort({ name: 1 }).exec();
  res.render('partials/brand_list', {
    title: 'Brand List',
    brand_list: allBrands,
  });
});

// Display detail page for a specific brand.
exports.brand_detail = asyncHandler(async (req, res, next) => {
  const [brand, shoes] = await Promise.all([
    Brand.findById(req.params.id).exec(),
    Shoe.find({ brand: req.params.id }).populate('category').exec(),
  ]);

  if (brand === null) {
    // No results.
    const err = new Error('Brand not found');
    err.status = 404;
    return next(err);
  }

  res.render('partials/brand_detail', {
    title: 'Brand:',
    brand: brand,
    shoes: shoes,
  });
});

// Display brand create form on GET.
exports.brand_create_get = asyncHandler(async (req, res, next) => {
  res.render('partials/forms/brand_form', {
    title: 'Create Brand',
    brand: '',
    errors: '',
  });
});

// Handle brand create on POST.
exports.brand_create_post = [
  // Validate and sanitize the name field.
  body('name', 'Brand name must contain at least 3 characters')
    .trim()
    .isLength({ min: 3 })
    .escape(),
  body('desc').trim().escape(),

  // Process request after validation and sanitization.
  asyncHandler(async (req, res, next) => {
    // Extract validation errors from a request.
    const errors = validationResult(req);

    // Create a brand object with escaped and trimmed data.
    const brand = new Brand({ name: req.body.name, desc: req.body.desc });

    if (!errors.isEmpty()) {
      // There are errors.
      // Render the form again with sanitized values/error messages.
      res.render('partials/forms/brand_form', {
        title: 'Create Brand',
        brand: brand,
        errors: errors.array(),
      });
    } else {
      // Data from form is valid. Check if brand with same name already exists.
      const brandExists = await Brand.findOne({ name: req.body.name }).exec();
      if (brandExists) {
        // Brand exists, redirect to its detail page.
        res.redirect(brandExists.url);
      } else {
        await brand.save();
        // New brand saved. Redirect to its detail page.
        res.redirect(brand.url);
      }
    }
  }),
];

// Display brand delete form on GET.
exports.brand_delete_get = asyncHandler(async (req, res, next) => {
  // Get details of brand and all their shoes (in parallel)
  const [brand, allShoesByBrand] = await Promise.all([
    Brand.findById(req.params.id).exec(),
    Shoe.find({ brand: req.params.id }).populate('category').exec(),
  ]);

  if (brand === null) {
    // No results.
    res.redirect('/inventory/brands');
  }

  res.render('partials/brand_delete', {
    title: 'Delete Brand',
    brand: brand,
    brand_shoes: allShoesByBrand,
  });
});

// Handle brand delete on POST.
exports.brand_delete_post = asyncHandler(async (req, res, next) => {
  // Get details of brand and all their shoes
  const [brand, allShoesByBrand] = await Promise.all([
    Brand.findById(req.params.id).exec(),
    Shoe.find({ brand: req.params.id }).exec(),
  ]);

  if (allShoesByBrand.length > 0) {
    // Brand has shoes. Render in sam way as for GET route.
    res.render('partials/brand_delete', {
      title: 'Delete Brand',
      brand: brand,
      brand_shoes: allShoesByBrand,
    });
  } else {
    // Brand has no shoes. Delete object and redirect to the list of brands.
    await Brand.findByIdAndRemove(req.body.brandid);
    res.redirect('/inventory/brands');
  }
});

// Display brand update form on GET.
exports.brand_update_get = asyncHandler(async (req, res, next) => {
  // Get details of brand
  const brand = await Brand.findById(req.params.id).exec();

  if (brand === null) {
    // No results.
    const err = new Error('Brand not found');
    err.status = 404;
    return next(err);
  }

  res.render('partials/forms/brand_form', {
    title: 'Update brand',
    brand: brand,
    errors: '',
  });
});

// Handle brand update on POST.
exports.brand_update_post = [
  // Validate and sanitize the name field.
  body('name', 'Brand name must contain at least 3 characters')
    .trim()
    .isLength({ min: 3 })
    .escape(),
  body('desc').trim().escape(),
  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create Brand object with escaped and trimmed data.
    const brand = new Brand({
      name: req.body.name,
      desc: req.body.desc,
      _id: req.params.id,
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/errors messages.
      res.render('partials/forms/brand_form', {
        title: 'Update Brand',
        brand: brand,
        errors: errors.array(),
      });
    } else {
      // Data from form is valid. Update the record.
      const thebrand = await Brand.findByIdAndUpdate(req.params.id, brand, {});
      // Redirect to brand details.
      res.redirect(thebrand.url);
    }
  }),
];
