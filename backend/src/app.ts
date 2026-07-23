import cors from "cors";
import express from "express";
import "dotenv/config";
import router from "./routes";
import { errorMiddleware } from "./middleware/error.middleware";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api", router);

app.use((_request, response) => {
  response.status(404).json({ message: "Rota nao encontrada" });
});

app.use(errorMiddleware);

export default app;
