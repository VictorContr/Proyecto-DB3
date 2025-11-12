document.addEventListener("DOMContentLoaded", () => {
  console.log("cargado el app_vc_bb");

  // VARIABLES
  const loginForm_vc_bb = document.getElementById("loginForm");
  const mensajeApi_vc_bb = document.getElementById("mensaje-api");
  const logoutButton_vc_bb = document.getElementById("logoutButton_vc_bb");

  // FUNCIONES

  // Función para cerrar sesión y redirigir al login
  const logout_vc_bb = () => {
    // Redirigir a la vista de login
    location.href = "../views/index.html";
  }

  // EVENTOS

  // Validar formulario de login
  if (loginForm_vc_bb) {
    loginForm_vc_bb.addEventListener("submit", async (e) => {
      e.preventDefault(); // Evita recargar la página

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
          body: JSON.stringify({ userName_bb_vc: userName_vc_bb, password_bb_vc: password_vc_bb }),
        });

        const data_vc_bb = await response_vc_bb.json();

        if (!response_vc_bb.ok) {
          mensajeApi_vc_bb.textContent = data_vc_bb.message || "Error en el login";
          mensajeApi_vc_bb.classList.add("text-red-500");
          return;
        }

        const rol_vc_bb = data_vc_bb.usuario.rol;

        // Redirigir según rol
        if (rol_vc_bb === "Administrador") {
          location.replace("../views/admin.html");
        } else if (rol_vc_bb === "Profesor") {
          location.replace("../views/teacher.html");
        } else {
          mensajeApi_vc_bb.textContent = "Usuario sin rol asignado";
          mensajeApi_vc_bb.classList.add("text-red-500");
        }

      } catch (error_vc_bb) {
        console.error("❌ Error en login:", error_vc_bb);
        mensajeApi_vc_bb.textContent = "Error de conexión con el servidor.";
        mensajeApi_vc_bb.classList.add("text-red-500");
      }
    });
  }

  // Cerrar sesión
  if (logoutButton_vc_bb) {
    logoutButton_vc_bb.addEventListener("click", () => {
      logout_vc_bb();
    });
  }
});
