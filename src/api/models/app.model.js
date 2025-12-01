import express from "express";
import morgan from "morgan";
import cors from "cors";
import { config } from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Routes
import adminRoutes_vc_bb from "../../routes/admin.routes.js";
import teacherRoutes_vc_bb from "../../routes/profesores.routes.js";
import usuariosRoutes_vc_bb from "../../routes/usuarios.routes.js";
import schemaRoutes_vc_bb from "../../routes/schema.routes.js";
import seccionesRoutes_vc_bb from "../../routes/secciones.routes.js";
import gradosRoutes_vc_bb from "../../routes/grados.routes.js";
import espaciosRoutes_vc_bb from "../../routes/espacios.routes.js";
import diasRoutes_vc_bb from "../../routes/dias.routes.js";
import bloquesRoutes_vc_bb from "../../routes/bloques.routes.js";
import indexRoutes_vc_bb from "../../routes/index.routes.js";
import loginRoutes_vc_bb from "../../routes/login.routes.js";
import asignaturasRoutes_vc_bb from "../../routes/asignaturas.routes.js";
import disponibilidadRoutes_vc_bb from "../../routes/disponibilidad.routes.js";
import gradoAsignaturasRoutes_vc_bb from "../../routes/gradoAsignaturas.routes.js";
import excelRoutes_vc_bb, { 
  routerEspaciosExcel_vc_bb, 
  routerGradosExcel_vc_bb, 
  routerSeccionesExcel_vc_bb, 
  routerPensumExcel_vc_bb, 
  routerAsignaturasExcel_vc_bb, 
  routerDisponibilidadesExcel_vc_bb 
} from "../../routes/excel.routes.js";
import lockRoutes_vc_bb from "../../routes/lock.routes.js";

config();

class AppModel_vc_bb {
  static #instancia_vc_bb = null;
  
  constructor() {
    if (AppModel_vc_bb.#instancia_vc_bb) {
      throw new Error("Use AppModel_vc_bb.obtenerInstancia_vc_bb() para obtener la instancia");
    }
    
    this.app_vc_bb = express();
    this.puerto_vc_bb = process.env.PORT;
    this.__dirname_vc_bb = path.dirname(fileURLToPath(import.meta.url));
    
    this.#configurarMiddlewares_vc_bb();
    this.#configurarRutasEstaticas_vc_bb();
    this.#configurarRutasAPI_vc_bb();
    this.#configurarManejoErrores_vc_bb();
    
    AppModel_vc_bb.#instancia_vc_bb = this;
  }

  static obtenerInstancia_vc_bb() {
    if (!AppModel_vc_bb.#instancia_vc_bb) {
      AppModel_vc_bb.#instancia_vc_bb = new AppModel_vc_bb();
    }
    return AppModel_vc_bb.#instancia_vc_bb;
  }

  #configurarMiddlewares_vc_bb() {
    this.app_vc_bb.use(morgan("dev"));
    this.app_vc_bb.use(express.json());
    this.app_vc_bb.use(express.urlencoded({ extended: true }));
    this.app_vc_bb.use(cors());
  }

  #configurarRutasEstaticas_vc_bb() {
    // Servir archivos estáticos
    this.app_vc_bb.use(express.static(path.join(this.__dirname_vc_bb, "../../public")));
    this.app_vc_bb.use("/views", express.static(path.join(this.__dirname_vc_bb, "../../views")));
    this.app_vc_bb.use("/html", express.static(path.join(this.__dirname_vc_bb, "../../html")));
    this.app_vc_bb.use("/public", express.static(path.join(this.__dirname_vc_bb, "../../public")));
    this.app_vc_bb.use("/js", express.static(path.join(this.__dirname_vc_bb, "../../js")));
    this.app_vc_bb.use("/components", express.static(path.join(this.__dirname_vc_bb, "../../components")));
  }

  #configurarRutasAPI_vc_bb() {
    // Routes
    this.app_vc_bb.use("/", indexRoutes_vc_bb);
    this.app_vc_bb.use("/api/login", loginRoutes_vc_bb);
    this.app_vc_bb.use("/api/admin", adminRoutes_vc_bb);
    this.app_vc_bb.use("/api/usuarios", usuariosRoutes_vc_bb);
    this.app_vc_bb.use("/api/profesores", teacherRoutes_vc_bb);
    this.app_vc_bb.use("/api/schema", schemaRoutes_vc_bb);
    this.app_vc_bb.use("/api/secciones", seccionesRoutes_vc_bb);
    this.app_vc_bb.use("/api/grados", gradosRoutes_vc_bb);
    this.app_vc_bb.use("/api/espacios", espaciosRoutes_vc_bb);
    this.app_vc_bb.use("/api/dias", diasRoutes_vc_bb);
    this.app_vc_bb.use("/api/bloques", bloquesRoutes_vc_bb);
    this.app_vc_bb.use("/api/asignaturas", asignaturasRoutes_vc_bb);
    this.app_vc_bb.use("/api/gradosAsignaturas", gradoAsignaturasRoutes_vc_bb);
    this.app_vc_bb.use("/api/disponibilidad", disponibilidadRoutes_vc_bb);

    // Rutas de Excel
    this.app_vc_bb.use("/api/profesores/excel", excelRoutes_vc_bb);
    this.app_vc_bb.use("/api/espacios/excel", routerEspaciosExcel_vc_bb);
    this.app_vc_bb.use("/api/grados/excel", routerGradosExcel_vc_bb);
    this.app_vc_bb.use("/api/secciones/excel", routerSeccionesExcel_vc_bb);
    this.app_vc_bb.use("/api/pensum/excel", routerPensumExcel_vc_bb);
    this.app_vc_bb.use("/api/asignaturas/excel", routerAsignaturasExcel_vc_bb);
    this.app_vc_bb.use("/api/disponibilidades/excel", routerDisponibilidadesExcel_vc_bb);

    // Sistema de bloqueo/rollback
    this.app_vc_bb.use("/api/lock", lockRoutes_vc_bb);

    // Ruta admin para CRUD
    this.app_vc_bb.get(/^\/admin(\/.*)?$/, (req, res) => {
      res.sendFile(path.join(this.__dirname_vc_bb, "../../views", "crudTable.html"));
    });
  }

  #configurarManejoErrores_vc_bb() {
    // Manejo de errores 404
    this.app_vc_bb.use((req, res, next) => {
      res.status(404).json({ message: "Ruta no encontrada" });
    });
  }

  obtenerApp_vc_bb() {
    return this.app_vc_bb;
  }

  obtenerPuerto_vc_bb() {
    return this.puerto_vc_bb;
  }

  iniciarServidor_vc_bb() {
    return new Promise((resolve, reject) => {
      try {
        this.app_vc_bb.listen(this.puerto_vc_bb, () => {
          console.log(`Server running at http://localhost:${this.puerto_vc_bb}`);
          resolve(true);
        });
      } catch (error) {
        console.error("Error al iniciar el servidor:", error);
        reject(error);
      }
    });
  }
}

export default AppModel_vc_bb;
