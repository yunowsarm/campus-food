const express = require("express");
const router = express.Router();
const {
  sendCode,
  register,
  emailLogin,
  wechatLogin,
  resetPassword,
  setRole,
} = require("../controllers/authController");
const { auth } = require("../middleware/auth");

router.post("/send-code", sendCode);
router.post("/register", register);
router.post("/login", emailLogin);
router.post("/wechat-login", wechatLogin);
router.post("/reset-password", resetPassword);
router.post("/set-role", auth, setRole);

module.exports = router;
