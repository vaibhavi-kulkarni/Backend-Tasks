const express = require('express');
const mongoose = require('mongoose');
const app = express();
const port = 3000;

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/Amazon', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Could not connect to MongoDB', err));

// Define product schema
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

// Create product model
const Product = mongoose.model('Product', productSchema);

// Helper function to filter products by month
function filterByMonth(products, month) {
    return products.filter(product => {
        const saleDate = new Date(product.dateOfSale);
        return saleDate.getMonth() + 1 === month;
    });
}

// API to get statistics by month
app.get('/statistics', async (req, res) => {
    const { month } = req.query;
    if (!month || isNaN(month) || month < 1 || month > 12) {
        return res.status(400).send({ error: 'Please provide a valid month (1-12).' });
    }

    const monthInt = parseInt(month, 10);

    try {
        // Fetch all products from the database
        const products = await Product.find();

        // Filter products by the selected month
        const filteredProducts = filterByMonth(products, monthInt);

        // Calculate total sale amount for sold products
        const totalSaleAmount = filteredProducts
            .filter(product => product.sold)
            .reduce((total, product) => total + product.price, 0);

        // Calculate total number of sold and not sold items
        const totalSoldItems = filteredProducts.filter(product => product.sold).length;
        const totalNotSoldItems = filteredProducts.filter(product => !product.sold).length;

        res.json({
            month: monthInt,
            totalSaleAmount,
            totalSoldItems,
            totalNotSoldItems
        });
    } catch (err) {
        console.error('Error fetching products', err);
        res.status(500).send('Internal server error');
    }
});

app.listen(port, () => {
    console.log(`API running at http://localhost:${port}`);
});
