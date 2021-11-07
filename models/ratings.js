const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ratingSchema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User Id Is Required For Rating"],
    },
    editorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Editor",
      required: [true, "Editor Id Is Required For Rating"],
    },
    ratingValue: {
      type: Number,
      max: 5,
      required: [true, "Rating Value Is Required For Rating"],
    },
  },
  {
    timestamps: true,
  }
);

ratingSchema.index({ userId: 1, editorId: 1 }, { unique: true });

const Ratings = mongoose.model("Rating", ratingSchema);

module.exports = Ratings;
