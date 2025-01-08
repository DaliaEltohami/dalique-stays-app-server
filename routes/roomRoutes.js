const express = require("express");
const router = express.Router();
const Rooms = require("../models/roomModel");
const CreateError = require("../utils/appError");
const mongoose = require("mongoose");
const {
  getFilteredRooms,
  getAllRooms,
  addRoom,
} = require("../controllers/roomsController");

// router.get("/getallrooms", async (req, res, next) => {
//   try {
//     const rooms = await Rooms.find();
//     // return res.json({ rooms });
//     res.send(rooms);
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: "Faild fetch rooms",
//       error: error.message,
//     });
//   }
// });

router.post("/getroom", async (req, res, next) => {
  try {
    // Check if roomId is a valid ObjectId
    // if (!mongoose.Types.ObjectId.isValid(req.body.roomId)) {
    //   return next(new CreateError("Invalid room ID format", 400));
    // }

    const room = await Rooms.findById(req.body.roomId);
    if (!room) {
      return next(new CreateError("This room doesn't exist!!", 404));
    }

    res.status(200).json({
      room,
    });
  } catch (error) {
    // console.error("error name", error.name, error);
    if (error.name === "CastError") {
      return next(new CreateError("Invalid room ID format", 400));
    }
    return next(new CreateError("Failed to fetch room", 500));
  }
});

router.post("/getfilteredrooms", getFilteredRooms);
router.get("/getallrooms", getAllRooms);
router.post("/addroom", addRoom);

module.exports = router;
