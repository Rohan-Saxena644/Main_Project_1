const express = require("express");
const router = express.Router();

//index route show users
router.get("/",(req,res)=>{
    res.send("Get for users");
});

// Show users route
router.get("/:id",(req,res)=>{
    res.send("Get for show users");
});

// Post route
router.post("/",(req,res)=>{
    res.send("Post for users");
});

// Delete route
router.delete("/:id",(req,res)=>{
    res.send("Delete for users id");
});

module.exports = router;