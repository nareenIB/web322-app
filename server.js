/*********************************************************************************
*  WEB322 – Assignment 03
*  I declare that this assignment is my own work in accordance with Seneca Academic Policy.  
*  No part of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
*
* Name: Nareen Ibrahim
* Student ID: 169115235
* Date: Mar 5, 2025
*
* Cyclic Web App URL:
* Replit Cover Page URL: https://replit.com/@nibrahim32/web322-app-2?v=1#server.js
* GitHub Repository URL: https://github.com/nareenIB/web322-app.git
********************************************************************************/

const express = require('express');
const path = require('path');
const app = express();
const storeService = require('./store-service');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
const expressLayouts = require('express-ejs-layouts');

const upload = multer();

cloudinary.config({
    cloud_name: 'dylxvdn6d',
    api_key: '533362628985213',
    api_secret: 'lBMS9X_ulmAmb95Le_NjPtNOx50',
    secure: true
});

//setting up EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(expressLayouts);
app.use('/images', express.static(path.join(__dirname, 'public/images')));
app.set('layout', 'layouts/main'); //set default layout

//middleware to handle active routes
app.use((req, res, next) => {
    res.locals.activeRoute = req.path;
    res.locals.viewingCategory = req.query.category;
    next();
});

//routes
app.get('/', (req, res) => {
    res.redirect('/shop');
});

app.get('/about', (req, res) => {
    res.render('about', { title: "About Us" });
});

app.get('/shop', async (req, res) => {
    try {
        const items = await storeService.getPublishedItems();
        const categories = await storeService.getCategories();

        const post = items.length > 0 ? items[0] : null; 

        res.render('shop', { title: "Shop", post, items, categories });
    } catch (err) {
        res.render('shop', { title: "Shop", message: 'No items found', categories: [] });
    }
});

app.get('/items', async (req, res) => {
  try {
      const items = await storeService.getItems(req.query.category, req.query.minDate);
      const categories = await storeService.getCategories();
      res.render('items', { title: "Items", items, categories, message: items.length > 0 ? null : 'No items available' });
  } catch (err) {
      console.error("Error loading items:", err);
      res.render('items', { title: "Items", items: [], categories: [], message: 'No results' });
  }
});


app.get('/categories', async (req, res) => {
  try {
      const categories = await storeService.getCategories();
      res.render('categories', { title: "Categories", categories, message: categories.length > 0 ? null : 'No categories available' });
  } catch (err) {
      console.error("Error loading categories:", err);
      res.render('categories', { title: "Categories", categories: [], message: 'No categories found' });
  }
});


app.get('/items/add', async (req, res) => {
  try {
      const categories = await storeService.getCategories();
      res.render('addItem', { title: "Add Item", categories });
  } catch {
      res.render('addItem', { title: "Add Item", categories: [] });
  }
});


app.get('/shop/:id', async (req, res) => {
  try {
      const item = await storeService.getItemById(req.params.id);
      const categories = await storeService.getCategories();
      
      res.render('itemDetail', { title: "Item Details", item, categories });
  } catch (err) {
      res.render('itemDetail', { title: "Item Details", message: "Item not found", categories: [] });
  }
});


// 404 Page
app.use((req, res) => {
    res.status(404).render('404', { title: "Page Not Found" });
});

//initialize store service and start server
storeService.initialize()
    .then(() => {
        const PORT = process.env.PORT || 8080;
        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    })
    .catch(err => console.log('Error initializing store:', err));
