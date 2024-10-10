// server.js
const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');

const app = express();
const port = 8080;

// MongoDB connection
async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/Amazon'); // Connect to MongoDB with database name "Amazon"
    console.log("Success with MongoDB connection");
}

// Product Schema
const productSchema = new mongoose.Schema({
    id: Number,
    title: String,
    price: Number,
    description: String,
    category: String,
    image: String,
    sold: Boolean,
    dateOfSale: Date
});

const Product = mongoose.model('Product', productSchema);

// Endpoint to fetch and store products from the third-party link
app.get('/initialize', async (req, res) => {
    try {
        const response = await axios.get('https://s3.amazonaws.com/roxiler.com/product_transaction.json');
        const products = response.data;

        await Product.deleteMany({}); // Clear existing products
        await Product.insertMany(products); // Insert new products

        res.json({ message: 'Products initialized successfully', products });
    } catch (error) {
        res.status(500).json({ message: 'Error initializing products', error: error.message });
    }
});

// Endpoint to get all products
app.get('/products', async (req, res) => {
    try {
        const products = await Product.find({});
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching products', error: error.message });
    }
});

// Start the server
main()
    .then(() => {
        app.listen(port, () => {
            console.log(`Server running at http://localhost:${port}`);
        });
    })
    .catch((err) => {
        console.log(err);
    });
