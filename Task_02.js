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

// Endpoint to get all products with search and pagination
app.get('/transactions', async (req, res) => {
    const { search = '', page = 1, perPage = 10 } = req.query;

    // Calculate pagination
    const limit = parseInt(perPage);
    const skip = (parseInt(page) - 1) * limit;

    try {
        // Create search query based on provided search parameter
        const searchQuery = {
            $or: []
        };

        // Add conditions based on search input
        if (search) {
            // Check if search input is a valid number
            const isNumber = !isNaN(search);
            if (isNumber) {
                // If it's a number, search in price
                searchQuery.$or.push({ price: parseFloat(search) }); // Convert to number
            } else {
                // If it's not a number, search in title and description
                searchQuery.$or.push(
                    { title: { $regex: search, $options: 'i' } },  // case-insensitive match on title
                    { description: { $regex: search, $options: 'i' } } // case-insensitive match on description
                );
            }
        }

        // Fetch transactions with search and pagination
        const products = await Product.find(searchQuery)
            .skip(skip)
            .limit(limit);
        
        // Count total documents matching search query for pagination
        const totalCount = await Product.countDocuments(searchQuery);
        
        res.json({
            page: parseInt(page),
            perPage: limit,
            total: totalCount,
            totalPages: Math.ceil(totalCount / limit),
            products
        });
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
