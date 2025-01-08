const Room = require("../models/roomModel");
const CreateError = require("../utils/appError");
const dayjs = require("dayjs");
const isBetween = require("dayjs/plugin/isBetween");

dayjs.extend(isBetween);

exports.getFilteredRooms = async (req, res, next) => {
  try {
    const { fromDate, toDate } = req.body;

    if (!fromDate || !toDate) {
      return next(
        new CreateError("Both fromDate and toDate are required!", 400)
      );
    }

    // Fetch rooms and populate currentbookings only for filtering
    const rooms = await Room.find().populate({
      path: "currentbookings",
      select: "fromDate toDate status", // Fetch only required fields for bookings
    });

    // Filter rooms based on availability
    const filteredRooms = rooms.filter((room) => {
      console.log(room.currentbookings);
      if (room.currentbookings?.length > 0) {
        const hasConflict = room.currentbookings.some((booking) => {
          if (
            dayjs(fromDate).isBetween(
              booking.fromDate,
              booking.toDate,
              "day",
              "[]"
            ) ||
            dayjs(toDate).isBetween(
              booking.fromDate,
              booking.toDate,
              "day",
              "[]"
            ) ||
            dayjs(booking.fromDate).isBetween(fromDate, toDate, "day", "[]") ||
            dayjs(booking.toDate).isBetween(fromDate, toDate, "day", "[]")
          ) {
            if (booking.status !== "cancelled") {
              return true;
            }
            console.log("room cancelled");
            return false;
          }
          return false;
        });

        return !hasConflict; // Exclude room if conflict exists
      }
      return true; // Include room if no bookings
    });

    // Remove currentbookings from the returned filtered rooms
    const sanitizedRooms = filteredRooms.map((room) => {
      const { currentbookings, ...rest } = room.toObject(); // Convert to plain object and exclude currentbookings
      return rest;
    });

    res.status(200).json({
      status: "success",
      data: {
        rooms: filteredRooms,
      },
    });
  } catch (error) {
    console.error(error);
    return next(new CreateError("Error Fetching Rooms!", 500));
  }
};

exports.getAllRooms = async (req, res, next) => {
  try {
    const rooms = await Room.find();
    return res.status(200).json({
      success: true,
      data: rooms,
    });
  } catch (error) {
    return next(new CreateError("Error Fetching Rooms", 500));
  }
};

exports.addRoom = async (req, res, next) => {
  console.log(req.body);
  try {
    const roomData = { ...req.body };
    if (
      !roomData.name ||
      !roomData.maxCount ||
      !roomData.rentPerNight ||
      !roomData.phoneNumber ||
      !roomData.type ||
      !roomData.description ||
      !roomData.images
    ) {
      return next(new CreateError("Missing required Room fields", 400));
    }

    const newRoom = new Room({
      name: roomData.name,
      maxcount: roomData.maxCount,
      rentperday: roomData.rentPerNight,
      phonenumber: roomData.phoneNumber,
      type: roomData.type,
      description: roomData.description,
      imageurls: roomData.images,
      currentbookings: [],
    });

    const savedRoom = await newRoom.save();

    // const newRoom = await Room.create(roomData);

    return res.status(200).json({
      success: true,
      message: "Room Added Successfully",
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return next(new CreateError("Invalid Room data", 400));
    }
    return next(new CreateError(error));
  }
};
