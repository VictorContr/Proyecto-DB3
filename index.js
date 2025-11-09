import express from "express";
import morgan from "morgan";
import cors from "cors";
import adminRoutes_vc_bb from "./src/routes/admin.routes.js";
// import teacherRoutes from "./src/routes/teacher.routes.js";
import indexRoutes_vc_bb from "./src/routes/index.routes.js";
import { config } from "dotenv";
config();

const PORT_vc_bb = process.env.PORT;
const app_vc_bb = express();

// Middlewares
app_vc_bb.use(morgan("dev"));
app_vc_bb.use(express.json());
app_vc_bb.use(cors());

// Routes
app_vc_bb.use("/", indexRoutes_vc_bb);
app_vc_bb.use("/users", adminRoutes_vc_bb);

app_vc_bb.use((req, res, next) => {
  res.status(404).json({ message: "Not found" });
});

app_vc_bb.listen(PORT_vc_bb);
console.log(`Server on port http://localhost:${PORT_vc_bb}`);
