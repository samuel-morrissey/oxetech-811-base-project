import cors from "cors";
import express from "express";
import "dotenv/config";
import router from "./routes/routes";

import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./swagger";

const app = express();

app.use(cors());
app.use(express.json());

app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec)
);

app.use("/api", router);

app.use((_request, response) => {
    response.status(404).json({ message: "Rota nao encontrada" });
});

export default app;