require('dotenv').config();
const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');

// Debug .env loading
console.log('Looking for .env in:', path.resolve(__dirname));
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '[hidden]' : undefined);

const app = express();
const PORT = process.env.PORT || 3002;

// Email configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Verify transporter
transporter.verify((error, success) => {
  if (error) {
    console.error('Transporter verification failed:', error);
  } else {
    console.log('Transporter is ready to send emails');
  }
});

// ... (rest of your code: CORS, MongoDB connection, schemas, routes, etc.)

// CORS setup
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/flightBookingDB')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Email configuration

// User Schema
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true }
});

const User = mongoose.model('User', userSchema);

// Booking Schema
const bookingSchema = new mongoose.Schema({
  flight: String,
  departure: String,
  arrival: String,
  departureDate: String,
  arrivalDate: String,
  tickets: Number,
  ticketType: String,
  userId: String,
  price: Number,
  bookingDate: { type: Date, default: Date.now }
});

const Booking = mongoose.model('Booking', bookingSchema);

// Function to send booking confirmation email
async function sendBookingConfirmation(userEmail, bookingDetails) {
  const mailOptions = {
    from: process.env.EMAIL_USER , // Sender address
    to: userEmail,                // Receiver address
    subject: 'Travela - Booking Confirmation',
    html: `
      <h2>Booking Confirmation</h2>
      <p>Dear Customer,</p>
      <p>Your flight booking has been confirmed. Here are the details:</p>
      <ul>
        <li><strong>Flight:</strong> ${bookingDetails.flight}</li>
        <li><strong>Departure:</strong> ${bookingDetails.departure}</li>
        <li><strong>Arrival:</strong> ${bookingDetails.arrival}</li>
        <li><strong>Departure Date:</strong> ${bookingDetails.departureDate}</li>
        <li><strong>Tickets:</strong> ${bookingDetails.tickets}</li>
        <li><strong>Ticket Type:</strong> ${bookingDetails.ticketType}</li>
        <li><strong>Total Price:</strong> ₹${bookingDetails.price}</li>
      </ul>
      <p>Thank you for choosing Travela!</p>
      <p>Best regards,<br>Travela Team</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Booking confirmation email sent to:', userEmail);
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send confirmation email');
  }
}

// Signup Route
app.post('/api/signup', async (req, res) => {
  const { name, email, password } = req.body;
  console.log('Signup request received:', { name, email });

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword });
    await user.save();

    res.status(201).json({ success: true, message: 'Signup successful! Please log in.' });
  } catch (error) {
    console.error('Error during signup:', error);
    res.status(500).json({ success: false, message: 'Error during signup', error: error.message });
  }
});

// Login Route
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  console.log('Login request received:', { email });

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found. Please sign up first.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Incorrect password' });
    }

    res.status(200).json({
      success: true,
      message: 'Login successful',
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ success: false, message: 'Error during login', error: error.message });
  }
});

// Booking Routes
app.options('/api/bookings', (req, res) => {
  console.log('OPTIONS request received from:', req.headers.origin);
  res.status(204).send();
});

app.post('/api/bookings', async (req, res) => {
  console.log('POST request received from:', req.headers.origin);
  console.log('Booking data:', req.body);

  try {
    const booking = new Booking(req.body);
    await booking.save();

    // Find user email if userId is provided
    let userEmail = '';
    if (req.body.userId && req.body.userId !== 'guest') {
      // Look up user by email instead of _id
      const user = await User.findOne({ email: req.body.userId });
      if (user) {
        userEmail = user.email;
      } else {
        console.log('No user found with email:', req.body.userId);
      }
    }

    // If no user found or user is guest, use email from request body
    if (!userEmail && req.body.userId === 'guest') {
      userEmail = req.body.email || '';
    }

    // Send email if we have an email address
    if (userEmail) {
      await sendBookingConfirmation(userEmail, req.body);
    }

    res.status(201).json({ success: true, message: 'Booking saved successfully' });
  } catch (error) {
    console.error('Error saving booking:', error);
    res.status(500).json({ success: false, message: 'Error saving booking', error: error.message });
  }
});

app.get('/api/bookings', async (req, res) => {
  try {
    const bookings = await Booking.find();
    res.status(200).json(bookings);
  } catch (error) {
    console.error('Error retrieving bookings:', error);
    res.status(500).json({ success: false, message: 'Error retrieving bookings' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});