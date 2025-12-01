import { GradoAsignaturaModel_vc_bb, GradoModel_vc_bb, AsignaturaModel_vc_bb } from "../models/index.js";

class GradoAsignaturaController_vc_bb {
  static #instancia_vc_bb = null;

  constructor() {
    if (GradoAsignaturaController_vc_bb.#instancia_vc_bb) {
      return GradoAsignaturaController_vc_bb.#instancia_vc_bb;
    }
    this.model_vc_bb = GradoAsignaturaModel_vc_bb.obtenerInstancia_vc_bb();
    this.gradoModel_vc_bb = GradoModel_vc_bb.obtenerInstancia_vc_bb();
    this.asignaturaModel_vc_bb = AsignaturaModel_vc_bb.obtenerInstancia_vc_bb();
    GradoAsignaturaController_vc_bb.#instancia_vc_bb = this;
  }

  static obtenerInstancia_vc_bb() {
    if (!GradoAsignaturaController_vc_bb.#instancia_vc_bb) {
      GradoAsignaturaController_vc_bb.#instancia_vc_bb = new GradoAsignaturaController_vc_bb();
    }
    return GradoAsignaturaController_vc_bb.#instancia_vc_bb;
  }

  async obtenerTodos_vc_bb(req_vc_bb, res_vc_bb) {
    try {
      const rows_vc_bb = await this.model_vc_bb.obtenerTodos_vc_bb();
      res_vc_bb.json(rows_vc_bb);
    } catch (error_vc_bb) {
      console.error('Error al obtener GradosAsignaturas:', error_vc_bb);
      res_vc_bb.status(500).json({ mensaje_vc_bb: 'Error al obtener registros' });
    }
  }

  async crear_vc_bb(req_vc_bb, res_vc_bb) {
    try {
      const { ID_grado_gradoAsig_bb_vc, ID_asignatura_gradoAsig_bb_vc } = req_vc_bb.body;

      if (!ID_grado_gradoAsig_bb_vc || !ID_asignatura_gradoAsig_bb_vc) {
        return res_vc_bb.status(400).json({ mensaje_vc_bb: 'Faltan campos requeridos' });
      }

      const grado_vc_bb = await this.gradoModel_vc_bb.obtenerPorId_vc_bb(ID_grado_gradoAsig_bb_vc);
      if (!grado_vc_bb) return res_vc_bb.status(404).json({ mensaje_vc_bb: 'Grado no encontrado' });
      const asig_vc_bb = await this.asignaturaModel_vc_bb.obtenerPorId_vc_bb(ID_asignatura_gradoAsig_bb_vc);
      if (!asig_vc_bb) return res_vc_bb.status(404).json({ mensaje_vc_bb: 'Asignatura no encontrada' });

      const id_vc_bb = await this.model_vc_bb.crear_vc_bb({ ID_grado_gradoAsig_bb_vc, ID_asignatura_gradoAsig_bb_vc });
      res_vc_bb.status(201).json({ ID_gradoAsignatura_bb_vc: id_vc_bb });
    } catch (error_vc_bb) {
      if (String(error_vc_bb?.message || '').includes('UNIQUE')) {
        return res_vc_bb.status(409).json({ mensaje_vc_bb: 'La relación grado-asignatura ya existe' });
      }
      console.error('Error al crear GradoAsignatura:', error_vc_bb);
      res_vc_bb.status(500).json({ mensaje_vc_bb: 'Error al crear registro' });
    }
  }

  async actualizar_vc_bb(req_vc_bb, res_vc_bb) {
    try {
      const { id } = req_vc_bb.params;
      const { ID_grado_gradoAsig_bb_vc, ID_asignatura_gradoAsig_bb_vc } = req_vc_bb.body;

      const existente_vc_bb = await this.model_vc_bb.obtenerPorId_vc_bb(id);
      if (!existente_vc_bb) return res_vc_bb.status(404).json({ mensaje_vc_bb: 'Registro no encontrado' });

      if (ID_grado_gradoAsig_bb_vc) {
        const grado_vc_bb = await this.gradoModel_vc_bb.obtenerPorId_vc_bb(ID_grado_gradoAsig_bb_vc);
        if (!grado_vc_bb) return res_vc_bb.status(404).json({ mensaje_vc_bb: 'Grado no encontrado' });
      }
      if (ID_asignatura_gradoAsig_bb_vc) {
        const asig_vc_bb = await this.asignaturaModel_vc_bb.obtenerPorId_vc_bb(ID_asignatura_gradoAsig_bb_vc);
        if (!asig_vc_bb) return res_vc_bb.status(404).json({ mensaje_vc_bb: 'Asignatura no encontrada' });
      }

      const cambios_vc_bb = await this.model_vc_bb.actualizar_vc_bb(id, {
        ID_grado_gradoAsig_bb_vc,
        ID_asignatura_gradoAsig_bb_vc,
      });
      if (cambios_vc_bb === 0) return res_vc_bb.status(404).json({ mensaje_vc_bb: 'Registro no encontrado' });
      res_vc_bb.json({ cambios_vc_bb });
    } catch (error_vc_bb) {
      if (String(error_vc_bb?.message || '').includes('UNIQUE')) {
        return res_vc_bb.status(409).json({ mensaje_vc_bb: 'La relación grado-asignatura ya existe' });
      }
      console.error('Error al actualizar GradoAsignatura:', error_vc_bb);
      res_vc_bb.status(500).json({ mensaje_vc_bb: 'Error al actualizar registro' });
    }
  }

  async eliminar_vc_bb(req_vc_bb, res_vc_bb) {
    try {
      const { id } = req_vc_bb.params;
      const existente_vc_bb = await this.model_vc_bb.obtenerPorId_vc_bb(id);
      if (!existente_vc_bb) return res_vc_bb.status(404).json({ mensaje_vc_bb: 'Registro no encontrado' });
      const cambios_vc_bb = await this.model_vc_bb.eliminar_vc_bb(id);
      res_vc_bb.json({ cambios_vc_bb });
    } catch (error_vc_bb) {
      console.error('Error al eliminar GradoAsignatura:', error_vc_bb);
      res_vc_bb.status(500).json({ mensaje_vc_bb: 'Error al eliminar registro' });
    }
  }
}

const controlador_vc_bb = GradoAsignaturaController_vc_bb.obtenerInstancia_vc_bb();
export const getAllGradosAsignaturas_vc_bb = (req_vc_bb, res_vc_bb) => controlador_vc_bb.obtenerTodos_vc_bb(req_vc_bb, res_vc_bb);
export const createGradoAsignatura_vc_bb = (req_vc_bb, res_vc_bb) => controlador_vc_bb.crear_vc_bb(req_vc_bb, res_vc_bb);
export const updateGradoAsignatura_vc_bb = (req_vc_bb, res_vc_bb) => controlador_vc_bb.actualizar_vc_bb(req_vc_bb, res_vc_bb);
export const deleteGradoAsignatura_vc_bb = (req_vc_bb, res_vc_bb) => controlador_vc_bb.eliminar_vc_bb(req_vc_bb, res_vc_bb);

export default GradoAsignaturaController_vc_bb;

