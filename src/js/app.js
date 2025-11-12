import { setupThemeToggle_vc_bb } from "./dark-mode.js";
import { GestorSesion_vc_bb, iniciarSesion_vc_bb, loginForm_vc_bb, logoutButton_vc_bb } from "./login.js";

document.addEventListener("DOMContentLoaded", () => {
  console.log("cargado el app_vc_bb");
  if (GestorSesion_vc_bb.verificarAcceso_vc_bb()) {
  // El método ya maneja la redirección automáticamente
  console.log("Verificando ...")
}
  // VARIABLES

  // EVENTOS

  // Validar formulario de login
  if (loginForm_vc_bb) {
    loginForm_vc_bb.addEventListener("submit", async (e) => {
      e.preventDefault(); // Evita recargar la página
      iniciarSesion_vc_bb();
    });
    setupThemeToggle_vc_bb()
  }

  // Cerrar sesión
  if (logoutButton_vc_bb) {
    logoutButton_vc_bb.addEventListener("click", () => {
      GestorSesion_vc_bb.cerrarSesion_vc_bb();
    });
  }
});
