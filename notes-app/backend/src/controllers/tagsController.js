const Tag = require("../models/Tag");
const logger = require("../config/logger");

const getTags = async (req, res) => {
  try {
    const tags = await Tag.find({ user: req.user._id }).sort({ createdAt: 1 });
    logger.info(`Fetched ${tags.length} tags for user: ${req.user.email}`);
    res.status(200).json(tags);
  } catch (error) {
    logger.error(`getTags error: ${error.message}`);
    res.status(500).json({ message: error.message });
  }
};

const createTag = async (req, res) => {
  try {
    const { name, color } = req.body || {};
    if (!name) {
      return res.status(400).json({ message: "Tag name is required" });
    }

    const existingTag = await Tag.findOne({ name, user: req.user._id });
    if (existingTag) {
      return res.status(400).json({ message: "Tag already exists" });
    }

    const tag = await Tag.create({ name, color, user: req.user._id });
    logger.info(`Tag created by user: ${req.user.email}`);
    res.status(201).json(tag);
  } catch (error) {
    logger.error(`createTag error: ${error.message}`);
    res.status(500).json({ message: error.message });
  }
};

const deleteTag = async (req, res) => {
  try {
    const tag = await Tag.findById(req.params.id);
    if (!tag) {
      return res.status(404).json({ message: "Tag not found" });
    }
    if (tag.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Not authorized" });
    }
    await Tag.findByIdAndDelete(req.params.id);
    logger.info(`Tag deleted by user: ${req.user.email}`);
    res.status(200).json({ message: "Tag deleted successfully" });
  } catch (error) {
    logger.error(`deleteTag error: ${error.message}`);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getTags, createTag, deleteTag };
