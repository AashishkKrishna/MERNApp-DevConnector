const express = require("express");
const router = express.Router();
const gravatar = require("gravatar");
const bcrypt = require("bcryptjs");

//Load User Model
const User = require("../../models/User");

// @route   : Get api/users/test
// @desc    : Tests users route
// @access  : Public
router.get("/test", (req, res) => {
  res.json({ msg: "user works" });
});

// @route   : Post api/users/register
// @desc    : Register a user
// @access  : Public
router.post("/register", (req, res) => {
  User.findOne({ email: req.body.email }).then(user => {
    if (user) {
      return res.status(400).json({ email: "Email already exists" });
    } else {
      const avatar = gravatar.url(req.body.email, {
        s: 100, // size
        r: "pg", // Rating
        d: "mm" // Default
      });

      const newuser = new User({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        avatar: avatar
      });

      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newuser.password, salt, (err, hash) => {
          if (err) throw err;
          else {
            newuser.password = hash;
            newuser
              .save()
              .then(user => res.json(user))
              .catch(err => console.log(err));
          }
        });
      });
    }
  });
});

// @route   : Post api/users/login
// @desc    : login a user
// @access  : Public
router.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  User.findOne({ email }).then(user => {
    if (user) {
      //Check password
      bcrypt.compare(password, user.password).then(isMatch => {
        if (isMatch) {
          res.status(200).json({ msg: "Success" });
        } else {
          res.status(400).json({ msg: "Incorrect password" });
        }
      });
    } else {
      res.status(200).json({ msg: "User Not found" });
    }
  });
});

module.exports = router;
