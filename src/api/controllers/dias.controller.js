import db_vc_bb from "../db.js";

export const getAllDias_vc_bb = async (req_vc_bb, res_vc_bb) => {
  try {
    const rows_vc_bb = await db_vc_bb.all_vc_bb(`SELECT * FROM td_Dia_bb_vc ORDER BY ID_dia_bb_vc;`);
    res_vc_bb.json(rows_vc_bb);
  } catch (err_vc_bb) {
    console.error(err_vc_bb);
    res_vc_bb.status(500).json({ message: "Error al obtener días" });
  }
};
