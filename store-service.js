const fs = require('fs');
let items = [];
let categories = [];

function initialize() {
  return new Promise((resolve, reject) => {
    fs.readFile('./data/items.json', 'utf8', (err, data) => {
      if (err) reject('Unable to read items file');
      else {
        items = JSON.parse(data);
        fs.readFile('./data/categories.json', 'utf8', (err, data) => {
          if (err) reject('Unable to read categories file');
          else {
            categories = JSON.parse(data);
            resolve();
          }
        });
      }
    });
  });
}

function getAllItems() {
  return new Promise((resolve, reject) => {
    if (items.length > 0) resolve(items);
    else reject('No items found');
  });
}

function getItems(category, minDate) {
  return new Promise((resolve, reject) => {
    let filteredItems = items;

    if (category) {
      filteredItems = filteredItems.filter(item => item.category == category);
    }

    if (minDate) {
      const minDateObj = new Date(minDate);
      filteredItems = filteredItems.filter(item => new Date(item.postDate) >= minDateObj);
    }

    //attach category names
    filteredItems = filteredItems.map(item => {
      const categoryObj = categories.find(cat => cat.id == item.category);
      return { ...item, categoryName: categoryObj ? categoryObj.name : "Unknown" };
    });

    resolve(filteredItems.length > 0 ? filteredItems : reject('No results'));
  });
}

function getItemById(id) {
  return new Promise((resolve, reject) => {
    const item = items.find(item => item.id == id);
    if (!item) reject("No result returned");
    else resolve(item);
  });
}

function getItemsByCategory(category) {
  return new Promise((resolve, reject) => {
    const filteredItems = items.filter(item => item.category == category);
    if (filteredItems.length === 0) reject("No results returned");
    else resolve(filteredItems);
  });
}

function getItemsByMinDate(minDateStr) {
  return new Promise((resolve, reject) => {
    const filteredItems = items.filter(item => new Date(item.postDate) >= new Date(minDateStr));
    if (filteredItems.length === 0) reject("No results returned");
    else resolve(filteredItems);
  });
}

function getPublishedItems() {
  return new Promise((resolve, reject) => {
    const publishedItems = items.filter(item => item.published);
    if (publishedItems.length > 0) resolve(publishedItems);
    else reject('No published items found');
  });
}

function getCategories() {
  return new Promise((resolve) => {
    resolve(categories.length > 0 ? categories : []);
  });
}

function addItem(itemData) {
  return new Promise((resolve, reject) => {
    if (itemData.published === undefined) {
      itemData.published = false;
    }
    
    //this will automatically set postDate in YYYY-MM-DD format
    itemData.postDate = new Date().toISOString().split('T')[0]; 

    itemData.id = items.length + 1;
    items.push(itemData);

    fs.writeFile('./data/items.json', JSON.stringify(items, null, 2), (err) => {
      if (err) reject('Error saving item');
      else resolve(itemData);
    });
  });
}

module.exports = {
  initialize,
  getAllItems,
  getPublishedItems,
  getCategories,
  addItem,
  getItems,
  getItemById,
  getItemsByCategory,
  getItemsByMinDate
};
