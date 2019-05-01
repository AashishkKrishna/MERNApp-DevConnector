const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");

// Load Models
const Post = require("../../models/Post");

// Load Validation
const validatePostInput = require("../../validation/post");

// @route   GET api/post/test
// @desc    Tests post routes
// @access  Public
router.get("/test", (req, res) => {
  res.json({ msg: "user works" });
});

// @route   POST api/post/test
// @desc    Tests post routes
// @access  Private
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validatePostInput(req.body);

    if (!isValid) {
      return res.status(400).json(errors);
    }

    const newPost = {
      text: req.body.text,
      name: req.body.name,
      avatar: req.body.avatar,
      user: req.user.id
    };

    newPost
      .save()
      .then(post => res.json(post))
      .catch(err => res.status(400).json(err));
  }
);

module.exports = router;
