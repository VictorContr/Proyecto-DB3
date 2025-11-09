import { Router } from "express";
import {
  show_vc_bb

} from "../api/controllers/admin.controller.js";

const router_vc_bb = Router();

// GET all admin
router_vc_bb.get("/admin", show_vc_bb);

// // GET An Employee
// router_vc_bb.get("/admin/:id", getEmployee);

// // DELETE An Employee
// router_vc_bb.delete("/admin/:id", deleteEmployee);

// // INSERT An Employee
// router_vc_bb.post("/admin", createEmployee);

// router_vc_bb.patch("/admin/:id", updateEmployee);

export default router_vc_bb;