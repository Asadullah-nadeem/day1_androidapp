const express = require('express');
const multer = require('multer');
const path = require('path');
const mysql = require('mysql2');
const fs = require('fs'); 
const crypto = require('crypto');  
const app = express();
app.set('view engine', 'ejs');
app.set('views', './views');
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);  
    const filename = Date.now() + ext;  
    cb(null, filename);  
  }
});
app.get('/', (req, res) => {
    const data = {
      message: 'Hello Server'
    };
    res.render('index', data);
  });
  const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, 
    fileFilter: (req, file, cb) => {
      if (!file.mimetype.startsWith('image/')) {
        return cb(new Error('Only image files are allowed'), false);
      }
      cb(null, true);
    }
  });
  
  // MySQL database connection
  const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '1234',
    database: 'myapp'
  });
  
  db.connect((err) => {
    if (err) {
      console.error('Error connecting to the database:', err.stack);
      return;
    }
    console.log('Connected to the MySQL database');
  });
  
  app.get('/', (req, res) => {
    const data = {
      message: 'Hello Server'
    };
    res.render('index', data);
  });
  
  
  // Log Text
  const logDirtext = 'logtext';
  if (!fs.existsSync(logDirtext)) {
    fs.mkdirSync(logDirtext);
  }
  // Log Image
  const logDirimage = 'logimage';
  if (!fs.existsSync(logDirimage)) {
    fs.mkdirSync(logDirimage);
  }
  
  // Comment
  app.post('/submit-comment', (req, res) => {
    const comment = req.body.comment;
    console.log('Received comment:', comment);
  
    const logFileName = path.join(logDirtext, crypto.createHash('sha256')
      .update(Date.now().toString())
      .digest('hex') + '.txt');
  
    const logComment = `Comment: ${comment}\nDate: ${new Date().toISOString()}\n\n`;
  
    fs.appendFile(logFileName, logComment, (err) => {
      if (err) {
        console.error('Error writing to log file:', err);
        return res.status(500).send('Error logging the comment');
      }
    });
    const query = 'INSERT INTO comments (comment) VALUES (?)';
    db.query(query, [comment], (err, result) => {
      if (err) {
        console.error('Error inserting comment:', err);
        return res.status(500).send(`<script>
          alert('Error uploading image');
          window.location.href = '/';
        </script>`);
      }
      res.send(`<script>
          alert('Comment submitted successfully');
          window.location.href = '/';
        </script>`);  });
  });
  
  
  // image
  app.post('/upload-image', upload.single('image'), (req, res) => {
    if (!req.file) {
      return res.status(400).send('No file uploaded');
    }
  
    const imagePath = path.join('uploads', req.file.filename);  
    console.log('File uploaded:', req.file);
  
  
   const logFileName = path.join(logDirimage, crypto.createHash('sha256')
      .update(Date.now().toString())  
      .digest('hex') + '.txt');
  
    const logUpload = `File: ${req.file.originalname}\nMimetype: ${req.file.mimetype}\nPath: ${imagePath}\nSize: ${req.file.size} bytes\nDate: ${new Date().toISOString()}\n\n`;
    fs.appendFile(logFileName, logUpload, (err) => {
      if (err) {
        console.error('Error writing to log file:', err);
        return res.status(500).send('Error logging the upload');
      }
    });
    const query = 'INSERT INTO images (filename, path) VALUES (?, ?)';
    db.query(query, [req.file.originalname, imagePath], (err, result) => {
      if (err) {
        console.error('Error inserting image info:', err);
        return res.status(500).send(`<script>
          alert('Error uploading image');
          window.location.href = '/';
        </script>`);
      }
      res.send(`<script>
          alert('Comment submitted successfully');
          window.location.href = '/';
        </script>`);
    });
  });
  
  // Start the server
  app.listen(3000, () => {
    console.log(`http://localhost:3000/`);
  });
  