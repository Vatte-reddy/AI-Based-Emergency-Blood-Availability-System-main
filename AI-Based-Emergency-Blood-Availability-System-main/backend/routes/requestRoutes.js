import express from "express";
import {
  createRequest,
  getRequests,
  updateRequest,
  deleteRequest,
} from "../controllers/requestController.js";

const router = express.Router();

// Primary creation route (as requested)
router.post("/create", createRequest);

// Legacy/Alternative routes
router.post("/", createRequest);
router.get("/", getRequests);
router.put("/:id", updateRequest);
router.delete("/:id", deleteRequest);

export default router;
