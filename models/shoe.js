const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ShoeSchema = new Schema({
  name: { type: String, required: true, maxlength: 100 },
  brand: { type: Schema.Types.ObjectId, ref: 'Brand', required: true },
  category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
  desc: { type: String },
});

// Virtual for shoe's URL
ShoeSchema.virtual('url').get(function () {
  return `/inventory/shoe/${this._id})`;
});

// Export model
module.exports = mongoose.model('Shoe', ShoeSchema);
