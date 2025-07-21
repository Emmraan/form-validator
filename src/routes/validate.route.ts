import express from "express";
import { authenticateToken } from "../middleware/authenticate";
import { rateLimitMiddleware } from "../middleware/rateLimit";
import { validateFormData } from "../controllers/validateController";

const router = express.Router();

router.post("/validate", rateLimitMiddleware, authenticateToken, validateFormData);

export default router;
