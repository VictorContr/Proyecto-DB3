//IMPORTACIONES
import { modal_vc_bb } from "./modal.js";

// VARIABLES
export const loginForm_vc_bb = document.getElementById("loginForm");
export const logoutButton_vc_bb = document.getElementById("logoutButton_vc_bb");
const mensajeApi_vc_bb = document.getElementById("mensaje-api");

//FUNCIONES

// Iniciar sesión
export const iniciarSesion_vc_bb = async () => {
  const userName_vc_bb = document.getElementById("username").value.trim();
  const password_vc_bb = document.getElementById("password").value.trim();

  if (!userName_vc_bb || !password_vc_bb) {
    mensajeApi_vc_bb.textContent = "Por favor ingresa usuario y contraseña.";
    mensajeApi_vc_bb.classList.add("text-red-500");
    return;
  }

  try {
    const response_vc_bb = await fetch("http://localhost:3000/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userName_bb_vc: userName_vc_bb,
        password_bb_vc: password_vc_bb,
      }),
    });

    const data_vc_bb = await response_vc_bb.json();

    if (!response_vc_bb.ok) {
      mensajeApi_vc_bb.textContent = data_vc_bb.message || "Error en el login";
      mensajeApi_vc_bb.classList.add("text-red-500");

      return;
    }
    // Aquí pasas el objeto completo que trajo tu SQL
    const datosMinimos_vc_bb = {
      id_vc_bb: data_vc_bb.usuario.id,
      rol_vc_bb: data_vc_bb.usuario.rol, // 'Administrador' o 'Profesor'
      nombre_vc_bb: data_vc_bb.usuario.nombre,
      apellido_vc_bb: data_vc_bb.usuario.apellido,
    };

    GestorSesion_vc_bb.guardarUsuarioActual_vc_bb(datosMinimos_vc_bb);
    const rol_vc_bb = data_vc_bb.usuario.rol;

    // Redirigir según rol
    if (rol_vc_bb === "Administrador") {
      modal_vc_bb.showSuccess_vc_bb(
        "Sesión exitosa",
        "Has iniciado sesión correctamente."
      );
      setTimeout(() => {
        location.replace("../views/admin.html");
      }, 1000);
    } else if (rol_vc_bb === "Profesor") {
      modal_vc_bb.showSuccess_vc_bb(
        "Sesión exitosa",
        "Has iniciado sesión correctamente."
      );
      setTimeout(() => {
        location.replace("../views/teacher.html");
      }, 1000);
    } else {
      mensajeApi_vc_bb.textContent = "Usuario sin rol asignado";
      mensajeApi_vc_bb.classList.add("text-red-500");
    }
  } catch (error_vc_bb) {
    console.error("❌ Error en login:", error_vc_bb);
    mensajeApi_vc_bb.textContent = "Error de conexión con el servidor.";
    mensajeApi_vc_bb.classList.add("text-red-500");
  }
};

//Clase de Gestor de
export class GestorSesion_vc_bb {
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
    modal_vc_bb.showSuccess_vc_bb(
      "Sesión finalizada",
      "Has cerrado sesión correctamente."
    );
    setTimeout(() => {
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
        // Nota: accedemos a las propiedades con el sufijo _vc_bb
        if (usuarioActual_vc_bb.rol_vc_bb === "Administrador")
          location.href = "./admin.html";
        if (usuarioActual_vc_bb.rol_vc_bb === "Profesor")
          location.href = "./teacher.html";
      }
      return true;
    }

    // --- B. Si NO hay usuario logueado ---
    if (!usuarioActual_vc_bb) {
      console.warn("Intento de acceso sin sesión.");

      // Asumiendo que el modal también cambia de nombre a modal_vc_bb
      if (typeof modal_vc_bb !== "undefined") {
        modal_vc_bb.showError_vc_bb("Error", "Debe iniciar sesión");
      } else {
        modal_vc_bb.showError_vc_bb("Debe iniciar sesión");
      }

      setTimeout(() => {
        location.href = "./index.html";
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
            "Usuario no es Admin."
          );
          setTimeout(() => {
            location.href = "./teacher.html";
          }, 1000);
        } else {
          modal_vc_bb.showError_vc_bb(
            "Acceso denegado",
            "Usuario no es Admin."
          );
          setTimeout(() => {
            location.href = "./index.html";
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
            "Usuario no es Profesor."
          );
          setTimeout(() => {
            location.href = "./admin.html";
          }, 1000);
        } else {
          modal_vc_bb.showError_vc_bb(
            "Acceso denegado",
            "Usuario no es Profesor."
          );
          setTimeout(() => {
            location.href = "./index.html";
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
