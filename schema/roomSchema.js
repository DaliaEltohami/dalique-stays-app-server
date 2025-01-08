const mongoose = require("mongoose");
// const Booking = require("../models/bookingModel");

const roomSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    maxcount: {
      type: Number,
      required: true,
    },
    rentperday: {
      type: Number,
      required: true,
    },
    phonenumber: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    imageurls: [],
    currentbookings: [{ type: mongoose.Schema.Types.ObjectId, ref: "Booking" }],
  },
  {
    timestamps: true,
  }
);

module.exports = roomSchema;
