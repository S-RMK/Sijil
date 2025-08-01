const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Set up Multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Save files to the 'uploads' directory
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    // Generate a unique filename to prevent conflicts
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // This line is crucial for viewing files

// --- Routes ---

// Route to handle file uploads
app.post('/upload', upload.single('document'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }
  res.send(`File uploaded successfully! View it at: <a href="/uploads/${req.file.filename}">${req.file.filename}</a>`);
});

// Route to get a list of all uploaded files
app.get('/files', (req, res) => {
    fs.readdir(path.join(__dirname, 'uploads'), (err, files) => {
        if (err) {
            return res.status(500).send('Unable to scan files.');
        }

        // Generate an HTML list of file links
        let fileList = '<h1>Uploaded Files</h1><ul>';
        files.forEach(file => {
            fileList += `<li><a href="/download/${file}">${file}</a> <a href="/uploads/${file}" target="_blank">(View)</a></li>`;
        });
        fileList += '</ul>';
        res.send(fileList);
    });
});

// Route to handle file downloads
app.get('/download/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, 'uploads', filename);

    // Use res.download to send the file as an attachment
    res.download(filePath, (err) => {
        if (err) {
            console.error('Download error:', err);
            res.status(404).send('File not found or an error occurred.');
        }
    });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});