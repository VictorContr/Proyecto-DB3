//IMPORTACIONES
import { modal_vc_bb } from "./modal.js";
import { ApiGuide_vc_bb, getApiBaseUrl_vc_bb } from "./guide.js";

// VARIABLES
export const loginForm_vc_bb = document.getElementById("loginForm");
export const logoutButton_vc_bb = document.getElementById("logoutButton_vc_bb");

//FUNCIONES
//Gestor de sesión
export class GestorSesion_vc_bb {

  // 0. NUEVO MÉTODO: INICIAR SESIÓN
  static async iniciarSesion_vc_bb() {
    // Obtenemos referencias a los elementos del DOM
    const userName_vc_bb =  document.getElementById("username").value.trim();
    const password_vc_bb = document.getElementById("password").value.trim();


    if (!userName_vc_bb || !password_vc_bb) {
          modal_vc_bb.showError_vc_bb("Error","Por favor ingresa usuario y contraseña.", { durationMs: 0 });
      return;
    }

    try {
      const payload_vc_bb = {
        userName_bb_vc: userName_vc_bb,
        password_bb_vc: password_vc_bb,
      };
      const resp_vc_bb = await ApiGuide_vc_bb.json("POST", "/api/login", payload_vc_bb);

      if (!resp_vc_bb.ok) {
        modal_vc_bb.showError_vc_bb("Error", resp_vc_bb?.data?.message || "Error en el login.", { durationMs: 0 });
        return;
      }

      // Construimos el objeto con los datos mínimos usando JSON plano del backend
      const data_vc_bb = resp_vc_bb.data;
      const datosMinimos_vc_bb = {
        id_vc_bb: data_vc_bb.ID_usuario,
        rol_vc_bb: data_vc_bb.rol, // 'Administrador' o 'Profesor'
        nombre_vc_bb: data_vc_bb.nombre,
        apellido_vc_bb: data_vc_bb.apellido,
      };

      // Usamos 'this' para llamar al método estático de la misma clase
      this.guardarUsuarioActual_vc_bb(datosMinimos_vc_bb);
      
      const rol_vc_bb = data_vc_bb.rol;

      // Redirigir según rol
      if (rol_vc_bb === "Administrador") {
        modal_vc_bb.showSuccess_vc_bb(
          "Sesión exitosa",
          "Has iniciado sesión correctamente.",
          { durationMs: 0 }
        );
        setTimeout(() => {
          location.replace("../views/admin.html");
        }, 1000);
      } else if (rol_vc_bb === "Profesor") {
        modal_vc_bb.showSuccess_vc_bb(
          "Sesión exitosa",
          "Has iniciado sesión correctamente.",
          { durationMs: 0 }
        );
        setTimeout(() => {
          location.replace("../views/teacher.html");
        }, 1000);
      } else {
        modal_vc_bb.showError_vc_bb("Error","Usuario sin rol asignado", { durationMs: 0 });  
        }
    } catch (error_vc_bb) {
      console.error("❌ Error en login:", error_vc_bb);
      modal_vc_bb.showError_vc_bb("Error","Error de conexión con el servidor.", { durationMs: 0 });  
    }
  }

  // 1. GUARDAR DATOS
  static guardarUsuarioActual_vc_bb(datosMinimos_vc_bb) {
    // Guardamos en storage con las claves actualizadas
    sessionStorage.setItem(
      "usuarioActual_vc_bb",
      JSON.stringify(datosMinimos_vc_bb)
    );
    sessionStorage.setItem(
      "selectedUserId_vc_bb",
      JSON.stringify(datosMinimos_vc_bb.id_vc_bb)
    );
  }

  // 2. OBTENER DATOS
  static obtenerUsuarioActual_vc_bb() {
    const sesion_vc_bb = sessionStorage.getItem("usuarioActual_vc_bb");
    return sesion_vc_bb ? JSON.parse(sesion_vc_bb) : null;
  }

