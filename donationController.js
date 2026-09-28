const axios = require('axios');
const Donation = require('../models/Donation');
const nodemailer = require('nodemailer');

let accessToken = '';

const getPesapalToken = async () => {

  const response = await axios.post(
    'https://pay.pesapal.com/v3/api/Auth/RequestToken',
    {
      consumer_key: process.env.PESAPAL_CONSUMER_KEY,
      consumer_secret: process.env.PESAPAL_CONSUMER_SECRET
    }
  );

  accessToken = response.data.token;

  return accessToken;
};

exports.createDonation = async (req, res) => {

  try {

    const {
      fullname,
      email,
      phone,
      donationType,
      amount,
      message
    } = req.body;

    const token = await getPesapalToken();

    const orderId = 'DON-' + Date.now();

    const paymentData = {
      id: orderId,
      currency: 'UGX',
      amount: amount,
      description: donationType + ' Donation',
      callback_url: 'http://localhost:5000/api/donations/callback',
      notification_id: 'YOUR_IPN_ID',
      billing_address: {
        email_address: email,
        phone_number: phone,
        country_code: 'UG',
        first_name: fullname
      }
    };

    const paymentResponse = await axios.post(
      'https://pay.pesapal.com/v3/api/Transactions/SubmitOrderRequest',
      paymentData,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    const donation = new Donation({
      fullname,
      email,
      phone,
      donationType,
      amount,
      message,
      transactionId: orderId,
      status: 'Pending'
    });

    await donation.save();

    res.json({
      success: true,
      payment_url: paymentResponse.data.redirect_url
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: 'Payment initialization failed'
    });
  }
};

exports.paymentCallback = async (req, res) => {

  try {

    const orderTrackingId = req.query.OrderTrackingId;

    const token = await getPesapalToken();

    const statusResponse = await axios.get(
      `https://pay.pesapal.com/v3/api/Transactions/GetTransactionStatus?orderTrackingId=${orderTrackingId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    const transactionStatus = statusResponse.data.payment_status_description;

    const donation = await Donation.findOneAndUpdate(
      {
        transactionId: statusResponse.data.merchant_reference
      },
      {
        status: transactionStatus
      },
      {
        new: true
      }
    );

    if (donation && transactionStatus === 'Completed') {

      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: donation.email,
        subject: 'Donation Receipt',
        html: `
          <h2>Thank You For Your Donation</h2>
          <p>Hello ${donation.fullname},</p>
          <p>Your donation of UGX ${donation.amount} has been received successfully.</p>
          <p>May God bless you abundantly.</p>
        `
      });
    }

    res.send('Payment verified successfully');

  } catch (error) {
    console.log(error);
    res.status(500).send('Verification failed');
  }
};

exports.getDonations = async (req, res) => {

  const donations = await Donation.find().sort({ createdAt: -1 });

  res.json(donations);
};
