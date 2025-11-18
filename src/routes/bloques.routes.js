import { Router } from "express";
import { getAllBloques_vc_bb } from "../api/controllers/bloques.controller.js";

const router_vc_bb = Router();

router_vc_bb.get("/", getAllBloques_vc_bb);

export default router_vc_bb;
