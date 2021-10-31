const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const editorSchema = new Schema(
  {
    name: {
      type: String,
      maxlength: [50, "Editor's Name Must Contain Less Than 50 Characters"],
      required: [true, "Editor's Name Is Required"],
    },
    description: {
      type: String,
      default: "No Description About Editor",
      maxlength: [
        500,
        "Editor's Description Must Contain Less Than 500 Characters",
      ],
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Editor's Owner Is Required"],
    },
    ratingCount: {
      type: Number,
      default: 0,
    },
    ratingValue: {
      type: Number,
      default: 0,
    },
    editorHTML: {
      type: String,
      default: "",
    },
    editorCSS: {
      type: String,
      default: "",
    },
    editorJavascript: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const Editors = mongoose.model("Editor", editorSchema);

module.exports = Editors;
