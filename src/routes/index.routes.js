import { Router } from "express";
import { index } from "../api/controllers/index.controller.js";

const router = Router();

router.get("/", index);

export default router;