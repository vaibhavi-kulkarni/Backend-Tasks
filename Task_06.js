// Task_06.js
const express = require('express');
const axios = require('axios');

const app = express();
const PORT = 8080; // Adjust if needed

app.use(express.json());

app.get('/combined-data', async (req, res) => {
    try {
        const month = req.query.month; // Get the month from query parameter

        // Fetch data from the three APIs
        const transactionsResponse = await axios.get(`http://localhost:8080/transactions?month=${month}`);
        const statisticsResponse = await axios.get(`http://localhost:8080/statistics?month=${month}`);
        const categoriesResponse = await axios.get(`http://localhost:8080/categories?month=${month}`);

        // Combine the data
        const combinedData = {
            transactions: transactionsResponse.data,
            statistics: statisticsResponse.data,
            categories: categoriesResponse.data,
        };

        // Send the combined response
        res.json(combinedData);
    } catch (error) {
        console.error('Error fetching combined data:', error);
        res.status(500).json({ message: 'Error fetching combined data' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
