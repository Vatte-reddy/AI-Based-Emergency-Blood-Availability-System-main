import express from "express";
import {
  createDonor,
  getDonors,
  getDonorById,
  updateDonor,
  deleteDonor,
  matchDonors,
} from "../controllers/donorController.js";

const router = express.Router();

// Primary registration route (as requested)
router.post("/register", createDonor);

// Legacy/Alternative routes
router.post("/", createDonor);
router.get("/search", matchDonors);
router.get("/", getDonors);
router.get("/:id", getDonorById);
router.put("/:id", updateDonor);
router.delete("/:id", deleteDonor);

export default router;
