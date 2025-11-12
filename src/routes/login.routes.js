import { Router } from "express";
import { login_vc_bb } from "../api/controllers/login.controller.js"; // controlador de login

const routerLogin_vc_bb = Router();

// POST → login de cualquier usuario (admin o profesor)
routerLogin_vc_bb.post("/", login_vc_bb);

export default routerLogin_vc_bb;
