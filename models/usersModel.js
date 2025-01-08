const mongoose = require("mongoose");

const usersSchema = require("../schema/usersSchema");

const User = mongoose.model("User", usersSchema);

module.exports = User;
