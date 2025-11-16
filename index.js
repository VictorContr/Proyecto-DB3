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
import excelRoutes_vc_bb, { routerEspaciosExcel_vc_bb, routerBloquesExcel_vc_bb, routerDiasExcel_vc_bb, routerCalendarioExcel_vc_bb, routerGradosExcel_vc_bb, routerSeccionesExcel_vc_bb, routerPensumExcel_vc_bb } from "./src/routes/excel.routes.js"
config();

const PORT_vc_bb = process.env.PORT;
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
app_vc_bb.use("/api/profesores/excel", excelRoutes_vc_bb);
app_vc_bb.use("/api/espacios/excel", routerEspaciosExcel_vc_bb);
app_vc_bb.use("/api/bloques/excel", routerBloquesExcel_vc_bb);
app_vc_bb.use("/api/dias/excel", routerDiasExcel_vc_bb);
app_vc_bb.use("/api/calendario/excel", routerCalendarioExcel_vc_bb);
app_vc_bb.use("/api/grados/excel", routerGradosExcel_vc_bb);
app_vc_bb.use("/api/secciones/excel", routerSeccionesExcel_vc_bb);
app_vc_bb.use("/api/pensum/excel", routerPensumExcel_vc_bb);
// Manejo de errores 404
app_vc_bb.use((req, res, next) => {
  res.status(404).json({ message: "Ruta no encontrada" });
});

// Inicialización del servidor
app_vc_bb.listen(PORT_vc_bb, () => {
  console.log(`Server running at http://localhost:${PORT_vc_bb}`);
});
