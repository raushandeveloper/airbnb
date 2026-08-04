// Core Module
const path = require('path');
const fs = require('fs');

// External Module
const express = require('express');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const { default: mongoose } = require('mongoose');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// DB connection string comes from Vercel Environment Variable now
const DB_PATH = process.env.MONGO_URI;

//Local Module
const storeRouter = require("./routes/storeRouter")
const hostRouter = require("./routes/hostRouter")
const authRouter = require("./routes/authRouter")
const rootDir = require("./utils/pathUtil");
const errorsController = require("./controllers/errors");

const app = express();

// Configure Cloudinary using credentials from environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

app.set('view engine', 'ejs');
app.set('views', path.join(rootDir, 'views'));

const store = new MongoDBStore({
  uri: DB_PATH,
  collection: 'sessions'
});

// Don't crash the whole app if the session store has a connection error
store.on('error', (err) => {
  console.log('Session store error: ', err);
});

// Photos go into an "airbnb/photos" folder on Cloudinary, stored as images
const photoStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'airbnb/photos',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
  },
});

// PDFs go into an "airbnb/pdfs" folder, stored as raw files
const pdfStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'airbnb/pdfs',
    resource_type: 'raw',
    allowed_formats: ['pdf'],
  },
});

// multer needs one storage engine per call, so we use a small custom
// storage wrapper that picks photoStorage or pdfStorage per file field.
const multiStorage = {
  _handleFile(req, file, cb) {
    const storage = file.fieldname === 'pdf' ? pdfStorage : photoStorage;
    storage._handleFile(req, file, cb);
  },
  _removeFile(req, file, cb) {
    const storage = file.fieldname === 'pdf' ? pdfStorage : photoStorage;
    storage._removeFile(req, file, cb);
  },
};

const multerOptions = {
  storage: multiStorage,
}

app.use(express.urlencoded({ extended: true }));
app.use(multer(multerOptions).fields([
  { name: 'photo', maxCount: 1 },
  { name: 'pdf', maxCount: 1 }
]));
app.use(express.static(path.join(rootDir, 'public')))

app.use(session({
  secret: process.env.SESSION_SECRET || "my secret key",
  resave: false,
  saveUninitialized: true,
  store: store
}));

app.use((req, res, next) => {
  req.isLoggedIn = req.session.isLoggedIn;
  next();
});

app.use(storeRouter);
app.use(authRouter);
app.use("/host", (req, res, next) => {
  if (req.isLoggedIn) {
    next();
  } else {
    res.redirect("/login");
  }
});

app.use("/host", hostRouter);
app.use(errorsController.pageNotFound);

// Connect to Mongo once (cached across invocations to avoid reconnecting on every request)
let isConnected = false;
async function connectDB() {
  if (isConnected) return;
  await mongoose.connect(DB_PATH);
  isConnected = true;
  console.log('Connected to Mongo');
}
connectDB().catch(err => console.log('Error while connecting to Mongo: ', err));

// Only call app.listen when running locally.
// On Vercel, the platform itself invokes the exported app as a serverless function.
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`Server running on address http://localhost:${PORT}`);
  });
}

module.exports = app;