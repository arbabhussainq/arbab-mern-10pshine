const Note = require("../models/Note");
const logger = require("../config/logger");

const getNotes = async (req, res) => {
  try {
    const notes = await Note.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
    logger.info(`Fetched ${notes.length} notes for user: ${req.user.email}`);
    res.status(200).json(notes);
  } catch (error) {
    logger.error(`getNotes error: ${error.message}`);
    res.status(500).json({ message: error.message });
  }
};

const getNoteById = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      logger.warn(`Note not found: ${req.params.id}`);
      return res.status(404).json({ message: "Note not found" });
    }

    if (note.user.toString() !== req.user._id.toString()) {
      logger.warn(`Unauthorized note access by user: ${req.user.email}`);
      return res.status(401).json({ message: "Not authorized" });
    }

    res.status(200).json(note);
  } catch (error) {
    logger.error(`getNoteById error: ${error.message}`);
    res.status(500).json({ message: error.message });
  }
};

const createNote = async (req, res) => {
  try {
    const { title, content, color } = req.body || {};

    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    const note = await Note.create({
      title,
      content,
      color,
      user: req.user._id,
    });

    logger.info(`Note created by user: ${req.user.email}`);
    res.status(201).json(note);
  } catch (error) {
    logger.error(`createNote error: ${error.message}`);
    res.status(500).json({ message: error.message });
  }
};

const updateNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      logger.warn(`Note not found for update: ${req.params.id}`);
      return res.status(404).json({ message: "Note not found" });
    }

    if (note.user.toString() !== req.user._id.toString()) {
      logger.warn(`Unauthorized note update by user: ${req.user.email}`);
      return res.status(401).json({ message: "Not authorized" });
    }

    const updatedNote = await Note.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    logger.info(`Note updated by user: ${req.user.email}`);
    res.status(200).json(updatedNote);
  } catch (error) {
    logger.error(`updateNote error: ${error.message}`);
    res.status(500).json({ message: error.message });
  }
};

const deleteNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      logger.warn(`Note not found for deletion: ${req.params.id}`);
      return res.status(404).json({ message: "Note not found" });
    }

    if (note.user.toString() !== req.user._id.toString()) {
      logger.warn(`Unauthorized note deletion by user: ${req.user.email}`);
      return res.status(401).json({ message: "Not authorized" });
    }

    await Note.findByIdAndDelete(req.params.id);
    logger.info(`Note deleted by user: ${req.user.email}`);
    res.status(200).json({ message: "Note deleted successfully" });
  } catch (error) {
    logger.error(`deleteNote error: ${error.message}`);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getNotes, getNoteById, createNote, updateNote, deleteNote };
