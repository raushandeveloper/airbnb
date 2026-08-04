// Core Module
const path = require('path');
const fs = require('fs');

// External Module
const express = require('express');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const { default: mongoose } = require('mongoose');
const multer = require('multer');

// DB connection string comes from Vercel Environment Variable now
const DB_PATH = process.env.MONGO_URI;

//Local Module
const storeRouter = require("./routes/storeRouter")
const hostRouter = require("./routes/hostRouter")
const authRouter = require("./routes/authRouter")
const rootDir = require("./utils/pathUtil");
const errorsController = require("./controllers/errors");

const app = express();

// Vercel's filesystem is read-only except /tmp.
// On Vercel use /tmp/uploads, locally use the normal project uploads folder.
const uploadDir = process.env.VERCEL
  ? '/tmp/uploads'
  : path.join(rootDir, 'uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

app.set('view engine', 'ejs');
app.set('views', 'views');

const store = new MongoDBStore({
  uri: DB_PATH,
  collection: 'sessions'
});

// Don't crash the whole app if the session store has a connection error
store.on('error', (err) => {
  console.log('Session store error: ', err);
});

const randomString = (length) => {
  const characters = 'abcdefghijklmnopqrstuvwxyz';
  let result = '';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, randomString(10) + path.extname(file.originalname));
  }
});

const multerOptions = {
  storage: storage,
}

app.use(express.urlencoded({ extended: true }));
app.use(multer(multerOptions).fields([
  { name: 'photo', maxCount: 1 },
  { name: 'pdf', maxCount: 1 }
]));
app.use('/uploads', express.static(uploadDir));
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