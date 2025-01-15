const express = require("express");
const multer = require("multer");
const path = require("path");
const mysql = require("mysql2");
const fs = require("fs");
const crypto = require("crypto");

const app = express();

app.set("view engine", "ejs");
app.set("views", "./views");
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = Date.now() + ext;
    cb(null, filename);
  },
});


const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files are allowed"), false);
    }
    cb(null, true);
  },
});

// MySQL database connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "1234",
  database: "myapp",
});

db.connect((err) => {
  if (err) {
    console.error("⛓️‍💥 Error connecting to the database:", err.stack);
    return;
  }
  console.log("✅ Connected to the MySQL database");
});


// INdex.ejs
app.get("/", (req, res) => {
  const data = {
    message: `Hello Server (API) `

  };
  res.render("index", data);
});



// Log Text
const logDirtext = "logtext";
if (!fs.existsSync(logDirtext)) {
  fs.mkdirSync(logDirtext);
}
// Log Image
const logDirimage = "logimage";
if (!fs.existsSync(logDirimage)) {
  fs.mkdirSync(logDirimage);
}

//Api Text
const apiLogDir = "logapikeys";
if (!fs.existsSync(apiLogDir)) {
  fs.mkdirSync(apiLogDir);
}

// Api Image
const apilogdirimage = "logapikeysimg";
if (!fs.existsSync(apilogdirimage)){
    fs.mkdirSync(apilogdirimage);
}




// Comment
app.post("/submit-comment", (req, res) => {
  const comment = req.body.comment;
  console.log("Received comment:", comment);

  const logFileName = path.join(
    logDirtext,
    crypto.createHash("sha256").update(Date.now().toString()).digest("hex") +
      ".txt"
  );

  const logComment = `Comment: ${comment}\nDate: ${new Date().toISOString()}\n\n`;

  fs.appendFile(logFileName, logComment, (err) => {
    if (err) {
      console.error("Error writing to log file:", err);
      return res.status(500).send("Error logging the comment");
    }
  });
  const query = "INSERT INTO comments (comment) VALUES (?)";
  db.query(query, [comment], (err, result) => {
    if (err) {
      console.error("Error inserting comment:", err);
      return res.status(500).send(`<script>
          alert('⛓️‍💥 Error uploading image');
          window.location.href = '/';
        </script>`);
    }
    res.send(`<script>
          alert('✅ Comment submitted successfully');
          window.location.href = '/';
        </script>`);
  });
});

// image
app.post("/upload-image", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded");
  }

  const imagePath = path.join("uploads", req.file.filename);
  console.log("File uploaded:", req.file);

  const logFileName = path.join(
    logDirimage,
    crypto.createHash("sha256").update(Date.now().toString()).digest("hex") +
      ".txt"
  );

  const logUpload = `File: ${req.file.originalname}\nMimetype: ${
    req.file.mimetype
  }\nPath: ${imagePath}\nSize: ${
    req.file.size
  } bytes\nDate: ${new Date().toISOString()}\n\n`;
  fs.appendFile(logFileName, logUpload, (err) => {
    if (err) {
      console.error("Error writing to log file:", err);
      return res.status(500).send("Error logging the upload");
    }
  });
  const query = "INSERT INTO images (filename, path) VALUES (?, ?)";
  db.query(query, [req.file.originalname, imagePath], (err, result) => {
    if (err) {
      console.error("Error inserting image info:", err);
      return res.status(500).send(`<script>
          alert('⛓️‍💥 Error uploading image');
          window.location.href = '/';
        </script>`);
    }
    res.send(`<script>
          alert('✅ Comment submitted successfully');
          window.location.href = '/';
        </script>`);
  });
});

// Text only

// Generate and log API key (Text)
const apiKey = crypto.randomBytes(16).toString("hex");
const apiLogFile = path.join(apiLogDir, "api_keys.log");
fs.appendFileSync(
  apiLogFile,
  `API Key: ${apiKey}\nGenerated On: ${new Date().toISOString()}\n\n`
);

// Middleware to validate API key(text)
function validateApiKey(req, res, next) {
  const requestKey = req.headers["x-api-key"];
  if (!requestKey) {
    return res.status(401).json({ error: "⛓️‍💥 API key missing" });
  }
  if (requestKey !== apiKey) {
    return res.status(403).json({ error: "⛓️‍💥 Invalid API key" });
  }
  next();
}

// Secure GET API endpoint (Text)
app.get("/secure-data", validateApiKey, (req, res) => {
  const query = "SELECT * FROM comments"; // Example: fetching comments from the database
  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching data:", err);
      return res.status(500).json({ error: "⛓️‍💥 Internal Server Error" });
    }
    res.json(results);
  });
});


// Image only

// Generate and log API key (IMage)
const apiKeyimg = crypto.randomBytes(16).toString("hex");
const apiLogFileimage = path.join(apilogdirimage, "api_keys.log");
fs.appendFileSync(
    apiLogFileimage,
  `API Key: ${apiKeyimg}\nGenerated On: ${new Date().toISOString()}\n\n`
);

// Middleware to validate API key(text)
function validateApiKey(req, res, next) {
  const requestKey = req.headers["x-api-key"];
  if (!requestKey) {
    return res.status(401).json({ error: "⛓️‍💥 API key missing" });
  }
  if (requestKey !== apiKeyimg) {
    return res.status(403).json({ error: "⛓️‍💥 Invalid API key" });
  }
  next();
}

// Secure GET API endpoint (Text)
app.get("/secure-data-image", validateApiKey, (req, res) => {
  const query = "SELECT * FROM 	images"; // Example: fetching comments from the database
  db.query(query, (err, results) => {
    if (err) {
      console.error("⛓️‍💥 Error fetching data:", err);
      return res.status(500).json({ error: " ⛓️‍💥 Internal Server Error" });
    }
    res.json(results);
  });
});






// Start the server
app.listen(3000, () => {
  console.log(`✅ Server listening at http://localhost:3000/`);
  console.log(`✅ API Key(Text): ${apiKey}`);
  console.log(`✅ API Key(Image): ${apiKeyimg}`);

});
