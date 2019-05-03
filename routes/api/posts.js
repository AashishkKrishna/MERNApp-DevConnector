const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");

// Load Models
const Post = require("../../models/Post");
const Profile = require("../../models/Profile");

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

    new Post(newPost)
      .save()
      .then(post => res.json(post))
      .catch(err => res.status(400).json(err));
  }
);

// @route   GET api/post
// @desc    Get all posts
// @access  Public
router.get("/", (req, res) => {
  Post.find()
    .sort({ date: -1 })
    .then(posts => res.json(posts))
    .catch(err => res.status(400).json(err));
});

// @route   GET api/post/:id
// @desc    Get post by Id
// @access  Public
router.get("/:id", (req, res) => {
  Post.findById(req.params.id)
    .then(posts => res.json(posts))
    .catch(err => res.status(400).json(err));
});

// @route   Delete api/post/:id
// @desc    Delete the post
// @access  Private
router.delete(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.params.id }).then(profile => {
      Post.findById(req.params.id)
        .then(post => {
          // Check for post owner
          if (post.user.toString() !== req.user.id) {
            //Unauthorized
            return res.status(401).json({ message: "user not authorized" });
          }

          //Delete the post
          post.remove().then(() => res.json({ success: true }));
        })
        .catch(err => res.status(400).json(err));
    });
  }
);

module.exports = router;
