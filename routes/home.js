const express = require("express");
const router = express.Router();

var library     = require('@fortawesome/fontawesome-svg-core').library;
var dom         = require('@fortawesome/fontawesome-svg-core').dom;
var icon        = require('@fortawesome/fontawesome-svg-core').icon;
var fas         = require('@fortawesome/free-solid-svg-icons').fas;
var far         = require('@fortawesome/free-regular-svg-icons').far

library.add(fas)
library.add(far)

const homeIcon = icon({ prefix: 'fas', iconName: "home" }).html
const searchIcon = icon({ prefix: 'fas', iconName: "search" }).html
const arrowDown = icon({ prefix: 'fas', iconName: "chevron-down" }).html
const atIcon = icon({ prefix: 'fas', iconName: "at" }).html
const ellipsisVIcon = icon({ prefix: 'fas', iconName: "ellipsis-v" }).html
const caretRightIcon = icon({ prefix: 'fas', iconName: "caret-right" }).html
const questionIcon = icon({ prefix: 'far', iconName: "question-circle" }).html
const clockIcon = icon({ prefix: 'far', iconName: "clock" }).html
const editIcon = icon({ prefix: 'far', iconName: "edit" }).html
const commentIcon = icon({ prefix: 'far', iconName: "comment-dots" }).html
const chatIcon = icon({ prefix: 'far', iconName: "comments" }).html
const bookmarkIcon = icon({ prefix: 'far', iconName: "bookmark" }).html

/* Adding GET method to homepage */

router.get("/", (req, res, next) => {
  res.render("home", { title: "Welcome to Slack (the Clone)", 
    homeIcon: homeIcon, 
    questionIcon: questionIcon,
    clockIcon: clockIcon,
    searchIcon: searchIcon,
    arrowDown: arrowDown,
    editIcon: editIcon,
    commentIcon: commentIcon,
    chatIcon: chatIcon,
    atIcon: atIcon,
    bookmarkIcon: bookmarkIcon,
    ellipsisVIcon: ellipsisVIcon,
    caretRightIcon: caretRightIcon,
  });
});

module.exports = router;
