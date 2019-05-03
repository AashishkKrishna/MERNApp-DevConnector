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

// @route   POST api/post/like/:id
// @desc    Like the post
// @access  Private
router.post(
  "/like/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id }).then(profile => {
      Post.findById(req.params.id)
        .then(post => {
          if (
            post.likes.filter(like => like.user.toString() === req.user.id)
              .length > 0
          ) {
            return res
              .status(400)
              .json({ alreadyliked: "User already liked the post" });
          }
          post.likes.unshift({ user: req.user.id });

          post
            .save()
            .then(post => res.json(post))
            .catch(err => res.status(400).json(err));
        })
        .catch(err => res.status(400).json(err));
    });
  }
);

// @route   POST api/post/like/:id
// @desc    UnLike the post
// @access  Private
router.post(
  "/unlike/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id }).then(profile => {
      Post.findById(req.params.id)
        .then(post => {
          if (
            post.likes.filter(like => like.user.toString() === req.user.id)
              .length === 0
          ) {
            return res
              .status(400)
              .json({ alreadyliked: "User already unliked the post" });
          }

          // Get remove index
          const removeindex = post.likes
            .map(item => item.user.toString())
            .indexOf(req.user.id);

          // Splice out that array
          post.likes.splice(removeindex, 1);

          post
            .save()
            .then(post => res.json(post))
            .catch(err => res.status(400).json(err));
        })
        .catch(err => res.status(400).json(err));
    });
  }
);

// @route   POST api/post/comment/:id
// @desc    Comment the post
// @access  Private
router.post(
  "/comment/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id }).then(profile => {
      Post.findById(req.params.id)
        .then(post => {
          const comment = {
            text: req.body.text,
            name: req.body.name,
            avatar: req.body.avatar,
            user: req.user.id
          };

          post.comments.unshift(comment);

          post
            .save()
            .then(post => res.json(post))
            .catch(err => res.status(400).json(err));
        })
        .catch(err => res.status(400).json(err));
    });
  }
);

// @route   Delete api/post/comment/:id
// @desc    Delete the comment on the post
// @access  Private
router.delete(
  "/comment/:id/:comment_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id }).then(profile => {
      Post.findById(req.params.id)
        .then(post => {
          if (
            post.comments.filter(item => item.id === req.params.comment_id)
              .length === 0
          ) {
            return res
              .status(400)
              .json({ commentnotexists: "Comment does not exists" });
          }

          const removeindex = post.comments
            .map(item => item._id.toString())
            .indexOf(req.params.comment_id);

          post.comments.splice(removeindex, 1);

          post
            .save()
            .then(post => res.json(post))
            .catch(err => res.status(400).json(err));
        })
        .catch(err => res.status(400).json(err));
    });
  }
);

module.exports = router;
