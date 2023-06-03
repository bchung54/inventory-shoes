const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const CategorySchema = new Schema({
  gender: {
    type: String,
    required: true,
    enum: ['mens', 'womens', 'kids', 'unisex'],
    default: 'unisex',
  },
  style: { type: String, required: true },
});

// Virtual for gender category URL
CategorySchema.virtual('genderurl').get(function () {
  return `/inventory/category/${this.gender}`;
});

// Virtual for style category URL
CategorySchema.virtual('url').get(function () {
  return `/inventory/category/${this.id}`;
});

// Virtual for category's full label
CategorySchema.virtual('label').get(function () {
  return `${
    this.gender[0].toUpperCase() + this.gender.slice(1)
  } - ${this.style[0].toUpperCase() + this.style.slice(1)}`;
});

// Export model
module.exports = mongoose.model('Category', CategorySchema);
