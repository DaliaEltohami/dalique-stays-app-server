const Booking = require("../models/bookingModel");
const Room = require("../models/roomModel");
const User = require("../models/usersModel");
const CreateError = require("../utils/appError");
const stripe = require("stripe")(process.env.STRIPE_SECRET);
const { v4: uuidv4 } = require("uuid");

const getBaseUrl = (req) => {
  const protocol = req.headers["x-forwarded-proto"] || req.protocol;
  const host = req.get("host");
  return `${protocol}://${host}`;
};

exports.roomBooking = async (req, res, next) => {
  const bookingData = { ...req.body.newBooking };
  try {
    // Find room and validate existence
    const room = await Room.findById(bookingData.roomId);
    if (!room) {
      return next(new CreateError("Room Not Found", 404));
    }

    // Validate booking data
    if (
      !bookingData.roomId ||
      !bookingData.userId ||
      !bookingData.fromDate ||
      !bookingData.toDate ||
      !bookingData.duration ||
      !bookingData.totalPrice
    ) {
      return next(new CreateError("Missing required booking fields", 400));
    }

    // Get the base URL from the current request
    const baseUrl = getBaseUrl(req);

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "egp",
            product_data: {
              name: room.name,
              images: room.imageurls,
            },
            unit_amount: Math.round(room.rentperday * 100),
          },
          quantity: bookingData.duration,
        },
      ],
      success_url: `${baseUrl}/app/payment-success`,
      cancel_url: `${baseUrl}/app/payment-cancelled`,
    });

    // res.redirect(303, session.url);

    if (session) {
      const newBooking = new Booking({
        room: room.id,
        user: bookingData.userId,
        fromDate: bookingData.fromDate,
        toDate: bookingData.toDate,
        totalPrice: bookingData.duration * room.rentperday,
        duration: bookingData.duration,
        session: uuidv4(),
      });
      const savedBooking = await newBooking.save();

      // Add booking to current bookings
      // const booking = { ...savedBooking._doc, bookingId: savedBooking._id };
      room.currentbookings.push(savedBooking._id);
      const updatedRoom = await room.save();

      return res
        .status(200)
        .json({ session: session, message: "Room Booked Successfully" });
    }

    // Create and save new booking
  } catch (error) {
    console.error("Error in roomBooking endpoint:", error);
    if (error.name === "ValidationError") {
      return next(new CreateError("Invalid booking data", 400));
    }
    return next(error);
  }
};

exports.getBookingsByUserId = async (req, res, next) => {
  try {
    const { userId } = req.body;
    const user = await User.findById(userId);
    if (user) {
      const bookings = await Booking.find({ user: userId });

      if (bookings) {
        res.status(200).json({ bookings });
      } else {
        return next(new CreateError("Error fetching your bookings", 401));
      }
    } else {
      return next(new CreateError("User Doesn't Exist", 401));
    }
  } catch (error) {
    return next(error);
  }
};

exports.cancelBooking = async (req, res, next) => {
  const bookingId = req.body.bookingId;
  try {
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return next(new CreateError("This Booking Doesn't Exist", 401));
    }
    booking.status = "cancelled";
    await booking.save();
    return res.status(200).json({
      message: `Booking with Id ${bookingId} Cancelled Successfully`,
    });
  } catch (error) {
    return next(error);
  }
};

exports.getAllBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find();
    return res.status(200).json({
      success: true,
      data: bookings,
    });
  } catch (error) {
    return next(new CreateError("Error Fetching Bookings", 500));
  }
};
