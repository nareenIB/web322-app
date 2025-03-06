/*********************************************************************************
*  WEB322 – Assignment 03
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part 
*  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
*
*
Name: __Nareen Ibrahim____________________ 
Student ID: __169115235____________ 
Date: __Mar 5, 2025______________

Cyclic Web App URL:
Replit Cover Page URL: https://cf6fc9ed-df80-4c87-bc97-929d90fdf80e-00-3i6ze0eqkcqtw.riker.replit.dev/
GitHub Repository URL: https://github.com/nareenIB/web322-app.git
********************************************************************************/ 

const express = require('express');
const path = require('path');
const app = express();
const storeService = require('./store-service');

app.use(express.static('public'));
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

const upload = multer(); // no storage option for multer

cloudinary.config({
    cloud_name: 'dylxvdn6d',
    api_key: '533362628985213 ',
    api_secret: 'lBMS9X_ulmAmb95Le_NjPtNOx50',
    secure: true
});

app.get('/', (req, res) => {
  res.redirect('/about');
});

app.get('/about', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'about.html'));
});

app.get('/shop', (req, res) => {
  storeService.getPublishedItems()
    .then(items => res.json(items))
    .catch(err => res.status(500).send(err));
});

app.get("/items", (req, res) => {
  const { category, minDate } = req.query;

  // Call the function to fetch items with filters
  storeService.getItems(category, minDate)
      .then((items) => {
          res.render("items", { items: items });
      })
      .catch((err) => {
          res.status(500).send("Error fetching items");
      });
});


app.get('/categories', (req, res) => {
  storeService.getCategories()
    .then(categories => res.json(categories))
    .catch(err => res.status(500).send(err));
});

// Serving the form for adding items
app.get('/items/add', (req, res) => {
  res.sendFile(path.join(__dirname, '/views/addItem.html'));
});


app.get("/item/:id", (req, res) => {
  const { id } = req.params;  // Extract 'id' from URL

  storeService.getItemById(id)
      .then((item) => {
          if (!item) {
              return res.status(404).send("Item not found");
          }
          res.render("itemDetail", { item: item });
      })
      .catch((err) => {
          res.status(500).send("Error fetching item");
      });
});

// Handling the form submission and file upload
app.post('/items/add', upload.single('featureImage'), (req, res) => {
  if (req.file) {
    // Function to upload image to Cloudinary
    let streamUpload = (req) => {
      return new Promise((resolve, reject) => {
        let stream = cloudinary.uploader.upload_stream(
          (error, result) => {
            if (result) {
              resolve(result);
            } else {
              reject(error);
            }
          }
        );
        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });
    };

    // Upload the image and then add the item
    async function upload(req) {
      let result = await streamUpload(req);
      console.log(result);  // Cloudinary image URL and data
      return result;
    }

    upload(req).then((uploaded) => {
      req.body.featureImage = uploaded.url;  // Store the image URL in the body
      storeService.addItem(req.body).then((addedItem) => {
        res.redirect('/items');  // Redirect to the item list after adding
      });
    });
  } else {
    // If no image, add the item without an image
    req.body.featureImage = "";  // Empty image URL if no image was uploaded
    storeService.addItem(req.body).then((addedItem) => {
      res.redirect('/items');  // Redirect to the item list after adding
    });
  }
});

// Error handling for undefined routes
app.use((req, res) => {
  res.status(404).send('Page Not Found');
});


storeService.initialize()
  .then(() => {
    const PORT = process.env.PORT || 8080;
    app.listen(PORT, () => {
      console.log(`Express http server listening on port ${PORT}`);
    });
  })
  .catch(err => {
    console.log('Error initializing store:', err);
  });
