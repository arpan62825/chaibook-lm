import { Router } from "express";
import { parsePDF } from "../controllers/upload.controller.js";
import multer from "multer";

const upload = multer({ storage: multer.memoryStorage() });

const router = Router();

router.post("/pdf", upload.single("pdf"), parsePDF);

export default router;
