const express = require("express"),
      router  = express.Router(),
      multer  = require("multer"),
      GridFsStorage = require("multer-gridfs-storage"),
      Grid = require("gridfs-stream"),
      path = require("path"),
      crypto = require("crypto"),
      mongoose = require("mongoose"),
      User = require("../models/user"),
      passport = require("passport"),
      passportHTTP = require("passport-http"),
      LocalStrategy = require("passport-local");


const mongoURI = "mongodb://localhost:27017/twitter_cone______";

let gfs;
var conn = mongoose.createConnection(mongoURI);
conn.once('open', function () {
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection("profileImageUpload");
});


const storage = new GridFsStorage({
url: mongoURI,
file: (req, file) => {
    return new Promise((resolve, reject) => {
    crypto.randomBytes(16, (err, buf) => {
        if (err) {
        return reject(err);
        }
        const filename = buf.toString('hex') + path.extname(file.originalname);
        const fileInfo = {
        filename: filename,
        bucketName: 'profileImageUpload'
        };
        resolve(fileInfo);
    });
    });
}
});
const upload = multer({ storage });

router.get("/register", (req, res) => {
    res.render("register");
});

router.post("/register", upload.single("profileImage"), (req, res) => {
    
    let name = req.body.name,
        username = req.body.username,
        email = req.body.email,
        password = req.body.password,
        password2 = req.body.password2;
                

    req.checkBody("name", "The Name Field is Mandatory!!!").notEmpty();
    req.checkBody("username", "The Username Field is Mandatory!!!").notEmpty();
    req.checkBody("email", "The Email Field is Mandatory!!!").notEmpty();
    req.checkBody("password", "The Password Field is Mandatory!!!").notEmpty();
    req.checkBody("email", "Please Enter a Valid Email Address").isEmail();
    req.checkBody("password2", "Passwords Have to Match!!!").equals(password);

    let errors = req.validationErrors();
    
    if(errors){
        res.render("register", {errors: errors});
    }else{
        User.findOne({username: {"$regex": "^" + username + "\\b", "$options": "i"}},
        (err, user) => {
            User.findOne({email: {"$regex": "^" + email + "\\b", "$options": "i"}},
        (err, mail) => {
            if(user || mail){
                res.render("register", {
                    user: user,
                    mail: mail
                });
            }else{
                
                let filename = "";
                if(req.file){
                    filename = req.file.filename;
                }
                 
                let newUser = new User({
                    name: name,
                    username: username,
                    email: email,
                    password: password,
                    profilePrictureFilename: filename
                });

                User.createUser(newUser, (err, user) => {
                    if(err) throw err;
                    else console.log(user);
                });
                
                req.flash("success_msg", "You Are Now Registred And Can Login :D");
                res.redirect(303, "/users/login");
            }
        });
        });
    }

});

router.get("/login", (req, res) => {
    res.render("login");
});

passport.use(new LocalStrategy(
    function(username, password, done) {
      User.findOne({ username: username }, function(err, user) {
        if (err) { return done(err); }
        if (!user) {
          return done(null, false, { message: 'Incorrect username.' });
        }
      User.comparePasswords(password, user.password, (err, isMatch) => {
          if(err) throw err;
          else{
              if(isMatch){
                  return done(null, user);
              }else{
                  return done(null, false, { message: 'Incorrect password.' });
              }
          }
      });
      });
    }
));

passport.serializeUser(function(user, done) {
    done(null, user.id);
  });
  
  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
});

router.post('/login', function(req, res, next) {
    passport.authenticate('local', function(err, user, info) {
      if (err) { return next(err); }
      if (!user) { return res.redirect('/users/login'); }
      req.logIn(user, function(err) {
        if (err) { return next(err); }
        return res.redirect('/user/' + user.username);
      });
    })(req, res, next);
});

router.get("/logout", (req, res) => {
    req.logOut();
    req.flash("info_msg", "You Have Successfully Logged Out");
    res.redirect(303, "/users/login");
});  

module.exports = router;