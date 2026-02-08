const express = require("express");
const router = express.Router();
const admin = require("../controllers/adminController");
const { auth, requireAdmin } = require("../middleware/auth");

router.use(auth, requireAdmin);

router.get("/users", admin.listUsers);
router.put("/users/:id/status", admin.setUserStatus);
router.put("/users/:id/role", admin.setUserRole);

router.get("/merchants/pending", admin.listPendingMerchants);
router.put("/merchants/:id/approve", admin.approveMerchant);
router.put("/merchants/:id/reject", admin.rejectMerchant);

router.get("/foods/pending", admin.listPendingFoods);
router.put("/foods/:id/approve", admin.approveFood);
router.put("/foods/:id/reject", admin.rejectFood);

router.get("/reviews/pending", admin.listPendingReviews);
router.put("/reviews/:id/approve", admin.approveReview);
router.put("/reviews/:id/reject", admin.rejectReview);

router.get("/stats", admin.getStats);

module.exports = router;
