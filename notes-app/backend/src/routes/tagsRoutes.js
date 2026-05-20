const express = require("express");
const router = express.Router();
const {
  getTags,
  createTag,
  deleteTag,
} = require("../controllers/tagsController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);
router.route("/").get(getTags).post(createTag);
router.route("/:id").delete(deleteTag);

module.exports = router;
