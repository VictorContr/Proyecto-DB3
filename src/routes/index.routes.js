import { Router } from "express";
import { index_vc_bb } from "../api/controllers/index.controller.js";

const router_vc_bb = Router();

router_vc_bb.get("/", index_vc_bb);

export default router_vc_bb;