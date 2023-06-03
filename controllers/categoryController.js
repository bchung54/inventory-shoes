const Category = require('../models/category');
const Shoe = require('../models/shoe');
const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');

// Display list of all categories.
exports.category_list = asyncHandler(async (req, res, next) => {
  const allCategories = await Category.find()
    .sort({ gender: 1, style: 1 })
    .exec();

  res.render('partials/category_list', {
    title: 'Category List',
    category_list: allCategories,
  });
});

// Display detail page for a specific category.
exports.category_detail = asyncHandler(async (req, res, next) => {
  const [category, shoes] = await Promise.all([
    Category.findById(req.params.id).exec(),
    Shoe.find({ category: req.params.id }).populate('brand').exec(),
  ]);

  if (category === null) {
    // No results.
    const err = new Error('Category not found');
    err.status = 404;
    return next(err);
  }

  res.render('partials/category_detail', {
    title: 'Category Detail',
    category: category,
    shoes: shoes,
  });
});

// Display category create form on GET.
exports.category_create_get = asyncHandler(async (req, res, next) => {
  const uniqueGenders = await Category.distinct('gender');
  uniqueGenders.sort((a, b) => {
    return a < b ? -1 : a > b ? 1 : 0;
  });

  res.render('partials/forms/category_form', {
    title: 'Create Category',
    gender_list: uniqueGenders,
    category: '',
    errors: '',
  });
});

// Handle category create on POST.
exports.category_create_post = [
  // Validate and sanitize fields.
  body('gender').escape(),
  body('style', 'Style must be specified').trim().isLength({ min: 1 }).escape(),

  // Process request after validation and sanitiziation.
  asyncHandler(async (req, res, next) => {
    // Extract validation errors from a request.
    const errors = validationResult(req);

    // Create a Category object with escaped and trimmed data.
    const category = new Category({
      gender: req.body.gender,
      style: req.body.style,
    });

    if (!errors.isEmpty()) {
      // There are errors.
      // Get list of unique genders.
      const uniqueGenders = await Category.distinct('gender');
      uniqueGenders.sort((a, b) => {
        return a < b ? -1 : a > b ? 1 : 0;
      });

      // Render form again with sanitized values and error messages.
      res.render('partials/forms/category_form', {
        title: 'Create Category',
        gender_list: uniqueGenders,
        category: category,
        errors: '',
      });
    } else {
      // Data from form is valid
      // Check if category already exists.
      const categoryExists = await Category.findOne({
        gender: req.body.gender,
        style: req.body.style,
      }).exec();
      if (categoryExists) {
        // Category exists, redirect to its detail page.
        res.redirect(category.url);
      } else {
        await category.save();
        res.redirect(category.url);
      }
    }
  }),
];

// Display category delete form on GET.
exports.category_delete_get = asyncHandler(async (req, res, next) => {
  // Get details of category and all associated shoes (in parallel)
  const [category, shoesInCategory] = await Promise.all([
    Category.findById(req.params.id).exec(),
    Shoe.find({ category: req.params.id }, 'name brand').exec(),
  ]);

  if (category === null) {
    // No results.
    res.redirect('inventory/categories');
  }

  res.render('partials/category_delete', {
    title: 'Delete Category',
    category: category,
    category_shoes: shoesInCategory,
  });
});

// Handle category delete on POST.
exports.category_delete_post = asyncHandler(async (req, res, next) => {
  const [category, shoesInCategory] = await Promise.all([
    Category.findById(req.params.id).exec(),
    Shoe.find({ category: req.params.id }).exec(),
  ]);

  if (shoesInCategory.length > 0) {
    // There are shoes in this category. Render just like GET route.
    res.render('partials/category_delete', {
      title: 'Delete Category',
      category: category,
      category_shoes: shoesInCategory,
    });
  } else {
    // There are no shoes in this category.
    // Delete object and redirect to list of categories.
    await Category.findByIdAndRemove(req.body.categoryid);
    res.redirect('/inventory/categories');
  }
});

// Display category update form on GET.
exports.category_update_get = asyncHandler(async (req, res, next) => {
  const [category, uniqueGenders] = await Promise.all([
    Category.findById(req.params.id).exec(),
    Category.distinct('gender'),
  ]);

  if (category === null) {
    // No results.
    const err = new Error('Category not found');
    err.status = 404;
    return next(err);
  }

  // Sort genders
  uniqueGenders.sort((a, b) => {
    return a < b ? -1 : a > b ? 1 : 0;
  });

  res.render('partials/forms/category_form', {
    title: 'Update Category',
    gender_list: uniqueGenders,
    category: category,
    errors: '',
  });
});

// Handle category update on POST.
exports.category_update_post = [
  // Validate and sanitize fields.
  body('gender').escape(),
  body('style', 'Style must be specified').trim().isLength({ min: 1 }).escape(),

  // Process request after validation and sanitization.
  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a Category object with escaped and trimmed data.
    const category = new Category({
      gender: req.body.gender,
      style: req.body.style,
      _id: req.params.id,
    });

    if (!errors.isEmpty()) {
      // There are errors.
      // Get list of unique genders.
      const uniqueGenders = await Category.distinct('gender').exec();
      // Render form again with sanitized values and error messages.
      res.render('partials/forms/category_form', {
        title: 'Update Category',
        gender_list: uniqueGenders,
        category: category,
        errors: errors.array(),
      });
    } else {
      const thecategory = await Category.findByIdAndUpdate(
        req.params.id,
        category,
        {}
      );
      res.redirect(thecategory.url);
    }
  }),
];
