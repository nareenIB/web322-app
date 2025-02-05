const express = require('express');
const path = require('path');
const app = express();
const storeService = require('./store-service');


app.use(express.static('public'));


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

app.get('/items', (req, res) => {
  storeService.getAllItems()
    .then(items => res.json(items))
    .catch(err => res.status(500).send(err));
});

app.get('/categories', (req, res) => {
  storeService.getCategories()
    .then(categories => res.json(categories))
    .catch(err => res.status(500).send(err));
});


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
