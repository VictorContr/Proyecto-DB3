import { UsuarioModel_vc_bb, RolModel_vc_bb, ProfesorModel_vc_bb, UsuarioRolModel_vc_bb } from "../models/index.js";

class UsuarioController_vc_bb {
  static #instancia_vc_bb = null;

  constructor() {
    if (UsuarioController_vc_bb.#instancia_vc_bb) {
      return UsuarioController_vc_bb.#instancia_vc_bb;
    }
    this.usuarioModel_vc_bb = UsuarioModel_vc_bb.obtenerInstancia_vc_bb();
    this.rolModel_vc_bb = RolModel_vc_bb.obtenerInstancia_vc_bb();
    this.profesorModel_vc_bb = ProfesorModel_vc_bb.obtenerInstancia_vc_bb();
    this.usuarioRolModel_vc_bb = UsuarioRolModel_vc_bb.obtenerInstancia_vc_bb();
    UsuarioController_vc_bb.#instancia_vc_bb = this;
  }

  static obtenerInstancia_vc_bb() {
    if (!UsuarioController_vc_bb.#instancia_vc_bb) {
      UsuarioController_vc_bb.#instancia_vc_bb = new UsuarioController_vc_bb();
    }
    return UsuarioController_vc_bb.#instancia_vc_bb;
  }

  async obtenerTodos_vc_bb(req_vc_bb, res_vc_bb) {
    try {
      const usuarios_vc_bb = await this.usuarioModel_vc_bb.obtenerTodos_vc_bb();
      res_vc_bb.json(usuarios_vc_bb);
    } catch (error_vc_bb) {
      console.error('Error al obtener usuarios:', error_vc_bb);
      res_vc_bb.status(500).json({ 
        mensaje_vc_bb: 'Error al obtener usuarios',
        error_vc_bb: error_vc_bb.message 
      });
    }
  }

  async obtenerPorId_vc_bb(req_vc_bb, res_vc_bb) {
    try {
      const { id } = req_vc_bb.params;
      const usuario_vc_bb = await this.usuarioModel_vc_bb.obtenerPorId_vc_bb(id);
      
      if (!usuario_vc_bb) {
        return res_vc_bb.status(404).json({ 
          mensaje_vc_bb: 'Usuario no encontrado' 
        });
      }

      res_vc_bb.json(usuario_vc_bb);
    } catch (error_vc_bb) {
      console.error('Error al obtener usuario por ID:', error_vc_bb);
      res_vc_bb.status(500).json({ 
        mensaje_vc_bb: 'Error al obtener usuario',
        error_vc_bb: error_vc_bb.message 
      });
    }
  }

  async crear_vc_bb(req_vc_bb, res_vc_bb) {
    try {
      const {
        userName_bb_vc = null,
        nombre_bb_vc = null,
        apellido_bb_vc = null,
        correo_bb_vc = null,
        telefono_bb_vc = null,
        cedula_bb_vc = null,
        rol_bb_vc = null,
        password_bb_vc = null
      } = req_vc_bb.body;

      // Validación básica
      if (!userName_bb_vc || !nombre_bb_vc || !apellido_bb_vc || !password_bb_vc) {
        return res_vc_bb.status(400).json({ 
          mensaje_vc_bb: 'Los campos userName_bb_vc, nombre_bb_vc, apellido_bb_vc y password_bb_vc son requeridos' 
        });
      }

      // Verificar si el username ya existe
      const usuarioExistente_vc_bb = await this.usuarioModel_vc_bb.obtenerPorUsername_vc_bb(userName_bb_vc);
      if (usuarioExistente_vc_bb) {
        return res_vc_bb.status(409).json({ 
          mensaje_vc_bb: 'El nombre de usuario ya existe' 
        });
      }

      // Crear usuario
      const idUsuario_vc_bb = await this.usuarioModel_vc_bb.crear_vc_bb({
        userName_bb_vc,
        nombre_bb_vc,
        apellido_bb_vc,
        correo_bb_vc,
        telefono_bb_vc,
        cedula_bb_vc,
        password_bb_vc
      });

      // Asignar rol si se proporciona
      if (rol_bb_vc) {
        await this.#asignarRolUsuario_vc_bb(idUsuario_vc_bb, rol_bb_vc);
      }

      res_vc_bb.status(201).json({ 
        mensaje_vc_bb: 'Usuario creado exitosamente',
        id_usuario_vc_bb: idUsuario_vc_bb 
      });
    } catch (error_vc_bb) {
      console.error('Error al crear usuario:', error_vc_bb);
      res_vc_bb.status(500).json({ 
        mensaje_vc_bb: 'Error al crear usuario',
        error_vc_bb: error_vc_bb.message 
      });
    }
  }

