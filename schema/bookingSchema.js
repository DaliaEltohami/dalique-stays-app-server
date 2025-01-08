const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    room: {
      type: mongoose.Types.ObjectId,
      ref: "Room",
      required: true,
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    fromDate: { type: Date, required: true },
    toDate: { type: Date, required: true },
    totalPrice: { type: Number, required: true },
    duration: { type: Number, required: true },
    session: { type: String, required: true },
    status: {
      type: String,
      required: true,
      enum: ["pending", "confirmed", "cancelled"],
      default: "confirmed",
    },
  },
  {
    timestamps: true,
  }
);

bookingSchema.pre(/^find/, function (next) {
  this.populate("user").populate("room");
  next();
});

module.exports = bookingSchema;
