const mongoose = require("mongoose");
const noteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    content: {
      type: String,
      default: "",
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    pinned: {
      type: Boolean,
      default: false,
    },
    favourited: {
      type: Boolean,
      default: false,
    },
    deleted: {
      type: Boolean,
      default: false,
    },
    tags: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tag",
      },
    ],
  },
  { timestamps: true },
);
module.exports = mongoose.model("Note", noteSchema);
