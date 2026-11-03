const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
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
        
        const { courseId, fileName, fileUri } = req.body;

        // Find the specific course and push the new document, or create it if missing
        const result = await courses.updateOne(
            { _id: new ObjectId(courseId) },
            { $push: { studyNotes: { _id: new ObjectId(), fileName: fileName, fileUri: fileUri } } },
            { upsert: true }
        );
        
        res.status(201).json({ success: true, modifiedCount: result.modifiedCount });
    } catch (error) {
        console.error("Database error:", error);
        res.status(500).json({ error: 'Failed to sync with database' });
    } finally {
        await client.close();
    }
});

const PORT = process.env.PORT || 8080;

app.get('/api/courses/:id', async (req, res) => {
    try {
        await client.connect();
        const database = client.db('ResourceHubDB');
        const courses = database.collection('Courses');
        
        const course = await courses.findOne({ _id: new ObjectId(req.params.id) });
        res.status(200).json(course);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch course' });
    } finally {
        await client.close();
    }
});
app.post('/api/courses/create', async (req, res) => {
    try {
        await client.connect();
        const database = client.db('ResourceHubDB');
        const courses = database.collection('Courses');
        
        const { courseName, courseCode, category } = req.body;

        // Create the new course with empty arrays for future files
        const newCourse = {
            courseName: courseName,
            courseCode: courseCode,
            category: category,
            studyNotes: [],
            assignments: []
        };

        const result = await courses.insertOne(newCourse);
        res.status(201).json({ success: true, insertedId: result.insertedId });
    } catch (error) {
        console.error("Database error:", error);
        res.status(500).json({ error: 'Failed to create course' });
    } finally {
        await client.close();
    }
});
app.get('/api/courses', async (req, res) => {
    try {
        await client.connect();
        const database = client.db('ResourceHubDB');
        const courses = database.collection('Courses');
        
        const allCourses = await courses.find({}).toArray();
        res.status(200).json(allCourses);
    } catch (error) {
        console.error("Database error:", error);
        res.status(500).json({ error: 'Failed to fetch courses' });
    } finally {
        await client.close();
    }
});
app.delete('/api/courses/:id', async (req, res) => {
    try {
        await client.connect();
        const database = client.db('ResourceHubDB');
        const courses = database.collection('Courses');
        
        const result = await courses.deleteOne({ _id: new ObjectId(req.params.id) });
        res.status(200).json({ success: true, deletedCount: result.deletedCount });
    } catch (error) {
        console.error("Database error:", error);
        res.status(500).json({ error: 'Failed to delete course' });
    } finally {
        await client.close();
    }
});
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});