const router = require("express").Router();
const {
  roomBooking,
  getBookingsByUserId,
  cancelBooking,
  getAllBookings,
} = require("../controllers/bookingsControllers");

router.post("/roomBooking", roomBooking);

router.post("/getbookingsbyuserid", getBookingsByUserId);

router.post("/cancelbooking", cancelBooking);

router.get("/getallbookings", getAllBookings);

module.exports = router;
