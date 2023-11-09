const express = require("express");
const { test, searchByHashtag, getMyPosts, renderMain } = require("../controllers");

const router = express.Router();

// POST /test
router.get("/test", test);

// GET /myposts
router.get("/myposts", getMyPosts);

// GET /search/:hashtag
router.get("/search/:hashtag", searchByHashtag);

// GET /
router.get("/", renderMain);

module.exports = router;