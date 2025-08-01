const express = require('express');
const multer = require('multer');
const path = require('path');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;

// Load environment variables from .env file
require('dotenv').config();

// Configure Cloudinary with your credentials
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const app = express();
const PORT = process.env.PORT || 3000;

// --- Cloudinary Storage Configuration ---
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'express-file-project', // Optional: A folder in your Cloudinary account
    allowed_formats: ['jpg', 'png', 'pdf', 'doc', 'docx'],
    transformation: [{ width: 500, crop: 'limit' }]
  }
});

const upload = multer({ storage: storage });

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// --- Routes ---

// Route to handle file uploads
app.post('/upload', upload.single('document'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }
  // The file is now on Cloudinary! We get the URL from req.file.path
  res.send(`File uploaded successfully! View it at: <a href="${req.file.path}" target="_blank">${req.file.filename}</a>`);
});

// Route to get a list of all uploaded files from Cloudinary
app.get('/files', async (req, res) => {
    try {
        const files = await cloudinary.search
            .expression('folder:express-file-project') // Match the folder name
            .execute();

        if (files.resources.length === 0) {
            return res.status(200).send('<h1>No files uploaded yet.</h1>');
        }

        let fileList = '<h1>Uploaded Files</h1><ul>';
        files.resources.forEach(file => {
            fileList += `<li><a href="${file.secure_url}" target="_blank">${file.public_id}</a></li>`;
        });
        fileList += '</ul>';
        res.send(fileList);
    } catch (err) {
        console.error('Error fetching files from Cloudinary:', err);
        res.status(500).send('Error fetching files.');
    }
});

// We no longer need a separate download route, as Cloudinary URLs can be viewed/downloaded directly.

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});