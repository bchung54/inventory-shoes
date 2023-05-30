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
  return `/category/${this.gender}`;
});

// Virtual for style category URL
CategorySchema.virtual('styleurl').get(function () {
  return `/category/${this.gender}/${this.style}`;
});

// Export model
module.exports = mongoose.model('Category', CategorySchema);
