
require('dotenv').config();

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
const MongoStore = require("connect-mongo");
const cors = require("cors");

const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");
const { sessionTimeout } = require("./middleware.js"); 


// =======================
// DATABASE CONNECTION
// =======================

const dburl = process.env.ATLASDB_URL;

async function main() {
  await mongoose.connect(dburl);
}

main()
  .then(() => console.log("Connected to DB"))
  .catch(err => console.log(err));


// =======================
// MIDDLEWARE SETUP
// =======================

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set("trust proxy", 1);

app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = [
      "http://localhost:5173",
      "https://main-project-1-sandy.vercel.app",
      /\.vercel\.app$/
    ];

    if (!origin) return callback(null, true);

    const isAllowed = allowedOrigins.some((allowed) => {
      if (allowed instanceof RegExp) {
        return allowed.test(origin);
      }
      return allowed === origin;
    });

    if (isAllowed) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  },
  credentials: true
}));


// =======================
// SESSION STORE
// =======================

const store = MongoStore.create({
  mongoUrl: dburl,
});

store.on("error", (err) => {
  console.log("Mongo session store error", err);
});

const sessionOptions = {
  store,
  secret: process.env.SECRET || "devsecret",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: "none", 
    secure: true,
    maxAge:  24 * 60 * 60 * 1000 // 24 hours
  },
  rolling: true, // Resets maxAge on each request
  unset: 'destroy'
};

app.use(session(sessionOptions));



// =======================
// PASSPORT
// =======================

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use(sessionTimeout);

// =======================
// HEALTH CHECK
// =======================

app.get("/api/health", (req, res) => {
  res.status(200).json({ 
    status: "ok", 
    timestamp: Date.now(),
    message: "Server is awake"
  });
});


// =======================
// API ROUTES (MERN)
// =======================

app.use("/api/listings", listingRouter);
app.use("/api/listings/:id/reviews", reviewRouter);
app.use("/api", userRouter);


// =======================
// ERROR HANDLING
// =======================

app.all("*",(req,res,next)=>{
  next(new ExpressError(404,"Route not found"));
});

app.use((err,req,res,next)=>{
  const status = err.statusCode || 500;
  const message = err.message || "Something went wrong";
  res.status(status).json({ error: message });
});


// =======================
// SERVER START
// =======================

app.listen(8080, ()=>{
  console.log("Server listening on port 8080");
});
