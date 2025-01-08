const mongoose = require("mongoose");
const bookingSchema = require("../schema/bookingSchema");

const Booking = mongoose.model("Booking", bookingSchema);

module.exports = Booking;
