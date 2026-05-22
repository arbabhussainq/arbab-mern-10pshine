const mongoose = require("mongoose");

const tagSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Tag name is required"],
      trim: true,
    },
    color: {
      type: String,
      default: "#6b7280",
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Tag", tagSchema);
