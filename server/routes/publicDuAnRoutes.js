const express = require("express");
const router = express.Router();
const PublicDuAnController = require("../controllers/PublicDuAnController");

// GET /api/public/du-an (public)
router.get("/", PublicDuAnController.getDanhSachDuAn);

// PUT /api/public/du-an/:id (không cần auth)
router.put("/:id", PublicDuAnController.updateDuAn);

// DELETE /api/public/du-an/:id (không cần auth)
router.delete("/:id", PublicDuAnController.deleteDuAn);

module.exports = router;
