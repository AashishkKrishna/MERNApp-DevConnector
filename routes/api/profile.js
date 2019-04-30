const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");

//Load Validation
const validateProfileInput = require("../../validation/profile");

// Load profile model
const Profile = require("../../models/Profile");
const User = require("../../models/User");

// @route   GET api/profile/test
// @desc    Tests profile routes
// @access  Public
router.get("/test", (req, res) => {
  res.json({ msg: "profile works" });
});

// @route   GET api/profile
// @desc    Get current user profile
// @access  Private
router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const errors = {};

    Profile.findOne({ user: req.user.id })
      // To populate connected fields
      .populate("user", ["name", "avatar"])
      .then(profile => {
        if (!profile) {
          errors.noprofile = "There is no profile for this user";
          return res.status(404).json(errors);
        }
        return res.json(profile);
      })
      .catch(err => console.log(err));
  }
);

// @route   POST api/profile
// @desc    Create or update current user profile
// @access  Private
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    //Check Validations
    const { errors, isValid } = validateProfileInput(req.body);
    if (!isValid) {
      //Return errors with status 400
      res.status(400).json(errors);
    }

    //Get fields
    const profilefields = {};
    profilefields.user = req.user.id;
    if (req.body.handle) profilefields.handle = req.body.handle;
    if (req.body.company) profilefields.company = req.body.company;
    if (req.body.website) profilefields.website = req.body.website;
    if (req.body.location) profilefields.location = req.body.location;
    if (req.body.bio) profilefields.bio = req.body.bio;
    if (req.body.status) profilefields.status = req.body.status;
    if (req.body.githubusername)
      profilefields.githubusername = req.body.githubusername;

    // Skills split into array
    if (typeof req.body.skills !== "undefined")
      profilefields.skills = req.body.skills.split(",");

    //Social
    profilefields.social = {};
    if (req.body.youtube) profilefields.social.youtube = req.body.youtube;
    if (req.body.twitter) profilefields.social.twitter = req.body.twitter;
    if (req.body.facebook) profilefields.social.facebook = req.body.facebook;
    if (req.body.linkedin) profilefields.social.linkedin = req.body.linkedin;
    if (req.body.instagram) profilefields.social.instagram = req.body.instagram;

    //Find user, if exists than update else create
    Profile.findOne({ user: req.user.id }).then(profile => {
      if (profile) {
        //Update
        Profile.findOneAndUpdate(
          {
            user: req.user.id
          },
          { $set: profilefields },
          { new: true }
        ).then(profile => res.json(profile));
      } else {
        //Create

        //Check if handle exists
        Profile.findOne({ handle: profilefields.handle }).then(profile => {
          if (profile) {
            errors.handle = "That handle already exists";
            res.status(400).json(errors);
          }

          //Save Profile
          new Profile(profilefields).save().then(profile => res.json(profile));
        });
      }
    });
  }
);

module.exports = router;
