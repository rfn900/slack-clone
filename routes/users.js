const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const passport = require("passport");

const { uploadPath, upload } = require("../utils/upload");
const User = require("../models/users");

/* Adding GET method to homepage */
router.get("/login", (req, res) => {
  if (req.isAuthenticated()) {
    res.redirect("/");
  } else {
    res.render("login");
  }
});

router.post("/login", (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/users/login",
    failureFlash: true,
  })(req, res, next);
});

router.get("/logout", (req, res, next) => {
  req.logout();
  req.flash("success_msg", "You are logged out");
  res.redirect("/users/login");
});

router.get("/signup", (req, res) => {
  if (req.isAuthenticated()) {
    res.redirect("/");
  }
  res.render("signup");
});

router.post("/signup", (req, res) => {
  // console.log(req.body);
  const { name, email, password, passwordConfirm } = req.body;

  // Let's do some validation:
  const errors = [];
  if (!name || !email || !password || !passwordConfirm) {
    errors.push({ msg: "All fields are required!" });
  }

  if (password !== passwordConfirm) {
    errors.push({ msg: "Passwords do not match" });
  }

  if (password.length < 6) {
    errors.push({ msg: "Passwords must be at least 6 characters long" });
  }

  if (errors.length > 0) {
    res.render("signup", {
      errors,
      name,
      email,
      password,
      passwordConfirm,
    });
  } else {
    User.findOne({ email: email }).then((user) => {
      if (user) {
        errors.push({ msg: "Email already registered" });
        res.render("signup", {
          errors,
          name,
          email,
          password,
          passwordConfirm,
        });
      } else {
        const newUser = new User({
          name,
          email,
          password,
        });
        bcrypt.genSalt(10, (err, salt) =>
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            // Set password to hash now
            newUser.password = hash;
            // Save user
            newUser
              .save()
              .then((user) => {
                req.flash(
                  "success_msg",
                  "You are now registered and can log in"
                );
                res.redirect("/users/login");
              })
              .catch((err) => console.log(err));
          })
        );
      }
    });
  }
});

router.post(
  "/upload-profile-pic",
  upload.single("profile_pic"),
  async (req, res) => {
    try {
      const profile_pic = uploadPath + req.file.filename;
      console.log(req.file);
      if (req.file.size > 0) {
        console.log(`File uploaded to ${profile_pic}`);

        const userId = req.session.passport.user;
        user = await User.findOne({ _id: userId });
        user.profileImage = `uploads/${req.file.filename}`;
        await user.save();
        res.redirect("/profile");
      }
    } catch (error) {
      console.log(error);
    }
  }
);

router.post("/edit", async (req, res) => {
  try {
    const userId = req.session.passport.user;
    const user = await User.findOne({ _id: userId });

    if (typeof req.body.name != "undefined") user.name = req.body.name;
    if (typeof req.body.email != "undefined") user.email = req.body.email;

    await user.save();
    req.flash("success_msg", "Detail successfully updated");
  } catch (error) {
    req.flash("error_msg", "Unable to update user");
    console.log(error);
  }
  res.redirect("/profile");
});

module.exports = router;
