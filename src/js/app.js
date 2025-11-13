import { setupThemeToggle_vc_bb } from "./dark-mode.js";
import { GestorSesion_vc_bb, loginForm_vc_bb, logoutButton_vc_bb } from "./login.js";

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
            tailwind.config = {
            darkMode: 'class',
            theme: {
                extend: {
                    colors: {
                        primary: {
                            50: '#f0f9ff',
                            100: '#e0f2fe',
                            500: '#106587',
                            600: '#0e5773',
                        },
                        colegio: {
                            blue: '#106587',
                            darkblue: '#0e5773',
                            light: '#f8fafc',
                            dark: '#1e293b'
                        }
                    },
                    fontFamily: {
                        'poppins': ['Poppins', 'sans-serif'],
                    }
                }
            }
        }
    loginForm_vc_bb.addEventListener("submit", async (e) => {
      e.preventDefault(); // Evita recargar la página
      GestorSesion_vc_bb.iniciarSesion_vc_bb();
    });
    setupThemeToggle_vc_bb()
  }

  // Cerrar sesión
  if (logoutButton_vc_bb) {
            tailwind.config = {
            darkMode: 'class',
            theme: {
                extend: {
                    colors: {
                        primary: {
                            50: '#f0f9ff',
                            100: '#e0f2fe',
                            500: '#106587',
                            600: '#0e5773',
                        },
                        colegio: {
                            blue: '#106587',
                            darkblue: '#0e5773',
                            light: '#f8fafc',
                            dark: '#1e293b'
                        }
                    },
                    fontFamily: {
                        'poppins': ['Poppins', 'sans-serif'],
                    }
                }
            }
        }
    logoutButton_vc_bb.addEventListener("click", () => {
      GestorSesion_vc_bb.cerrarSesion_vc_bb();
    });
    setupThemeToggle_vc_bb();
  }
});
