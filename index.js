import express from "express";
import morgan from "morgan";
import cors from "cors";
import { config } from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Routes
import adminRoutes_vc_bb from "./src/routes/admin.routes.js";
import teacherRoutes_vc_bb from "./src/routes/teacher.routes.js";
import indexRoutes_vc_bb from "./src/routes/index.routes.js";
import loginRoutes_vc_bb from "./src/routes/login.routes.js"; // nueva ruta de login

config();

const PORT_vc_bb = process.env.PORT || 3000;
const app_vc_bb = express();

// Para __dirname en ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middlewares
app_vc_bb.use(morgan("dev"));
app_vc_bb.use(express.json());
app_vc_bb.use(express.urlencoded({ extended: true }));
app_vc_bb.use(cors());

// Servir archivos estáticos (HTML, CSS, JS)
app_vc_bb.use(express.static(path.join(__dirname, "public"))); // /public
app_vc_bb.use("/html", express.static(path.join(__dirname, "html"))); // tus vistas login/admin/profesor

// Routes
app_vc_bb.use("/", indexRoutes_vc_bb);          // landing page o home
app_vc_bb.use("/api/login", loginRoutes_vc_bb); // login
app_vc_bb.use("/api/admin", adminRoutes_vc_bb); // rutas admin
app_vc_bb.use("/api/teacher", teacherRoutes_vc_bb); // rutas profesor

// Manejo de errores 404
app_vc_bb.use((req, res, next) => {
  res.status(404).json({ message: "Ruta no encontrada" });
});

// Inicialización del servidor
app_vc_bb.listen(PORT_vc_bb, () => {
  console.log(`Server running at http://localhost:${PORT_vc_bb}`);
});
