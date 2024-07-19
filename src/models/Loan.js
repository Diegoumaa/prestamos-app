const mongoose = require('mongoose');

const loanSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  capital: { type: Number, required: true },
  abonos: { type: Number, required: true },
  porcentaje: { type: Number, required: true },
  cuotaMensual: { type: Number, required: true },
});

const Loan = mongoose.model('Loan', loanSchema);

module.exports = Loan;