  // 3. CERRAR SESIÓN
  static cerrarSesion_vc_bb() {
    sessionStorage.removeItem("usuarioActual_vc_bb");
    sessionStorage.removeItem("selectedUserId_vc_bb");
    
    // Verificamos si existe el modal antes de usarlo
    if(typeof modal_vc_bb !== 'undefined') {
        modal_vc_bb.showSuccess_vc_bb(
          "Sesión finalizada",
          "Has cerrado sesión correctamente.",
          { durationMs: 0 }
        );
    }
    
    setTimeout(() => {
      // Redirigir a la vista de login usando ruta absoluta para evitar 404
      location.href = "index.html";
    }, 1000);
  }

  // 4. VERIFICAR ACCESO
  static verificarAcceso_vc_bb(urlsPublicas_vc_bb = ["index.html"]) {
    const usuarioActual_vc_bb = this.obtenerUsuarioActual_vc_bb();
    const urlActual_vc_bb = location.href;

    // --- A. Si es una URL pública (Login), dejar pasar ---
    const esPublica_vc_bb = urlsPublicas_vc_bb.some((url) =>
      urlActual_vc_bb.includes(url)
    );

    if (esPublica_vc_bb) {
      // Si ya hay sesión iniciada y está en el login, redirigir a su dashboard
      if (usuarioActual_vc_bb) {
        if (usuarioActual_vc_bb.rol_vc_bb === "Administrador")
          location.href = "admin.html"; // Asegúrate de la ruta correcta
        if (usuarioActual_vc_bb.rol_vc_bb === "Profesor")
          location.href = "teacher.html"; // Asegúrate de la ruta correcta
      }
      return true;
    }

    // --- B. Si NO hay usuario logueado ---
    if (!usuarioActual_vc_bb) {
      console.warn("Intento de acceso sin sesión.");

      if (typeof modal_vc_bb !== "undefined") {
        modal_vc_bb.showError_vc_bb("Error", "Debe iniciar sesión", { durationMs: 0 });
      } else {
         // Fallback si no hay modal
         console.log("Debe iniciar sesión");
      }

      setTimeout(() => {
        // Usar ruta absoluta al login para evitar problemas de rutas relativas
        location.href = "index.html";
      }, 1000);
      return false;
    }

    // --- C. Verificación de Ruta para ADMINISTRADOR ---
    if (urlActual_vc_bb.includes("/views/admin.html")) {
      if (usuarioActual_vc_bb.rol_vc_bb !== "Administrador") {
        console.error("Acceso denegado: Usuario no es Admin");
        if (usuarioActual_vc_bb.rol_vc_bb === "Profesor") {
          modal_vc_bb.showError_vc_bb(
            "Acceso denegado",
            "Usuario no es Admin.",
            { durationMs: 0 }
          );
          setTimeout(() => {
            location.href = "./teacher.html";
          }, 1000);
        } else {
          modal_vc_bb.showError_vc_bb(
            "Acceso denegado",
            "Usuario no es Admin.",
            { durationMs: 0 }
          );
          setTimeout(() => {
            location.href = "index.html";
          }, 1000);
        }
        return false;
      }
      console.log("✅ Acceso concedido a Admin");
      return true;
    }

    // --- D. Verificación de Ruta para PROFESOR ---
    if (urlActual_vc_bb.includes("/views/teacher.html")) {
      if (usuarioActual_vc_bb.rol_vc_bb !== "Profesor") {
        console.error("Acceso denegado: Usuario no es Profesor");

        if (usuarioActual_vc_bb.rol_vc_bb === "Administrador") {
          modal_vc_bb.showError_vc_bb(
            "Acceso denegado",
            "Usuario no es Profesor.",
            { durationMs: 0 }
          );
          setTimeout(() => {
            location.href = "./admin.html";
          }, 1000);
        } else {
          modal_vc_bb.showError_vc_bb(
            "Acceso denegado",
            "Usuario no es Profesor.",
            { durationMs: 0 }
          );
          setTimeout(() => {
            location.href = "index.html";
          }, 1000);
        }
        return false;
      }
      console.log("✅ Acceso concedido a Profesor");
      return true;
    }

    return true;
  }
}
