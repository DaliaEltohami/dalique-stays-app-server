const router = require("express").Router();

const User = require("../models/usersModel");

router.post("/register", async (req, res) => {
  try {
    // Extract email from request body
    const { email } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        status: false,
        message: "Email already registered",
        error: "DUPLICATE_EMAIL",
      });
    }

    // Validate required fields
    if (!email || !req.body.password) {
      return res.status(400).json({
        status: false,
        message: "Email and password are required",
        error: "MISSING_FIELDS",
      });
    }

    // Create new user
    const newUser = new User(req.body);
    const user = await newUser.save();
    console.log(user);

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;
    console.log(userResponse);

    // Send success response
    res.status(201).json({
      status: true,
      message: "Registration successful",
      data: userResponse,
    });
  } catch (error) {
    // Handle specific validation errors
    if (error.name === "ValidationError") {
      return res.status(400).json({
        status: false,
        message: "Validation error",
        error: error.message,
      });
    }

    // Handle other errors
    res.status(500).json({
      status: false,
      message: "Failed to register",
      error: error.message,
    });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const foundUser = await User.findOne({
      email,
      password,
    });
    if (foundUser) {
      const returnedUser = {
        id: foundUser.id,
        name: foundUser.name,
        email: foundUser.email,
        isAdmin: foundUser.isAdmin,
      };
      res.send(returnedUser);
    } else {
      res.send({ message: "login failed" });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error ",
      error: error.message,
    });
  }
});

module.exports = router;
