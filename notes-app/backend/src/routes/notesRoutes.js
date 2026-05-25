const express = require("express");
const router = express.Router();
const {
  getNotes,
  getNoteById,
  createNote,
  updateNote,
  deleteNote,
  getTrashNotes,
  emptyTrash,
  importNotes,
} = require("../controllers/notesController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);
router.route("/").get(getNotes).post(createNote);
router.get("/trash", getTrashNotes);
router.delete("/trash/empty", emptyTrash);
router.post("/import", importNotes);
router.route("/:id").get(getNoteById).put(updateNote).delete(deleteNote);

module.exports = router;
