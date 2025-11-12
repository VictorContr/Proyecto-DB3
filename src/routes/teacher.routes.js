import { Router } from "express";
import { showTeacher_vc_bb } from "../api/controllers/teacher.controller.js";

const router_vc_bb = Router();

// GET → info de un profesor
router_vc_bb.get("/", showTeacher_vc_bb);

export default router_vc_bb;
