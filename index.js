import express from "express";
import morgan from "morgan";
import cors from "cors";
import { config } from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import horariosRoutes_vc_bb from "./src/routes/horarios.routes.js"; // Asegúrate de importar la ruta de horarios


// Routes
import adminRoutes_vc_bb from "./src/routes/admin.routes.js";
import teacherRoutes_vc_bb from "./src/routes/profesores.routes.js";
import usuariosRoutes_vc_bb from "./src/routes/usuarios.routes.js";
import schemaRoutes_vc_bb from "./src/routes/schema.routes.js";
import seccionesRoutes_vc_bb from "./src/routes/secciones.routes.js";
import gradosRoutes_vc_bb from "./src/routes/grados.routes.js";
import espaciosRoutes_vc_bb from "./src/routes/espacios.routes.js";
import diasRoutes_vc_bb from "./src/routes/dias.routes.js";
import bloquesRoutes_vc_bb from "./src/routes/bloques.routes.js";
import indexRoutes_vc_bb from "./src/routes/index.routes.js";
import loginRoutes_vc_bb from "./src/routes/login.routes.js"; // nueva ruta de login
import lockRoutes_vc_bb from "./src/routes/lock.routes.js";

// Nueva importación necesaria para CRUD de asignaturas
import asignaturasRoutes_vc_bb from "./src/routes/asignaturas.routes.js";
import disponibilidadRoutes_vc_bb from "./src/routes/disponibilidad.routes.js";
import gradoAsignaturasRoutes_vc_bb from "./src/routes/gradoAsignaturas.routes.js";

import excelRoutes_vc_bb, { 
  routerEspaciosExcel_vc_bb, 
  routerGradosExcel_vc_bb, 
  routerSeccionesExcel_vc_bb, 
  routerPensumExcel_vc_bb, 
  routerAsignaturasExcel_vc_bb, 
  routerDisponibilidadesExcel_vc_bb 
} from "./src/routes/excel.routes.js";

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

// Servir archivos estáticos (HTML, CSS, JS) desde `src/public`
app_vc_bb.use(express.static(path.join(__dirname, "src", "public")));
// Servir las vistas estáticas desde `src/views` bajo el prefijo `/views`
app_vc_bb.use("/views", express.static(path.join(__dirname, "src", "views")));
app_vc_bb.use("/html", express.static(path.join(__dirname, "html"))); // compatibilidad antigua
app_vc_bb.use("/public", express.static(path.join(__dirname, "src", "public")));
app_vc_bb.use("/js", express.static(path.join(__dirname, "src", "js")));
app_vc_bb.use("/components", express.static(path.join(__dirname, "src", "components")));

// Routes
app_vc_bb.use("/", indexRoutes_vc_bb);          // landing page o home
app_vc_bb.use("/api/login", loginRoutes_vc_bb); // login
app_vc_bb.use("/api/admin", adminRoutes_vc_bb); // rutas admin
app_vc_bb.use("/api/usuarios", usuariosRoutes_vc_bb); // rutas usuarios (nuevo)
app_vc_bb.use("/api/profesores", teacherRoutes_vc_bb); // rutas profesor
app_vc_bb.use("/api/schema", schemaRoutes_vc_bb);
app_vc_bb.use("/api/secciones", seccionesRoutes_vc_bb);
app_vc_bb.use("/api/grados", gradosRoutes_vc_bb);
app_vc_bb.use("/api/espacios", espaciosRoutes_vc_bb);
app_vc_bb.use("/api/dias", diasRoutes_vc_bb);
app_vc_bb.use("/api/bloques", bloquesRoutes_vc_bb);
app_vc_bb.use("/api/lock", lockRoutes_vc_bb);

// CRUD de asignaturas (PENSUM real)
app_vc_bb.use("/api/asignaturas", asignaturasRoutes_vc_bb);
app_vc_bb.use("/api/gradosAsignaturas", gradoAsignaturasRoutes_vc_bb);
app_vc_bb.use("/api/disponibilidad", disponibilidadRoutes_vc_bb);

app_vc_bb.use("/api/profesores/excel", excelRoutes_vc_bb);
app_vc_bb.use("/api/espacios/excel", routerEspaciosExcel_vc_bb);
app_vc_bb.use("/api/grados/excel", routerGradosExcel_vc_bb);
app_vc_bb.use("/api/secciones/excel", routerSeccionesExcel_vc_bb);
app_vc_bb.use("/api/pensum/excel", routerPensumExcel_vc_bb);
app_vc_bb.use("/api/asignaturas/excel", routerAsignaturasExcel_vc_bb);
app_vc_bb.use("/api/disponibilidades/excel", routerDisponibilidadesExcel_vc_bb);

// Horarios
app_vc_bb.use("/api/horarios", horariosRoutes_vc_bb);

// Para que cualquier ruta de tabla CRUD de admin (incluyendo subrutas)
// cargue en la misma vista (el componente web lee la URL para saber qué tabla/subtabla cargar).
// Servir la misma vista para cualquier ruta bajo /admin (incluyendo subrutas).
// Usamos una RegExp para evitar problemas con la versión de path-to-regexp.
app_vc_bb.get(/^\/admin(\/.*)?$/, (req, res) => {
  res.sendFile(path.join(__dirname, "src", "views", "crudTable.html"));
});

// Manejo de errores 404
app_vc_bb.use((req, res, next) => {
  res.status(404).json({ message: "Ruta no encontrada" });
});

// Inicialización del servidor
app_vc_bb.listen(PORT_vc_bb, () => {
  console.log(`Server running at http://localhost:${PORT_vc_bb}`);
});
