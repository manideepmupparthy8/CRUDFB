const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors({
  origin: "http://localhost:3000", // Replace with your client application's domain
}));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const tempDir = path.join(__dirname, 'temp');
    fs.mkdirSync(tempDir, { recursive: true }); // Create the temporary directory if it doesn't exist
    cb(null, tempDir);
  },
  filename: (req, file, cb) => {
    const { userId } = req.query;
    const fileName = `${userId}${path.extname(file.originalname)}`;
    cb(null, fileName);
  },
});

const upload = multer({ storage });

app.use(express.json());

app.post('/api/upload', upload.single('file'), (req, res) => {
  const { userId } = req.query;
  console.log(userId,"thisis the userId")

  if (!userId) {
    return res.status(400).json({ message: 'Missing userId parameter.' });
  }

  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded.' });
  }

  const filePath = req.file.path;
  const existingFilePath = path.join(__dirname, 'uploads', `${userId}${path.extname(req.file.originalname)}`);

  if (fs.existsSync(existingFilePath)) {
    fs.unlinkSync(existingFilePath);
  }

  fs.rename(filePath, existingFilePath, (err) => {
    if (err) {
      return res.status(500).json({ message: 'Error updating file.' });
    }
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.json({ message: 'File updated successfully.', userId });
  });
});

app.get('/api/files/:userId', (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({ message: 'Missing userId parameter.' });
  }

  fs.readdir('uploads/', (err, files) => {
    if (err) {
      return res.status(500).json({ message: 'Error reading files.' });
    }

    const matchingFiles = files.filter((file) => file.startsWith(userId));

    if (matchingFiles.length > 0) {
      const filePath = path.join(__dirname, 'uploads', matchingFiles[0]);
      return res.download(filePath, (err) => {
        if (err) {
          return res.status(500).json({ message: 'Error downloading file.' });
        }
      });
    } else {
      return res.status(404).json({ message: 'File not found.' });
    }
  });
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
