const express = require("express");
const router = express.Router();
const {
  create,
  list,
  getHot,
  reply,
  updateStatus,
} = require("../controllers/reviewController");
const { auth, requireRole } = require("../middleware/auth");

router.post("/", auth, requireRole("student"), create);
router.get("/", list);
router.get("/hot", getHot);
router.put("/:id/reply", auth, requireRole("merchant"), reply);
router.put("/:id/status", auth, requireRole("admin"), updateStatus);

module.exports = router;
