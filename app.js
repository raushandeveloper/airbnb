// Core Module
const path = require('path');
const fs = require('fs');

// External Module
const express = require('express');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const { default: mongoose } = require('mongoose');
const multer = require('multer');
const DB_PATH =  "mongodb+srv://root:Raushan70@completecoding.djxle2f.mongodb.net/airbnb?appName=CompleteCoding";
  

//Local Module
const storeRouter = require("./routes/storeRouter")
const hostRouter = require("./routes/hostRouter")
const authRouter = require("./routes/authRouter")
const rootDir = require("./utils/pathUtil");
const errorsController = require("./controllers/errors");

const app = express();
const uploadDir = path.join(rootDir, 'uploads');
fs.mkdirSync(uploadDir, { recursive: true });

app.set('view engine', 'ejs');
app.set('views', 'views');

const store = new MongoDBStore({
  uri: DB_PATH,
  collection: 'sessions'
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
  secret: "my secret key",
  resave: false,
  saveUninitialized: true,
  store: store
}));

app.use((req,res,next)=>{
  req.isLoggedIn = req.session.isLoggedIn;
  next();
});

app.use(storeRouter);
app.use(authRouter);
app.use("/host",(req,res,next)=>{
  if(req.isLoggedIn){
    next();
  }else{
    res.redirect("/login");
  }
});

app.use("/host", hostRouter);
app.use(errorsController.pageNotFound);

const PORT = 3001;


mongoose.connect(DB_PATH).then(() => {
  console.log('Connected to Mongo');
  app.listen(PORT, () => {
    console.log(`Server running on address http://localhost:${PORT}`);
  });
}).catch(err => {
  console.log('Error while connecting to Mongo: ', err);
});