const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB connection
mongoose.connect('mongodb+srv://abbasalichand786:ZIg9QjyQw20MeST2@cluster0.fytd6rm.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
.then(()=>console.log("mongo connected"))

// Define a schema and model for storing paths
const pathSchema = new mongoose.Schema({
  date: { type: String, required: true },
  positions: { type: [[Number]], required: true },
});

const Path = mongoose.model('Path', pathSchema);

// API routes

// Save path data for a specific date
app.post('/api/paths', async (req, res) => {
  const { date, positions } = req.body;

  try {
    // Check if data for that date already exists
    let pathData = await Path.findOne({ date });

    if (pathData) {
      // Update existing data
      pathData.positions.push(...positions);
      await pathData.save();
    } else {
      // Create new data entry
      pathData = new Path({ date, positions });
      await pathData.save();
    }

    res.status(200).json({ message: 'Path saved successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save path' });
  }
});

// Get all stored dates
app.get('/api/paths/dates', async (req, res) => {
  try {
    const paths = await Path.find({}, 'date');
    const dates = paths.map(path => path.date);
    console.log("Stored Dates:", dates);
    res.status(200).json(dates);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch dates' });
  }
});

// Get path data for a specific date
app.get('/api/paths/:date', async (req, res) => {
  const { date } = req.params;

  try {
    const pathData = await Path.findOne({ date });
    if (!pathData) return res.status(404).json({ message: 'No data found for this date' });

    res.status(200).json(pathData.positions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch path data' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});