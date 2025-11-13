class ThemeToggle_vc_bb {
  constructor() {
    this.btnColorModo_vc_bb = document.getElementById("cambio-color");
    // Verificamos si existe el botón para evitar errores si no se carga en alguna página
    if (this.btnColorModo_vc_bb) {
        this.icon_vc_bb = this.btnColorModo_vc_bb.querySelector('i');
    }
    this.currentTheme_vc_bb = null;
    this.mediaQuery_vc_bb = window.matchMedia('(prefers-color-scheme: dark)');
    
    // Bindear métodos para mantener el contexto
    this.handleSystemThemeChange_vc_bb = this.handleSystemThemeChange_vc_bb.bind(this);
    this.toggleTheme_vc_bb = this.toggleTheme_vc_bb.bind(this);
  }

  getSystemTheme_vc_bb() {
    return this.mediaQuery_vc_bb.matches ? 'dark' : 'light';
  }

  applyTheme_vc_bb(theme_vc_bb) {
    document.documentElement.classList.toggle('dark', theme_vc_bb === 'dark');
    
    // Cambiar icono según el tema (si el icono existe)
    if (this.icon_vc_bb) {
        if (theme_vc_bb === 'dark') {
        this.icon_vc_bb.classList.replace('fa-moon', 'fa-sun');
        } else {
        this.icon_vc_bb.classList.replace('fa-sun', 'fa-moon');
        }
    }
  }

  saveThemePreference_vc_bb(theme_vc_bb) {
    localStorage.setItem('themePreference_vc_bb', theme_vc_bb);
  }

  loadTheme_vc_bb() {
    const savedTheme_vc_bb = localStorage.getItem('themePreference_vc_bb');
    const systemTheme_vc_bb = this.getSystemTheme_vc_bb();
    const themeToApply_vc_bb = savedTheme_vc_bb || systemTheme_vc_bb;
    
    this.applyTheme_vc_bb(themeToApply_vc_bb);
    return themeToApply_vc_bb;
  }

  handleSystemThemeChange_vc_bb(e_vc_bb) {
    const newTheme_vc_bb = e_vc_bb.matches ? 'dark' : 'light';
    
    if (!localStorage.getItem('themePreference_vc_bb')) {
      this.applyTheme_vc_bb(newTheme_vc_bb);
    } else {
      const currentSavedTheme_vc_bb = localStorage.getItem('themePreference_vc_bb');
      if (currentSavedTheme_vc_bb === this.getSystemTheme_vc_bb()) {
        this.saveThemePreference_vc_bb(newTheme_vc_bb);
      }
    }
  }

  toggleTheme_vc_bb() {
    this.currentTheme_vc_bb = this.currentTheme_vc_bb === 'dark' ? 'light' : 'dark';
    this.applyTheme_vc_bb(this.currentTheme_vc_bb);
    this.saveThemePreference_vc_bb(this.currentTheme_vc_bb);
  }

  init_vc_bb() {
    // Solo inicializar si el botón existe en el DOM
    if (this.btnColorModo_vc_bb) {
        this.mediaQuery_vc_bb.addEventListener('change', this.handleSystemThemeChange_vc_bb);
        this.currentTheme_vc_bb = this.loadTheme_vc_bb();
        this.btnColorModo_vc_bb.addEventListener('click', this.toggleTheme_vc_bb);
    } else {
        // Si no hay botón, al menos cargamos el tema guardado
        this.loadTheme_vc_bb();
    }
  }
}

// Función simple para mantener la misma interfaz
export const setupThemeToggle_vc_bb = () => {
  const themeToggle_vc_bb = new ThemeToggle_vc_bb();
  themeToggle_vc_bb.init_vc_bb();
};