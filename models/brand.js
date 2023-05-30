const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const BrandSchema = new Schema({
  name: { type: String, required: true },
  desc: { type: String },
});

// Virtual for shoe brand's URL
BrandSchema.virtual('url').get(function () {
  return `/brand/${this.name})`;
});

// Export model
module.exports = mongoose.model('Brand', BrandSchema);
