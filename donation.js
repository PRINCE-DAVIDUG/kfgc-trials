const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
  fullname: String,
  email: String,
  phone: String,
  donationType: String,
  amount: Number,
  message: String,
  transactionId: String,
  status: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Donation', donationSchema);
