const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const SKUSchema = new Schema({
  shoe: { type: Schema.Types.ObjectId, ref: 'Shoe', required: true },
  size: { type: Number, required: true },
  color: { type: String, required: true },
  qty: { type: Number, required: true, default: 0 },
  price: { type: mongoose.Decimal128, required: true },
});

// Virtual for shoe SKU's URL
SKUSchema.virtual('url').get(function () {
  return `/inventory/sku/${this._id})`;
});

// Export model
module.exports = mongoose.model('SKU', SKUSchema);
