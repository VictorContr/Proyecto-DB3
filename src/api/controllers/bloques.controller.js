import db_vc_bb from "../db.js";

export const getAllBloques_vc_bb = async (req, res) => {
  try {
    const rows = await db_vc_bb.all_vc_bb(`SELECT * FROM td_Bloque_bb_vc ORDER BY ID_bloque_bb_vc;`);
    res.json(rows);
  } catch (err_vc_bb) {
    console.error(err_vc_bb);
    res.status(500).json({ message: "Error al obtener bloques" });
  }
};
