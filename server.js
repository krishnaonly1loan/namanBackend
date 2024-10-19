const express = require('express');
const nodemailer = require('nodemailer');
const multer = require('multer'); // For handling form-data
const cors = require('cors'); // Add this for CORS handling
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for all routes (allowing all origins)
app.use(cors());

// Setup multer for handling form-data
const upload = multer({ storage: multer.memoryStorage() }); // In-memory storage (no files saved to disk)

// Nodemailer configuration
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false, // Allow self-signed certificates
  },
});

// Middleware to parse form-data (via multer)
app.use(express.json());

// Root route for testing
app.get('/', (req, res) => {
  res.send('Server is up and running!');
});

// API to handle form submission using form-data
app.post('/apply', upload.single('resume'), (req, res) => {
  const { name, email } = req.body; // Get name and email from form-data fields
  console.log(req.file);

  // Configure email options
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.RECIPIENT_EMAIL, // Your recipient email where details will be sent
    subject: 'New Job Application',
    text: `Name: ${name}\nEmail: ${email}`,
    attachments: [
      {
        filename: req.file.originalname, // The original name of the file
        content: req.file.buffer, // The file content as buffer
        contentType: req.file.mimetype, // The MIME type of the file
      },
    ],
  };

  console.log(mailOptions);

  // Send the email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log('Error sending email:', error);
      return res.status(500).json({ message: 'Failed to send email' });
    }

    console.log('Email sent: ' + info.response);
    return res.status(200).json({ message: 'Application submitted successfully!' });
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
