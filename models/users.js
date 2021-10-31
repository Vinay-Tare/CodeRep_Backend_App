const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new Schema({
  fullName: {
    type: String,
    maxlength: [20, "User's Full Name Must Contain Less Than 20 Characters"],
    required: true,
  },
  email: {
    type: String,
    lowercase: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      "User's Email Should Be Valid",
    ],
    required: [true, "User's Email Is Required"],
  },
  description: {
    type: String,
    default: "No Description About User",
    maxlength: [
        500,
        "User's Description Must Contain Less Than 500 Characters",
      ],
  },
  ownsEditors: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Editor" }],
    default: [],
  },
});

userSchema.plugin(passportLocalMongoose);

const Users = mongoose.model("User", userSchema);

module.exports = Users;
