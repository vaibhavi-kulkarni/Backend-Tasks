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

// Helper function to categorize products by price range
function categorizeByPriceRange(products) {
    const priceRanges = {
        '0-100': 0,
        '101-200': 0,
        '201-300': 0,
        '301-400': 0,
        '401-500': 0,
        '501-600': 0,
        '601-700': 0,
        '701-800': 0,
        '801-900': 0,
        '901-above': 0
    };

    products.forEach(product => {
        const price = product.price;
        if (price >= 0 && price <= 100) {
            priceRanges['0-100']++;
        } else if (price >= 101 && price <= 200) {
            priceRanges['101-200']++;
        } else if (price >= 201 && price <= 300) {
            priceRanges['201-300']++;
        } else if (price >= 301 && price <= 400) {
            priceRanges['301-400']++;
        } else if (price >= 401 && price <= 500) {
            priceRanges['401-500']++;
        } else if (price >= 501 && price <= 600) {
            priceRanges['501-600']++;
        } else if (price >= 601 && price <= 700) {
            priceRanges['601-700']++;
        } else if (price >= 701 && price <= 800) {
            priceRanges['701-800']++;
        } else if (price >= 801 && price <= 900) {
            priceRanges['801-900']++;
        } else {
            priceRanges['901-above']++;
        }
    });

    return priceRanges;
}

// API to get pie chart data (categories and number of items) for the selected month
app.get('/pie-chart', async (req, res) => {
    const { month, category } = req.query;
    if (!month || isNaN(month) || month < 1 || month > 12) {
        return res.status(400).send({ error: 'Please provide a valid month (1-12).' });
    }
    if (!category) {
        return res.status(400).send({ error: 'Please provide a valid category.' });
    }

    const monthInt = parseInt(month, 10);

    try {
        // Fetch all products from the database
        const products = await Product.find();

        // Filter products by the selected month
        const filteredProducts = filterByMonth(products, monthInt);

        // Filter by category
        const filteredByCategory = filteredProducts.filter(product => product.category === category);

        // If there are no products in this category
        if (filteredByCategory.length === 0) {
            return res.status(404).json({
                error: `No items found for category "${category}" in month ${month}.`
            });
        }

        // Categorize products into price ranges
        const priceRangeData = categorizeByPriceRange(filteredByCategory);

        res.json({
            month: monthInt,
            category: category,
            priceRangeData
        });
    } catch (err) {
        console.error('Error fetching products', err);
        res.status(500).send('Internal server error');
    }
});

app.listen(port, () => {
    console.log(`API running at http://localhost:${port}`);
});