  async actualizar_vc_bb(req_vc_bb, res_vc_bb) {
    try {
      const { id } = req_vc_bb.params;
      const datosActualizar_vc_bb = {};
      
      // Filtrar solo los campos que se envían
      const camposPermitidos_vc_bb = ['userName_bb_vc', 'nombre_bb_vc', 'apellido_bb_vc', 'correo_bb_vc', 'telefono_bb_vc', 'cedula_bb_vc', 'password_bb_vc'];
      // No actualizar password si se envía vacío
      if (typeof req_vc_bb.body.password_bb_vc === 'string' && req_vc_bb.body.password_bb_vc.trim() === '') {
        delete req_vc_bb.body.password_bb_vc;
      }
      camposPermitidos_vc_bb.forEach(campo_vc_bb => {
        if (req_vc_bb.body[campo_vc_bb] !== undefined) {
          datosActualizar_vc_bb[campo_vc_bb] = req_vc_bb.body[campo_vc_bb];
        }
      });

      // Verificar si el usuario existe
      const usuarioExistente_vc_bb = await this.usuarioModel_vc_bb.obtenerPorId_vc_bb(id);
      if (!usuarioExistente_vc_bb) {
        return res_vc_bb.status(404).json({ 
          mensaje_vc_bb: 'Usuario no encontrado' 
        });
      }

      // Actualizar usuario
      if (Object.keys(datosActualizar_vc_bb).length > 0) {
        await this.usuarioModel_vc_bb.actualizar_vc_bb(id, datosActualizar_vc_bb);
      }

      // Actualizar rol si se proporciona
      if (req_vc_bb.body.rol_bb_vc !== undefined) {
        await this.#actualizarRolUsuario_vc_bb(id, req_vc_bb.body.rol_bb_vc);
      }

      res_vc_bb.json({ 
        mensaje_vc_bb: 'Usuario actualizado exitosamente' 
      });
    } catch (error_vc_bb) {
      console.error('Error al actualizar usuario:', error_vc_bb);
      res_vc_bb.status(500).json({ 
        mensaje_vc_bb: 'Error al actualizar usuario',
        error_vc_bb: error_vc_bb.message 
      });
    }
  }

  async eliminar_vc_bb(req_vc_bb, res_vc_bb) {
    try {
      const { id } = req_vc_bb.params;

      // Verificar si el usuario existe
      const usuarioExistente_vc_bb = await this.usuarioModel_vc_bb.obtenerPorId_vc_bb(id);
      if (!usuarioExistente_vc_bb) {
        return res_vc_bb.status(404).json({ 
          mensaje_vc_bb: 'Usuario no encontrado' 
        });
      }

      // Eliminar usuario (las relaciones se manejan por FK)
      await this.usuarioModel_vc_bb.eliminar_vc_bb(id);

      res_vc_bb.json({ 
        mensaje_vc_bb: 'Usuario eliminado exitosamente' 
      });
    } catch (error_vc_bb) {
      console.error('Error al eliminar usuario:', error_vc_bb);
      res_vc_bb.status(500).json({ 
        mensaje_vc_bb: 'Error al eliminar usuario',
        error_vc_bb: error_vc_bb.message 
      });
    }
  }

