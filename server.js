const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

app.post('/api/courses', async (req, res) => {
    try {
        await client.connect();
        const database = client.db('ResourceHubDB');
        const courses = database.collection('Courses');
        
        const result = await courses.insertOne(req.body);
        res.status(201).json({ success: true, insertedId: result.insertedId });
    } catch (error) {
        console.error("Database error:", error);
        res.status(500).json({ error: 'Failed to sync with database' });
    } finally {
        await client.close();
    }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});