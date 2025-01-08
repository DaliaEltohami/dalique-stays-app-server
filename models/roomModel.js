const mongoose = require("mongoose");
const roomSchema = require("../schema/roomSchema");
const Booking = require("../models/bookingModel");

const Room = mongoose.model("Room", roomSchema);

module.exports = Room;
