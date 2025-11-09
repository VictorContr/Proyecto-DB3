import { Router } from "express";
import {
  show

} from "../api/controllers/admin.controller.js";

const router = Router();

// GET all admin
router.get("/admin", show);

// // GET An Employee
// router.get("/admin/:id", getEmployee);

// // DELETE An Employee
// router.delete("/admin/:id", deleteEmployee);

// // INSERT An Employee
// router.post("/admin", createEmployee);

// router.patch("/admin/:id", updateEmployee);

export default router;