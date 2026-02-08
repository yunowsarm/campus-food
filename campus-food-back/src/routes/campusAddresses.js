const express = require("express");
const router = express.Router();
const campusAddressController = require("../controllers/campusAddressController");

// 校园配送地址列表（无需登录，供下单选择）
router.get("/", campusAddressController.list);

module.exports = router;
