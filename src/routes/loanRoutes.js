const express = require('express');
const Loan = require('../models/Loan');

const router = express.Router();

// Get all loans
router.get('/', async (req, res) => {
  try {
    const loans = await Loan.find();
    res.json(loans);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add a new loan
router.post('/', async (req, res) => {
  const loan = new Loan({
    nombre: req.body.nombre,
    capital: req.body.capital,
    abonos: req.body.abonos,
    porcentaje: req.body.porcentaje,
    cuotaMensual: req.body.cuotaMensual,
  });

  try {
    const newLoan = await loan.save();
    res.status(201).json(newLoan);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
