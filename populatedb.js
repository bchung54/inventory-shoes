#! /usr/bin/env node

console.log(
  'This script populates some test shoes, brands, styles, and shoeSKUs to your database. Specified database as argument - e.g.: node populatedb "mongodb+srv://cooluser:coolpassword@cluster0.lz91hw2.mongodb.net/local_library?retryWrites=true&w=majority"'
);

// Get arguments passed on command line
const userArgs = process.argv.slice(2);

const Shoe = require('./models/shoe');
const Brand = require('./models/brand');
const Category = require('./models/category');
const SKU = require('./models/sku');

const brands = [];
const categories = [];
const shoes = [];
const skus = [];

const mongoose = require('mongoose');
mongoose.set('strictQuery', false); // Prepare for Mongoose 7

const mongoDB = userArgs[0];

main().catch((err) => console.log(err));

async function main() {
  console.log('Debug: About to connect');
  await mongoose.connect(mongoDB);
  console.log('Debug: Should be connected?');
  await createBrands();
  await createCategories();
  await createShoes();
  await createSkus();
  console.log('Debug: Closing mongoose');
  mongoose.connection.close();
}

async function brandCreate(name, desc) {
  const branddetail = { name: name };
  if (desc != false) branddetail.desc = desc;

  const brand = new Brand(branddetail);
  await brand.save();
  brands.push(brand);
  console.log(`Added brand: ${name}`);
}

async function categoryCreate(gender, style) {
  const category = new Category({ gender: gender, style: style });
  await category.save();
  categories.push(category);
  console.log(`Added category: ${gender} ${style}`);
}

async function shoeCreate(name, brand, category, desc) {
  const shoedetail = { name: name, brand: brand, category: category };
  if (desc != false) shoedetail.desc = desc;

  const shoe = new Shoe({ name, brand, category, desc });
  await shoe.save();
  shoes.push(shoe);
  console.log(`Added shoe: ${brand.name} - ${name}`);
}

async function skuCreate(shoe, size, color, qty, price) {
  const sku = new SKU({ shoe, size, color, qty, price });
  await sku.save();
  skus.push(sku);
  console.log(`Added sku: ${color} ${shoe.name} size: ${size}`);
}

async function createBrands() {
  console.log('Adding brands');
  await Promise.all([
    brandCreate('Nike'),
    brandCreate(
      'Adidas',
      "adidas has just the right style for everyone. Whatever you're looking for, consider this your one-stop-shop for everything adidas."
    ),
    brandCreate(
      'New Balance',
      'From tried-and-true classic sneakers to need-right-now trends, find the latest New Balance shoes and apparel for everyone in the family right here.'
    ),
    brandCreate('Nine West'),
  ]);
}

async function createCategories() {
  console.log('Adding categories');
  await Promise.all([
    categoryCreate('unisex', 'Sandal'),
    categoryCreate('mens', 'Sneakers'),
    categoryCreate('mens', 'Oxfords'),
    categoryCreate('womens', 'Sneakers'),
    categoryCreate('womens', 'Heels'),
    categoryCreate('kids', 'Sneakers'),
  ]);
}

async function createShoes() {
  console.log('Adding shoes');
  await Promise.all([
    shoeCreate(
      'Adilette Shower Slide Sandal',
      brands[1],
      categories[0],
      'Enjoy your after-pool sessions in the comfort of the Adidas Adilette Shower slide sandal.'
    ),
    shoeCreate('Adilette CF+ Slide Sandal', brands[1], categories[0]),
    shoeCreate(
      '997H Sneaker',
      brands[2],
      categories[3],
      'Keep comfortable hitting the gym or the town. Womens'
    ),
    shoeCreate(
      '997H Sneaker',
      brands[2],
      categories[1],
      'Keep comfortable hitting the gym or the town. Mens'
    ),
    shoeCreate(
      'Pruce Sandal',
      brands[3],
      categories[4],
      'Featuring leather upper for a rich look, the Nine West Pruce sandal is just great to wear everyday.'
    ),
    shoeCreate(
      'Lite Racer Adapt 5.0 Sneaker',
      brands[1],
      categories[5],
      'Add comfort to their run-around days with the Lite Race Adapt 5.0 sneaker from Adidas.'
    ),
  ]);
}

async function createSkus() {
  console.log('Adding authors');
  await Promise.all([
    skuCreate(shoes[0], 7, 'Blue', 5, 14.99),
    skuCreate(shoes[0], 8, 'Blue', 5, 14.99),
    skuCreate(shoes[0], 9, 'Blue', 5, 14.99),
    skuCreate(shoes[0], 10, 'Black', 0, 19.99),
    skuCreate(shoes[1], 5, 'Black', 3, 14.99),
    skuCreate(shoes[1], 8, 'Black', 4, 14.99),
    skuCreate(shoes[2], 8, 'Grey', 2, 49.99),
    skuCreate(shoes[2], 8, 'Grey', 2, 49.99),
    skuCreate(shoes[3], 6, 'Beige', 3, 83.99),
    skuCreate(shoes[4], 4, 'Blue', 11, 67.99),
  ]);
}
