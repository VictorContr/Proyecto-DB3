console.log("carbb el app_vc_bb");
import { setupThemeToggle_vc_bb } from "../js/dark-mode.js";
import { modal_vc_bb } from "../js/modal.js";
const loginHTML_vc_bb = document.getElementById("login");
const registerHTML_vc_bb = document.getElementById('register');
if (loginHTML_vc_bb) {
  tailwind.config = {
    darkMode: 'class',
    theme: {
      extend: {
        colors: {
          primary: '#0D0A0B',
          secondary: '#454955',
          light: '#F3EFF5',
          accent1: '#72B01D',
          accent2: '#3F7D20',
          dark: {
            900: '#0D0A0B',
            800: '#1a1a1a',
            700: '#2d2d2d',
          }
        },
        fontFamily: {
          inter: ['Inter', 'sans-serif'],
          verdana: ['Verdana', 'sans-serif'],
        },
        animation: {
          'fade-in': 'fadeIn 0.5s ease-in',
          'slide-down': 'slideDown 0.5s ease-out',
          'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
          'underline': 'underline 0.3s ease-out forwards'
        },
        keyframes: {
          fadeIn: {
            '0%': { opacity: '0' },
            '100%': { opacity: '1' },
          },
          slideDown: {
            '0%': { transform: 'translateY(-20px)', opacity: '0' },
            '100%': { transform: 'translateY(0)', opacity: '1' },
          },
          pulse: {
            '0%, 100%': { opacity: '1' },
            '50%': { opacity: '0.8' },
          },
          underline: {
            '0%': { width: '0' },
            '100%': { width: '100%' },
          }
        }
      }
    }
  };

  setupThemeToggle_vc_bb();
  // Espera a que el botón sea presionado
document.addEventListener("submit", async (e) => {
  e.preventDefault()
  const pMensaje = document.getElementById('mensaje-api');
  pMensaje.innerText = 'Cargando...';

  try {
    const respuesta = await fetch('http://localhost:3000/users/admin');

    if (!respuesta.ok) {
      throw new Error(`Error HTTP! Estado: ${respuesta.status}`);
    }

    const mensaje = await respuesta.text(); 
    
    // Mostramos el mensaje en la consola
    console.log('Respuesta API:', mensaje);
    
    // Y lo ponemos en el párrafo
    pMensaje.innerText = mensaje;

  } catch (error) {
    console.error('Error al consumir la API:', error);
    pMensaje.innerText = 'Error al cargar el mensaje.';
  }
});
  
}
if (registerHTML_vc_bb) {
    tailwind.config = {
    darkMode: 'class',
    theme: {
      extend: {
        colors: {
          primary: '#0D0A0B',
          secondary: '#454955',
          light: '#F3EFF5',
          accent1: '#72B01D',
          accent2: '#3F7D20',
          dark: {
            900: '#0D0A0B',
            800: '#1a1a1a',
            700: '#2d2d2d',
          }
        },
        fontFamily: {
          inter: ['Inter', 'sans-serif'],
          verdana: ['Verdana', 'sans-serif'],
        },
        animation: {
          'fade-in': 'fadeIn 0.5s ease-in',
          'slide-down': 'slideDown 0.5s ease-out',
          'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
          'underline': 'underline 0.3s ease-out forwards'
        },
        keyframes: {
          fadeIn: {
            '0%': { opacity: '0' },
            '100%': { opacity: '1' },
          },
          slideDown: {
            '0%': { transform: 'translateY(-20px)', opacity: '0' },
            '100%': { transform: 'translateY(0)', opacity: '1' },
          },
          pulse: {
            '0%, 100%': { opacity: '1' },
            '50%': { opacity: '0.8' },
          },
          underline: {
            '0%': { width: '0' },
            '100%': { width: '100%' },
          }
        }
      }
    }
  };

  setupThemeToggle_vc_bb();
}