  // Métodos privados para manejar la lógica de roles
  async #asignarRolUsuario_vc_bb(idUsuario_vc_bb, rol_vc_bb) {
    try {
      // Determinar el nombre del rol
      let nombreRol_vc_bb = this.#determinarNombreRol_vc_bb(rol_vc_bb);
      
      // Obtener el ID del rol
      const rolDb_vc_bb = await this.rolModel_vc_bb.obtenerPorNombre_vc_bb(nombreRol_vc_bb);
      if (!rolDb_vc_bb) {
        throw new Error(`Rol '${nombreRol_vc_bb}' no encontrado`);
      }

      // Crear relación usuario-rol (o recuperar si ya existía)
      const idUsuarioRol_vc_bb = await this.usuarioRolModel_vc_bb.crear_vc_bb(idUsuario_vc_bb, rolDb_vc_bb.ID_rol_bb_vc);

      // Si es profesor, crear registro en tabla profesores
      if (nombreRol_vc_bb === 'Profesor') {
        const existeProfesor_vc_bb = await this.profesorModel_vc_bb.obtenerPorIdUsuario_vc_bb(idUsuario_vc_bb);
        if (!existeProfesor_vc_bb) {
          await this.profesorModel_vc_bb.crear_vc_bb(idUsuarioRol_vc_bb);
        }
      }

      return idUsuarioRol_vc_bb;
    } catch (error_vc_bb) {
      console.error('Error al asignar rol:', error_vc_bb);
      throw error_vc_bb;
    }
  }

  async #actualizarRolUsuario_vc_bb(idUsuario_vc_bb, rol_vc_bb) {
    try {
      // Obtener rol actual del usuario
      const rolActual_vc_bb = await this.usuarioModel_vc_bb.obtenerRol_vc_bb(idUsuario_vc_bb);
      
      // Determinar nuevo nombre de rol
      const nuevoNombreRol_vc_bb = this.#determinarNombreRol_vc_bb(rol_vc_bb);
      
      // Si el rol no cambia, no hacer nada
      if (rolActual_vc_bb && rolActual_vc_bb.rol_bb_vc === nuevoNombreRol_vc_bb) {
        return;
      }

      // Eliminar rol anterior si existe
      if (rolActual_vc_bb) {
        await this.usuarioRolModel_vc_bb.eliminar_vc_bb(rolActual_vc_bb.ID_usuarioRol_bb_vc);
        // Si era profesor, eliminar de tabla profesores
        if (rolActual_vc_bb.rol_bb_vc === 'Profesor') {
          await this.profesorModel_vc_bb.eliminarPorUsuarioRol_vc_bb(rolActual_vc_bb.ID_usuarioRol_bb_vc);
        }
      }

      // Asignar nuevo rol
      await this.#asignarRolUsuario_vc_bb(idUsuario_vc_bb, nuevoNombreRol_vc_bb);
    } catch (error_vc_bb) {
      console.error('Error al actualizar rol:', error_vc_bb);
      throw error_vc_bb;
    }
  }

  #determinarNombreRol_vc_bb(rol_vc_bb) {
    const rolLower_vc_bb = String(rol_vc_bb).toLowerCase();
    if (rolLower_vc_bb.includes('prof')) return 'Profesor';
    if (rolLower_vc_bb.includes('admin')) return 'Administrador';
    return String(rol_vc_bb);
  }
}

// Exportar funciones para mantener compatibilidad con rutas existentes
const controlador_vc_bb = UsuarioController_vc_bb.obtenerInstancia_vc_bb();

export const getAllUsuarios_vc_bb = (req_vc_bb, res_vc_bb) => controlador_vc_bb.obtenerTodos_vc_bb(req_vc_bb, res_vc_bb);
export const getUsuarioById_vc_bb = (req_vc_bb, res_vc_bb) => controlador_vc_bb.obtenerPorId_vc_bb(req_vc_bb, res_vc_bb);
export const createUsuario_vc_bb = (req_vc_bb, res_vc_bb) => controlador_vc_bb.crear_vc_bb(req_vc_bb, res_vc_bb);
export const updateUsuario_vc_bb = (req_vc_bb, res_vc_bb) => controlador_vc_bb.actualizar_vc_bb(req_vc_bb, res_vc_bb);
export const deleteUsuario_vc_bb = (req_vc_bb, res_vc_bb) => controlador_vc_bb.eliminar_vc_bb(req_vc_bb, res_vc_bb);

export default {
  getAllUsuarios_vc_bb,
  getUsuarioById_vc_bb,
  createUsuario_vc_bb,
  updateUsuario_vc_bb,
  deleteUsuario_vc_bb
};
