import { Router } from "express";
import { getAllDias_vc_bb } from "../api/controllers/dias.controller.js";

const router_vc_bb = Router();

router_vc_bb.get("/", getAllDias_vc_bb);

export default router_vc_bb;
