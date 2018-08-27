const express = require("express"),
      router  = express.Router(),
      User = require("../models/user"),
      multer  = require("multer"),
      GridFsStorage = require("multer-gridfs-storage"),
      Grid = require("gridfs-stream"),
      path = require("path"),
      crypto = require("crypto"),
      mongoose = require("mongoose");
      

function getTimeStamp(){
    const months =  [
        "Jan", "Feb", "Mar", "Apr", "Maj", "Jun", "Jul", "Aug", "Sep",
        "Okt", "Nov", "Dec"
    ];
    let now = new Date();
    let amPm = (now.getHours() < 10)? "am" : "pm";
    let month = months[now.getMonth() - 1];
    let year = now.getFullYear();
    let day = now.getDate();
    let h = now.getHours();
    let min = (now.getMinutes() < 10)? "0" + now.getMinutes() : now.getMinutes(); 
    return day + " " + month + " " + year + " " + h + "h " + min + "min " + amPm;
}


const mongoURI = "mongodb://localhost:27017/twitter_cone______";

let gfs;
var conn = mongoose.createConnection(mongoURI);
conn.once('open', function () {
    gfs = Grid(conn.db, mongoose.mongo);
    gfs.collection("profileImageUpload");
});


function ensureAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }else{
        req.flash("error_msg", "You Must First Login");
        res.redirect(303, "/users/login");
    }
}

router.get("/", ensureAuthenticated, (req, res) => {
    res.render("index");
});

router.get("/image/:filename", (req, res) => {
    gfs.files.findOne({filename: req.params.filename}, (err, file) => {
        if(err) throw err;
        else{
            const readstream = gfs.createReadStream(file.filename);
            readstream.pipe(res);
        }
    });
});

router.get("/file/:id", (req, res) => {
    User.findOne({_id: req.params.id}, (err, file) => {
        if(err) throw err;
        else{
            res.json(file);
        }
    });
});

router.get("/user/:username", ensureAuthenticated, (req, res) => {
    User.findOne({username: req.params.username}, (err , user) => {
        if(err) throw err;
        else{
           let userArrAndImage = {
               arr: user.tweetsArr,
               image: user.profilePrictureFilename
           };
           console.log(userArrAndImage);
           res.render("index", {user:user, userArrAndImage: userArrAndImage});
        }
    });
});

router.post("/user/postTweet/:id", ensureAuthenticated,(req, res) => {
    User.findById(req.params.id, (err, user) => {
        if(err) throw err;
        else{
            let cloneTweet = {
                time: getTimeStamp(),
                text: req.body.textArea
            };

            user.tweetsArr.push(cloneTweet);
            user.save();
            res.redirect(303, "/");
        }
    });
});

function findIdx(cloneTweetsArr, cloneTweet){
    let i = 0, idx = 0;
    for(i = 0; i < cloneTweetsArr.length; i++){
        if(JSON.stringify(cloneTweetsArr[i]) === cloneTweet){
            idx = i;
            break;
        }
    }
        return idx;
}

router.delete("/user/removeTweet/:id", ensureAuthenticated,(req, res) => {
    User.findById(req.params.id, (err, user) => {
        if(err) throw err;
        else{
            let cloneTweet = {
                time: req.body.hiddenTime,
                text: req.body.hiddenText
            };
            let idx = 0;
            
            idx = (findIdx(user.tweetsArr, JSON.stringify(cloneTweet)));

            user.tweetsArr.splice(idx, 1);
            user.save();
            res.redirect(303, "/");
        }
    });
}); 



module.exports = router;