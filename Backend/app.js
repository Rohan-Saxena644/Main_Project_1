//     require('dotenv').config();


// const express = require("express");
// const app = express();
// const mongoose = require("mongoose");
// const path = require("path");
// const methodOverride = require("method-override");
// const ejsMate = require("ejs-mate");
// const ExpressError = require("./utils/ExpressError.js");
// const session = require("express-session");
// const flash = require("connect-flash");
// const passport = require("passport");
// const LocalStrategy = require("passport-local");
// const User = require("./models/user.js");
// const MongoStore = require('connect-mongo');


// const listingRouter = require("./routes/listing.js");
// const reviewRouter = require("./routes/review.js");
// const userRouter = require("./routes/user.js");

// const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust" ;
// // const dburl = process.env.ATLASDB_URL; // CHANGING THE UI TO REACT

// main()
//     .then(()=>{
//         console.log("Connected to db") ;
//     }).catch((err)=>{
//         console.log(err) ;
//     }) ;

// async function main(){
//     // await mongoose.connect(dburl) ;
//     await mongoose.connect(MONGO_URL) ;
// }

// app.set("view engine","ejs") ;
// app.set("views", path.join(__dirname,"views")) ;
// app.use(express.urlencoded({extended: true})) ;
// app.use(express.json()); // NEW THING ADDED WHILE IMPLEMENTING REACT
// app.use(methodOverride("_method"));
// app.engine('ejs',ejsMate);
// app.use(express.static(path.join(__dirname,"public")));


// // const store = MongoStore.create({ 
// //     mongoUrl: dburl, 
// //     // crypto: {
// //     //     secret: "mysupersecretcode"
// //     // },
// //     // touchAfter: 24*3600,
// // });

// // store.on("error",(err)=>{
// //     console.log("Error in MONGO SESSION STORE",err);
// // });


// const sessionOptions = {
//     // store,
//     secret: process.env.SECRET,
//     resave: false,
//     saveUninitialized: false,
//     cookie: {
//         expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
//         maxAge: 7 * 24 * 60 * 60 * 1000,
//         httpOnly: true, 
//     },
// };

// app.use(session(sessionOptions));
// app.use(flash());

// app.use(passport.initialize());
// app.use(passport.session());

// // use static authenticate method of model in LocalStrategy
// passport.use(new LocalStrategy(User.authenticate()));

// // use static serialize and deserialize of model for passport session support
// passport.serializeUser(User.serializeUser());
// passport.deserializeUser(User.deserializeUser());


// // app.get("/",(req,res)=>{
// //     res.send("Hello,I am root") ;
// // })


// app.use((req,res,next)=>{
//     res.locals.success = req.flash("success")||[];
//     res.locals.error = req.flash("error")||[];
//     res.locals.currUser = req.user||null;
//     // console.log(res.locals.success); this will give empty array hence in flash ejs just if(success) is not enough and we use if(success && success.length)
//     next();
// });


// // app.get("/demouser" , async (req,res)=>{
// //     let fakeUser = new User({
// //         email: "student@gmail.com" , 
// //         username: "delta-student",
// //     });

// //     let registeredUser = await User.register(fakeUser,"helloWorld");
// //     res.send(registeredUser);
// // })


// // // listings router used
// // app.use("/listings", listingRouter);

// // // Reviews router used
// // app.use("/listings/:id/reviews", reviewRouter);

// // // User router
// // app.use("/" , userRouter);

// app.use("/api/listings", listingRouter);
// app.use("/api/listings/:id/reviews", reviewRouter);
// app.use("/api", userRouter);



// app.all("*",(req,res,next)=>{
//     next(new ExpressError(404,"Page not found"));
// })


// //Error handling middleware
// app.use((err,req,res,next)=>{
//     let {statusCode=500,message="Something went wrong!"} = err;
//     res.status(statusCode).render("error.ejs",{message});
// });


// app.listen(8080,()=>{
//     console.log("server is listening to port 8080") ;
// });





require('dotenv').config();

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
// const methodOverride = require("method-override");
// const ejsMate = require("ejs-mate");
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


// =======================
// DATABASE CONNECTION
// =======================

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
// const dburl = process.env.ATLASDB_URL;   // MEN / Production

async function main() {
  await mongoose.connect(MONGO_URL);
  // await mongoose.connect(dburl);
}

main()
  .then(() => console.log("Connected to DB"))
  .catch(err => console.log(err));


// =======================
// MIDDLEWARE SETUP
// =======================

// React will send JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MEN only (EJS forms & PUT override)
// app.use(methodOverride("_method"));

// Enable CORS for React
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));


// =======================
// SESSION STORE
// =======================

const store = MongoStore.create({
  mongoUrl: MONGO_URL,
  // mongoUrl: dburl,
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
    maxAge: 7 * 24 * 60 * 60 * 1000
  }
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


// =======================
// MEN STACK VIEW ENGINE (COMMENTED)
// =======================

// app.set("view engine","ejs");
// app.set("views", path.join(__dirname,"views"));
// app.engine("ejs", ejsMate);
// app.use(express.static(path.join(__dirname,"public")));

// Flash + res.locals were only for EJS
// const flash = require("connect-flash");
// app.use(flash());
// app.use((req,res,next)=>{
//   res.locals.success = req.flash("success") || [];
//   res.locals.error = req.flash("error") || [];
//   res.locals.currUser = req.user || null;
//   next();
// });


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

// MERN Error Handler → JSON
app.use((err,req,res,next)=>{
  const status = err.statusCode || 500;
  const message = err.message || "Something went wrong";

  // MEN fallback
  // res.status(status).render("error.ejs",{message});

  // MERN response
  res.status(status).json({ error: message });
});


// =======================
// SERVER START
// =======================

app.listen(8080, ()=>{
  console.log("Server listening on port 8080");
});


