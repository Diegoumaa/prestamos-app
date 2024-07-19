const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const loanRoutes = require('./routes/loanRoutes');

dotenv.config();

const app = express();

// Middlewares
app.use(express.json());

// Routes
app.use('/api/loans', loanRoutes);

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((err) => {
  console.error(err);
});

module.exports = app;
