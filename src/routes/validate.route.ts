import express from "express";
import { authenticateToken } from "../middleware/authenticate";
import { validateFormData } from "../controllers/validateController";

const router = express.Router();

router.post("/validate", authenticateToken, validateFormData);

export default router;
