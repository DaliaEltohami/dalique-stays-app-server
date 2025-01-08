const router = require("express").Router();
const {
  login,
  singup,
  verifyAuth,
  getAllUsers,
} = require("../controllers/authController");

router.post("/login", login);
router.post("/signup", singup);
router.get("/verify-token", verifyAuth);
router.get("/getallusers", getAllUsers);

module.exports = router;
