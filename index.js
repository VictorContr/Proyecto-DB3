import express from "express";
import morgan from "morgan";
import cors from "cors";
import adminRoutes from "./src/routes/admin.routes.js";
// import teacherRoutes from "./src/routes/teacher.routes.js";
import indexRoutes from "./src/routes/index.routes.js";
import { config } from "dotenv";
config();

const PORT = process.env.PORT;
const app = express();

// Middlewares
app.use(morgan("dev"));
app.use(express.json());
app.use(cors());

// Routes
app.use("/", indexRoutes);
app.use("/users", adminRoutes);

app.use((req, res, next) => {
  res.status(404).json({ message: "Not found" });
});

app.listen(PORT);
console.log(`Server on port http://localhost:${PORT}`);
