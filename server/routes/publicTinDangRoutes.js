const express = require("express");
const router = express.Router();
const PublicTinDangController = require("../controllers/PublicTinDangController");

// GET /api/public/tin-dang (public)
router.get("/", PublicTinDangController.getDanhSachTinDang);

// PUT /api/public/tin-dang/:id (không cần auth)
router.put("/:id", PublicTinDangController.updateTinDang);

// DELETE /api/public/tin-dang/:id (không cần auth)
router.delete("/:id", PublicTinDangController.deleteTinDang);

module.exports = router;
