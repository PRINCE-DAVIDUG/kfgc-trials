const express = require('express');
const router = express.Router();

const {
  createDonation,
  paymentCallback,
  getDonations
} = require('../controllers/donationController');

router.post('/donate', createDonation);
router.get('/callback', paymentCallback);
router.get('/all', getDonations);

module.exports = router;
